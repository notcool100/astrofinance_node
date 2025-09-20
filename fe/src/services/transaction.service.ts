import apiService from './api';

// Types
export interface Transaction {
  id: string;
  accountId: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST_CREDIT' | 'FEE_DEBIT' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  amount: number;
  description?: string;
  referenceNumber?: string;
  transactionMethod?: string;
  transactionDate: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  account?: {
    id: string;
    accountNumber: string;
    userId: string;
    user?: {
      id: string;
      fullName: string;
    };
  };
}

export interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalInterestEarned: number;
  totalFees: number;
  transactionCount: number;
  lastTransactionDate?: string;
}

export interface CreateTransactionData {
  accountId: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST_CREDIT' | 'FEE_DEBIT' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  amount: number;
  description?: string;
  referenceNumber?: string;
  transactionMethod?: string;
  transactionDate?: string;
}

export interface CancelTransactionData {
  id: string;
  reason: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// API functions
export const getTransactionsByAccount = async (
  accountId: string,
  page = 1,
  limit = 10,
  startDate?: string,
  endDate?: string,
  transactionType?: string
): Promise<PaginatedResponse<Transaction>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (transactionType) params.append('transactionType', transactionType);
  
  const response = await apiService.get<{success: boolean, message: string, data: Transaction[], pagination: any}>(`/user/accounts/${accountId}/transactions?${params.toString()}`);
  
  if (!response || !response.data) {
    return { data: [], pagination: { total: 0, page, limit, pages: 0 } };
  }
  
  return {
    data: response.data,
    pagination: response.pagination || { total: 0, page, limit, pages: 0 }
  };
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
  const response = await apiService.get<{success: boolean, message: string, data: Transaction}>(`/user/transactions/${id}`);
  if (!response || !response.data) {
    throw new Error('Transaction not found');
  }
  return response.data;
};

export const createTransaction = async (data: CreateTransactionData): Promise<Transaction> => {
  const response = await apiService.post<{success: boolean, message: string, data: Transaction}>(`/user/accounts/${data.accountId}/transactions`, data);
  if (!response || !response.data) {
    throw new Error('Failed to create transaction');
  }
  return response.data;
};

export const cancelTransaction = async (data: CancelTransactionData): Promise<Transaction> => {
  const response = await apiService.post<{success: boolean, message: string, data: Transaction}>(`/user/transactions/${data.id}/cancel`, { reason: data.reason });
  if (!response || !response.data) {
    throw new Error('Failed to cancel transaction');
  }
  return response.data;
};

export const getTransactionSummary = async (accountId: string): Promise<TransactionSummary> => {
  const response = await apiService.get<{success: boolean, message: string, data: {summary: TransactionSummary}}>(`/user/accounts/${accountId}/transactions/summary`);
  
  if (!response || !response.data || !response.data.summary) {
    return {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalInterestEarned: 0,
      totalFees: 0,
      transactionCount: 0
    };
  }
  
  return response.data.summary;
};

export const getAllTransactions = async (
  page = 1,
  limit = 10,
  startDate?: string,
  endDate?: string,
  transactionType?: string,
  accountId?: string,
  accountNumber?: string
): Promise<PaginatedResponse<Transaction>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (transactionType) params.append('transactionType', transactionType);
  if (accountId) params.append('accountId', accountId);
  if (accountNumber) params.append('accountNumber', accountNumber);
  
  const response = await apiService.get<{success: boolean, message: string, data: Transaction[], pagination: any}>(`/user/transactions?${params.toString()}`);
  
  if (!response || !response.data) {
    return { data: [], pagination: { total: 0, page, limit, pages: 0 } };
  }
  
  return {
    data: response.data,
    pagination: response.pagination || { total: 0, page, limit, pages: 0 }
  };
};

export const getAllTransactionsSummary = async (accountId?: string, accountNumber?: string): Promise<TransactionSummary> => {
  const params = new URLSearchParams();
  if (accountId) params.append('accountId', accountId);
  if (accountNumber) params.append('accountNumber', accountNumber);
  
  const response = await apiService.get<{success: boolean, message: string, data: {summary: TransactionSummary}}>(`/user/transactions/summary?${params.toString()}`);
  
  if (!response || !response.data || !response.data.summary) {
    return {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalInterestEarned: 0,
      totalFees: 0,
      transactionCount: 0
    };
  }
  
  return response.data.summary;
};

export const getAccountById = async (accountId: string) => {
  const response = await apiService.get<{success: boolean, message: string, data: any}>(`/user/accounts/${accountId}`);
  if (!response || !response.data) {
    throw new Error('Account not found');
  }
  return response.data;
};

const transactionService = {
  getTransactionsByAccount,
  getTransactionById,
  createTransaction,
  cancelTransaction,
  getTransactionSummary,
  getAllTransactions,
  getAllTransactionsSummary,
  getAccountById
};

export default transactionService;