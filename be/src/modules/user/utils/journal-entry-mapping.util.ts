import { TransactionType } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import prisma from "../../../config/database";

/**
 * User transaction types to chart of accounts mapping
 * Using actual account CODES from the database
 */
export const USER_TRANSACTION_ACCOUNT_MAPPING = {
	DEPOSIT: {
		debitAccount: "1101", // Cash in Hand
		creditAccount: "2101", // Customer Deposits
	},
	WITHDRAWAL: {
		debitAccount: "2101", // Customer Deposits
		creditAccount: "1101", // Cash in Hand
	},
	INTEREST_CREDIT: {
		debitAccount: "5101", // Interest Expense
		creditAccount: "2101", // Customer Deposits
	},
	FEE_DEBIT: {
		debitAccount: "2101", // Customer Deposits
		creditAccount: "4200", // Fee Income
	},
	ADJUSTMENT: {
		debitAccount: "1101", // Cash in Hand
		creditAccount: "4300", // Other Income
	},
	TRANSFER_IN: {
		debitAccount: "2101", // Customer Deposits (from source)
		creditAccount: "2101", // Customer Deposits (to destination)
	},
	TRANSFER_OUT: {
		debitAccount: "2101", // Customer Deposits
		creditAccount: "2101", // Customer Deposits
	},
};

/**
 * Get account ID by account code
 */
export const getAccountIdByCode = async (
	accountCode: string,
): Promise<string | null> => {
	const account = await prisma.account_COA.findUnique({
		where: { accountCode },
	});

	if (account && account.isActive) {
		return account.id;
	}

	console.error(`Account not found or inactive: ${accountCode}`);
	return null;
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

	if (!accountMapping) {
		throw new Error(`No account mapping found for transaction type: ${transaction.transactionType}`);
	}

	// Get account IDs by CODE
	const [debitAccountId, creditAccountId] = await Promise.all([
		getAccountIdByCode(accountMapping.debitAccount),
		getAccountIdByCode(accountMapping.creditAccount),
	]);

	if (!debitAccountId || !creditAccountId) {
		throw new Error(
			`Required accounts not found: ${accountMapping.debitAccount} (debit) or ${accountMapping.creditAccount} (credit). Please run 'npx prisma db seed' to create the required accounts.`,
		);
	}

	// Convert amount to number if it's a Decimal
	const amountValue =
		typeof transaction.amount === "number"
			? transaction.amount
			: Number(transaction.amount.toString());

	const journalAmount = Math.abs(amountValue);

	// Determine debit and credit amounts based on transaction type
	let debitAmount = journalAmount;
	let creditAmount = journalAmount;

	if (transaction.transactionType === TransactionType.ADJUSTMENT) {
		// For adjustments, amount can be positive or negative
		if (amountValue < 0) {
			// Negative adjustment - swap debit and credit
			debitAmount = 0;
			creditAmount = journalAmount;
		} else {
			debitAmount = journalAmount;
			creditAmount = journalAmount;
		}
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

	console.log(`Created journal entry ${journalEntry.entryNumber} for transaction ${transaction.id}`);
	return journalEntry.id;
};
