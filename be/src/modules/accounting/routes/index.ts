import { Router, type Router as ExpressRouter } from 'express';
import chartOfAccountsRoutes from './chart-of-accounts.routes';
import journalEntryRoutes from './journal-entry.routes';
import dayBookRoutes from './day-book.routes';
import financialReportRoutes from './financial-report.routes';
import interestRoutes from "./interest.routes";
import llpRoutes from "./llp.routes";

const router: ExpressRouter = Router();

// Chart of accounts routes
router.use('/accounts', chartOfAccountsRoutes);

// Journal entry routes
router.use('/journal-entries', journalEntryRoutes);

// Day book routes
router.use('/day-books', dayBookRoutes);

// Financial report routes
router.use('/reports', financialReportRoutes);

// Interest routes
router.use('/interest', interestRoutes);

// LLP routes
router.use('/llp', llpRoutes);

export default router;