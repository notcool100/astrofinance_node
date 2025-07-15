import { Router } from 'express';
import authRoutes from './auth.routes';
import adminUserRoutes from './admin-user.routes';
import staffRoutes from './staff.routes';
import roleRoutes from './role.routes';
import navigationRoutes from './navigation.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

// Admin user routes (legacy)
router.use('/users', adminUserRoutes);

// Staff management routes
router.use('/staff', staffRoutes);

// Role routes
router.use('/roles', roleRoutes);

// Navigation routes
router.use('/navigation', navigationRoutes);

export default router;