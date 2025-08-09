import { Router } from 'express';
import { 
  getAllNavigationGroups,
  getNavigationGroupById,
  createNavigationGroup,
  updateNavigationGroup,
  deleteNavigationGroup,
  getAllNavigationItems,
  getNavigationItemById,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  getNavigationStructure,
  getUserNavigation,
  updateRoleNavigation
} from '../controllers/navigation.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createNavigationGroupValidation,
  updateNavigationGroupValidation,
  createNavigationItemValidation,
  updateNavigationItemValidation
} from '../validations/navigation.validation';
import { updateRoleNavigationValidation } from '../validations/role.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Navigation groups
router.get('/groups', hasPermission('admin.view'), getAllNavigationGroups);
router.get('/groups/:id', hasPermission('admin.view'), getNavigationGroupById);
router.post(
  '/groups', 
  hasPermission('admin.create'), 
  validate(createNavigationGroupValidation), 
  createNavigationGroup
);
router.put(
  '/groups/:id', 
  hasPermission('admin.edit'), 
  validate(updateNavigationGroupValidation), 
  updateNavigationGroup
);
router.delete(
  '/groups/:id', 
  hasPermission('admin.delete'), 
  deleteNavigationGroup
);

// Navigation items
router.get('/', hasPermission('admin.view'), getAllNavigationItems);
router.get('/:id', hasPermission('admin.view'), getNavigationItemById);
router.post(
  '/', 
  hasPermission('admin.create'), 
  validate(createNavigationItemValidation), 
  createNavigationItem
);
router.put(
  '/:id', 
  hasPermission('admin.edit'), 
  validate(updateNavigationItemValidation), 
  updateNavigationItem
);
router.delete(
  '/:id', 
  hasPermission('admin.delete'), 
  deleteNavigationItem
);

// Navigation structure
router.get('/structure', hasPermission('admin.view'), getNavigationStructure);
router.get('/user', authenticateAdmin, getUserNavigation);

// Role navigation
router.put(
  '/roles/:id', 
  hasPermission('admin.edit'), 
  validate(updateRoleNavigationValidation), 
  updateRoleNavigation
);

export default router;