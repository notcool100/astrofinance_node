import express, { type Router as ExpressRouter } from 'express';
import { authenticate, hasPermission } from '../../../common/middleware/auth.middleware';
import { validateRequest } from '../../../common/middleware/joi-validation.middleware';
import {
  createTransactionSchema,
  getTransactionsByAccountSchema,
  getTransactionByIdSchema,
  cancelTransactionSchema
} from '../validations/transaction.validation';
import {
  createTransaction,
  getTransactionsByAccount,
  getTransactionById,
  cancelTransaction,
  getTransactionSummary,
  getAllTransactions,
  getAllTransactionsSummary
} from '../controllers/transaction.controller';

const router: ExpressRouter = express.Router();

/**
 * @route POST /api/user/accounts/:accountId/transactions
 * @desc Create a new transaction for a user account
 * @access Private (Admin, Staff)
 */
router.post(
  '/accounts/:accountId/transactions',
  authenticate,
  hasPermission('usertransactions.create'),
  validateRequest(createTransactionSchema, 'body', ['accountId']),
  createTransaction
);

/**
 * @route GET /api/user/accounts/:accountId/transactions
 * @desc Get transactions for a specific account with pagination and filtering
 * @access Private (Admin, Staff)
 */
router.get(
  '/accounts/:accountId/transactions',
  authenticate,
  hasPermission('usertransactions.view'),
  validateRequest(getTransactionsByAccountSchema, 'query', ['accountId']),
  getTransactionsByAccount
);

/**
 * @route GET /api/user/accounts/:accountId/transactions/summary
 * @desc Get transaction summary for an account
 * @access Private (Admin, Staff)
 */
router.get(
  '/accounts/:accountId/transactions/summary',
  authenticate,
  hasPermission('usertransactions.view'),
  getTransactionSummary
);

/**
 * @route GET /api/user/transactions/summary
 * @desc Get summary for all transactions or filtered by accountId
 * @access Private (Admin, Staff)
 */
router.get(
  '/transactions/summary',
  authenticate,
  hasPermission('usertransactions.view'),
  getAllTransactionsSummary
);

/**
 * @route GET /api/user/transactions/:id
 * @desc Get a specific transaction by ID
 * @access Private (Admin, Staff)
 */
router.get(
  '/transactions/:id',
  authenticate,
  hasPermission('usertransactions.view'),
  validateRequest(getTransactionByIdSchema, 'params', ['id']),
  getTransactionById
);

/**
 * @route POST /api/user/transactions/:id/cancel
 * @desc Cancel/reverse a transaction
 * @access Private (Admin only)
 */
router.post(
  '/transactions/:id/cancel',
  authenticate,
  hasPermission('usertransactions.cancel'), // Only admins can cancel transactions
  validateRequest(cancelTransactionSchema, 'body', ['id']),
  cancelTransaction
);

/**
 * @route GET /api/user/transactions
 * @desc Get all transactions with pagination and filtering
 * @access Private (Admin, Staff)
 */
router.get(
  '/transactions',
  authenticate,
  hasPermission('usertransactions.view'),
  getAllTransactions
);

export default router;