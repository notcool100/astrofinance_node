import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import accountsRoutes from './accounts.routes';

const router = Router();

// User routes
router.use('/users', userRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Accounts routes
router.use('/accounts', accountsRoutes);

export default router;