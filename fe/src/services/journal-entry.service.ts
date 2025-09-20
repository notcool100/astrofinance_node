import apiService from './api';
import { Account } from './chart-of-accounts.service';

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'REVERSED';

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  account?: Account;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  narration: string;
  reference?: string;
  status: JournalEntryStatus;
  isRecurring: boolean;
  recurringInterval?: string;
  recurringDay?: number;
  createdById: string;
  approvedById?: string;
  createdAt: string;
  updatedAt: string;
  journalEntryLines: JournalEntryLine[];
  createdBy?: {
    id: string;
    username: string;
    fullName: string;
  };
  approvedBy?: {
    id: string;
    username: string;
    fullName: string;
  };
}

export interface EntryLineInput {
  accountId: string;
  amount: number | string;
  description?: string;
}

export interface CreateJournalEntryData {
  entryDate: string;
  reference?: string;
  description: string;
  debitEntries: EntryLineInput[];
  creditEntries: EntryLineInput[];
}

export interface JournalEntryFilters {
  startDate?: string;
  endDate?: string;
  status?: JournalEntryStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedJournalEntries {
  data: JournalEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Get all journal entries with optional filtering
export const getAllJournalEntries = async (
  filters: JournalEntryFilters = {}
): Promise<PaginatedJournalEntries> => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  const result = await apiService.get<{
    success: boolean;
    message: string;
    data: JournalEntry[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>(`/accounting/journal-entries?${params.toString()}`);
  
  return {
    data: result.data || [],
    pagination: result.pagination || {
      total: 0,
      page: filters.page || 1,
      limit: filters.limit || 10,
      pages: 0
    }
  };
};

// Get journal entry by ID
export const getJournalEntryById = async (id: string): Promise<JournalEntry> => {
  const result = await apiService.get<{
    success: boolean;
    message: string;
    data: JournalEntry;
  }>(`/accounting/journal-entries/${id}`);
  
  if (!result || !result.data) {
    throw new Error('Journal entry not found');
  }
  
  return result.data;
};

// Create new journal entry
export const createJournalEntry = async (data: CreateJournalEntryData): Promise<JournalEntry> => {
  const result = await apiService.post<{
    success: boolean;
    message: string;
    data: JournalEntry;
  }>('/accounting/journal-entries', data);
  
  if (!result || !result.data) {
    throw new Error('Failed to create journal entry');
  }
  
  return result.data;
};

// Update journal entry status
export const updateJournalEntryStatus = async (
  id: string,
  status: JournalEntryStatus,
  rejectionReason?: string
): Promise<JournalEntry> => {
  const result = await apiService.put<{
    success: boolean;
    message: string;
    data: JournalEntry;
  }>(`/accounting/journal-entries/${id}/status`, {
    status,
    rejectionReason
  });
  
  if (!result || !result.data) {
    throw new Error('Failed to update journal entry status');
  }
  
  return result.data;
};

// Delete journal entry
export const deleteJournalEntry = async (id: string): Promise<void> => {
  await apiService.delete<{
    success: boolean;
    message: string;
  }>(`/accounting/journal-entries/${id}`);
};

const journalEntryService = {
  getAllJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  updateJournalEntryStatus,
  deleteJournalEntry
};

export default journalEntryService;