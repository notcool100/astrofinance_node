import { body, param, query } from 'express-validator';

/**
 * Validation schema for creating loan application
 */
export const createLoanApplicationValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  body('loanTypeId')
    .notEmpty()
    .withMessage('Loan type ID is required')
    .isUUID()
    .withMessage('Loan type ID must be a valid UUID'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('tenure')
    .notEmpty()
    .withMessage('Tenure is required')
    .isInt({ min: 1 })
    .withMessage('Tenure must be a positive integer'),
  
  body('purpose')
    .notEmpty()
    .withMessage('Purpose is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Purpose must be between 10 and 500 characters'),
  
  body('documents')
    .optional()
    .isArray()
    .withMessage('Documents must be an array'),
  
  body('documents.*.documentType')
    .optional()
    .notEmpty()
    .withMessage('Document type is required'),
  
  body('documents.*.documentName')
    .optional()
    .notEmpty()
    .withMessage('Document name is required'),
  
  body('documents.*.filePath')
    .optional()
    .notEmpty()
    .withMessage('File path is required')
];

/**
 * Validation schema for updating loan application status
 */
export const updateLoanApplicationStatusValidation = [
  param('id')
    .notEmpty()
    .withMessage('Application ID is required')
    .isUUID()
    .withMessage('Application ID must be a valid UUID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['PENDING', 'APPROVED', 'REJECTED'])
    .withMessage('Invalid status'),
  
  body('rejectionReason')
    .if(body('status').equals('REJECTED'))
    .notEmpty()
    .withMessage('Rejection reason is required when status is REJECTED')
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters')
];

/**
 * Validation schema for uploading loan document
 */
export const uploadLoanDocumentValidation = [
  param('id')
    .notEmpty()
    .withMessage('Application ID is required')
    .isUUID()
    .withMessage('Application ID must be a valid UUID'),
  
  body('documentType')
    .notEmpty()
    .withMessage('Document type is required'),
  
  body('documentName')
    .notEmpty()
    .withMessage('Document name is required'),
  
  body('filePath')
    .notEmpty()
    .withMessage('File path is required')
];

/**
 * Validation schema for getting loan applications
 */
export const getLoanApplicationsValidation = [
  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'DISBURSED'])
    .withMessage('Invalid status'),
  
  query('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];