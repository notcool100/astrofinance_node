import { Router, type Router as ExpressRouter } from 'express';
import { 
  getUserAccounts, 
  getAccountById, 
  createAccount, 
  updateAccount, 
  closeAccount,
  getAllAccounts
} from '../controllers/account.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createAccountValidation, 
  updateAccountValidation, 
  getUserAccountsValidation,
  getAccountByIdValidation
} from '../validations/account.validation';

const router: ExpressRouter = Router();

// Temporarily disable authentication for testing
// router.use(authenticateAdmin);

// Get all accounts (admin function)
router.get(
  '/', 
  // hasPermission('accounts.view'), 
  getAllAccounts
);

// Get account by ID
router.get(
  '/:id', 
  // hasPermission('accounts.view'), 
  validate(getAccountByIdValidation),
  getAccountById
);

// Create new account
router.post(
  '/', 
  // hasPermission('accounts.create'), 
  validate(createAccountValidation), 
  createAccount
);

// Update account
router.put(
  '/:id', 
  // hasPermission('accounts.edit'), 
  validate(updateAccountValidation), 
  updateAccount
);

// Close account
router.post(
  '/:id/close', 
  // hasPermission('accounts.edit'), 
  closeAccount
);

// Get user accounts
router.get(
  '/user/:userId', 
  // hasPermission('accounts.view'), 
  validate(getUserAccountsValidation), 
  getUserAccounts
);

export default router;