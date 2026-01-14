import { Router, type Router as ExpressRouter } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticateAdmin } from '../../../common/middleware/auth.middleware';

const router: ExpressRouter = Router();

// Dashboard routes (all protected)
router.get('/summary', authenticateAdmin, getDashboardSummary);

export default router;