import { body, param, query } from "express-validator";

/**
 * Validation schema for disbursing loan
 */
export const disburseLoanValidation = [
	body("applicationId")
		.notEmpty()
		.withMessage("Application ID is required")
		.isUUID()
		.withMessage("Application ID must be a valid UUID"),

	body("disbursementDate")
		.notEmpty()
		.withMessage("Disbursement date is required")
		.isISO8601()
		.withMessage("Disbursement date must be a valid date"),

	body("firstPaymentDate")
		.notEmpty()
		.withMessage("First payment date is required")
		.isISO8601()
		.withMessage("First payment date must be a valid date"),
];

/**
 * Validation schema for recording loan payment
 */
export const recordLoanPaymentValidation = [
	param("id")
		.notEmpty()
		.withMessage("Loan ID is required")
		.isUUID()
		.withMessage("Loan ID must be a valid UUID"),

	body("installmentId")
		.notEmpty()
		.withMessage("Installment ID is required")
		.isUUID()
		.withMessage("Installment ID must be a valid UUID"),

	body("amount")
		.notEmpty()
		.withMessage("Amount is required")
		.isFloat({ min: 0.01 })
		.withMessage("Amount must be greater than zero"),

	body("paymentDate")
		.optional()
		.isISO8601()
		.withMessage("Payment date must be a valid date"),

	body("paymentMethod")
		.notEmpty()
		.withMessage("Payment method is required")
		.isIn(["CASH", "BANK_TRANSFER", "CHEQUE", "CARD", "MOBILE_MONEY", "OTHER"])
		.withMessage("Invalid payment method"),

	body("referenceNumber")
		.optional()
		.isLength({ max: 50 })
		.withMessage("Reference number cannot exceed 50 characters"),
];

/**
 * Validation schema for calculating early settlement
 */
export const calculateEarlySettlementValidation = [
	param("id")
		.notEmpty()
		.withMessage("Loan ID is required")
		.isUUID()
		.withMessage("Loan ID must be a valid UUID"),

	body("settlementDate")
		.optional()
		.isISO8601()
		.withMessage("Settlement date must be a valid date"),
];

/**
 * Validation schema for processing early settlement
 */
export const processEarlySettlementValidation = [
	param("id")
		.notEmpty()
		.withMessage("Loan ID is required")
		.isUUID()
		.withMessage("Loan ID must be a valid UUID"),

	body("settlementAmount")
		.notEmpty()
		.withMessage("Settlement amount is required")
		.isFloat({ min: 0.01 })
		.withMessage("Settlement amount must be greater than zero"),

	body("paymentDate")
		.optional()
		.isISO8601()
		.withMessage("Payment date must be a valid date"),

	body("paymentMethod")
		.notEmpty()
		.withMessage("Payment method is required")
		.isIn(["CASH", "BANK_TRANSFER", "CHEQUE", "CARD", "MOBILE_MONEY", "OTHER"])
		.withMessage("Invalid payment method"),

	body("referenceNumber")
		.optional()
		.isLength({ max: 50 })
		.withMessage("Reference number cannot exceed 50 characters"),
];

/**
 * Validation schema for getting loans
 */
export const getLoansValidation = [
	query("status")
		.optional()
		.isIn(["ACTIVE", "CLOSED", "DEFAULTED"])
		.withMessage("Invalid status"),

	query("userId")
		.optional()
		.isUUID()
		.withMessage("User ID must be a valid UUID"),

	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),

	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Limit must be between 1 and 100"),
];
