import apiService from './api';

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
}

export const getAllRoles = async (): Promise<Role[]> => {
  try {
    return await apiService.get<Role[]>('/admin/roles');
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const getRoleById = async (id: string): Promise<Role> => {
  try {
    return await apiService.get<Role>(`/admin/roles/${id}`);
  } catch (error) {
    console.error(`Error fetching role with ID ${id}:`, error);
    throw error;
  }
};

export const createRole = async (data: Omit<Role, 'id'>): Promise<Role> => {
  try {
    return await apiService.post<Role>('/admin/roles', data);
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

export const updateRole = async (id: string, data: Partial<Omit<Role, 'id'>>): Promise<Role> => {
  try {
    return await apiService.put<Role>(`/admin/roles/${id}`, data);
  } catch (error) {
    console.error(`Error updating role with ID ${id}:`, error);
    throw error;
  }
};

export const deleteRole = async (id: string): Promise<{ message: string }> => {
  try {
    return await apiService.delete<{ message: string }>(`/admin/roles/${id}`);
  } catch (error) {
    console.error(`Error deleting role with ID ${id}:`, error);
    throw error;
  }
};