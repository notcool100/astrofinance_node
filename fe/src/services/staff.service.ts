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
    description: string;
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

// Staff profile API
export const fetchStaffProfile = async (): Promise<StaffProfile> => {
  return apiService.get<StaffProfile>('/staff/profile');
};

export const updateStaffProfile = async (data: UpdateProfileData): Promise<StaffProfile> => {
  return apiService.put<StaffProfile>('/staff/profile', data);
};

export const changeStaffPassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  return apiService.post<{ message: string }>('/staff/profile/change-password', data);
};