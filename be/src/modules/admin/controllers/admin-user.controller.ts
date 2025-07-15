import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction } from '@prisma/client';
import { ApiError } from '../../../common/middleware/error.middleware';

/**
 * Get all admin users
 */
export const getAllAdminUsers = async (req: Request, res: Response) => {
  try {
    const adminUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        username: 'asc'
      }
    });

    return res.json(adminUsers);
  } catch (error) {
    logger.error('Get all admin users error:', error);
    throw new ApiError(500, 'Failed to fetch admin users');
  }
};

/**
 * Get admin user by ID
 */
export const getAdminUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const adminUser = await prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!adminUser) {
      throw new ApiError(404, 'Admin user not found');
    }

    return res.json(adminUser);
  } catch (error) {
    logger.error(`Get admin user by ID error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch admin user');
  }
};

/**
 * Create new admin user
 */
export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, isActive = true, roleIds = [] } = req.body;

    // Check if username or email already exists
    const existingUser = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ApiError(409, `Username '${username}' is already taken`);
      } else {
        throw new ApiError(409, `Email '${email}' is already registered`);
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Validate roles
    if (roleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: {
          id: {
            in: roleIds
          }
        }
      });

      if (roles.length !== roleIds.length) {
        throw new ApiError(400, 'One or more role IDs are invalid');
      }
    }

    // Create admin user with roles in a transaction
    const adminUser = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.adminUser.create({
        data: {
          username,
          email,
          passwordHash,
          fullName,
          isActive
        }
      });

      // Assign roles
      for (const roleId of roleIds) {
        await tx.adminUserRole.create({
          data: {
            adminUserId: user.id,
            roleId
          }
        });
      }

      return user;
    });

    // Get created user with roles
    const createdUser = await prisma.adminUser.findUnique({
      where: { id: adminUser.id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'AdminUser',
      adminUser.id,
      AuditAction.CREATE,
      null,
      {
        username,
        email,
        fullName,
        isActive,
        roles: roleIds
      }
    );

    return res.status(201).json({
      id: createdUser?.id,
      username: createdUser?.username,
      email: createdUser?.email,
      fullName: createdUser?.fullName,
      isActive: createdUser?.isActive,
      roles: createdUser?.roles.map(r => ({
        id: r.role.id,
        name: r.role.name
      }))
    });
  } catch (error) {
    logger.error(`Create admin user error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create admin user');
  }
};

/**
 * Update admin user
 */
export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, fullName, isActive, roleIds } = req.body;

    // Check if user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id },
      include: {
        roles: true
      }
    });

    if (!existingUser) {
      throw new ApiError(404, 'Admin user not found');
    }

    // Prevent deactivating the main admin account
    if (existingUser.username === 'admin' && isActive === false) {
      throw new ApiError(403, 'The main admin account cannot be deactivated');
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.adminUser.findFirst({
        where: {
          email,
          id: { not: id }
        }
      });

      if (emailExists) {
        throw new ApiError(409, `Email '${email}' is already registered`);
      }
    }

    // Validate roles if provided
    if (roleIds && Array.isArray(roleIds)) {
      const roles = await prisma.role.findMany({
        where: {
          id: {
            in: roleIds
          }
        }
      });

      if (roles.length !== roleIds.length) {
        throw new ApiError(400, 'One or more role IDs are invalid');
      }
    }

    // Update user in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user details
      await tx.adminUser.update({
        where: { id },
        data: {
          email: email || existingUser.email,
          fullName: fullName || existingUser.fullName,
          isActive: isActive !== undefined ? isActive : existingUser.isActive
        }
      });

      // Update roles if provided
      if (roleIds && Array.isArray(roleIds)) {
        // Get existing role IDs
        const existingRoleIds = existingUser.roles.map(r => r.roleId);

        // Remove roles that are not in the new list
        await tx.adminUserRole.deleteMany({
          where: {
            adminUserId: id,
            roleId: {
              notIn: roleIds
            }
          }
        });

        // Add new roles
        const newRoleIds = roleIds.filter(
          roleId => !existingRoleIds.includes(roleId)
        );

        for (const roleId of newRoleIds) {
          await tx.adminUserRole.create({
            data: {
              adminUserId: id,
              roleId
            }
          });
        }
      }
    });

    // Get updated user with roles
    const updatedUser = await prisma.adminUser.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'AdminUser',
      id,
      AuditAction.UPDATE,
      {
        email: existingUser.email,
        fullName: existingUser.fullName,
        isActive: existingUser.isActive,
        roles: existingUser.roles.map(r => r.roleId)
      },
      {
        email: email || existingUser.email,
        fullName: fullName || existingUser.fullName,
        isActive: isActive !== undefined ? isActive : existingUser.isActive,
        roles: roleIds || existingUser.roles.map(r => r.roleId)
      }
    );

    return res.json({
      id: updatedUser?.id,
      username: updatedUser?.username,
      email: updatedUser?.email,
      fullName: updatedUser?.fullName,
      isActive: updatedUser?.isActive,
      roles: updatedUser?.roles.map(r => ({
        id: r.role.id,
        name: r.role.name
      }))
    });
  } catch (error) {
    logger.error(`Update admin user error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update admin user');
  }
};

/**
 * Reset admin user password
 */
export const resetAdminUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Check if user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new ApiError(404, 'Admin user not found');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash }
    });

    // Create audit log
    await createAuditLog(
      req,
      'AdminUser',
      id,
      AuditAction.PASSWORD_CHANGE,
      null,
      null,
      { resetByAdmin: req.adminUser.id }
    );

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error(`Reset admin user password error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to reset password');
  }
};