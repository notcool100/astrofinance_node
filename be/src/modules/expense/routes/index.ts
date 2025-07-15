import { Router } from 'express';
import expenseRoutes from './expense.routes';

const router = Router();

// Expense routes
router.use('/', expenseRoutes);

export default router;