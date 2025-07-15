import { body, param } from 'express-validator';

/**
 * Validation schema for creating role
 */
export const createRoleValidation = [
  body('name')
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Role name must be between 3 and 50 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('isSystem')
    .optional()
    .isBoolean()
    .withMessage('isSystem must be a boolean')
];

/**
 * Validation schema for updating role
 */
export const updateRoleValidation = [
  param('id')
    .notEmpty()
    .withMessage('Role ID is required'),
  
  body('name')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Role name must be between 3 and 50 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
];

/**
 * Validation schema for updating role permissions
 */
export const updateRolePermissionsValidation = [
  param('id')
    .notEmpty()
    .withMessage('Role ID is required'),
  
  body('permissionIds')
    .isArray()
    .withMessage('permissionIds must be an array')
];

/**
 * Validation schema for updating role navigation
 */
export const updateRoleNavigationValidation = [
  param('id')
    .notEmpty()
    .withMessage('Role ID is required'),
  
  body('navigationItemIds')
    .isArray()
    .withMessage('navigationItemIds must be an array')
];