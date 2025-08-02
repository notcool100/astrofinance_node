import { body } from 'express-validator';

/**
 * Validation schema for uploading a loan document
 */
export const uploadLoanDocumentValidation = [
  body('documentType')
    .notEmpty()
    .withMessage('Document type is required')
    .isString()
    .withMessage('Document type must be a string'),
  
  body('documentName')
    .optional()
    .isString()
    .withMessage('Document name must be a string')
];

/**
 * Validation schema for verifying a loan document
 */
export const verifyLoanDocumentValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['VERIFIED', 'REJECTED'])
    .withMessage('Status must be either VERIFIED or REJECTED'),
  
  body('verificationNotes')
    .optional()
    .isString()
    .withMessage('Verification notes must be a string')
];