import { Router, type Router as ExpressRouter } from 'express';
import { 
  getUserCalculationHistory,
  recordCalculation,
  getUserCalculationStats,
  clearUserCalculationHistory
} from '../controllers/calculator-history.controller';
import { authenticate } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { recordCalculationValidation } from '../validations/calculator-history.validation';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

// Get calculation history for a user
router.get('/user/:userId', getUserCalculationHistory);

// Get calculation statistics for a user
router.get('/user/:userId/stats', getUserCalculationStats);

// Record a new calculation
router.post(
  '/',
  validate(recordCalculationValidation),
  recordCalculation
);

// Clear calculation history for a user
router.delete('/user/:userId', clearUserCalculationHistory);

export default router;