import { Router } from 'express';
import smsRoutes from './sms.routes';

const router = Router();

// SMS routes
router.use('/sms', smsRoutes);

export default router;