import apiService from './api';
import authService from './authService';

const navigationService = {
  /**
   * Get navigation items for the current user
   * @returns Array of navigation items
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
   * Get navigation items for a specific role (debug only)
   * @param roleName Role name
   * @returns Array of navigation items
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
   * Process navigation items to match the format expected by the UI
   * @param items Raw navigation items from API
   * @returns Processed navigation items
   */
  processNavigationItems: (items: any[]) => {
    if (!items || items.length === 0) {
      return [];
    }

    // Group items by group name
    const groupedItems = items.reduce((acc: Record<string, any[]>, item: any) => {
      const groupName = item.groupName || 'Other';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(item);
      return acc;
    }, {});

    // Sort groups by groupOrder
    const sortedGroups = Object.entries(groupedItems)
      .sort(([groupNameA, itemsA], [groupNameB, itemsB]) => {
        const groupOrderA = itemsA[0]?.groupOrder || 999;
        const groupOrderB = itemsB[0]?.groupOrder || 999;
        return groupOrderA - groupOrderB;
      });

    // Flatten the sorted groups back into a single array
    const sortedItems = sortedGroups.flatMap(([groupName, items]) => {
      // Sort items within each group by order
      return items.sort((a, b) => a.order - b.order);
    });

    return sortedItems;
  }
};

export default navigationService;