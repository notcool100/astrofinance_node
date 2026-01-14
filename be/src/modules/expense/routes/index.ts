import { Router, type Router as ExpressRouter } from 'express';
import expenseRoutes from './expense.routes';

const router: ExpressRouter = Router();

// Expense routes
router.use('/', expenseRoutes);

export default router;