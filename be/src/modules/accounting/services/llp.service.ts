import { PrismaClient } from "@prisma/client";
import logger from "../../../config/logger";

const prisma = new PrismaClient();

export class LLPService {
    /**
     * Classifies loans and calculates required Loan Loss Provision.
     * Rules:
     * Good (Pass): 0-3 Months Overdue -> 1%
     * Substandard: 3-6 Months Overdue -> 25%
     * Doubtful: 6-12 Months Overdue -> 50%
     * Bad (Loss): >1 Year (12 months) Overdue -> 100%
     */
    static async calculateProvisions() {
        logger.info("Starting Loan Loss Provision Calculation...");

        // Fetch all active loans with outstanding principal
        const loans = await prisma.loan.findMany({
            where: {
                status: "ACTIVE",
                outstandingPrincipal: { gt: 0 }
            }
        });

        let processedCount = 0;

        for (const loan of loans) {
            try {
                // Determine reference date for overdue calculation
                // If never paid, use disbursement date. If paid, use last payment date.
                // Ideally should check installment due dates, but simplified regulation often uses "Overdue Days" from last expected payment.
                // Stricter logic: Check earliest unpaid installment due date.

                const earliestUnpaidInstallment = await prisma.loanInstallment.findFirst({
                    where: {
                        loanId: loan.id,
                        status: { not: "PAID" }
                    },
                    orderBy: { dueDate: "asc" }
                });

                const today = new Date();
                let overdueDays = 0;

                if (earliestUnpaidInstallment) {
                    const dueDate = new Date(earliestUnpaidInstallment.dueDate);
                    if (today > dueDate) {
                        const diffTime = Math.abs(today.getTime() - dueDate.getTime());
                        overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }
                }

                let classification = "GOOD";
                let provisionPercent = 1;

                // Classification Logic
                if (overdueDays <= 90) {
                    classification = "GOOD"; // Pass
                    provisionPercent = 1;
                } else if (overdueDays > 90 && overdueDays <= 180) {
                    classification = "SUBSTANDARD";
                    provisionPercent = 25;
                } else if (overdueDays > 180 && overdueDays <= 365) {
                    classification = "DOUBTFUL";
                    provisionPercent = 50;
                } else {
                    classification = "BAD"; // Loss
                    provisionPercent = 100;
                }

                const outstandingPrincipal = Number(loan.outstandingPrincipal);
                const provisionAmount = (outstandingPrincipal * provisionPercent) / 100;

                // Save Provision Record
                // We create a new snapshot everytime this runs (e.g. Monthly/Quarterly reporting)
                await prisma.loanProvision.create({
                    data: {
                        loanId: loan.id,
                        classification,
                        overdueDays,
                        provisionPercent,
                        provisionAmount,
                        provisionDate: new Date()
                    }
                });

                processedCount++;

            } catch (error) {
                logger.error(`Error calculating LLP for loan ${loan.loanNumber}: ${error}`);
            }
        }

        logger.info(`LLP Calculation Completed. Processed ${processedCount} loans.`);
        return processedCount;
    }

    /**
     * Get latest provision summary for dashboard
     */
    static async getProvisionSummary() {
        // Get the latest provision for each loan (This is tricky in SQL, but manageable)
        // For simplicity, we can fetch all provisions created "today" or "latest run"
        // Assuming this job runs and creates records with close timestamps.

        // Better: Fetch by grouping logic or just raw query if needed.
        // Simple approach: Get provisions from the last 24 hours (assuming job ran recently)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const provisions = await prisma.loanProvision.findMany({
            where: {
                provisionDate: { gt: yesterday }
            },
            include: {
                loan: {
                    select: {
                        loanNumber: true,
                        outstandingPrincipal: true,
                        user: { select: { fullName: true } }
                    }
                }
            },
            orderBy: { provisionDate: "desc" }
        });

        // Aggregate data
        const summary = {
            GOOD: { count: 0, amount: 0, provision: 0 },
            SUBSTANDARD: { count: 0, amount: 0, provision: 0 },
            DOUBTFUL: { count: 0, amount: 0, provision: 0 },
            BAD: { count: 0, amount: 0, provision: 0 },
            totalProvision: 0
        };

        provisions.forEach((p: any) => {
            const type = p.classification as keyof typeof summary;
            if (summary[type] && type !== 'totalProvision') {
                summary[type].count++;
                summary[type].amount += Number(p.loan.outstandingPrincipal);
                summary[type].provision += Number(p.provisionAmount);
                summary.totalProvision += Number(p.provisionAmount);
            }
        });

        return {
            summary,
            details: provisions
        };
    }
}
