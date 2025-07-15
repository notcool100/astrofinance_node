import { body, param, query } from 'express-validator';

/**
 * Validation schema for creating expense category
 */
export const createExpenseCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['OPERATIONAL', 'ADMINISTRATIVE', 'FINANCIAL', 'OTHER'])
    .withMessage('Invalid expense category type'),
  
  body('accountId')
    .optional()
    .isUUID()
    .withMessage('Account ID must be a valid UUID'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for updating expense category
 */
export const updateExpenseCategoryValidation = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('type')
    .optional()
    .isIn(['OPERATIONAL', 'ADMINISTRATIVE', 'FINANCIAL', 'OTHER'])
    .withMessage('Invalid expense category type'),
  
  body('accountId')
    .optional()
    .isUUID()
    .withMessage('Account ID must be a valid UUID'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for getting expense categories
 */
export const getExpenseCategoriesValidation = [
  query('type')
    .optional()
    .isIn(['OPERATIONAL', 'ADMINISTRATIVE', 'FINANCIAL', 'OTHER'])
    .withMessage('Invalid expense category type')
];

/**
 * Validation schema for creating expense
 */
export const createExpenseValidation = [
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('expenseDate')
    .notEmpty()
    .withMessage('Expense date is required')
    .isISO8601()
    .withMessage('Expense date must be a valid date'),
  
  body('reference')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Reference cannot exceed 100 characters'),
  
  body('paymentMethod')
    .optional()
    .isIn(['CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'OTHER'])
    .withMessage('Invalid payment method'),
  
  body('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED'])
    .withMessage('Invalid status')
];

/**
 * Validation schema for updating expense
 */
export const updateExpenseValidation = [
  param('id')
    .notEmpty()
    .withMessage('Expense ID is required')
    .isUUID()
    .withMessage('Expense ID must be a valid UUID'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('expenseDate')
    .optional()
    .isISO8601()
    .withMessage('Expense date must be a valid date'),
  
  body('reference')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Reference cannot exceed 100 characters'),
  
  body('paymentMethod')
    .optional()
    .isIn(['CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'OTHER'])
    .withMessage('Invalid payment method')
];

/**
 * Validation schema for approving/rejecting expense
 */
export const approveRejectExpenseValidation = [
  param('id')
    .notEmpty()
    .withMessage('Expense ID is required')
    .isUUID()
    .withMessage('Expense ID must be a valid UUID'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

/**
 * Validation schema for getting expenses
 */
export const getExpensesValidation = [
  query('category')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query && req.query.startDate && value) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(value);
        if (endDate < startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];