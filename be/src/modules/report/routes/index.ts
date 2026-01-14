import { Router, type Router as ExpressRouter } from 'express';
import reportRoutes from './report.routes';

const router: ExpressRouter = Router();

// Report routes
router.use('/', reportRoutes);

export default router;