import { Router, type Router as ExpressRouter } from 'express';
import { 
  getAllLoanTypes, 
  getLoanTypeById, 
  createLoanType, 
  updateLoanType, 
  deleteLoanType,
  bulkUpdateLoanTypeStatus
} from '../controllers/loan-type.controller';
import { authenticate, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { performanceMonitor } from '../../../common/middleware/performance.middleware';
import { apiLimiter } from '../../../common/middleware/rate-limit.middleware';
import { sanitizeInput } from '../../../common/middleware/sanitization.middleware';
import { 
  createLoanTypeValidation, 
  updateLoanTypeValidation,
  bulkUpdateStatusValidation
} from '../validations/loan-type.validation';

const router: ExpressRouter = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Apply performance monitoring middleware to all routes
router.use(performanceMonitor);

// Apply input sanitization to all routes
router.use(sanitizeInput);

// All routes require authentication
router.use(authenticate);

// Get all loan types
router.get('/', hasPermission('loans.view'), getAllLoanTypes);

// Get loan type by ID
router.get('/:id', hasPermission('loans.view'), getLoanTypeById);

// Create new loan type
router.post(
  '/', 
  hasPermission('loans.create'), 
  validate(createLoanTypeValidation), 
  createLoanType
);

// Update loan type
router.put(
  '/:id', 
  hasPermission('loans.edit'), 
  validate(updateLoanTypeValidation), 
  updateLoanType
);

// Delete loan type
router.delete(
  '/:id', 
  hasPermission('loans.delete'), 
  deleteLoanType
);

// Bulk update loan type status
router.post(
  '/bulk/status',
  hasPermission('loans.edit'),
  validate(bulkUpdateStatusValidation),
  bulkUpdateLoanTypeStatus
);

export default router;