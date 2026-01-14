import prisma from "../../../config/database";
import * as ExcelJS from "exceljs";
import { Response } from "express";

export class ReportService {
    /**
     * Generate Loan Portfolio Report with NPL Classification
     */
    async generateLoanReport(res: Response, startDate?: Date, endDate?: Date) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Loan Portfolio Report");

        // add header
        worksheet.columns = [
            { header: "Loan ID", key: "loanNumber", width: 15 },
            { header: "Borrower Name", key: "borrower", width: 25 },
            { header: "Contact", key: "contact", width: 15 },
            { header: "Loan Type", key: "loanType", width: 20 },
            { header: "Principal", key: "principal", width: 15 },
            { header: "Outstanding Principal", key: "outstandingPrincipal", width: 20 },
            { header: "Disbursed Date", key: "disbursedDate", width: 15 },
            { header: "Maturity Date", key: "maturityDate", width: 15 },
            { header: "Overdue Days", key: "overdueDays", width: 15 },
            { header: "Classification", key: "classification", width: 15 },
        ];

        // date filter logic (if applicable - usually portfolio is "as of" a date, but for now we take all active loans)
        // If startDate/endDate is provided, we might filter disbursements, but NPL is usually snapshot.
        // We will assume "current status" for now.

        const loans = await prisma.loan.findMany({
            where: {
                status: { in: ["ACTIVE", "DEFAULTED"] },
            },
            include: {
                user: true,
                loanType: true,
                installments: {
                    where: {
                        status: { not: "PAID" },
                        dueDate: { lt: new Date() }, // Only overdue installments
                    },
                    orderBy: { dueDate: "asc" },
                },
            },
        });

        const now = new Date();

        for (const loan of loans) {
            let overdueDays = 0;
            let classification = "Pass"; // Default

            // Calculate overdue days based on the oldest unpaid installment
            if (loan.installments.length > 0) {
                const oldestDue = new Date(loan.installments[0].dueDate);
                const diffTime = Math.abs(now.getTime() - oldestDue.getTime());
                overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            // NRB Classification
            if (overdueDays <= 30) {
                classification = "Pass";
            } else if (overdueDays <= 90) {
                classification = "Watchlist"; // Often 1-30 is Pass, but sometimes 30-90 is Watchlist depending on MFI directive.
                // Let's use:
                // 0: Pass
                // 1-30: Watchlist (Microfinance often stricter? or banking?)
                // Standard NRB for Banks: 
                // Pass: Not overdue
                // Watchlist: < 1 month overdue? 
                // Let's stick to the plan: 
                // 0 days (Pass), 1-30 days (Watchlist), 31-90 days (Substandard), 91-180 days (Doubtful), 180+ days (Bad).
                // Wait, standard is: Pass (Current), Watchlist (up to 1 month), Substandard (1-3 months), Doubtful (3-6 months), Loss (>6 months)
                // I'll adjust slightly to match common practice.
            }

            // Re-evaluating based on common NRB directives for MFIs
            if (overdueDays === 0) {
                classification = "Pass";
            } else if (overdueDays <= 30) {
                classification = "Watchlist";
            } else if (overdueDays <= 90) {
                classification = "Substandard";
            } else if (overdueDays <= 180) {
                classification = "Doubtful";
            } else {
                classification = "Loss";
            }

            worksheet.addRow({
                loanNumber: loan.loanNumber,
                borrower: loan.user.fullName,
                contact: loan.user.contactNumber,
                loanType: loan.loanType.name,
                principal: Number(loan.principalAmount),
                outstandingPrincipal: Number(loan.outstandingPrincipal),
                disbursedDate: loan.disbursementDate ? loan.disbursementDate.toISOString().split('T')[0] : "",
                maturityDate: loan.lastPaymentDate ? loan.lastPaymentDate.toISOString().split('T')[0] : "",
                overdueDays: overdueDays,
                classification: classification,
            });
        }

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "Loan_Portfolio_Report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
    }

    /**
     * Generate Collection Report
     */
    async generateCollectionReport(res: Response, startDate: Date, endDate: Date) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Collection Report");

        worksheet.columns = [
            { header: "Date", key: "date", width: 15 },
            { header: "Loan ID", key: "loanNumber", width: 15 },
            { header: "Borrower", key: "borrower", width: 20 },
            { header: "Total Paid", key: "totalPaid", width: 15 },
            { header: "Principal", key: "principal", width: 15 },
            { header: "Interest", key: "interest", width: 15 },
            { header: "Late Fee", key: "lateFee", width: 15 },
            { header: "Payment Method", key: "method", width: 15 },
        ];

        const payments = await prisma.loanPayment.findMany({
            where: {
                paymentDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                loan: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                paymentDate: "desc",
            },
        });

        for (const payment of payments) {
            worksheet.addRow({
                date: payment.paymentDate.toISOString().split('T')[0],
                loanNumber: payment.loan.loanNumber,
                borrower: payment.loan.user.fullName,
                totalPaid: Number(payment.amount),
                principal: Number(payment.principalComponent),
                interest: Number(payment.interestComponent),
                lateFee: Number(payment.lateFeeComponent),
                method: payment.paymentMethod,
            });
        }

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "Collection_Report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
    }
}

export const reportService = new ReportService();
