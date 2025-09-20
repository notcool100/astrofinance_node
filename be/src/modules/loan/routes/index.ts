import { Router } from 'express';
import loanTypeRoutes from './loan-type.routes';
import loanApplicationRoutes from './loan-application.routes';
import loanRoutes from './loan.routes';
import calculatorRoutes from './calculator.routes';
import calculatorPresetRoutes from './calculator-preset.routes';
import calculatorHistoryRoutes from './calculator-history.routes';
import loanDocumentRoutes from './loan-document.routes';

const router = Router();

// Loan type routes
router.use('/types', loanTypeRoutes);

// Loan application routes
router.use('/applications', loanApplicationRoutes);

// Loan routes
router.use('/loans', loanRoutes);

// Loan document routes
router.use('/documents', loanDocumentRoutes);

// Calculator routes
router.use('/calculator', calculatorRoutes);

// Calculator preset routes
router.use('/calculator-presets', calculatorPresetRoutes);

// Calculator history routes
router.use('/calculator-history', calculatorHistoryRoutes);

export default router;