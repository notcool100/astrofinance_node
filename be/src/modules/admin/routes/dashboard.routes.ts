import { Router, type Router as ExpressRouter } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticate } from '../../../common/middleware/auth.middleware';

const router: ExpressRouter = Router();

// Dashboard routes (all protected)
router.get('/summary', authenticate, getDashboardSummary);

export default router;