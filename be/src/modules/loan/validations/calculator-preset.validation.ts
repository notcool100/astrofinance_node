import { body } from 'express-validator';
import { InterestType } from '../utils/loan.utils';

/**
 * Validation schema for creating a calculator preset
 */
export const createCalculatorPresetValidation = [
  body('name')
    .notEmpty()
    .withMessage('Preset name is required')
    .isString()
    .withMessage('Preset name must be a string')
    .isLength({ min: 3, max: 50 })
    .withMessage('Preset name must be between 3 and 50 characters'),
  
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  body('loanTypeId')
    .optional()
    .isUUID()
    .withMessage('Loan type ID must be a valid UUID'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than zero'),
  
  body('tenure')
    .notEmpty()
    .withMessage('Tenure is required')
    .isInt({ min: 1 })
    .withMessage('Tenure must be a positive integer'),
  
  body('interestRate')
    .notEmpty()
    .withMessage('Interest rate is required')
    .isFloat({ min: 0 })
    .withMessage('Interest rate must be a positive number'),
  
  body('interestType')
    .notEmpty()
    .withMessage('Interest type is required')
    .isIn(Object.values(InterestType))
    .withMessage('Invalid interest type'),
  
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];

/**
 * Validation schema for updating a calculator preset
 */
export const updateCalculatorPresetValidation = [
  body('name')
    .optional()
    .isString()
    .withMessage('Preset name must be a string')
    .isLength({ min: 3, max: 50 })
    .withMessage('Preset name must be between 3 and 50 characters'),
  
  body('loanTypeId')
    .optional()
    .isUUID()
    .withMessage('Loan type ID must be a valid UUID'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than zero'),
  
  body('tenure')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Tenure must be a positive integer'),
  
  body('interestRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Interest rate must be a positive number'),
  
  body('interestType')
    .optional()
    .isIn(Object.values(InterestType))
    .withMessage('Invalid interest type'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];