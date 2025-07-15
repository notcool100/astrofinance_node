import { Router } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  resetUserPassword, 
  getUserLoans, 
  getUserLoanApplications 
} from '../controllers/user.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createUserValidation, 
  updateUserValidation, 
  resetUserPasswordValidation, 
  getUsersValidation, 
  getUserLoansValidation, 
  getUserLoanApplicationsValidation 
} from '../validations/user.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Get all users
router.get(
  '/', 
  hasPermission('users.view'), 
  validate(getUsersValidation), 
  getAllUsers
);

// Get user by ID
router.get(
  '/:id', 
  hasPermission('users.view'), 
  getUserById
);

// Create new user
router.post(
  '/', 
  hasPermission('users.create'), 
  validate(createUserValidation), 
  createUser
);

// Update user
router.put(
  '/:id', 
  hasPermission('users.edit'), 
  validate(updateUserValidation), 
  updateUser
);

// Reset user password
router.post(
  '/:id/reset-password', 
  hasPermission('users.edit'), 
  validate(resetUserPasswordValidation), 
  resetUserPassword
);

// Get user loans
router.get(
  '/:id/loans', 
  hasPermission('users.view'), 
  validate(getUserLoansValidation), 
  getUserLoans
);

// Get user loan applications
router.get(
  '/:id/loan-applications', 
  hasPermission('users.view'), 
  validate(getUserLoanApplicationsValidation), 
  getUserLoanApplications
);

export default router;