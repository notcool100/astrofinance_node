import { Router } from 'express';
import { getAssignedUsers, getUserDetails } from '../controllers/users.controller';
import { authenticateStaff } from '../../../common/middleware/auth.middleware';

const router = Router();

// User routes (all protected)
router.get('/', authenticateStaff, getAssignedUsers);
router.get('/:id', authenticateStaff, getUserDetails);

export default router;