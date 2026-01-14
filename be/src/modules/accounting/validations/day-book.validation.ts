import { body, param, query } from 'express-validator';

/**
 * Validation schema for creating day book
 */
export const createDayBookValidation = [
  body('transactionDate')
    .notEmpty()
    .withMessage('Transaction date is required')
    .isISO8601()
    .withMessage('Transaction date must be a valid date'),

  body('openingBalance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Opening balance must be a positive number')
];

/**
 * Validation schema for reconciling day book
 */
export const reconcileDayBookValidation = [
  param('id')
    .notEmpty()
    .withMessage('Day book ID is required')
    .isUUID()
    .withMessage('Day book ID must be a valid UUID'),

  body('physicalCashBalance')
    .notEmpty()
    .withMessage('Physical cash balance is required')
    .isFloat({ min: 0 })
    .withMessage('Physical cash balance must be a positive number'),

  body('discrepancyNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Discrepancy notes cannot exceed 500 characters'),

  body('denominations')
    .optional()
    .isObject()
    .withMessage('Denominations must be a valid object')
];

/**
 * Validation schema for closing day book
 */
export const closeDayBookValidation = [
  param('id')
    .notEmpty()
    .withMessage('Day book ID is required')
    .isUUID()
    .withMessage('Day book ID must be a valid UUID')
];

/**
 * Validation schema for getting day books
 */
export const getDayBooksValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),

  query('isReconciled')
    .optional()
    .isBoolean()
    .withMessage('isReconciled must be a boolean'),

  query('isClosed')
    .optional()
    .isBoolean()
    .withMessage('isClosed must be a boolean'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation schema for adding transaction to daybook
 */
export const addTransactionValidation = [
  param('dayBookId')
    .notEmpty()
    .withMessage('Day book ID is required')
    .isUUID()
    .withMessage('Day book ID must be a valid UUID'),

  body('transactionType')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn([
      'CASH_RECEIPT',
      'CASH_PAYMENT',
      'BANK_DEPOSIT',
      'BANK_WITHDRAWAL',
      'INTERNAL_TRANSFER',
      'LOAN_DISBURSEMENT',
      'LOAN_PAYMENT',
      'INTEREST_RECEIVED',
      'INTEREST_PAID',
      'FEE_RECEIVED',
      'FEE_PAID',
      'OTHER_INCOME',
      'OTHER_EXPENSE'
    ])
    .withMessage('Invalid transaction type'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Description must be between 3 and 500 characters'),

  body('referenceNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Reference number cannot exceed 50 characters'),

  body('counterparty')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Counterparty cannot exceed 200 characters'),

  body('paymentMethod')
    .optional()
    .isIn(['CASH', 'CHEQUE', 'BANK_TRANSFER', 'ONLINE', 'CARD', 'OTHER'])
    .withMessage('Invalid payment method'),

  body('debitAccountId')
    .optional()
    .isUUID()
    .withMessage('Debit account ID must be a valid UUID'),

  body('creditAccountId')
    .optional()
    .isUUID()
    .withMessage('Credit account ID must be a valid UUID')
];

/**
 * Validation schema for getting daybook transactions
 */
export const getDayBookTransactionsValidation = [
  param('dayBookId')
    .notEmpty()
    .withMessage('Day book ID is required')
    .isUUID()
    .withMessage('Day book ID must be a valid UUID'),

  query('transactionType')
    .optional()
    .isIn([
      'CASH_RECEIPT',
      'CASH_PAYMENT',
      'BANK_DEPOSIT',
      'BANK_WITHDRAWAL',
      'INTERNAL_TRANSFER',
      'LOAN_DISBURSEMENT',
      'LOAN_PAYMENT',
      'INTEREST_RECEIVED',
      'INTEREST_PAID',
      'FEE_RECEIVED',
      'FEE_PAID',
      'OTHER_INCOME',
      'OTHER_EXPENSE'
    ])
    .withMessage('Invalid transaction type'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation schema for deleting daybook transaction
 */
export const deleteTransactionValidation = [
  param('transactionId')
    .notEmpty()
    .withMessage('Transaction ID is required')
    .isUUID()
    .withMessage('Transaction ID must be a valid UUID')
];