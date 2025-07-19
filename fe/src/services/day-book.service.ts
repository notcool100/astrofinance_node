import apiService from './api';
import { JournalEntry } from './journal-entry.service';

export interface DayBook {
  id: string;
  transactionDate: string;
  isReconciled: boolean;
  isClosed: boolean;
  systemCashBalance: number;
  physicalCashBalance?: number;
  discrepancyAmount?: number;
  discrepancyNotes?: string;
  closedById?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  closedBy?: {
    id: string;
    username: string;
    fullName: string;
  };
}

export interface CreateDayBookData {
  transactionDate: string;
  systemCashBalance: number;
}

export interface ReconcileDayBookData {
  physicalCashBalance: number;
  discrepancyNotes?: string;
}

export interface DayBookFilters {
  startDate?: string;
  endDate?: string;
  isReconciled?: boolean;
  isClosed?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedDayBooks {
  data: DayBook[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface DayBookSummary {
  dayBook: {
    id: string;
    transactionDate: string;
    isReconciled: boolean;
    isClosed: boolean;
    systemCashBalance: number;
    physicalCashBalance?: number;
    discrepancyAmount?: number;
  };
  summary: {
    totalEntries: number;
    totalDebits: number;
    totalCredits: number;
    accountTypeSummary: Record<string, { debits: number; credits: number }>;
  };
  journalEntries: JournalEntry[];
}

// Get all day books with optional filtering
export const getAllDayBooks = async (
  filters: DayBookFilters = {}
): Promise<PaginatedDayBooks> => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.isReconciled !== undefined) params.append('isReconciled', filters.isReconciled.toString());
  if (filters.isClosed !== undefined) params.append('isClosed', filters.isClosed.toString());
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  const result = await apiService.get<{
    success: boolean;
    message: string;
    data: DayBook[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>(`/accounting/day-books?${params.toString()}`);
  
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

// Get day book by ID
export const getDayBookById = async (id: string): Promise<DayBook> => {
  const result = await apiService.get<{
    success: boolean;
    message: string;
    data: DayBook;
  }>(`/accounting/day-books/${id}`);
  
  if (!result || !result.data) {
    throw new Error('Day book not found');
  }
  
  return result.data;
};

// Create new day book
export const createDayBook = async (data: CreateDayBookData): Promise<DayBook> => {
  const result = await apiService.post<{
    success: boolean;
    message: string;
    data: DayBook;
  }>('/accounting/day-books', data);
  
  if (!result || !result.data) {
    throw new Error('Failed to create day book');
  }
  
  return result.data;
};

// Reconcile day book
export const reconcileDayBook = async (id: string, data: ReconcileDayBookData): Promise<DayBook> => {
  const result = await apiService.put<{
    success: boolean;
    message: string;
    data: DayBook;
  }>(`/accounting/day-books/${id}/reconcile`, data);
  
  if (!result || !result.data) {
    throw new Error('Failed to reconcile day book');
  }
  
  return result.data;
};

// Close day book
export const closeDayBook = async (id: string): Promise<DayBook> => {
  const result = await apiService.put<{
    success: boolean;
    message: string;
    data: DayBook;
  }>(`/accounting/day-books/${id}/close`, {});
  
  if (!result || !result.data) {
    throw new Error('Failed to close day book');
  }
  
  return result.data;
};

// Get day book summary
export const getDayBookSummary = async (id: string): Promise<DayBookSummary> => {
  const result = await apiService.get<{
    success: boolean;
    message: string;
    data: DayBookSummary;
  }>(`/accounting/day-books/${id}/summary`);
  
  if (!result || !result.data) {
    throw new Error('Failed to get day book summary');
  }
  
  return result.data;
};

const dayBookService = {
  getAllDayBooks,
  getDayBookById,
  createDayBook,
  reconcileDayBook,
  closeDayBook,
  getDayBookSummary
};

export default dayBookService;