import { TransactionType } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import prisma from "../../../config/database";

/**
 * User transaction types to chart of accounts mapping
 * This defines which accounts should be debited/credited for each user transaction type
 */
export const USER_TRANSACTION_ACCOUNT_MAPPING = {
	DEPOSIT: {
		debitAccount: "CASH", // Cash account
		creditAccount: "USER_DEPOSITS", // User deposits liability account
	},
	WITHDRAWAL: {
		debitAccount: "USER_DEPOSITS", // User deposits liability account
		creditAccount: "CASH", // Cash account
	},
	INTEREST_CREDIT: {
		debitAccount: "INTEREST_EXPENSE", // Interest expense account
		creditAccount: "USER_DEPOSITS", // User deposits liability account
	},
	FEE_DEBIT: {
		debitAccount: "USER_DEPOSITS", // User deposits liability account
		creditAccount: "FEE_INCOME", // Fee income account
	},
	ADJUSTMENT: {
		debitAccount: "CASH", // Cash account (for positive adjustments)
		creditAccount: "ADJUSTMENT_INCOME", // Adjustment income account
	},
	TRANSFER_IN: {
		debitAccount: "CASH", // Cash account
		creditAccount: "USER_DEPOSITS", // User deposits liability account
	},
	TRANSFER_OUT: {
		debitAccount: "USER_DEPOSITS", // User deposits liability account
		creditAccount: "CASH", // Cash account
	},
};

/**
 * Get default account ID by account code
 */
export const getDefaultAccountIdByCode = async (
	accountCode: string,
): Promise<string | null> => {
	const account = await prisma.account_COA.findFirst({
		where: {
			name: accountCode, // Using name instead of code since code field doesn't exist
			isActive: true,
		},
	});

	return account?.id || null;
};

/**
 * Get account mapping for user transaction type
 */
export const getUserTransactionAccountMapping = (
	transactionType: TransactionType,
) => {
	return USER_TRANSACTION_ACCOUNT_MAPPING[transactionType];
};

/**
 * Create automatic journal entry for user transaction
 */
export const createJournalEntryForUserTransaction = async (
	transaction: {
		id: string;
		transactionType: TransactionType;
		amount: number | Decimal;
		description?: string | null;
		referenceNumber?: string | null;
		transactionDate?: Date;
	},
	adminUserId: string,
): Promise<string> => {
	const { generateJournalEntryNumber } = await import(
		"../../accounting/utils/accounting.utils"
	);

	const entryNumber = await generateJournalEntryNumber();
	const accountMapping = getUserTransactionAccountMapping(
		transaction.transactionType,
	);

	// Get account IDs
	const [debitAccountId, creditAccountId] = await Promise.all([
		getDefaultAccountIdByCode(accountMapping.debitAccount),
		getDefaultAccountIdByCode(accountMapping.creditAccount),
	]);

	if (!debitAccountId || !creditAccountId) {
		throw new Error(
			`Required accounts not found: ${accountMapping.debitAccount} or ${accountMapping.creditAccount}`,
		);
	}

	// Convert amount to number if it's a Decimal
	const amountValue =
		typeof transaction.amount === "number"
			? transaction.amount
			: Number(transaction.amount.toString());

	// Use the amount directly since transaction amounts are already in rupees
	// and journal entries should also be in rupees (no conversion needed)
	const journalAmount = amountValue;

	// Determine debit and credit amounts based on transaction type
	let debitAmount = 0;
	let creditAmount = 0;

	if (transaction.transactionType === TransactionType.ADJUSTMENT) {
		// For adjustments, amount can be positive or negative
		if (journalAmount > 0) {
			debitAmount = journalAmount;
		} else {
			creditAmount = Math.abs(journalAmount);
		}
	} else {
		// For other transaction types, use the mapping
		debitAmount = journalAmount;
		creditAmount = journalAmount;
	}

	const journalEntry = await prisma.journalEntry.create({
		data: {
			entryNumber,
			entryDate: transaction.transactionDate || new Date(),
			narration: `User Transaction: ${transaction.transactionType} - ${transaction.description || "No description"}`,
			reference: transaction.referenceNumber || `TXN-${transaction.id}`,
			status: "POSTED" as const,
			createdById: adminUserId,
			approvedById: adminUserId,
			journalEntryLines: {
				create: [
					{
						accountId: debitAccountId,
						debitAmount: debitAmount,
						creditAmount: 0,
						description: `${transaction.transactionType} - Debit`,
					},
					{
						accountId: creditAccountId,
						debitAmount: 0,
						creditAmount: creditAmount,
						description: `${transaction.transactionType} - Credit`,
					},
				],
			},
		},
		include: {
			journalEntryLines: true,
		},
	});

	return journalEntry.id;
};
