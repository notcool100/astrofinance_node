import { Router } from 'express';
import { login, logout, getProfile, changePassword } from '../controllers/auth.controller';
import { authenticateAdmin } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { loginValidation, changePasswordValidation } from '../validations/auth.validation';

const router = Router();

// Public routes
router.post('/login', validate(loginValidation), login);

// Protected routes
router.post('/logout', authenticateAdmin, logout);
router.get('/profile', authenticateAdmin, getProfile);
router.post('/change-password', authenticateAdmin, validate(changePasswordValidation), changePassword);

export default router;