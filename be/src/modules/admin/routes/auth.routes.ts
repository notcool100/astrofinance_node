import { Router, type Router as ExpressRouter } from 'express';
import { login, logout, getProfile, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { loginValidation, changePasswordValidation } from '../validations/auth.validation';

const router: ExpressRouter = Router();

// Public routes
router.post('/login', validate(loginValidation), login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.post('/change-password', authenticate, validate(changePasswordValidation), changePassword);

export default router;