import { body, param, query } from 'express-validator';

/**
 * Validation schema for creating SMS template
 */
export const createSmsTemplateValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 500 })
    .withMessage('Content cannot exceed 500 characters'),
  
  body('smsEventId')
    .notEmpty()
    .withMessage('SMS event ID is required')
    .isUUID()
    .withMessage('SMS event ID must be a valid UUID'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for updating SMS template
 */
export const updateSmsTemplateValidation = [
  param('id')
    .notEmpty()
    .withMessage('Template ID is required')
    .isUUID()
    .withMessage('Template ID must be a valid UUID'),
  
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  
  body('content')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Content cannot exceed 500 characters'),
  
  body('smsEventId')
    .optional()
    .isUUID()
    .withMessage('SMS event ID must be a valid UUID'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for getting SMS templates
 */
export const getSmsTemplatesValidation = [
  query('event')
    .optional()
    .isUUID()
    .withMessage('Event ID must be a valid UUID')
];

/**
 * Validation schema for sending test SMS
 */
export const sendTestSmsValidation = [
  body('templateId')
    .notEmpty()
    .withMessage('Template ID is required')
    .isUUID()
    .withMessage('Template ID must be a valid UUID'),
  
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Phone number must be a valid phone number'),
  
  body('placeholders')
    .optional()
    .isObject()
    .withMessage('Placeholders must be an object')
];