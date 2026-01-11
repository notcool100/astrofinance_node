import { Router, type Router as ExpressRouter } from 'express';
import { 
  getAllDayBooks, 
  getDayBookById, 
  createDayBook, 
  reconcileDayBook,
  closeDayBook, 
  getDayBookSummary 
} from '../controllers/day-book.controller';
import {
  addTransactionToDayBook,
  getDayBookTransactions,
  deleteDayBookTransaction
} from '../controllers/daybook-transaction.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createDayBookValidation, 
  reconcileDayBookValidation,
  closeDayBookValidation, 
  getDayBooksValidation,
  addTransactionValidation,
  getDayBookTransactionsValidation,
  deleteTransactionValidation
} from '../validations/day-book.validation';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Get all day books
router.get(
  '/', 
  hasPermission('accounting.view'), 
  validate(getDayBooksValidation), 
  getAllDayBooks
);

// Get day book by ID
router.get(
  '/:id', 
  hasPermission('accounting.view'), 
  getDayBookById
);

// Get day book summary
router.get(
  '/:id/summary', 
  hasPermission('accounting.view'), 
  getDayBookSummary
);

// Create new day book
router.post(
  '/', 
  hasPermission('accounting.create'), 
  validate(createDayBookValidation), 
  createDayBook
);

// Reconcile day book
router.put(
  '/:id/reconcile', 
  hasPermission('accounting.edit'), 
  validate(reconcileDayBookValidation), 
  reconcileDayBook
);

// Close day book
router.put(
  '/:id/close', 
  hasPermission('accounting.edit'), 
  validate(closeDayBookValidation), 
  closeDayBook
);

// ==================== Daybook Transaction Routes ====================

// Add transaction to daybook
router.post(
  '/:dayBookId/transactions',
  hasPermission('accounting.create'),
  validate(addTransactionValidation),
  addTransactionToDayBook
);

// Get daybook transactions
router.get(
  '/:dayBookId/transactions',
  hasPermission('accounting.view'),
  validate(getDayBookTransactionsValidation),
  getDayBookTransactions
);

// Delete transaction from daybook
router.delete(
  '/transactions/:transactionId',
  hasPermission('accounting.delete'),
  validate(deleteTransactionValidation),
  deleteDayBookTransaction
);

export default router;