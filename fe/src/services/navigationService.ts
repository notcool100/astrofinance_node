import apiService from './api';
import authService from './authService';

const navigationService = {
  /**
   * Get navigation groups for the current user
   * @returns Array of navigation groups, each containing navigation items
   */
  getUserNavigation: async () => {
    try {
      const data = await apiService.get('/office/navigation');
      console.log('Navigation response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching navigation:', error);
      return [];
    }
  },

  /**
   * Get navigation groups for a specific role (debug only)
   * @param roleName Role name
   * @returns Array of navigation groups, each containing navigation items
   */
  getNavigationByRole: async (roleName: string) => {
    try {
      const data = await apiService.get(`/office/navigation/role/${roleName}`);
      console.log(`Navigation for role ${roleName}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching navigation for role ${roleName}:`, error);
      return [];
    }
  },

  /**
   * Process navigation groups to match the format expected by the UI
   * @param groups Raw navigation groups from API
   * @returns Processed navigation groups
   */
  processNavigationGroups: (groups: any[]) => {
    if (!groups || groups.length === 0) {
      return [];
    }

    // Sort groups by order
    const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

    // Process each group
    return sortedGroups.map(group => {
      // Sort items within each group
      const sortedItems = group.items.sort((a: any, b: any) => a.order - b.order);
      
      // Process each item
      const processedItems = sortedItems.map((item: any) => {
        // Sort children if they exist
        if (item.children && item.children.length > 0) {
          item.children = item.children.sort((a: any, b: any) => a.order - b.order);
        }
        return item;
      });
      
      return {
        ...group,
        items: processedItems
      };
    });
  }
};

export default navigationService;