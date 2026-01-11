import { Router, type Router as ExpressRouter } from 'express';
import { login, logout, getProfile, changePassword } from '../controllers/auth.controller';
import { authenticateStaff } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
// import { loginValidation, changePasswordValidation } from '../validations/auth.validation';

const router: ExpressRouter = Router();

// Public routes
router.post('/login', login);

// Protected routes
router.post('/logout', authenticateStaff, logout);
router.get('/profile', authenticateStaff, getProfile);
router.post('/change-password', authenticateStaff, changePassword);

export default router;