import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';

const router = Router();

// User routes
router.use('/users', userRoutes);

// Auth routes
router.use('/auth', authRoutes);

export default router;