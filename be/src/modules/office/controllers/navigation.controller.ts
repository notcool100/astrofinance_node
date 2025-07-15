import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { ApiError } from '../../../common/middleware/error.middleware';
import { getUserNavigation } from '../services/navigation.service';

/**
 * Get navigation items for the current user
 */
export const getUserNavigationItems = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.userType;

    if (!userId || !userType) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Log the request details
    logger.debug(`Fetching navigation for user: ${userId}, type: ${userType}`);

    // Get navigation items for the user
    const navigationItems = await getUserNavigation(userId, userType as 'ADMIN' | 'STAFF');
    
    // Log the response
    logger.debug(`Returning ${navigationItems.length} navigation items to user`);
    
    return res.json(navigationItems);
  } catch (error) {
    logger.error('Error fetching user navigation:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch navigation items');
  }
};

/**
 * Debug endpoint to test navigation for a specific role
 * This is for development/testing only
 */
export const getNavigationByRole = async (req: Request, res: Response) => {
  try {
    const { roleName } = req.params;
    
    if (!roleName) {
      throw new ApiError(400, 'Role name is required');
    }
    
    // Find the role
    const role = await prisma.role.findFirst({
      where: { name: roleName }
    });
    
    if (!role) {
      throw new ApiError(404, `Role '${roleName}' not found`);
    }
    
    // Get navigation items for this role
    const roleNavigation = await prisma.roleNavigation.findMany({
      where: {
        roleId: role.id
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
    
    // Log the results
    logger.debug(`Found ${roleNavigation.length} navigation items for role: ${roleName}`);
    
    // Format the response
    const items = roleNavigation.map(rn => ({
      id: rn.navigationItem.id,
      label: rn.navigationItem.label,
      icon: rn.navigationItem.icon,
      url: rn.navigationItem.url,
      order: rn.navigationItem.order,
      parentId: rn.navigationItem.parentId,
      groupId: rn.navigationItem.groupId,
      groupName: rn.navigationItem.group?.name,
      groupOrder: rn.navigationItem.group?.order
    }));
    
    return res.json(items);
  } catch (error) {
    logger.error('Error fetching role navigation:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch navigation items for role');
  }
};

/**
 * Get all navigation items (admin only)
 */
export const getAllNavigationItems = async (req: Request, res: Response) => {
  try {
    // Get all navigation items using the service method
    const navigationItems = await prisma.navigationItem.findMany({
      where: {
        isActive: true
      },
      include: {
        group: true,
        parent: true,
        children: {
          where: {
            isActive: true
          }
        },
      },
      orderBy: [
        { order: 'asc' },
      ],
    });
    
    // Log the result for debugging
    logger.debug(`Returning ${navigationItems.length} navigation items to client`);
    
    return res.json(navigationItems);
  } catch (error) {
    logger.error('Error fetching all navigation items:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch navigation items');
  }
};

/**
 * Get all navigation groups (admin only)
 */
export const getAllNavigationGroups = async (req: Request, res: Response) => {
  try {
    // Get all active navigation groups
    const navigationGroups = await prisma.navigationGroup.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
      ],
    });
    
    // Log the result for debugging
    logger.debug(`Returning ${navigationGroups.length} navigation groups to client`);
    
    return res.json(navigationGroups);
  } catch (error) {
    logger.error('Error fetching navigation groups:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch navigation groups');
  }
};

/**
 * Create a new navigation item (admin only)
 */
export const createNavigationItem = async (req: Request, res: Response) => {
  try {
    const { label, icon, url, order, parentId, groupId } = req.body;

    // Create navigation item
    const navigationItem = await prisma.navigationItem.create({
      data: {
        label,
        icon,
        url,
        order,
        parentId,
        groupId,
        isActive: true,
      },
    });
    
    return res.status(201).json(navigationItem);
  } catch (error) {
    logger.error('Error creating navigation item:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create navigation item');
  }
};

/**
 * Update a navigation item (admin only)
 */
export const updateNavigationItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { label, icon, url, order, parentId, groupId, isActive } = req.body;

    // Check if navigation item exists
    const existingItem = await prisma.navigationItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new ApiError(404, 'Navigation item not found');
    }

    // Update navigation item
    const navigationItem = await prisma.navigationItem.update({
      where: { id },
      data: {
        label,
        icon,
        url,
        order,
        parentId,
        groupId,
        isActive,
      },
    });
    
    return res.json(navigationItem);
  } catch (error) {
    logger.error('Error updating navigation item:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update navigation item');
  }
};

/**
 * Delete a navigation item (admin only)
 */
export const deleteNavigationItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if navigation item exists
    const existingItem = await prisma.navigationItem.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!existingItem) {
      throw new ApiError(404, 'Navigation item not found');
    }

    // Check if item has children
    if (existingItem.children.length > 0) {
      throw new ApiError(400, 'Cannot delete navigation item with children');
    }

    // Delete navigation item
    await prisma.roleNavigation.deleteMany({
      where: { navigationItemId: id },
    });

    await prisma.navigationItem.delete({
      where: { id },
    });
    
    return res.json({ message: 'Navigation item deleted successfully' });
  } catch (error) {
    logger.error('Error deleting navigation item:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete navigation item');
  }
};

/**
 * Assign navigation items to a role (admin only)
 */
export const assignNavigationToRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { navigationItemIds } = req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      throw new ApiError(404, 'Role not found');
    }

    // Delete existing role navigation assignments
    await prisma.roleNavigation.deleteMany({
      where: { roleId },
    });

    // Create new role navigation assignments
    const roleNavigations = await Promise.all(
      navigationItemIds.map(async (navigationItemId: string) => {
        return prisma.roleNavigation.create({
          data: {
            roleId,
            navigationItemId,
          },
        });
      })
    );
    
    return res.json({ 
      message: 'Navigation items assigned to role successfully',
      count: roleNavigations.length,
    });
  } catch (error) {
    logger.error('Error assigning navigation to role:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to assign navigation items to role');
  }
};