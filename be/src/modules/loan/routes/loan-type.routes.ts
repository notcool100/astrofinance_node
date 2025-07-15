import { Router } from 'express';
import { 
  getAllLoanTypes, 
  getLoanTypeById, 
  createLoanType, 
  updateLoanType, 
  deleteLoanType 
} from '../controllers/loan-type.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createLoanTypeValidation, 
  updateLoanTypeValidation 
} from '../validations/loan-type.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

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

export default router;