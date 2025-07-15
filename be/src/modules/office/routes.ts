import express from 'express';
import * as authController from './controllers/auth.controller';
import * as navigationController from './controllers/navigation.controller';
import { authenticate, hasPermission } from '../../common/middleware/auth.middleware';
import { validateRequest } from '../../common/middleware/yup-validation.middleware';
import { loginSchema, changePasswordSchema } from './validators/auth.validator';
import { 
  createNavigationItemSchema, 
  updateNavigationItemSchema,
  assignNavigationToRoleSchema 
} from './validators/navigation.validator';

const router = express.Router();

// Auth routes
router.post('/auth/login', validateRequest(loginSchema), authController.login);
router.post('/auth/logout', authenticate, authController.logout);
router.get('/auth/profile', authenticate, authController.getProfile);
router.post('/auth/change-password', authenticate, validateRequest(changePasswordSchema), authController.changePassword);

// Navigation routes
router.get('/navigation', authenticate, navigationController.getUserNavigationItems);
router.get('/navigation/role/:roleName', authenticate, navigationController.getNavigationByRole);

// Admin navigation routes (requires admin permission)
router.get('/admin/navigation/items', authenticate, hasPermission('navigation.view'), navigationController.getAllNavigationItems);
router.get('/admin/navigation/groups', authenticate, hasPermission('navigation.view'), navigationController.getAllNavigationGroups);
router.post('/admin/navigation/items', authenticate, hasPermission('navigation.create'), validateRequest(createNavigationItemSchema), navigationController.createNavigationItem);
router.put('/admin/navigation/items/:id', authenticate, hasPermission('navigation.edit'), validateRequest(updateNavigationItemSchema), navigationController.updateNavigationItem);
router.delete('/admin/navigation/items/:id', authenticate, hasPermission('navigation.delete'), navigationController.deleteNavigationItem);
router.post('/admin/roles/:roleId/navigation', authenticate, hasPermission('roles.edit'), validateRequest(assignNavigationToRoleSchema), navigationController.assignNavigationToRole);

export default router;