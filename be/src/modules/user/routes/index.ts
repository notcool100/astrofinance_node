import { Router, type Router as ExpressRouter } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import accountsRoutes from './accounts.routes';
import transactionRoutes from './transaction.routes';

const router: ExpressRouter = Router();

// User routes
router.use('/users', userRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Accounts routes
router.use('/accounts', accountsRoutes);

// Transaction routes
router.use('/', transactionRoutes);

export default router;