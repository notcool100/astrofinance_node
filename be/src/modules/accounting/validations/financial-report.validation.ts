import { param, query } from 'express-validator';

/**
 * Validation schema for getting account balance
 */
export const getAccountBalanceValidation = [
  param('id')
    .notEmpty()
    .withMessage('Account ID is required')
    .isUUID()
    .withMessage('Account ID must be a valid UUID'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

/**
 * Validation schema for getting trial balance
 */
export const getTrialBalanceValidation = [
  query('asOfDate')
    .optional()
    .isISO8601()
    .withMessage('As of date must be a valid date')
];

/**
 * Validation schema for getting income statement
 */
export const getIncomeStatementValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

/**
 * Validation schema for getting balance sheet
 */
export const getBalanceSheetValidation = [
  query('asOfDate')
    .optional()
    .isISO8601()
    .withMessage('As of date must be a valid date')
];

/**
 * Validation schema for getting general ledger
 */
export const getGeneralLedgerValidation = [
  query('accountId')
    .optional()
    .isUUID()
    .withMessage('Account ID must be a valid UUID'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];