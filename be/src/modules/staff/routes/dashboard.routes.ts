import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticateStaff } from '../../../common/middleware/auth.middleware';

const router = Router();

// Dashboard routes (all protected)
router.get('/summary', authenticateStaff, getDashboardSummary);

export default router;