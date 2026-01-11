import { PrismaClient } from "@prisma/client";
import logger from "../../../config/logger";

const prisma = new PrismaClient();

/**
 * Account code cache to avoid repeated database lookups
 */
const accountCodeCache = new Map<string, string>();

/**
 * Get account ID by account code with caching
 */
async function getAccountIdByCode(accountCode: string): Promise<string | null> {
    // Check cache first
    if (accountCodeCache.has(accountCode)) {
        return accountCodeCache.get(accountCode) || null;
    }

    //Look up in database
    const account = await prisma.account_COA.findUnique({
        where: { accountCode }
    });

    if (account && account.isActive) {
        accountCodeCache.set(accountCode, account.id);
        return account.id;
    }

    logger.warn(`Account code not found: ${accountCode}`);
    return null;
}

/**
 * Clear account code cache (useful for testing or after seed)
 */
export function clearAccountCodeCache() {
    accountCodeCache.clear();
}

/**
 * Account Code Configuration for Transaction Types
 * These should match the codes in your Chart of Accounts seeding
 */
export const TRANSACTION_ACCOUNT_MAPPING = {
    // User Transactions
    DEPOSIT: {
        debit: "1101",  // Cash in Hand
        credit: "2101", // Customer Deposits
    },
    WITHDRAWAL: {
        debit: "2101",  // Customer Deposits
        credit: "1101", // Cash in Hand
    },
    TRANSFER: {
        // Transfers are between customer accounts (liability)
        debit: "2101",  // Customer Deposits (from account)
        credit: "2101", // Customer Deposits (to account)
    },

    // Loan Transactions
    LOAN_DISBURSEMENT: {
        debit: "1200",  // Loans Receivable
        credit: "1101", // Cash in Hand
    },
    LOAN_PAYMENT_PRINCIPAL: {
        debit: "1101",  // Cash in Hand
        credit: "1200", // Loans Receivable
    },
    LOAN_PAYMENT_INTEREST: {
        debit: "1101",  // Cash in Hand
        credit: "4101", // Interest Income
    },

    // Share Transactions
    SHARE_PURCHASE: {
        debit: "1101",  // Cash in Hand
        credit: "3101", // Share Capital
    },
    SHARE_RETURN: {
        debit: "3101",  // Share Capital
        credit: "1101", // Cash in Hand
    },

    // Interest Posting
    INTEREST_EXPENSE: {
        debit: "5101",  // Interest Expense
        credit: "2101", // Customer Deposits
    },
} as const;

interface JournalLine {
    accountCode: string;
    debit: number;
    credit: number;
    description?: string;
}

interface CreateJournalEntryParams {
    description: string;
    entryDate: Date;
    lines: JournalLine[];
    referenceNumber?: string;
    createdById?: string;
}

export class JournalEntryService {
    /**
     * Core method to create a journal entry with validation
     */
    static async createEntry(params: CreateJournalEntryParams) {
        const { description, entryDate, lines, referenceNumber, createdById } = params;

        // Validate that debits equal credits
        const totalDebits = lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredits = lines.reduce((sum, line) => sum + line.credit, 0);

        if (Math.abs(totalDebits - totalCredits) > 0.01) {
            throw new Error(
                `Journal entry not balanced. Debits: ${totalDebits}, Credits: ${totalCredits}`
            );
        }

        // Look up all account IDs and validate they exist
        const accountIds = await Promise.all(
            lines.map(async (line) => {
                const accountId = await getAccountIdByCode(line.accountCode);
                if (!accountId) {
                    throw new Error(
                        `Account code ${line.accountCode} not found in Chart of Accounts. Please ensure it exists and is active.`
                    );
                }
                return { ...line, accountId };
            })
        );

        // Generate entry number
        const lastEntry = await prisma.journalEntry.findFirst({
            orderBy: { createdAt: "desc" },
            select: { entryNumber: true }
        });

        let entryNumber = "JE-0001";
        if (lastEntry?.entryNumber) {
            const match = lastEntry.entryNumber.match(/JE-(\d+)/);
            if (match) {
                const nextNum = parseInt(match[1]) + 1;
                entryNumber = `JE-${String(nextNum).padStart(4, "0")}`;
            }
        }

        // Create the journal entry with lines
        const journalEntry = await prisma.journalEntry.create({
            data: {
                entryNumber,
                entryDate,
                narration: description,
                reference: referenceNumber,
                status: "POSTED",
                createdById,
                approvedById: createdById,
                journalEntryLines: {
                    create: accountIds.map((line) => ({
                        accountId: line.accountId,
                        debitAmount: line.debit,
                        creditAmount: line.credit,
                        description: line.description || description,
                    }))
                }
            },
            include: {
                journalEntryLines: true
            }
        });

        logger.info(`Created journal entry: ${journalEntry.entryNumber} - ${description}`);
        return journalEntry;
    }

    /**
     * Create journal entry for deposit
     */
    static async createDepositEntry(params: {
        amount: number;
        accountNumber: string;
        transactionDate: Date;
        referenceNumber?: string;
        createdById?: string;
    }) {
        const mapping = TRANSACTION_ACCOUNT_MAPPING.DEPOSIT;
        return await this.createEntry({
            description: `Deposit to account ${params.accountNumber}`,
            entryDate: params.transactionDate,
            referenceNumber: params.referenceNumber,
            createdById: params.createdById,
            lines: [
                {
                    accountCode: mapping.debit,
                    debit: params.amount,
                    credit: 0,
                    description: `Cash received - ${params.accountNumber}`
                },
                {
                    accountCode: mapping.credit,
                    debit: 0,
                    credit: params.amount,
                    description: `Customer deposit - ${params.accountNumber}`
                }
            ]
        });
    }

    /**
     * Create journal entry for withdrawal
     */
    static async createWithdrawalEntry(params: {
        amount: number;
        accountNumber: string;
        transactionDate: Date;
        referenceNumber?: string;
        createdById?: string;
    }) {
        const mapping = TRANSACTION_ACCOUNT_MAPPING.WITHDRAWAL;
        return await this.createEntry({
            description: `Withdrawal from account ${params.accountNumber}`,
            entryDate: params.transactionDate,
            referenceNumber: params.referenceNumber,
            createdById: params.createdById,
            lines: [
                {
                    accountCode: mapping.debit,
                    debit: params.amount,
                    credit: 0,
                    description: `Withdrawal - ${params.accountNumber}`
                },
                {
                    accountCode: mapping.credit,
                    debit: 0,
                    credit: params.amount,
                    description: `Cash paid - ${params.accountNumber}`
                }
            ]
        });
    }

    /**
     * Create journal entry for loan disbursement
     */
    static async createLoanDisbursementEntry(params: {
        amount: number;
        loanNumber: string;
        disbursementDate: Date;
        referenceNumber?: string;
        createdById?: string;
    }) {
        const mapping = TRANSACTION_ACCOUNT_MAPPING.LOAN_DISBURSEMENT;
        return await this.createEntry({
            description: `Loan disbursed - ${params.loanNumber}`,
            entryDate: params.disbursementDate,
            referenceNumber: params.referenceNumber,
            createdById: params.createdById,
            lines: [
                {
                    accountCode: mapping.debit,
                    debit: params.amount,
                    credit: 0,
                    description: `Loan disbursed - ${params.loanNumber}`
                },
                {
                    accountCode: mapping.credit,
                    debit: 0,
                    credit: params.amount,
                    description: `Cash paid - ${params.loanNumber}`
                }
            ]
        });
    }

    /**
     * Create journal entry for loan payment
     */
    static async createLoanPaymentEntry(params: {
        principalAmount: number;
        interestAmount: number;
        loanNumber: string;
        paymentDate: Date;
        referenceNumber?: string;
        createdById?: string;
    }) {
        const totalAmount = params.principalAmount + params.interestAmount;
        const lines: JournalLine[] = [];

        // Debit: Cash received
        lines.push({
            accountCode: TRANSACTION_ACCOUNT_MAPPING.LOAN_PAYMENT_PRINCIPAL.debit,
            debit: totalAmount,
            credit: 0,
            description: `EMI received - ${params.loanNumber}`
        });

        // Credit: Loans Receivable (principal)
        lines.push({
            accountCode: TRANSACTION_ACCOUNT_MAPPING.LOAN_PAYMENT_PRINCIPAL.credit,
            debit: 0,
            credit: params.principalAmount,
            description: `Principal repayment - ${params.loanNumber}`
        });

        // Credit: Interest Income (if any)
        if (params.interestAmount > 0) {
            lines.push({
                accountCode: TRANSACTION_ACCOUNT_MAPPING.LOAN_PAYMENT_INTEREST.credit,
                debit: 0,
                credit: params.interestAmount,
                description: `Interest income - ${params.loanNumber}`
            });
        }

        return await this.createEntry({
            description: `Loan payment - ${params.loanNumber}`,
            entryDate: params.paymentDate,
            referenceNumber: params.referenceNumber,
            createdById: params.createdById,
            lines
        });
    }

    /**
     * Create journal entry for share purchase
     */
    static async createSharePurchaseEntry(params: {
        amount: number;
        shareCount: number;
        memberName: string;
        transactionDate: Date;
        referenceNumber?: string;
        createdById?: string;
    }) {
        const mapping = TRANSACTION_ACCOUNT_MAPPING.SHARE_PURCHASE;
        return await this.createEntry({
            description: `Share purchase - ${params.shareCount} shares by ${params.memberName}`,
            entryDate: params.transactionDate,
            referenceNumber: params.referenceNumber,
            createdById: params.createdById,
            lines: [
                {
                    accountCode: mapping.debit,
                    debit: params.amount,
                    credit: 0,
                    description: `Cash received - Share purchase`
                },
                {
                    accountCode: mapping.credit,
                    debit: 0,
                    credit: params.amount,
                    description: `Share capital - ${params.shareCount} shares`
                }
            ]
        });
    }

    /**
     * Create journal entry for interest posting
     */
    static async createInterestPostingEntry(params: {
        amount: number;
        accountNumber: string;
        postingDate: Date;
        referenceNumber?: string;
        createdById?: string;
    }) {
        const mapping = TRANSACTION_ACCOUNT_MAPPING.INTEREST_EXPENSE;
        return await this.createEntry({
            description: `Interest posted to ${params.accountNumber}`,
            entryDate: params.postingDate,
            referenceNumber: params.referenceNumber,
            createdById: params.createdById,
            lines: [
                {
                    accountCode: mapping.debit,
                    debit: params.amount,
                    credit: 0,
                    description: `Interest expense - ${params.accountNumber}`
                },
                {
                    accountCode: mapping.credit,
                    debit: 0,
                    credit: params.amount,
                    description: `Interest capitalized - ${params.accountNumber}`
                }
            ]
        });
    }
}
