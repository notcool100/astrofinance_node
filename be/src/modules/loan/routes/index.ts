import { Router } from 'express';
import loanTypeRoutes from './loan-type.routes';
import loanApplicationRoutes from './loan-application.routes';
import loanRoutes from './loan.routes';
import calculatorRoutes from './calculator.routes';

const router = Router();

// Loan type routes
router.use('/types', loanTypeRoutes);

// Loan application routes
router.use('/applications', loanApplicationRoutes);

// Loan routes
router.use('/loans', loanRoutes);

// Calculator routes
router.use('/calculator', calculatorRoutes);

export default router;