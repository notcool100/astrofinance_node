import { body, param, query } from 'express-validator';

/**
 * Validation schema for creating report template
 */
export const createReportTemplateValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['LOAN', 'ACCOUNTING', 'USER', 'ADMIN', 'SYSTEM', 'CUSTOM'])
    .withMessage('Invalid category'),
  
  body('query')
    .notEmpty()
    .withMessage('Query is required')
    .isLength({ min: 10 })
    .withMessage('Query must be at least 10 characters long')
    .custom((value) => {
      // Basic validation to prevent dangerous queries
      const dangerousKeywords = [
        'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE',
        'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
      ];
      
      const containsDangerousKeyword = dangerousKeywords.some(keyword => 
        new RegExp(`\\b${keyword}\\b`, 'i').test(value)
      );
      
      if (containsDangerousKeyword) {
        throw new Error('Query contains disallowed keywords');
      }
      
      return true;
    }),
  
  body('parameters')
    .optional()
    .isObject()
    .withMessage('Parameters must be an object'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for updating report template
 */
export const updateReportTemplateValidation = [
  param('id')
    .notEmpty()
    .withMessage('Template ID is required')
    .isUUID()
    .withMessage('Template ID must be a valid UUID'),
  
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('category')
    .optional()
    .isIn(['LOAN', 'ACCOUNTING', 'USER', 'ADMIN', 'SYSTEM', 'CUSTOM'])
    .withMessage('Invalid category'),
  
  body('query')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Query must be at least 10 characters long')
    .custom((value) => {
      // Basic validation to prevent dangerous queries
      const dangerousKeywords = [
        'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE',
        'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
      ];
      
      const containsDangerousKeyword = dangerousKeywords.some(keyword => 
        new RegExp(`\\b${keyword}\\b`, 'i').test(value)
      );
      
      if (containsDangerousKeyword) {
        throw new Error('Query contains disallowed keywords');
      }
      
      return true;
    }),
  
  body('parameters')
    .optional()
    .isObject()
    .withMessage('Parameters must be an object'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for getting report templates
 */
export const getReportTemplatesValidation = [
  query('category')
    .optional()
    .isIn(['LOAN', 'ACCOUNTING', 'USER', 'ADMIN', 'SYSTEM', 'CUSTOM'])
    .withMessage('Invalid category')
];

/**
 * Validation schema for running report
 */
export const runReportValidation = [
  param('id')
    .notEmpty()
    .withMessage('Template ID is required')
    .isUUID()
    .withMessage('Template ID must be a valid UUID'),
  
  body('parameters')
    .optional()
    .isObject()
    .withMessage('Parameters must be an object')
];