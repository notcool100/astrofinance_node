import apiService from './api';

// Types
export interface StaffProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  joinDate: string;
  department: string;
  position: string;
  status: string;
  profileImage?: string;
  lastLogin?: string;
  roles: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profileImage?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface CreateStaffData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  joinDate: string;
  department: string;
  position: string;
  status?: string;
  roleIds?: string[];
}

export interface UpdateStaffData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  status?: string;
  roleIds?: string[];
}

export interface ResetPasswordData {
  newPassword: string;
}

// Staff profile API (for staff users)
export const fetchStaffProfile = async (): Promise<StaffProfile> => {
  return apiService.get<StaffProfile>('/staff/profile');
};

export const updateStaffProfile = async (data: UpdateProfileData): Promise<StaffProfile> => {
  return apiService.put<StaffProfile>('/staff/profile', data);
};

export const changeStaffPassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  return apiService.post<{ message: string }>('/staff/profile/change-password', data);
};

// Staff management API (for admin users)
export const getAllStaff = async (): Promise<StaffProfile[]> => {
  return apiService.get<StaffProfile[]>('/admin/staff');
};

export const getStaffById = async (id: string): Promise<StaffProfile> => {
  return apiService.get<StaffProfile>(`/admin/staff/${id}`);
};

export const createStaff = async (data: CreateStaffData): Promise<StaffProfile> => {
  return apiService.post<StaffProfile>('/admin/staff', data);
};

export const updateStaff = async (id: string, data: UpdateStaffData): Promise<StaffProfile> => {
  return apiService.put<StaffProfile>(`/admin/staff/${id}`, data);
};

export const resetStaffPassword = async (id: string, data: ResetPasswordData): Promise<{ message: string }> => {
  return apiService.post<{ message: string }>(`/admin/staff/${id}/reset-password`, data);
};

export const deleteStaff = async (id: string): Promise<{ message: string }> => {
  return apiService.delete<{ message: string }>(`/admin/staff/${id}`);
};