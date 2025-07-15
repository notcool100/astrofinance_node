import { Router } from 'express';
import { 
  getAllExpenseCategories, 
  getExpenseCategoryById, 
  createExpenseCategory, 
  updateExpenseCategory, 
  deleteExpenseCategory, 
  getAllExpenses, 
  getExpenseById, 
  createExpense, 
  updateExpense, 
  approveExpense, 
  rejectExpense, 
  deleteExpense 
} from '../controllers/expense.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createExpenseCategoryValidation, 
  updateExpenseCategoryValidation, 
  getExpenseCategoriesValidation, 
  createExpenseValidation, 
  updateExpenseValidation, 
  approveRejectExpenseValidation, 
  getExpensesValidation 
} from '../validations/expense.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Expense category routes
router.get(
  '/categories', 
  hasPermission('expenses.view'), 
  validate(getExpenseCategoriesValidation), 
  getAllExpenseCategories
);

router.get(
  '/categories/:id', 
  hasPermission('expenses.view'), 
  getExpenseCategoryById
);

router.post(
  '/categories', 
  hasPermission('expenses.create'), 
  validate(createExpenseCategoryValidation), 
  createExpenseCategory
);

router.put(
  '/categories/:id', 
  hasPermission('expenses.edit'), 
  validate(updateExpenseCategoryValidation), 
  updateExpenseCategory
);

router.delete(
  '/categories/:id', 
  hasPermission('expenses.delete'), 
  deleteExpenseCategory
);

// Expense routes
router.get(
  '/', 
  hasPermission('expenses.view'), 
  validate(getExpensesValidation), 
  getAllExpenses
);

router.get(
  '/:id', 
  hasPermission('expenses.view'), 
  getExpenseById
);

router.post(
  '/', 
  hasPermission('expenses.create'), 
  validate(createExpenseValidation), 
  createExpense
);

router.put(
  '/:id', 
  hasPermission('expenses.edit'), 
  validate(updateExpenseValidation), 
  updateExpense
);

router.post(
  '/:id/approve', 
  hasPermission('expenses.approve'), 
  validate(approveRejectExpenseValidation), 
  approveExpense
);

router.post(
  '/:id/reject', 
  hasPermission('expenses.approve'), 
  validate(approveRejectExpenseValidation), 
  rejectExpense
);

router.delete(
  '/:id', 
  hasPermission('expenses.delete'), 
  deleteExpense
);

export default router;