import { DayBookTransactionType, TransactionType } from "@prisma/client";
import prisma from "../../config/database";
import logger from "../../config/logger";
import { prepareForJournalEntry } from "./currency.util";

/**
 * Utility to automatically integrate user transactions with daybook
 */

/**
 * Maps user transaction types to daybook transaction types
 */
const USER_TO_DAYBOOK_TRANSACTION_MAPPING: Record<
	TransactionType,
	DayBookTransactionType
> = {
	DEPOSIT: DayBookTransactionType.CASH_RECEIPT,
	WITHDRAWAL: DayBookTransactionType.CASH_PAYMENT,
	TRANSFER_IN: DayBookTransactionType.INTERNAL_TRANSFER,
	TRANSFER_OUT: DayBookTransactionType.INTERNAL_TRANSFER,
	INTEREST_CREDIT: DayBookTransactionType.INTEREST_RECEIVED,
	FEE_DEBIT: DayBookTransactionType.FEE_PAID,
	ADJUSTMENT: DayBookTransactionType.OTHER_INCOME, // or OTHER_EXPENSE based on amount
};

/**
 * Maps transaction methods to payment methods (for future use)
 */
// const TRANSACTION_METHOD_TO_PAYMENT_METHOD: Record<string, PaymentMethod> = {
// 	CASH: PaymentMethod.CASH,
// 	BANK: PaymentMethod.BANK_TRANSFER,
// 	CHEQUE: PaymentMethod.CHEQUE,
// 	SYSTEM: PaymentMethod.BANK_TRANSFER,
// 	CARD: PaymentMethod.CARD,
// };

/**
 * Get or create daybook for a specific date
 */
export const getOrCreateDayBook = async (
	transactionDate: Date,
): Promise<string> => {
	try {
		// Check if daybook exists for this date
		const startOfDay = new Date(transactionDate);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(transactionDate);
		endOfDay.setHours(23, 59, 59, 999);

		let dayBook = await prisma.dayBook.findFirst({
			where: {
				transactionDate: {
					gte: startOfDay,
					lte: endOfDay,
				},
			},
		});

		if (!dayBook) {
			// Generate book number
			const today = new Date(transactionDate);
			const year = today.getFullYear().toString();
			const month = (today.getMonth() + 1).toString().padStart(2, "0");
			const day = today.getDate().toString().padStart(2, "0");
			const prefix = `DB${year}${month}${day}`;

			const dayBooksCount = await prisma.dayBook.count({
				where: {
					transactionDate: {
						gte: startOfDay,
						lte: endOfDay,
					},
				},
			});

			const sequentialNumber = (dayBooksCount + 1).toString().padStart(2, "0");
			const bookNumber = `${prefix}-${sequentialNumber}`;

			// Create new daybook
			dayBook = await prisma.dayBook.create({
				data: {
					bookNumber,
					transactionDate: startOfDay,
					openingBalance: 0,
					closingBalance: 0,
					systemCashBalance: 0,
					isReconciled: false,
					isClosed: false,
				},
			});

			logger.info(
				`Created new daybook for date ${transactionDate.toISOString()}`,
			);
		}

		return dayBook.id;
	} catch (error) {
		logger.error(`Error getting or creating daybook: ${error}`);
		throw error;
	}
};

/**
 * Add user transaction to daybook
 */
export const addUserTransactionToDayBook = async (
	userTransaction: {
		id: string;
		accountId: string;
		transactionType: TransactionType;
		amount: number | string | { toString(): string };
		description: string | null;
		referenceNumber?: string | null;
		transactionMethod: string | null;
		transactionDate: Date;
	},
	_adminUserId: string,
): Promise<void> => {
	try {
		// Skip if daybook is closed for the transaction date
		const transactionDate = new Date(userTransaction.transactionDate);
		const dayBookId = await getOrCreateDayBook(transactionDate);

		// Check if daybook is closed
		const dayBook = await prisma.dayBook.findUnique({
			where: { id: dayBookId },
		});

		if (dayBook?.isClosed) {
			logger.warn(
				`Daybook is closed. Cannot add transaction ${userTransaction.id}`,
			);
			return;
		}

		// Map user transaction type to daybook transaction type
		let dayBookTransactionType =
			USER_TO_DAYBOOK_TRANSACTION_MAPPING[
				userTransaction.transactionType as TransactionType
			];

		// Special handling for adjustments
		if (userTransaction.transactionType === TransactionType.ADJUSTMENT) {
			dayBookTransactionType =
				prepareForJournalEntry(userTransaction.amount, false) >= 0
					? DayBookTransactionType.OTHER_INCOME
					: DayBookTransactionType.OTHER_EXPENSE;
		}

		// Map payment method (for future use)
		// const paymentMethod = TRANSACTION_METHOD_TO_PAYMENT_METHOD[userTransaction.transactionMethod] || PaymentMethod.CASH;

		// Get user account info for description (for future use)
		// const userAccount = await prisma.userAccount.findUnique({
		// 	where: { id: userTransaction.accountId },
		// 	include: { user: true },
		// });

		// Update daybook balances
		let balanceChange = 0;
		if (
			dayBookTransactionType === DayBookTransactionType.CASH_RECEIPT ||
			dayBookTransactionType === DayBookTransactionType.INTEREST_RECEIVED ||
			dayBookTransactionType === DayBookTransactionType.OTHER_INCOME
		) {
			balanceChange = prepareForJournalEntry(userTransaction.amount, false);
		} else if (
			dayBookTransactionType === DayBookTransactionType.CASH_PAYMENT ||
			dayBookTransactionType === DayBookTransactionType.FEE_PAID ||
			dayBookTransactionType === DayBookTransactionType.OTHER_EXPENSE
		) {
			balanceChange = -prepareForJournalEntry(userTransaction.amount, false);
		}
		// INTERNAL_TRANSFER doesn't change overall cash balance

		if (balanceChange !== 0) {
			await prisma.dayBook.update({
				where: { id: dayBookId },
				data: {
					closingBalance: {
						increment: balanceChange,
					},
					systemCashBalance: {
						increment: balanceChange,
					},
				},
			});
		}

		const description =
			userTransaction.description ||
			`${userTransaction.transactionType} transaction`;
		const method = userTransaction.transactionMethod || "UNKNOWN";
		logger.info(
			`Added user transaction ${userTransaction.id} (${description}) via ${method} to daybook. Balance change: ${balanceChange}`,
		);
	} catch (error) {
		logger.error(`Error adding user transaction to daybook: ${error}`);
		// Don't throw error to prevent user transaction from failing
		// Just log the error and continue
	}
};

/**
 * Remove user transaction from daybook (for cancellations/reversals)
 */
export const removeUserTransactionFromDayBook = async (
	userTransactionId: string,
	_adminUserId: string,
): Promise<void> => {
	try {
		// For now, just log that we would remove the transaction
		// In a full implementation, this would reverse the daybook balance changes
		logger.info(
			`Would remove user transaction ${userTransactionId} from daybook`,
		);
	} catch (error) {
		logger.error(`Error removing user transaction from daybook: ${error}`);
		// Don't throw error to prevent user transaction reversal from failing
	}
};

export default {
	getOrCreateDayBook,
	addUserTransactionToDayBook,
	removeUserTransactionFromDayBook,
};
