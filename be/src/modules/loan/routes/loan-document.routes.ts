import { Router, type Router as ExpressRouter } from 'express';
import { 
  getLoanDocuments,
  uploadLoanDocument,
  verifyLoanDocument,
  deleteLoanDocument
} from '../controllers/loan-document.controller';
import { authenticateAdmin } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { upload } from '../../../common/middleware/upload.middleware';
import { 
  uploadLoanDocumentValidation,
  verifyLoanDocumentValidation
} from '../validations/loan-document.validation';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Get all documents for a loan application
router.get('/application/:applicationId', getLoanDocuments);

// Upload a document for a loan application
router.post(
  '/application/:applicationId',
  upload.single('document'),
  validate(uploadLoanDocumentValidation),
  uploadLoanDocument
);

// Verify a loan document
router.put(
  '/verify/:documentId',
  validate(verifyLoanDocumentValidation),
  verifyLoanDocument
);

// Delete a loan document
router.delete('/:documentId', deleteLoanDocument);

export default router;