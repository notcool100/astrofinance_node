import { Router, type Router as ExpressRouter } from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
  getAllPermissions
} from '../controllers/role.controller';
import { authenticate, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  createRoleValidation,
  updateRoleValidation,
  updateRolePermissionsValidation
} from '../validations/role.validation';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

// Get all roles
router.get('/', hasPermission('admin.view'), getAllRoles);

// Get all permissions
router.get('/permissions', hasPermission('admin.view'), getAllPermissions);

// Get role by ID
router.get('/:id', hasPermission('admin.view'), getRoleById);

// Create new role
router.post(
  '/',
  hasPermission('admin.create'),
  validate(createRoleValidation),
  createRole
);

// Update role
router.put(
  '/:id',
  hasPermission('admin.edit'),
  validate(updateRoleValidation),
  updateRole
);

// Delete role
router.delete(
  '/:id',
  hasPermission('admin.delete'),
  deleteRole
);

// Update role permissions
router.put(
  '/:id/permissions',
  hasPermission('admin.edit'),
  validate(updateRolePermissionsValidation),
  updateRolePermissions
);

export default router;