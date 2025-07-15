import { Router } from 'express';
import { 
  getAllSmsTemplates, 
  getSmsTemplateById, 
  createSmsTemplate, 
  updateSmsTemplate, 
  deleteSmsTemplate, 
  getAllSmsEvents, 
  sendTestSms 
} from '../controllers/sms.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createSmsTemplateValidation, 
  updateSmsTemplateValidation, 
  getSmsTemplatesValidation, 
  sendTestSmsValidation 
} from '../validations/sms.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Get all SMS templates
router.get(
  '/templates', 
  hasPermission('sms.view'), 
  validate(getSmsTemplatesValidation), 
  getAllSmsTemplates
);

// Get SMS template by ID
router.get(
  '/templates/:id', 
  hasPermission('sms.view'), 
  getSmsTemplateById
);

// Create new SMS template
router.post(
  '/templates', 
  hasPermission('sms.create'), 
  validate(createSmsTemplateValidation), 
  createSmsTemplate
);

// Update SMS template
router.put(
  '/templates/:id', 
  hasPermission('sms.edit'), 
  validate(updateSmsTemplateValidation), 
  updateSmsTemplate
);

// Delete SMS template
router.delete(
  '/templates/:id', 
  hasPermission('sms.delete'), 
  deleteSmsTemplate
);

// Get all SMS events
router.get(
  '/events', 
  hasPermission('sms.view'), 
  getAllSmsEvents
);

// Send test SMS
router.post(
  '/test', 
  hasPermission('sms.edit'), 
  validate(sendTestSmsValidation), 
  sendTestSms
);

export default router;