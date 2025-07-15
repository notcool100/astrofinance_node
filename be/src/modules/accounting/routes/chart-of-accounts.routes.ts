import { Router } from 'express';
import { 
  getAllAccounts, 
  getAccountById, 
  createAccount, 
  updateAccount, 
  deleteAccount, 
  getAccountStructure 
} from '../controllers/chart-of-accounts.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createAccountValidation, 
  updateAccountValidation, 
  getAccountsValidation 
} from '../validations/chart-of-accounts.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Get all accounts
router.get(
  '/', 
  hasPermission('accounting.view'), 
  validate(getAccountsValidation), 
  getAllAccounts
);

// Get account structure
router.get(
  '/structure', 
  hasPermission('accounting.view'), 
  getAccountStructure
);

// Get account by ID
router.get(
  '/:id', 
  hasPermission('accounting.view'), 
  getAccountById
);

// Create new account
router.post(
  '/', 
  hasPermission('accounting.create'), 
  validate(createAccountValidation), 
  createAccount
);

// Update account
router.put(
  '/:id', 
  hasPermission('accounting.edit'), 
  validate(updateAccountValidation), 
  updateAccount
);

// Delete account
router.delete(
  '/:id', 
  hasPermission('accounting.delete'), 
  deleteAccount
);

export default router;