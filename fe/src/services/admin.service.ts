import apiService from './api';

// Types
export interface AdminProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastLogin?: string;
  roles: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export interface UpdateProfileData {
  fullName: string;
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Admin profile API
export const fetchAdminProfile = async (): Promise<AdminProfile> => {
  return apiService.get<AdminProfile>('/admin/auth/profile');
};

export const updateAdminProfile = async (data: UpdateProfileData): Promise<AdminProfile> => {
  return apiService.put<AdminProfile>('/admin/profile', data);
};

export const changeAdminPassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  return apiService.post<{ message: string }>('/admin/auth/change-password', data);
};