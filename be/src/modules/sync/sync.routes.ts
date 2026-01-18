import { Router } from 'express';
import * as syncController from './sync.controller';

const router = Router();

router.get('/data', syncController.downloadData);
router.post('/upload', syncController.uploadData);

export default router;
