import { Router, type Router as ExpressRouter } from 'express';
import { 
  getAllTaxTypes, 
  getTaxTypeById, 
  createTaxType, 
  updateTaxType, 
  deleteTaxType, 
  getAllTaxRates, 
  getTaxRateById, 
  createTaxRate, 
  updateTaxRate, 
  deleteTaxRate, 
  calculateTax 
} from '../controllers/tax.controller';
import { authenticate, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createTaxTypeValidation, 
  updateTaxTypeValidation, 
  getTaxTypesValidation, 
  createTaxRateValidation, 
  updateTaxRateValidation, 
  getTaxRatesValidation, 
  calculateTaxValidation 
} from '../validations/tax.validation';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

// Tax type routes
router.get(
  '/types', 
  hasPermission('tax.view'), 
  validate(getTaxTypesValidation), 
  getAllTaxTypes
);

router.get(
  '/types/:id', 
  hasPermission('tax.view'), 
  getTaxTypeById
);

router.post(
  '/types', 
  hasPermission('tax.create'), 
  validate(createTaxTypeValidation), 
  createTaxType
);

router.put(
  '/types/:id', 
  hasPermission('tax.edit'), 
  validate(updateTaxTypeValidation), 
  updateTaxType
);

router.delete(
  '/types/:id', 
  hasPermission('tax.delete'), 
  deleteTaxType
);

// Tax rate routes
router.get(
  '/rates', 
  hasPermission('tax.view'), 
  validate(getTaxRatesValidation), 
  getAllTaxRates
);

router.get(
  '/rates/:id', 
  hasPermission('tax.view'), 
  getTaxRateById
);

router.post(
  '/rates', 
  hasPermission('tax.create'), 
  validate(createTaxRateValidation), 
  createTaxRate
);

router.put(
  '/rates/:id', 
  hasPermission('tax.edit'), 
  validate(updateTaxRateValidation), 
  updateTaxRate
);

router.delete(
  '/rates/:id', 
  hasPermission('tax.delete'), 
  deleteTaxRate
);

// Tax calculation route
router.post(
  '/calculate', 
  hasPermission('tax.view'), 
  validate(calculateTaxValidation), 
  calculateTax
);

export default router;