import { body, param, query } from 'express-validator';

/**
 * Validation schema for creating tax type
 */
export const createTaxTypeValidation = [
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
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('Code must contain only uppercase letters, numbers, and underscores'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for updating tax type
 */
export const updateTaxTypeValidation = [
  param('id')
    .notEmpty()
    .withMessage('Tax type ID is required')
    .isUUID()
    .withMessage('Tax type ID must be a valid UUID'),
  
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for getting tax types
 */
export const getTaxTypesValidation = [
  query('active')
    .optional()
    .isBoolean()
    .withMessage('active must be a boolean')
];

/**
 * Validation schema for creating tax rate
 */
export const createTaxRateValidation = [
  body('taxTypeId')
    .notEmpty()
    .withMessage('Tax type ID is required')
    .isUUID()
    .withMessage('Tax type ID must be a valid UUID'),
  
  body('rate')
    .notEmpty()
    .withMessage('Rate is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Rate must be a number between 0 and 100'),
  
  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('Effective date must be a valid date'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
    .custom((value, { req }) => {
      if (req.body.effectiveDate && value) {
        const effectiveDate = new Date(req.body.effectiveDate);
        const expiryDate = new Date(value);
        if (expiryDate <= effectiveDate) {
          throw new Error('Expiry date must be after effective date');
        }
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for updating tax rate
 */
export const updateTaxRateValidation = [
  param('id')
    .notEmpty()
    .withMessage('Tax rate ID is required')
    .isUUID()
    .withMessage('Tax rate ID must be a valid UUID'),
  
  body('rate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Rate must be a number between 0 and 100'),
  
  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('Effective date must be a valid date'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
    .custom((value, { req }) => {
      if (req.body.effectiveDate && value) {
        const effectiveDate = new Date(req.body.effectiveDate);
        const expiryDate = new Date(value);
        if (expiryDate <= effectiveDate) {
          throw new Error('Expiry date must be after effective date');
        }
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for getting tax rates
 */
export const getTaxRatesValidation = [
  query('taxTypeId')
    .optional()
    .isUUID()
    .withMessage('Tax type ID must be a valid UUID'),
  
  query('active')
    .optional()
    .isBoolean()
    .withMessage('active must be a boolean')
];

/**
 * Validation schema for calculating tax
 */
export const calculateTaxValidation = [
  body('taxTypeId')
    .notEmpty()
    .withMessage('Tax type ID is required')
    .isUUID()
    .withMessage('Tax type ID must be a valid UUID'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date')
];