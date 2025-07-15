import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction } from '@prisma/client';
import { ApiError } from '../../../common/middleware/error.middleware';
import { getUserNavigation, getUserPermissions } from '../services/navigation.service';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'astrofinance-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Office user login (admin or staff)
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // First try to find an admin user
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ],
        isActive: true
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // If admin user found, verify password
    if (adminUser) {
      const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);
      
      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid username or password');
      }

      // Update last login timestamp
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { 
          lastLogin: new Date(),
          failedLoginAttempts: 0
        }
      });

      // Get user permissions and navigation items
      const permissions = await getUserPermissions(adminUser.id, 'ADMIN');
      const navigationItems = await getUserNavigation(adminUser.id, 'ADMIN');
      
      // Debug log
      logger.debug(`Admin login: Found ${permissions.length} permissions and ${navigationItems.length} navigation items`);

      // Create audit log
      await createAuditLog(
        req,
        'AdminUser',
        adminUser.id,
        AuditAction.LOGIN,
        null,
        { id: adminUser.id, email: adminUser.email }
      );

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: adminUser.id, 
          username: adminUser.username,
          email: adminUser.email,
          userType: 'ADMIN'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as SignOptions
      );

      // Prepare response
      const response = {
        user: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          fullName: adminUser.fullName,
          userType: 'ADMIN',
          isActive: adminUser.isActive,
          roles: adminUser.roles.map(r => ({
            id: r.role.id,
            name: r.role.name
          })),
          permissions,
          navigation: navigationItems
        },
        token
      };
      
      // Debug log
      logger.debug(`Admin login response: ${JSON.stringify({
        ...response,
        user: {
          ...response.user,
          navigation: `${response.user.navigation.length} items`,
          permissions: `${response.user.permissions.length} permissions`
        }
      })}`);
      
      // Return user data and token
      return res.json(response);
    }

    // If no admin user found, try to find a staff user
    const staffUser = await prisma.staff.findFirst({
      where: {
        OR: [
          { employeeId: username },
          { email: username }
        ],
        status: 'ACTIVE'
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // If staff user found, verify password
    if (staffUser) {
      // Check if the staff has a password hash
      if (!staffUser.passwordHash) {
        throw new ApiError(401, 'Password not set. Please contact administrator.');
      }

      const isPasswordValid = await bcrypt.compare(password, staffUser.passwordHash);
      
      if (!isPasswordValid) {
        // Increment failed login attempts
        await prisma.staff.update({
          where: { id: staffUser.id },
          data: { failedLoginAttempts: { increment: 1 } }
        });
        
        throw new ApiError(401, 'Invalid username or password');
      }

      // Reset failed login attempts and update last login time
      await prisma.staff.update({
        where: { id: staffUser.id },
        data: { 
          failedLoginAttempts: 0,
          lastLogin: new Date()
        }
      });

      // Get user permissions and navigation items
      const permissions = await getUserPermissions(staffUser.id, 'STAFF');
      const navigationItems = await getUserNavigation(staffUser.id, 'STAFF');
      
      // Debug log
      logger.debug(`Staff login: Found ${permissions.length} permissions and ${navigationItems.length} navigation items`);

      // Create audit log
      await createAuditLog(
        req,
        'Staff',
        staffUser.id,
        AuditAction.LOGIN,
        null,
        { id: staffUser.id, email: staffUser.email }
      );

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: staffUser.id, 
          employeeId: staffUser.employeeId,
          email: staffUser.email,
          userType: 'STAFF'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as SignOptions
      );

      // Return user data and token
      return res.json({
        user: {
          id: staffUser.id,
          employeeId: staffUser.employeeId,
          email: staffUser.email,
          fullName: `${staffUser.firstName} ${staffUser.lastName}`,
          userType: 'STAFF',
          isActive: staffUser.status === 'ACTIVE',
          department: staffUser.department,
          position: staffUser.position,
          roles: staffUser.roles.map(r => ({
            id: r.role.id,
            name: r.role.name
          })),
          permissions,
          navigation: navigationItems
        },
        token
      });
    }

    // If neither admin nor staff user found
    throw new ApiError(401, 'Invalid username or password');
  } catch (error) {
    logger.error(`Office login error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'An error occurred during login');
  }
};

/**
 * Office user logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.userType;

    if (userId) {
      // Create audit log
      await createAuditLog(
        req,
        userType === 'ADMIN' ? 'AdminUser' : 'Staff',
        userId,
        AuditAction.LOGOUT,
        null,
        { id: userId }
      );
    }

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'An error occurred during logout');
  }
};

/**
 * Get office user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.userType;

    if (!userId || !userType) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Get profile based on user type
    if (userType === 'ADMIN') {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!adminUser) {
        throw new ApiError(404, 'User not found');
      }

      // Get user permissions and navigation items
      const permissions = await getUserPermissions(adminUser.id, 'ADMIN');
      const navigationItems = await getUserNavigation(adminUser.id, 'ADMIN');

      return res.json({
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        fullName: adminUser.fullName,
        userType: 'ADMIN',
        isActive: adminUser.isActive,
        roles: adminUser.roles.map(r => ({
          id: r.role.id,
          name: r.role.name
        })),
        permissions,
        navigation: navigationItems,
        lastLogin: adminUser.lastLogin
      });
    } else if (userType === 'STAFF') {
      const staffUser = await prisma.staff.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!staffUser) {
        throw new ApiError(404, 'User not found');
      }

      // Get user permissions and navigation items
      const permissions = await getUserPermissions(staffUser.id, 'STAFF');
      const navigationItems = await getUserNavigation(staffUser.id, 'STAFF');

      return res.json({
        id: staffUser.id,
        employeeId: staffUser.employeeId,
        email: staffUser.email,
        fullName: `${staffUser.firstName} ${staffUser.lastName}`,
        firstName: staffUser.firstName,
        lastName: staffUser.lastName,
        phone: staffUser.phone,
        address: staffUser.address,
        dateOfBirth: staffUser.dateOfBirth,
        joinDate: staffUser.joinDate,
        department: staffUser.department,
        position: staffUser.position,
        status: staffUser.status,
        profileImage: staffUser.profileImage,
        userType: 'STAFF',
        roles: staffUser.roles.map(r => ({
          id: r.role.id,
          name: r.role.name
        })),
        permissions,
        navigation: navigationItems,
        lastLogin: staffUser.lastLogin
      });
    }

    throw new ApiError(400, 'Invalid user type');
  } catch (error) {
    logger.error(`Get profile error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch user profile');
  }
};

/**
 * Change office user password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.userType;
    const { currentPassword, newPassword } = req.body;

    if (!userId || !userType) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Change password based on user type
    if (userType === 'ADMIN') {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: userId }
      });

      if (!adminUser) {
        throw new ApiError(404, 'User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, adminUser.passwordHash);
      
      if (!isPasswordValid) {
        throw new ApiError(401, 'Current password is incorrect');
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.adminUser.update({
        where: { id: userId },
        data: { 
          passwordHash,
          passwordChangedAt: new Date()
        }
      });

      // Create audit log
      await createAuditLog(
        req,
        'AdminUser',
        userId,
        AuditAction.PASSWORD_CHANGE,
        null,
        { id: userId }
      );

      return res.json({ message: 'Password changed successfully' });
    } else if (userType === 'STAFF') {
      const staffUser = await prisma.staff.findUnique({
        where: { id: userId }
      });

      if (!staffUser) {
        throw new ApiError(404, 'User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, staffUser.passwordHash || '');
      
      if (!isPasswordValid) {
        throw new ApiError(401, 'Current password is incorrect');
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.staff.update({
        where: { id: userId },
        data: { 
          passwordHash,
          // passwordChangedAt: new Date()
        }
      });

      // Create audit log
      await createAuditLog(
        req,
        'Staff',
        userId,
        AuditAction.PASSWORD_CHANGE,
        null,
        { id: userId }
      );

      return res.json({ message: 'Password changed successfully' });
    }

    throw new ApiError(400, 'Invalid user type');
  } catch (error) {
    logger.error(`Change password error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to change password');
  }
};