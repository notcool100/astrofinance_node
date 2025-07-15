import { Router } from 'express';
import { 
  getAllLoanApplications, 
  getLoanApplicationById, 
  createLoanApplication, 
  updateLoanApplicationStatus, 
  uploadLoanDocument 
} from '../controllers/loan-application.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createLoanApplicationValidation, 
  updateLoanApplicationStatusValidation, 
  uploadLoanDocumentValidation,
  getLoanApplicationsValidation
} from '../validations/loan-application.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Get all loan applications
router.get(
  '/', 
  hasPermission('loans.view'), 
  validate(getLoanApplicationsValidation), 
  getAllLoanApplications
);

// Get loan application by ID
router.get(
  '/:id', 
  hasPermission('loans.view'), 
  getLoanApplicationById
);

// Create new loan application
router.post(
  '/', 
  hasPermission('loans.create'), 
  validate(createLoanApplicationValidation), 
  createLoanApplication
);

// Update loan application status
router.put(
  '/:id/status', 
  hasPermission('loans.approve'), 
  validate(updateLoanApplicationStatusValidation), 
  updateLoanApplicationStatus
);

// Upload loan document
router.post(
  '/:id/documents', 
  hasPermission('loans.edit'), 
  validate(uploadLoanDocumentValidation), 
  uploadLoanDocument
);

export default router;