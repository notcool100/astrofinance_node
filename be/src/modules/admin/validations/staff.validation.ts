import { body, param } from 'express-validator';
import { StaffStatus } from '@prisma/client';

// Create staff validation schema
export const createStaffValidation = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required'),
  
  body('firstName')
    .notEmpty()
    .withMessage('First name is required'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('address')
    .notEmpty()
    .withMessage('Address is required'),
  
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .custom((value) => {
      if (isNaN(Date.parse(value))) {
        throw new Error('Invalid date format for date of birth');
      }
      return true;
    }),
  
  body('joinDate')
    .notEmpty()
    .withMessage('Join date is required')
    .custom((value) => {
      if (isNaN(Date.parse(value))) {
        throw new Error('Invalid date format for join date');
      }
      return true;
    }),
  
  body('department')
    .notEmpty()
    .withMessage('Department is required'),
  
  body('position')
    .notEmpty()
    .withMessage('Position is required'),
  
  body('status')
    .optional()
    .isIn(Object.values(StaffStatus))
    .withMessage('Invalid staff status'),
  
  body('roleIds')
    .optional()
    .isArray()
    .withMessage('roleIds must be an array')
];

// Update staff validation schema
export const updateStaffValidation = [
  param('id')
    .notEmpty()
    .withMessage('Staff ID is required'),
  
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty if provided'),
  
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty if provided'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('phone')
    .optional()
    .notEmpty()
    .withMessage('Phone number cannot be empty if provided'),
  
  body('address')
    .optional()
    .notEmpty()
    .withMessage('Address cannot be empty if provided'),
  
  body('department')
    .optional()
    .notEmpty()
    .withMessage('Department cannot be empty if provided'),
  
  body('position')
    .optional()
    .notEmpty()
    .withMessage('Position cannot be empty if provided'),
  
  body('status')
    .optional()
    .isIn(Object.values(StaffStatus))
    .withMessage('Invalid staff status'),
  
  body('roleIds')
    .optional()
    .isArray()
    .withMessage('roleIds must be an array')
];

// Reset password validation schema
export const resetPasswordValidation = [
  param('id')
    .notEmpty()
    .withMessage('Staff ID is required'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];