import { body, param, query } from 'express-validator';

/**
 * Validation schema for creating setting
 */
export const createSettingValidation = [
  body('key')
    .notEmpty()
    .withMessage('Setting key is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Setting key must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Setting key can only contain letters, numbers, dots, underscores, and hyphens'),
  
  body('value')
    .notEmpty()
    .withMessage('Setting value is required'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('isEncrypted')
    .optional()
    .isBoolean()
    .withMessage('isEncrypted must be a boolean'),
  
  body('dataType')
    .optional()
    .isIn(['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE', 'EMAIL', 'URL', 'PHONE'])
    .withMessage('Invalid data type'),
  
  body('validation')
    .optional()
    .isJSON()
    .withMessage('Validation must be valid JSON')
];

/**
 * Validation schema for updating setting
 */
export const updateSettingValidation = [
  param('key')
    .notEmpty()
    .withMessage('Setting key is required'),
  
  body('value')
    .optional()
    .notEmpty()
    .withMessage('Setting value cannot be empty if provided'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('isEncrypted')
    .optional()
    .isBoolean()
    .withMessage('isEncrypted must be a boolean'),
  
  body('dataType')
    .optional()
    .isIn(['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE', 'EMAIL', 'URL', 'PHONE'])
    .withMessage('Invalid data type'),
  
  body('validation')
    .optional()
    .isJSON()
    .withMessage('Validation must be valid JSON')
];

/**
 * Validation schema for deleting setting
 */
export const deleteSettingValidation = [
  param('key')
    .notEmpty()
    .withMessage('Setting key is required')
];

/**
 * Validation schema for getting setting by key
 */
export const getSettingByKeyValidation = [
  param('key')
    .notEmpty()
    .withMessage('Setting key is required')
];

/**
 * Validation schema for getting all settings
 */
export const getAllSettingsValidation = [
  query('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation schema for bulk update settings
 */
export const bulkUpdateSettingsValidation = [
  body('settings')
    .isArray({ min: 1 })
    .withMessage('Settings must be a non-empty array'),
  
  body('settings.*.key')
    .notEmpty()
    .withMessage('Setting key is required for each setting'),
  
  body('settings.*.value')
    .optional()
    .notEmpty()
    .withMessage('Setting value cannot be empty if provided'),
  
  body('settings.*.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

/**
 * Validation schema for getting setting audit logs
 */
export const getSettingAuditLogsValidation = [
  query('key')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Setting key must be between 1 and 100 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation schema for getting public settings
 */
export const getPublicSettingsValidation = [
  query('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters')
];
