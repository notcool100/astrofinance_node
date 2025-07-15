import apiService from './api';

// Types
export interface User {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender?: string;
  contactNumber: string;
  email?: string;
  address: string;
  idType: string;
  idNumber: string;
  userType: 'SB' | 'BB' | 'MB';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    loans: number;
    loanApplications: number;
  };
}

export interface CreateUserData {
  fullName: string;
  dateOfBirth: string;
  gender?: string;
  contactNumber: string;
  email?: string;
  address: string;
  identificationNumber: string;
  identificationType: string;
  password: string;
  userType?: 'SB' | 'BB' | 'MB';
  isActive?: boolean;
}

export interface UpdateUserData {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  identificationNumber?: string;
  identificationType?: string;
  isActive?: boolean;
}

export interface ResetPasswordData {
  newPassword: string;
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

export interface UserLoan {
  id: string;
  accountNumber: string;
  amount: number;
  disbursementDate: string;
  status: string;
  loanType: {
    id: string;
    name: string;
    code: string;
  };
}

export interface UserLoanApplication {
  id: string;
  applicationNumber: string;
  amount: number;
  appliedDate: string;
  status: string;
  loanType: {
    id: string;
    name: string;
    code: string;
  };
}

// API functions
export const getAllUsers = async (
  page = 1,
  limit = 10,
  search?: string,
  status?: string
): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  
  return apiService.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
};

export const getUserById = async (id: string): Promise<User> => {
  return apiService.get<User>(`/users/${id}`);
};

export const createUser = async (data: CreateUserData): Promise<User> => {
  return apiService.post<User>('/users', data);
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<User> => {
  return apiService.put<User>(`/users/${id}`, data);
};

export const resetUserPassword = async (id: string, data: ResetPasswordData): Promise<{ message: string }> => {
  return apiService.post<{ message: string }>(`/users/${id}/reset-password`, data);
};

export const getUserLoans = async (
  id: string,
  page = 1,
  limit = 10,
  status?: string
): Promise<PaginatedResponse<UserLoan>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (status) params.append('status', status);
  
  return apiService.get<PaginatedResponse<UserLoan>>(`/users/${id}/loans?${params.toString()}`);
};

export const getUserLoanApplications = async (
  id: string,
  page = 1,
  limit = 10,
  status?: string
): Promise<PaginatedResponse<UserLoanApplication>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (status) params.append('status', status);
  
  return apiService.get<PaginatedResponse<UserLoanApplication>>(`/users/${id}/loan-applications?${params.toString()}`);
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  return apiService.delete<{ message: string }>(`/users/${id}`);
};

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  getUserLoans,
  getUserLoanApplications,
  deleteUser
};

export default userService;