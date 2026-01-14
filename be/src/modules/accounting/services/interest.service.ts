import { PrismaClient } from "@prisma/client";
import logger from "../../../config/logger";

const prisma = new PrismaClient();

export class InterestService {
    /**
     * Calculates daily interest for all active Savings & Term accounts.
     * Formula: Daily Interest = (Closing Balance * Interest Rate) / (365 * 100)
     * This should be scheduled to run daily at 23:59.
     */
    static async calculateDailyInterest() {
        logger.info("Starting Daily Interest Calculation Job...");

        // Fetch all active accounts with positive balance
        // In a real system, you might process in batches.
        const eligibleAccounts = await prisma.userAccount.findMany({
            where: {
                status: "ACTIVE",
                balance: { gt: 0 },
                // Filter by account types that earn interest if needed (e.g., SB, FD)
                // For now assuming all active accounts earn interest if rate > 0
                interestRate: { gt: 0 }
            }
        });

        let processedCount = 0;

        for (const account of eligibleAccounts) {
            try {
                // Daily Rate = Annual Rate / 365
                const dailyInterest = (Number(account.balance) * Number(account.interestRate)) / (365 * 100);

                if (dailyInterest > 0) {
                    await prisma.userAccount.update({
                        where: { id: account.id },
                        data: {
                            accruedInterest: { increment: dailyInterest }
                        }
                    });
                    processedCount++;
                }
            } catch (error) {
                logger.error(`Failed to calculate interest for account ${account.accountNumber}: ${error}`);
            }
        }

        logger.info(`Daily Interest Calculation Completed. Processed ${processedCount} accounts.`);
        return processedCount;
    }

    /**
     * Posts accrued interest to the main balance.
     * Capitalizes interest (Compound Interest effect).
     * Typically runs Quarterly (e.g., 1st of Baishakh/Shrawan/Kartik/Magh).
     */
    static async postQuarterlyInterest() {
        logger.info("Starting Quarterly Interest Posting Job...");

        const eligibleAccounts = await prisma.userAccount.findMany({
            where: {
                status: "ACTIVE",
                accruedInterest: { gt: 0 }
            }
        });

        let processedCount = 0;
        const errors: string[] = [];

        for (const account of eligibleAccounts) {
            try {
                const interestAmount = Number(account.accruedInterest);

                // Use a transaction to ensure separate journal entry creation and balance update happen atomically
                await prisma.$transaction(async (tx) => {
                    // 1. Create Transaction Record
                    await tx.userAccountTransaction.create({
                        data: {
                            accountId: account.id,
                            transactionType: "INTEREST_CREDIT",
                            amount: interestAmount,
                            description: "Quarterly Interest Capitalization",
                            runningBalance: Number(account.balance) + interestAmount,
                            transactionDate: new Date(),
                        }
                    });

                    // 2. Update Account Balance & Reset Accrued Interest
                    await tx.userAccount.update({
                        where: { id: account.id },
                        data: {
                            balance: { increment: interestAmount },
                            accruedInterest: 0,
                            lastInterestPostedDate: new Date()
                        }
                    });
                });

                processedCount++;
            } catch (error) {
                const msg = `Failed to post interest for account ${account.accountNumber}: ${error}`;
                logger.error(msg);
                errors.push(msg);
            }
        }

        logger.info(`Quarterly Interest Posting Completed. Processed ${processedCount} accounts.`);
        return { processedCount, errors };
    }
}
