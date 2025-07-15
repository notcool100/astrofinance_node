import { Router } from 'express';
import reportRoutes from './report.routes';

const router = Router();

// Report routes
router.use('/', reportRoutes);

export default router;