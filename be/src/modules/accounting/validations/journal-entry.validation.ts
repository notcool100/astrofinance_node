import { body, param, query } from 'express-validator';

/**
 * Validation schema for creating journal entry
 */
export const createJournalEntryValidation = [
  body('entryDate')
    .notEmpty()
    .withMessage('Entry date is required')
    .isISO8601()
    .withMessage('Entry date must be a valid date'),
  
  body('reference')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Reference cannot exceed 50 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('debitEntries')
    .isArray({ min: 1 })
    .withMessage('At least one debit entry is required'),
  
  body('debitEntries.*.accountId')
    .notEmpty()
    .withMessage('Account ID is required for debit entry')
    .isUUID()
    .withMessage('Account ID must be a valid UUID'),
  
  body('debitEntries.*.amount')
    .notEmpty()
    .withMessage('Amount is required for debit entry')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than zero'),
  
  body('debitEntries.*.description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('creditEntries')
    .isArray({ min: 1 })
    .withMessage('At least one credit entry is required'),
  
  body('creditEntries.*.accountId')
    .notEmpty()
    .withMessage('Account ID is required for credit entry')
    .isUUID()
    .withMessage('Account ID must be a valid UUID'),
  
  body('creditEntries.*.amount')
    .notEmpty()
    .withMessage('Amount is required for credit entry')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than zero'),
  
  body('creditEntries.*.description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
];

/**
 * Validation schema for updating journal entry status
 */
export const updateJournalEntryStatusValidation = [
  param('id')
    .notEmpty()
    .withMessage('Journal entry ID is required')
    .isUUID()
    .withMessage('Journal entry ID must be a valid UUID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['DRAFT', 'POSTED', 'REVERSED'])
    .withMessage('Invalid status'),
  
  body('rejectionReason')
    .if(body('status').equals('REVERSED'))
    .notEmpty()
    .withMessage('Rejection reason is required when status is REVERSED')
    .isLength({ min: 10, max: 200 })
    .withMessage('Rejection reason must be between 10 and 200 characters')
];

/**
 * Validation schema for getting journal entries
 */
export const getJournalEntriesValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('status')
    .optional()
    .isIn(['DRAFT', 'POSTED', 'REVERSED'])
    .withMessage('Invalid status'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];