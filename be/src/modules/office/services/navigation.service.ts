import prisma from '../../../config/database';
import logger from '../../../config/logger';

// Define interfaces for navigation items
interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  order: number;
  parentId?: string | null;
  groupId?: string | null;
  groupName?: string;
  groupOrder?: number;
  children: NavigationItem[];
}

/**
 * Get navigation items for a user based on their roles
 * @param userId User ID
 * @param userType User type (ADMIN or STAFF)
 * @returns Array of navigation items
 */
export const getUserNavigation = async (userId: string, userType: 'ADMIN' | 'STAFF') => {
  try {
    // Get user roles based on user type
    let userRoles: { roleId: string }[] = [];
    
    if (userType === 'ADMIN') {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: userId },
        include: {
          roles: true
        }
      });
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      userRoles = adminUser.roles.map(role => ({ roleId: role.roleId }));
    } else if (userType === 'STAFF') {
      const staffUser = await prisma.staff.findUnique({
        where: { id: userId },
        include: {
          roles: {
            where: { isActive: true }
          }
        }
      });
      
      if (!staffUser) {
        throw new Error('Staff user not found');
      }
      
      userRoles = staffUser.roles.map(role => ({ roleId: role.roleId }));
    }
    
    if (userRoles.length === 0) {
      return [];
    }
    
    // Get role IDs
    const roleIds = userRoles.map(role => role.roleId);
    
    // Get navigation items for these roles
    const roleNavigation = await prisma.roleNavigation.findMany({
      where: {
        roleId: { in: roleIds }
      },
      include: {
        navigationItem: {
          include: {
            group: true,
            children: true
          }
        }
      }
    });
    
    // Debug log
    logger.debug(`Found ${roleNavigation.length} navigation items for roles: ${roleIds.join(', ')}`);
    
    // Check if we have any navigation items
    if (roleNavigation.length === 0) {
      logger.warn(`No navigation items found for roles: ${roleIds.join(', ')}`);
      
      // As a fallback, try to get navigation items for the Super Admin role
      logger.debug('Attempting to get Super Admin navigation as fallback');
      
      const superAdminRole = await prisma.role.findFirst({
        where: { name: 'Super Admin' }
      });
      
      if (superAdminRole) {
        const superAdminNavigation = await prisma.roleNavigation.findMany({
          where: {
            roleId: superAdminRole.id
          },
          include: {
            navigationItem: {
              include: {
                group: true,
                children: true
              }
            }
          }
        });
        
        if (superAdminNavigation.length > 0) {
          logger.debug(`Found ${superAdminNavigation.length} navigation items from Super Admin role as fallback`);
          roleNavigation.push(...superAdminNavigation);
        } else {
          // If still no items, get all active navigation items
          logger.debug('No Super Admin navigation found. Getting all active navigation items');
          
          const allNavItems = await prisma.navigationItem.findMany({
            where: { isActive: true },
            include: {
              group: true,
              children: {
                where: { isActive: true }
              }
            }
          });
          
          if (allNavItems.length > 0) {
            logger.debug(`Found ${allNavItems.length} active navigation items as final fallback`);
            
            // Convert to the expected format and return
            const result = allNavItems.map(item => ({
              id: item.id,
              label: item.label,
              icon: item.icon || undefined,
              url: item.url || undefined,
              order: item.order,
              parentId: item.parentId || undefined,
              groupId: item.groupId || undefined,
              groupName: item.group?.name,
              groupOrder: item.group?.order,
              children: []
            }));
            
            return result;
          }
        }
      }
      
      // If we still have no items, return empty array
      if (roleNavigation.length === 0) {
        return [];
      }
    }
    
    // Extract unique navigation items
    const navigationItemMap = new Map<string, NavigationItem>();
    
    // Log the raw data for debugging
    logger.debug(`Raw navigation data: ${JSON.stringify(roleNavigation.slice(0, 1))}`);
    
    for (const rn of roleNavigation) {
      try {
        if (!rn.navigationItem) {
          logger.warn(`Navigation item not found for role navigation: ${rn.id}`);
          continue;
        }
        
        const item = rn.navigationItem;
        
        // Skip inactive items
        if (item.isActive === false) {
          logger.debug(`Skipping inactive navigation item: ${item.label}`);
          continue;
        }
        
        if (!navigationItemMap.has(item.id)) {
          // Debug log for each navigation item
          logger.debug(`Processing navigation item: ${item.label}, icon: ${item.icon}, url: ${item.url}, parentId: ${item.parentId}, groupId: ${item.groupId}`);
          
          // Get group info if available
          const groupName = item.group?.name;
          const groupOrder = item.group?.order;
          
          navigationItemMap.set(item.id, {
            id: item.id,
            label: item.label,
            icon: item.icon ?? undefined,
            url: item.url ?? undefined,
            order: item.order,
            parentId: item.parentId,
            groupId: item.groupId,
            groupName,
            groupOrder,
            children: []
          });
        }
      } catch (error) {
        logger.error(`Error processing navigation item: ${error}`);
      }
    }
    
    // Add children to parent items
    navigationItemMap.forEach(item => {
      if (item.parentId && navigationItemMap.has(item.parentId)) {
        const parent = navigationItemMap.get(item.parentId);
        if (parent) {
          parent.children.push(item);
        }
      }
    });
    
    // Filter out items that are children (they'll be included in their parents)
    const topLevelItems = Array.from(navigationItemMap.values())
      .filter(item => !item.parentId)
      .sort((a: NavigationItem, b: NavigationItem) => {
        // Sort by group order first, then by item order
        if (a.groupOrder !== b.groupOrder && a.groupOrder !== undefined && b.groupOrder !== undefined) {
          return a.groupOrder - b.groupOrder;
        }
        return a.order - b.order;
      });
    
    // Sort children by order
    topLevelItems.forEach(item => {
      if (item.children.length > 0) {
        item.children.sort((a: NavigationItem, b: NavigationItem) => a.order - b.order);
      }
    });
    
    // Debug log
    logger.debug(`Returning ${topLevelItems.length} top-level navigation items`);
    
    return topLevelItems;
  } catch (error) {
    logger.error('Error fetching user navigation:', error);
    throw error;
  }
};

/**
 * Get user permissions based on their roles
 * @param userId User ID
 * @param userType User type (ADMIN or STAFF)
 * @returns Array of permission codes
 */
/**
 * Get all navigation items for testing purposes
 * This is for internal use only
 */
const fetchAllNavigationItems = async () => {
  try {
    const navigationItems = await prisma.navigationItem.findMany({
      where: {
        isActive: true
      },
      include: {
        group: true,
        children: {
          where: {
            isActive: true
          }
        }
      },
      orderBy: [
        {
          order: 'asc'
        }
      ]
    });
    
    logger.debug(`Found ${navigationItems.length} total navigation items in database`);
    
    return navigationItems;
  } catch (error) {
    logger.error('Error fetching all navigation items:', error);
    throw error;
  }
};

export const getUserPermissions = async (userId: string, userType: 'ADMIN' | 'STAFF') => {
  try {
    // Get user roles based on user type
    let userRoles: { roleId: string }[] = [];
    
    if (userType === 'ADMIN') {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: userId },
        include: {
          roles: true
        }
      });
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      userRoles = adminUser.roles.map(role => ({ roleId: role.roleId }));
    } else if (userType === 'STAFF') {
      const staffUser = await prisma.staff.findUnique({
        where: { id: userId },
        include: {
          roles: {
            where: { isActive: true }
          }
        }
      });
      
      if (!staffUser) {
        throw new Error('Staff user not found');
      }
      
      userRoles = staffUser.roles.map(role => ({ roleId: role.roleId }));
    }
    
    if (userRoles.length === 0) {
      return [];
    }
    
    // Get role IDs
    const roleIds = userRoles.map(role => role.roleId);
    
    // Get permissions for these roles
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        roleId: { in: roleIds }
      },
      include: {
        permission: true
      }
    });
    
    // Extract unique permission codes
    const permissionCodes = new Set<string>();
    
    rolePermissions.forEach(rp => {
      permissionCodes.add(rp.permission.code);
    });
    
    return Array.from(permissionCodes);
  } catch (error) {
    logger.error('Error fetching user permissions:', error);
    throw error;
  }
};