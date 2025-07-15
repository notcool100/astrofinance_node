import { body } from 'express-validator';
import { InterestType } from '../utils/loan.utils';

/**
 * Validation schema for calculating EMI
 */
export const calculateEMIValidation = [
  body('principal')
    .notEmpty()
    .withMessage('Principal amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Principal amount must be greater than zero'),
  
  body('interestRate')
    .notEmpty()
    .withMessage('Interest rate is required')
    .isFloat({ min: 0 })
    .withMessage('Interest rate must be a positive number'),
  
  body('tenure')
    .notEmpty()
    .withMessage('Tenure is required')
    .isInt({ min: 1 })
    .withMessage('Tenure must be a positive integer'),
  
  body('interestType')
    .notEmpty()
    .withMessage('Interest type is required')
    .isIn(Object.values(InterestType))
    .withMessage('Invalid interest type')
];

/**
 * Validation schema for generating amortization schedule
 */
export const generateAmortizationScheduleValidation = [
  body('principal')
    .notEmpty()
    .withMessage('Principal amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Principal amount must be greater than zero'),
  
  body('interestRate')
    .notEmpty()
    .withMessage('Interest rate is required')
    .isFloat({ min: 0 })
    .withMessage('Interest rate must be a positive number'),
  
  body('tenure')
    .notEmpty()
    .withMessage('Tenure is required')
    .isInt({ min: 1 })
    .withMessage('Tenure must be a positive integer'),
  
  body('interestType')
    .notEmpty()
    .withMessage('Interest type is required')
    .isIn(Object.values(InterestType))
    .withMessage('Invalid interest type'),
  
  body('disbursementDate')
    .optional()
    .isISO8601()
    .withMessage('Disbursement date must be a valid date'),
  
  body('firstPaymentDate')
    .optional()
    .isISO8601()
    .withMessage('First payment date must be a valid date')
];