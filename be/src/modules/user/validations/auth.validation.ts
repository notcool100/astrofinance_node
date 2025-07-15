import { body } from 'express-validator';

/**
 * Validation schema for user login
 */
export const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation schema for user registration
 */
export const registerValidation = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Full name must be between 3 and 100 characters'),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('contactNumber')
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Contact number must be a valid phone number'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  
  body('identificationNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Identification number cannot exceed 50 characters'),
  
  body('identificationType')
    .optional()
    .isIn(['NATIONAL_ID', 'PASSPORT', 'DRIVING_LICENSE', 'OTHER'])
    .withMessage('Invalid identification type'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      if (age < 18) {
        throw new Error('User must be at least 18 years old');
      }
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Invalid gender'),
  
  body('occupation')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Occupation cannot exceed 100 characters'),
  
  body('employerName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Employer name cannot exceed 100 characters'),
  
  body('monthlyIncome')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly income must be a positive number')
];

/**
 * Validation schema for updating user profile
 */
export const updateProfileValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Full name must be between 3 and 100 characters'),
  
  body('contactNumber')
    .optional()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Contact number must be a valid phone number'),
  
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  
  body('occupation')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Occupation cannot exceed 100 characters'),
  
  body('employerName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Employer name cannot exceed 100 characters'),
  
  body('monthlyIncome')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly income must be a positive number')
];

/**
 * Validation schema for changing user password
 */
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
];