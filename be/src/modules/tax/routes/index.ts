import { Router, type Router as ExpressRouter } from 'express';
import taxRoutes from './tax.routes';

const router: ExpressRouter = Router();

// Tax routes
router.use('/', taxRoutes);

export default router;