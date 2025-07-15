import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import profileRoutes from './profile.routes';
import usersRoutes from './users.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

// Profile routes
router.use('/profile', profileRoutes);

// Users routes
router.use('/users', usersRoutes);

export default router;