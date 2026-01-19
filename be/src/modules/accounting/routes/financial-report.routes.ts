import { Router, type Router as ExpressRouter } from 'express';
import { 
  getAccountBalance, 
  getTrialBalance, 
  getIncomeStatement, 
  getBalanceSheet, 
  getGeneralLedger,
  exportReport
} from '../controllers/financial-report.controller';
import { authenticate, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  getAccountBalanceValidation, 
  getTrialBalanceValidation, 
  getIncomeStatementValidation, 
  getBalanceSheetValidation, 
  getGeneralLedgerValidation,
  exportReportValidation
} from '../validations/financial-report.validation';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

// Get account balance
router.get(
  '/accounts/:id/balance', 
  hasPermission('accounting.view'), 
  validate(getAccountBalanceValidation), 
  getAccountBalance
);

// Get trial balance
router.get(
  '/trial-balance', 
  hasPermission('accounting.view'), 
  validate(getTrialBalanceValidation), 
  getTrialBalance
);

// Get income statement
router.get(
  '/income-statement', 
  hasPermission('accounting.view'), 
  validate(getIncomeStatementValidation), 
  getIncomeStatement
);

// Get balance sheet
router.get(
  '/balance-sheet', 
  hasPermission('accounting.view'), 
  validate(getBalanceSheetValidation), 
  getBalanceSheet
);

// Get general ledger
router.get(
  '/general-ledger', 
  hasPermission('accounting.view'), 
  validate(getGeneralLedgerValidation), 
  getGeneralLedger
);

// Export report
router.get(
  '/export/:type',
  hasPermission('accounting.view'),
  validate(exportReportValidation),
  exportReport
);

export default router;