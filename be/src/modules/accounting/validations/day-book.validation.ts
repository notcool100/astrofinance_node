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
  
  body('systemCashBalance')
    .notEmpty()
    .withMessage('System cash balance is required')
    .isFloat({ min: 0 })
    .withMessage('System cash balance must be a positive number')
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
    .withMessage('Discrepancy notes cannot exceed 500 characters')
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