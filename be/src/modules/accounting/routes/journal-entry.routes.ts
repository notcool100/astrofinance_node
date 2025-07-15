import { Router } from 'express';
import { 
  getAllJournalEntries, 
  getJournalEntryById, 
  createJournalEntry, 
  updateJournalEntryStatus, 
  deleteJournalEntry 
} from '../controllers/journal-entry.controller';
import { authenticateAdmin, hasPermission } from '../../../common/middleware/auth.middleware';
import { validate } from '../../../common/middleware/validation.middleware';
import { 
  createJournalEntryValidation, 
  updateJournalEntryStatusValidation, 
  getJournalEntriesValidation 
} from '../validations/journal-entry.validation';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Get all journal entries
router.get(
  '/', 
  hasPermission('accounting.view'), 
  validate(getJournalEntriesValidation), 
  getAllJournalEntries
);

// Get journal entry by ID
router.get(
  '/:id', 
  hasPermission('accounting.view'), 
  getJournalEntryById
);

// Create new journal entry
router.post(
  '/', 
  hasPermission('accounting.create'), 
  validate(createJournalEntryValidation), 
  createJournalEntry
);

// Update journal entry status
router.put(
  '/:id/status', 
  hasPermission('accounting.approve'), 
  validate(updateJournalEntryStatusValidation), 
  updateJournalEntryStatus
);

// Delete journal entry
router.delete(
  '/:id', 
  hasPermission('accounting.delete'), 
  deleteJournalEntry
);

export default router;