import { PrismaClient, TransactionType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { createJournalEntryForUserTransaction } from "./journal-entry-mapping.util";

const prisma = new PrismaClient();

/**
 * Calculate interest for an account based on its type and balance
 * @param accountId The account ID to calculate interest for
 * @returns The calculated interest amount
 */
export const calculateInterest = async (accountId: string): Promise<number> => {
	const account = await prisma.userAccount.findUnique({
		where: { id: accountId },
		include: {
			mbAccountDetails: true,
		},
	});

	if (!account) {
		throw new Error("Account not found");
	}

	// Get the current balance and interest rate as Decimal
	const balance = account.balance;
	const interestRate = account.interestRate;

	// Calculate interest based on account type
	let interestAmount = new Decimal(0);

	switch (account.accountType) {
		case "SB":
		case "BB":
			// Simple interest calculation for savings accounts (monthly)
			// (balance * interestRate / 100) / 12
			interestAmount = balance
				.mul(interestRate)
				.div(new Decimal(100))
				.div(new Decimal(12));
			break;

		case "FD":
			// For fixed deposits, interest might be calculated differently
			// This is a simplified version
			interestAmount = balance
				.mul(interestRate)
				.div(new Decimal(100))
				.div(new Decimal(12));
			break;

		default:
			// No interest for other account types
			interestAmount = new Decimal(0);
	}

	// Convert to number with 2 decimal places for return
	return Number(interestAmount.toFixed(2));
};

/**
 * Apply interest to an account
 * @param accountId The account ID to apply interest to
 * @param adminUserId The admin user ID performing the operation
 * @returns The created transaction and updated account
 */
export const applyInterest = async (accountId: string, adminUserId: string) => {
	// Calculate interest
	const interestAmount = await calculateInterest(accountId);

	if (interestAmount <= 0) {
		throw new Error("No interest to apply");
	}

	// Get current account
	const account = await prisma.userAccount.findUnique({
		where: { id: accountId },
	});

	if (!account) {
		throw new Error("Account not found");
	}

	// Calculate new balance
	const decimalInterestAmount = new Decimal(interestAmount.toString());
	const newBalance = account.balance.add(decimalInterestAmount);

	// Create transaction and update account in a transaction
	const result = await prisma.$transaction(async (tx) => {
		// Create the interest transaction
		const transaction = await tx.userAccountTransaction.create({
			data: {
				accountId,
				transactionType: TransactionType.INTEREST_CREDIT,
				amount: interestAmount,
				description: "Monthly interest credit",
				runningBalance: newBalance,
				performedById: adminUserId,
				transactionMethod: "SYSTEM",
			},
		});

		// Create journal entry for the interest transaction
		let journalEntryId: string | null = null;
		try {
			journalEntryId = await createJournalEntryForUserTransaction(
				{
					...transaction,
					transactionDate: new Date(),
				},
				adminUserId,
			);

			// Update transaction with journal entry reference
			await tx.userAccountTransaction.update({
				where: { id: transaction.id },
				data: { journalEntryId },
			});
		} catch (journalError) {
			console.error(
				"Error creating journal entry for interest transaction:",
				journalError,
			);
		}

		// Update account balance
		const updatedAccount = await tx.userAccount.update({
			where: { id: accountId },
			data: {
				balance: newBalance,
				lastTransactionDate: new Date(),
			},
		});

		return { transaction, updatedAccount, journalEntryId };
	});

	return result;
};

/**
 * Get transaction statistics for a user
 * @param userId The user ID to get statistics for
 * @returns Transaction statistics
 */
export const getUserTransactionStats = async (userId: string) => {
	// Get all accounts for the user
	const accounts = await prisma.userAccount.findMany({
		where: { userId },
	});

	const accountIds = accounts.map((account) => account.id);

	// Get current month's start and end dates
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const endOfMonth = new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0,
		23,
		59,
		59,
	);

	// Get transactions for the current month
	const transactions = await prisma.userAccountTransaction.findMany({
		where: {
			accountId: { in: accountIds },
			transactionDate: {
				gte: startOfMonth,
				lte: endOfMonth,
			},
		},
	});

	// Calculate statistics
	let totalDeposits = new Decimal(0);
	let totalWithdrawals = new Decimal(0);
	let totalInterestEarned = new Decimal(0);
	let totalFees = new Decimal(0);

	transactions.forEach((transaction) => {
		switch (transaction.transactionType) {
			case TransactionType.DEPOSIT:
			case TransactionType.TRANSFER_IN:
				totalDeposits = totalDeposits.add(transaction.amount);
				break;
			case TransactionType.WITHDRAWAL:
			case TransactionType.TRANSFER_OUT:
				totalWithdrawals = totalWithdrawals.add(transaction.amount);
				break;
			case TransactionType.INTEREST_CREDIT:
				totalInterestEarned = totalInterestEarned.add(transaction.amount);
				break;
			case TransactionType.FEE_DEBIT:
				totalFees = totalFees.add(transaction.amount);
				break;
		}
	});

	const stats = {
		totalDeposits: Number(totalDeposits.toFixed(2)),
		totalWithdrawals: Number(totalWithdrawals.toFixed(2)),
		totalInterestEarned: Number(totalInterestEarned.toFixed(2)),
		totalFees: Number(totalFees.toFixed(2)),
		transactionCount: transactions.length,
	};

	return stats;
};

/**
 * Transfer funds between two accounts
 * @param fromAccountId Source account ID
 * @param toAccountId Destination account ID
 * @param amount Amount to transfer
 * @param description Transaction description
 * @param adminUserId Admin user performing the transfer
 * @returns The created transactions and updated accounts
 */
export const transferFunds = async (
	fromAccountId: string,
	toAccountId: string,
	amount: number,
	description: string,
	adminUserId: string,
) => {
	// Validate accounts
	const [fromAccount, toAccount] = await Promise.all([
		prisma.userAccount.findUnique({ where: { id: fromAccountId } }),
		prisma.userAccount.findUnique({ where: { id: toAccountId } }),
	]);

	if (!fromAccount || !toAccount) {
		throw new Error("One or both accounts not found");
	}

	// Convert amount to Decimal
	const decimalAmount = new Decimal(amount.toString());

	// Check sufficient balance
	if (fromAccount.balance.lessThan(decimalAmount)) {
		throw new Error("Insufficient balance for transfer");
	}

	// Calculate new balances
	const newFromBalance = fromAccount.balance.sub(decimalAmount);
	const newToBalance = toAccount.balance.add(decimalAmount);

	// Create transactions and update accounts in a transaction
	const result = await prisma.$transaction(async (tx) => {
		// Create outgoing transaction
		const outTransaction = await tx.userAccountTransaction.create({
			data: {
				accountId: fromAccountId,
				transactionType: TransactionType.TRANSFER_OUT,
				amount,
				description:
					description || `Transfer to account ${toAccount.accountNumber}`,
				runningBalance: newFromBalance,
				performedById: adminUserId,
				transactionMethod: "SYSTEM",
				referenceNumber: `TRF-${Date.now()}`,
			},
		});

		// Create incoming transaction
		const inTransaction = await tx.userAccountTransaction.create({
			data: {
				accountId: toAccountId,
				transactionType: TransactionType.TRANSFER_IN,
				amount,
				description:
					description || `Transfer from account ${fromAccount.accountNumber}`,
				runningBalance: newToBalance,
				performedById: adminUserId,
				transactionMethod: "SYSTEM",
				referenceNumber: `TRF-${Date.now()}`,
			},
		});

		// Create journal entries for both transactions
		let outJournalEntryId: string | null = null;
		let inJournalEntryId: string | null = null;

		try {
			// Create journal entry for outgoing transaction
			outJournalEntryId = await createJournalEntryForUserTransaction(
				{
					...outTransaction,
					transactionDate: new Date(),
				},
				adminUserId,
			);

			// Update outgoing transaction with journal entry reference
			await tx.userAccountTransaction.update({
				where: { id: outTransaction.id },
				data: { journalEntryId: outJournalEntryId },
			});
		} catch (journalError) {
			console.error(
				"Error creating journal entry for outgoing transaction:",
				journalError,
			);
		}

		try {
			// Create journal entry for incoming transaction
			inJournalEntryId = await createJournalEntryForUserTransaction(
				{
					...inTransaction,
					transactionDate: new Date(),
				},
				adminUserId,
			);

			// Update incoming transaction with journal entry reference
			await tx.userAccountTransaction.update({
				where: { id: inTransaction.id },
				data: { journalEntryId: inJournalEntryId },
			});
		} catch (journalError) {
			console.error(
				"Error creating journal entry for incoming transaction:",
				journalError,
			);
		}

		// Update source account
		const updatedFromAccount = await tx.userAccount.update({
			where: { id: fromAccountId },
			data: {
				balance: newFromBalance,
				lastTransactionDate: new Date(),
			},
		});

		// Update destination account
		const updatedToAccount = await tx.userAccount.update({
			where: { id: toAccountId },
			data: {
				balance: newToBalance,
				lastTransactionDate: new Date(),
			},
		});

		return {
			outTransaction,
			inTransaction,
			updatedFromAccount,
			updatedToAccount,
			outJournalEntryId,
			inJournalEntryId,
		};
	});

	return result;
};

export default {
	calculateInterest,
	applyInterest,
	getUserTransactionStats,
	transferFunds,
};
