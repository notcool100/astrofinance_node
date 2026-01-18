import { Router } from 'express';
import * as centerController from './center.controller';

const router = Router();

router.post('/', centerController.createCenter);
router.get('/', centerController.getCenters);
router.get('/:id', centerController.getCenterById);
router.put('/:id', centerController.updateCenter);
router.delete('/:id', centerController.deleteCenter);

export default router;
