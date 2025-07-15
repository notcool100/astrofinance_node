import { body, param, query } from 'express-validator';
import { AccountType_COA } from '@prisma/client';

/**
 * Validation schema for creating account
 */
export const createAccountValidation = [
  body('accountName')
    .notEmpty()
    .withMessage('Account name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Account name must be between 3 and 100 characters'),
  
  body('accountCode')
    .notEmpty()
    .withMessage('Account code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Account code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Account code must contain only uppercase letters, numbers, and hyphens'),
  
  body('accountType')
    .notEmpty()
    .withMessage('Account type is required')
    .isIn(Object.values(AccountType_COA))
    .withMessage('Invalid account type'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('parentAccountId')
    .optional()
    .isUUID()
    .withMessage('Parent account ID must be a valid UUID'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for updating account
 */
export const updateAccountValidation = [
  param('id')
    .notEmpty()
    .withMessage('Account ID is required')
    .isUUID()
    .withMessage('Account ID must be a valid UUID'),
  
  body('accountName')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Account name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('parentAccountId')
    .optional()
    .isUUID()
    .withMessage('Parent account ID must be a valid UUID'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * Validation schema for getting accounts
 */
export const getAccountsValidation = [
  query('type')
    .optional()
    .isIn(Object.values(AccountType_COA))
    .withMessage('Invalid account type'),
  
  query('active')
    .optional()
    .isBoolean()
    .withMessage('active must be a boolean')
];