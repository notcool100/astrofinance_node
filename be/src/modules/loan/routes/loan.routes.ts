import { Router } from 'express';
import { 
  getAllLoans, 
  getLoanById, 
  getLoanInstallments, 
  disburseLoan, 
  processLoanPayment, 
  calculateEarlySettlement, 
  processEarlySettlement 
} from '../controllers/loan.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  disburseLoanValidation, 
  recordLoanPaymentValidation, 
  calculateEarlySettlementValidation, 
  processEarlySettlementValidation,
  getLoansValidation
} from '../validations/loan.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Get all loans
router.get(
  '/', 
  hasPermission('loans.view'), 
  validate(getLoansValidation), 
  getAllLoans
);

// Get loan by ID
router.get(
  '/:id', 
  hasPermission('loans.view'), 
  getLoanById
);

// Get loan installments
router.get(
  '/:id/installments', 
  hasPermission('loans.view'), 
  getLoanInstallments
);

// Disburse loan
router.post(
  '/disburse', 
  hasPermission('loans.approve'), 
  validate(disburseLoanValidation), 
  disburseLoan
);

// Process loan payment
router.post(
  '/:id/payments', 
  hasPermission('loans.edit'), 
  validate(recordLoanPaymentValidation), 
  processLoanPayment
);

// Calculate early settlement
router.post(
  '/:id/calculate-settlement', 
  hasPermission('loans.view'), 
  validate(calculateEarlySettlementValidation), 
  calculateEarlySettlement
);

// Process early settlement
router.post(
  '/:id/settle', 
  hasPermission('loans.edit'), 
  validate(processEarlySettlementValidation), 
  processEarlySettlement
);

export default router;