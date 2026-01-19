import { Router, type Router as ExpressRouter } from 'express';
import {
  getAllSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
  getSettingCategories,
  getPublicSettings,
  bulkUpdateSettings,
  getSettingAuditLogs
} from '../controllers/settings.controller';
import { authenticate, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  createSettingValidation,
  updateSettingValidation,
  deleteSettingValidation,
  getSettingByKeyValidation,
  getAllSettingsValidation,
  bulkUpdateSettingsValidation,
  getSettingAuditLogsValidation,
  getPublicSettingsValidation
} from '../validations/settings.validation';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

// Get all settings (requires settings.view permission)
router.get(
  '/',
  hasPermission('settings.view'),
  validate(getAllSettingsValidation),
  getAllSettings
);

// Get setting by key (requires settings.view permission)
router.get(
  '/:key',
  hasPermission('settings.view'),
  validate(getSettingByKeyValidation),
  getSettingByKey
);

// Create new setting (requires settings.create permission)
router.post(
  '/',
  hasPermission('settings.create'),
  validate(createSettingValidation),
  createSetting
);

// Update setting (requires settings.update permission)
router.put(
  '/:key',
  hasPermission('settings.update'),
  validate(updateSettingValidation),
  updateSetting
);

// Delete setting (requires settings.delete permission)
router.delete(
  '/:key',
  hasPermission('settings.delete'),
  validate(deleteSettingValidation),
  deleteSetting
);

// Get setting categories (requires settings.view permission)
router.get(
  '/categories/list',
  hasPermission('settings.view'),
  getSettingCategories
);

// Get public settings (no permission required, but still authenticated)
router.get(
  '/public/list',
  validate(getPublicSettingsValidation),
  getPublicSettings
);

// Bulk update settings (requires settings.update permission)
router.post(
  '/bulk-update',
  hasPermission('settings.update'),
  validate(bulkUpdateSettingsValidation),
  bulkUpdateSettings
);

// Get setting audit logs (requires settings.view permission)
router.get(
  '/audit-logs/list',
  hasPermission('settings.view'),
  validate(getSettingAuditLogsValidation),
  getSettingAuditLogs
);

export default router;
