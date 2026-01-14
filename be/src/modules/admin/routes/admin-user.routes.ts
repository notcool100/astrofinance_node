import { Router, type Router as ExpressRouter } from 'express';
import {
  getAllAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword
} from '../controllers/admin-user.controller';
import { authenticate, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  createAdminUserValidation,
  updateAdminUserValidation,
  resetPasswordValidation
} from '../validations/admin-user.validation';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

// Get all admin users
router.get('/', hasPermission('admin.view'), getAllAdminUsers);

// Get admin user by ID
router.get('/:id', hasPermission('admin.view'), getAdminUserById);

// Create new admin user
router.post(
  '/',
  hasPermission('admin.create'),
  validate(createAdminUserValidation),
  createAdminUser
);

// Update admin user
router.put(
  '/:id',
  hasPermission('admin.edit'),
  validate(updateAdminUserValidation),
  updateAdminUser
);

// Reset admin user password
router.post(
  '/:id/reset-password',
  hasPermission('admin.edit'),
  validate(resetPasswordValidation),
  resetAdminUserPassword
);

export default router;