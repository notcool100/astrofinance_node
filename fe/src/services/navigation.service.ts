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
    const response = await apiService.get<NavigationItem[]>('/office/admin/navigation/items');
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
    const response = await apiService.get<NavigationGroup[]>('/office/admin/navigation/groups');
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
    const response = await apiService.post<NavigationItem>('/office/admin/navigation/items', data);
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
    const response = await apiService.put<NavigationItem>(`/office/admin/navigation/items/${id}`, data);
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
    const response = await apiService.delete<{ message: string }>(`/office/admin/navigation/items/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting navigation item:', error);
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
    const response = await apiService.post<{ message: string }>(
      `/office/admin/roles/${roleId}/navigation`, 
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
  assignNavigationToRole,
};