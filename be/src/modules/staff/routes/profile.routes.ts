import { Router } from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/profile.controller';
import { authenticateStaff } from '../../../common/middleware/auth.middleware';

const router = Router();

// Profile routes (all protected)
router.get('/', authenticateStaff, getProfile);
router.put('/', authenticateStaff, updateProfile);
router.post('/change-password', authenticateStaff, updatePassword);

export default router;