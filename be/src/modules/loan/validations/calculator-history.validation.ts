import { body } from 'express-validator';
import { InterestType } from '../utils/loan.utils';

/**
 * Validation schema for recording a calculation
 */
export const recordCalculationValidation = [
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
  
  body('emi')
    .notEmpty()
    .withMessage('EMI is required')
    .isFloat({ min: 0 })
    .withMessage('EMI must be a positive number'),
  
  body('totalInterest')
    .notEmpty()
    .withMessage('Total interest is required')
    .isFloat({ min: 0 })
    .withMessage('Total interest must be a positive number'),
  
  body('totalAmount')
    .notEmpty()
    .withMessage('Total amount is required')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number')
];