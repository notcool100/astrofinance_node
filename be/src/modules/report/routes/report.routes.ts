import { Router, type Router as ExpressRouter } from 'express';
import {
  getAllReportTemplates,
  getReportTemplateById,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  runReport,
  generateLoanPortfolioReport,
  generateCollectionReport
} from '../controllers/report.controller';
import { authenticate, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  createReportTemplateValidation,
  updateReportTemplateValidation,
  getReportTemplatesValidation,
  runReportValidation
} from '../validations/report.validation';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

// Get all report templates
router.get(
  '/templates',
  hasPermission('reports.view'),
  validate(getReportTemplatesValidation),
  getAllReportTemplates
);

// Get report template by ID
router.get(
  '/templates/:id',
  hasPermission('reports.view'),
  getReportTemplateById
);

// Create new report template
router.post(
  '/templates',
  hasPermission('reports.create'),
  validate(createReportTemplateValidation),
  createReportTemplate
);

// Update report template
router.put(
  '/templates/:id',
  hasPermission('reports.edit'),
  validate(updateReportTemplateValidation),
  updateReportTemplate
);

// Delete report template
router.delete(
  '/templates/:id',
  hasPermission('reports.delete'),
  deleteReportTemplate
);

// Run report
router.post(
  '/run/:id',
  hasPermission('reports.view'),
  validate(runReportValidation),
  runReport
);

// NRB Excel Reports
router.get(
  '/excel/loan-portfolio',
  hasPermission('reports.view'),
  generateLoanPortfolioReport
);

router.get(
  '/excel/collections',
  hasPermission('reports.view'),
  generateCollectionReport
);

export default router;