import { Router } from 'express';
import taxRoutes from './tax.routes';

const router = Router();

// Tax routes
router.use('/', taxRoutes);

export default router;