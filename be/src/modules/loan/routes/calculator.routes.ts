import { Router } from 'express';
import { 
  calculateLoanEMI, 
  generateAmortizationSchedule 
} from '../controllers/calculator.controller';
import { authenticateAdmin } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  calculateEMIValidation, 
  generateAmortizationScheduleValidation 
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

export default router;