import apiService from './api';

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
}

export interface Permission {
  id: string;
  code: string;
  description?: string;
  module: string;
  action: string;
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

// Permissions
export const getAllPermissions = async (): Promise<Record<string, Permission[]>> => {
  try {
    return await apiService.get<Record<string, Permission[]>>('/admin/roles/permissions');
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};

export const updateRolePermissions = async (
  id: string,
  permissionIds: string[],
): Promise<any> => {
  try {
    return await apiService.put<any>(`/admin/roles/${id}/permissions`, { permissionIds });
  } catch (error) {
    console.error(`Error updating role permissions for role ${id}:`, error);
    throw error;
  }
};