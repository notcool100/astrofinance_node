import { body, param } from 'express-validator';
import { InterestType } from '../utils/loan.utils';

/**
 * Validation schema for creating loan type
 */
export const createLoanTypeValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  
  body('code')
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must contain only uppercase letters and numbers'),
  
  body('interestType')
    .notEmpty()
    .withMessage('Interest type is required')
    .isIn(Object.values(InterestType))
    .withMessage('Invalid interest type'),
  
  body('minAmount')
    .notEmpty()
    .withMessage('Minimum amount is required')
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),
  
  body('maxAmount')
    .notEmpty()
    .withMessage('Maximum amount is required')
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number')
    .custom((value, { req }) => {
      if (value <= req.body.minAmount) {
        throw new Error('Maximum amount must be greater than minimum amount');
      }
      return true;
    }),
  
  body('minTenure')
    .notEmpty()
    .withMessage('Minimum tenure is required')
    .isInt({ min: 1 })
    .withMessage('Minimum tenure must be a positive integer'),
  
  body('maxTenure')
    .notEmpty()
    .withMessage('Maximum tenure is required')
    .isInt({ min: 1 })
    .withMessage('Maximum tenure must be a positive integer')
    .custom((value, { req }) => {
      if (value <= req.body.minTenure) {
        throw new Error('Maximum tenure must be greater than minimum tenure');
      }
      return true;
    }),
  
  body('interestRate')
    .notEmpty()
    .withMessage('Interest rate is required')
    .isFloat({ min: 0 })
    .withMessage('Interest rate must be a positive number'),
  
  body('processingFeePercent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Processing fee percentage must be between 0 and 100'),
  
  body('lateFeeAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Late fee amount must be a positive number'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for updating loan type
 */
export const updateLoanTypeValidation = [
  param('id')
    .notEmpty()
    .withMessage('Loan type ID is required'),
  
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  
  body('interestType')
    .optional()
    .isIn(Object.values(InterestType))
    .withMessage('Invalid interest type'),
  
  body('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),
  
  body('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number')
    .custom((value, { req }) => {
      if (req.body.minAmount && value <= req.body.minAmount) {
        throw new Error('Maximum amount must be greater than minimum amount');
      }
      return true;
    }),
  
  body('minTenure')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum tenure must be a positive integer'),
  
  body('maxTenure')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum tenure must be a positive integer')
    .custom((value, { req }) => {
      if (req.body.minTenure && value <= req.body.minTenure) {
        throw new Error('Maximum tenure must be greater than minimum tenure');
      }
      return true;
    }),
  
  body('interestRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Interest rate must be a positive number'),
  
  body('processingFeePercent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Processing fee percentage must be between 0 and 100'),
  
  body('lateFeeAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Late fee amount must be a positive number'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];