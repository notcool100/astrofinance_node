import { Router } from 'express';
import { 
  calculateLoanEMI, 
  generateAmortizationSchedule,
  compareInterestCalculationMethods
} from '../controllers/calculator.controller';
import { authenticateAdmin } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  calculateEMIValidation, 
  generateAmortizationScheduleValidation,
  compareInterestMethodsValidation
} from '../validations/calculator.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Calculate EMI
router.post(
  '/emi', 
  validate(calculateEMIValidation), 
  calculateLoanEMI
);

// Generate amortization schedule
router.post(
  '/schedule', 
  validate(generateAmortizationScheduleValidation), 
  generateAmortizationSchedule
);

// Compare interest calculation methods
router.post(
  '/compare-methods',
  validate(compareInterestMethodsValidation),
  compareInterestCalculationMethods
);

export default router;