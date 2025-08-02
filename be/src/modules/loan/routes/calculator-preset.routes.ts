import { Router } from 'express';
import { 
  getUserCalculatorPresets,
  getCalculatorPreset,
  createCalculatorPreset,
  updateCalculatorPreset,
  deleteCalculatorPreset
} from '../controllers/calculator-preset.controller';
import { authenticateAdmin } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createCalculatorPresetValidation,
  updateCalculatorPresetValidation
} from '../validations/calculator-preset.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Get all presets for a user
router.get('/user/:userId', getUserCalculatorPresets);

// Get a specific preset
router.get('/:id', getCalculatorPreset);

// Create a new preset
router.post(
  '/',
  validate(createCalculatorPresetValidation),
  createCalculatorPreset
);

// Update a preset
router.put(
  '/:id',
  validate(updateCalculatorPresetValidation),
  updateCalculatorPreset
);

// Delete a preset
router.delete('/:id', deleteCalculatorPreset);

export default router;