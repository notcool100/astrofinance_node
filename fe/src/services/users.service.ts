import apiService from './api';

// Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  activeLoans: number;
  totalLoans: number;
}

export interface UserDetails extends User {
  address?: string;
  dateOfBirth?: string;
  idNumber?: string;
  loans: Array<{
    id: string;
    principalAmount: number;
    outstandingPrincipal: number;
    status: string;
    startDate: string;
    endDate: string;
    loanType: {
      id: string;
      name: string;
    };
  }>;
  loanApplications: Array<{
    id: string;
    amount: number;
    status: string;
    appliedDate: string;
  }>;
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    uploadDate: string;
  }>;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | '';
}

// Staff user management API
export const fetchStaffUsers = async (filters: UserFilters = {}): Promise<UsersResponse> => {
  const { page = 1, limit = 10, search = '', status = '' } = filters;
  const queryParams = new URLSearchParams();
  
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  if (search) {
    queryParams.append('search', search);
  }
  
  if (status) {
    queryParams.append('status', status);
  }
  
  return apiService.get<UsersResponse>(`/staff/users?${queryParams.toString()}`);
};

export const fetchStaffUserDetails = async (userId: string): Promise<{ user: UserDetails }> => {
  return apiService.get<{ user: UserDetails }>(`/staff/users/${userId}`);
};