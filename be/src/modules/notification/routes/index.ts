import { Router, type Router as ExpressRouter } from 'express';
import smsRoutes from './sms.routes';

const router: ExpressRouter = Router();

// SMS routes
router.use('/sms', smsRoutes);

export default router;