import { body, param } from 'express-validator';

/**
 * Validation schema for creating navigation group
 */
export const createNavigationGroupValidation = [
  body('name')
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Group name must be between 3 and 50 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('order')
    .notEmpty()
    .withMessage('Order is required')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for updating navigation group
 */
export const updateNavigationGroupValidation = [
  param('id')
    .notEmpty()
    .withMessage('Group ID is required'),
  
  body('name')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Group name must be between 3 and 50 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for creating navigation item
 */
export const createNavigationItemValidation = [
  body('label')
    .notEmpty()
    .withMessage('Label is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Label must be between 2 and 50 characters'),
  
  body('icon')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
  
  body('url')
    .optional()
    .isLength({ max: 200 })
    .withMessage('URL cannot exceed 200 characters'),
  
  body('order')
    .notEmpty()
    .withMessage('Order is required')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
  
  body('groupId')
    .optional()
    .isUUID()
    .withMessage('Group ID must be a valid UUID'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for updating navigation item
 */
export const updateNavigationItemValidation = [
  param('id')
    .notEmpty()
    .withMessage('Item ID is required'),
  
  body('label')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Label must be between 2 and 50 characters'),
  
  body('icon')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
  
  body('url')
    .optional()
    .isLength({ max: 200 })
    .withMessage('URL cannot exceed 200 characters'),
  
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
  
  body('groupId')
    .optional()
    .isUUID()
    .withMessage('Group ID must be a valid UUID'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];