import { Router } from 'express';
import { 
  login, 
  register, 
  getProfile, 
  updateProfile, 
  changePassword 
} from '../controllers/auth.controller';
import { authenticateUser } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  loginValidation, 
  registerValidation, 
  updateProfileValidation, 
  changePasswordValidation 
} from '../validations/auth.validation';

const router = Router();

// Public routes
router.post('/login', validate(loginValidation), login);
router.post('/register', validate(registerValidation), register);

// Protected routes
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, validate(updateProfileValidation), updateProfile);
router.post('/change-password', authenticateUser, validate(changePasswordValidation), changePassword);

export default router;