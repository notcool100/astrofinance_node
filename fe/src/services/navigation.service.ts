import apiService from './api';

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  order: number;
  parentId?: string;
  groupId?: string;
  groupName?: string;
  groupOrder?: number;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
}

/**
 * Fetch navigation items for the current user
 * @returns Array of navigation items
 */
export const fetchUserNavigation = async (): Promise<NavigationItem[]> => {
  try {
    const response = await apiService.get<NavigationItem[]>('/office/navigation');
    return response;
  } catch (error) {
    console.error('Error fetching user navigation:', error);
    return [];
  }
};

/**
 * Fetch all navigation items (admin only)
 * @returns Array of all navigation items
 */
export const fetchAllNavigationItems = async (): Promise<NavigationItem[]> => {
  try {
    const response = await apiService.get<NavigationItem[]>('/admin/navigation');
    return response;
  } catch (error) {
    console.error('Error fetching all navigation items:', error);
    return [];
  }
};

/**
 * Fetch all navigation groups (admin only)
 * @returns Array of all navigation groups
 */
export const fetchNavigationGroups = async (): Promise<NavigationGroup[]> => {
  try {
    const response = await apiService.get<NavigationGroup[]>('/admin/navigation/groups');
    return response;
  } catch (error) {
    console.error('Error fetching navigation groups:', error);
    return [];
  }
};

/**
 * Create a new navigation item (admin only)
 * @param data Navigation item data
 * @returns Created navigation item
 */
export const createNavigationItem = async (data: Partial<NavigationItem>): Promise<NavigationItem> => {
  try {
    const response = await apiService.post<NavigationItem>('/admin/navigation', data);
    return response;
  } catch (error) {
    console.error('Error creating navigation item:', error);
    throw error;
  }
};

/**
 * Update a navigation item (admin only)
 * @param id Navigation item ID
 * @param data Navigation item data
 * @returns Updated navigation item
 */
export const updateNavigationItem = async (id: string, data: Partial<NavigationItem>): Promise<NavigationItem> => {
  try {
    const response = await apiService.put<NavigationItem>(`/admin/navigation/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error updating navigation item:', error);
    throw error;
  }
};

/**
 * Delete a navigation item (admin only)
 * @param id Navigation item ID
 * @returns Success message
 */
export const deleteNavigationItem = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await apiService.delete<{ message: string }>(`/admin/navigation/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting navigation item:', error);
    throw error;
  }
};

/**
 * Create a new navigation group (admin only)
 * @param data Navigation group data
 * @returns Created navigation group
 */
export const createNavigationGroup = async (data: Partial<NavigationGroup>): Promise<NavigationGroup> => {
  try {
    const response = await apiService.post<NavigationGroup>('/admin/navigation/groups', data);
    return response;
  } catch (error) {
    console.error('Error creating navigation group:', error);
    throw error;
  }
};

/**
 * Update a navigation group (admin only)
 * @param id Navigation group ID
 * @param data Navigation group data
 * @returns Updated navigation group
 */
export const updateNavigationGroup = async (id: string, data: Partial<NavigationGroup>): Promise<NavigationGroup> => {
  try {
    const response = await apiService.put<NavigationGroup>(`/admin/navigation/groups/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error updating navigation group:', error);
    throw error;
  }
};

/**
 * Delete a navigation group (admin only)
 * @param id Navigation group ID
 * @returns Success message
 */
export const deleteNavigationGroup = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await apiService.delete<{ message: string }>(`/admin/navigation/groups/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting navigation group:', error);
    throw error;
  }
};

/**
 * Get navigation group by ID (admin only)
 * @param id Navigation group ID
 * @returns Navigation group
 */
export const getNavigationGroupById = async (id: string): Promise<NavigationGroup> => {
  try {
    const response = await apiService.get<NavigationGroup>(`/admin/navigation/groups/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching navigation group:', error);
    throw error;
  }
};

/**
 * Get navigation item by ID (admin only)
 * @param id Navigation item ID
 * @returns Navigation item
 */
export const getNavigationItemById = async (id: string): Promise<NavigationItem> => {
  try {
    const response = await apiService.get<NavigationItem>(`/admin/navigation/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching navigation item:', error);
    throw error;
  }
};

/**
 * Assign navigation items to a role (admin only)
 * @param roleId Role ID
 * @param navigationItemIds Array of navigation item IDs
 * @returns Success message
 */
export const assignNavigationToRole = async (
  roleId: string, 
  navigationItemIds: string[]
): Promise<{ message: string }> => {
  try {
    const response = await apiService.put<{ message: string }>(
      `/admin/navigation/roles/${roleId}`,
      { navigationItemIds }
    );
    return response;
  } catch (error) {
    console.error('Error assigning navigation to role:', error);
    throw error;
  }
};

export default {
  fetchUserNavigation,
  fetchAllNavigationItems,
  fetchNavigationGroups,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  createNavigationGroup,
  updateNavigationGroup,
  deleteNavigationGroup,
  getNavigationGroupById,
  getNavigationItemById,
  assignNavigationToRole,
};