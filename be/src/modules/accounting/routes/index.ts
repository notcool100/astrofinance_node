import { Router } from 'express';
import chartOfAccountsRoutes from './chart-of-accounts.routes';
import journalEntryRoutes from './journal-entry.routes';
import financialReportRoutes from './financial-report.routes';

const router = Router();

// Chart of accounts routes
router.use('/accounts', chartOfAccountsRoutes);

// Journal entry routes
router.use('/journal-entries', journalEntryRoutes);

// Financial report routes
router.use('/reports', financialReportRoutes);

export default router;