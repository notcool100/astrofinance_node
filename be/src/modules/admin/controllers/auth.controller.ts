import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction } from '@prisma/client';

// JWT secret from environment variables
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Admin login controller
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find admin user by username or email
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                },
                navigation: {
                  include: {
                    navigationItem: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Check if user exists
    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if user is active
    if (!adminUser.isActive) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact the administrator.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser.id, username: adminUser.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    // Update last login timestamp
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLogin: new Date() }
    });

    // Extract permissions and navigation items
    const permissions = new Set<string>();
    const navigationItems: any[] = [];
    
    adminUser.roles.forEach(roleAssignment => {
      // Add permissions
      roleAssignment.role.permissions.forEach(permissionAssignment => {
        permissions.add(permissionAssignment.permission.code);
      });
      
      // Add navigation items
      roleAssignment.role.navigation.forEach(navAssignment => {
        navigationItems.push(navAssignment.navigationItem);
      });
    });

    // Create audit log
    await createAuditLog(
      req,
      'AdminUser',
      adminUser.id,
      AuditAction.LOGIN,
      null,
      null,
      { method: 'username/password' }
    );

    // Return user data and token
    return res.json({
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        fullName: adminUser.fullName,
        userType: 'ADMIN', // Explicitly set userType for admin users
        isActive: adminUser.isActive,
        roles: adminUser.roles.map(r => ({
          id: r.role.id,
          name: r.role.name
        })),
        permissions: Array.from(permissions),
      },
      token,
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
};

/**
 * Admin logout controller
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // Create audit log if user is authenticated
    if (req.adminUser) {
      await createAuditLog(
        req,
        'AdminUser',
        req.adminUser.id,
        AuditAction.LOGOUT,
        null,
        null
      );
    }

    // Note: JWT tokens are stateless, so we can't invalidate them server-side
    // The client should remove the token from storage
    
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({ message: 'An error occurred during logout' });
  }
};

/**
 * Get current admin user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    // User is already attached to request by auth middleware
    const adminUser = req.adminUser;
    
    // Extract permissions
    const permissions = new Set<string>();
    
    adminUser.roles.forEach((roleAssignment: any) => {
      roleAssignment.role.permissions.forEach((permissionAssignment: any) => {
        permissions.add(permissionAssignment.permission.code);
      });
    });

    // Return user data
    return res.json({
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      fullName: adminUser.fullName,
      userType: 'ADMIN', // Explicitly set userType for admin users
      isActive: adminUser.isActive,
      roles: adminUser.roles.map((r: any) => ({
        id: r.role.id,
        name: r.role.name
      })),
      permissions: Array.from(permissions),
      lastLogin: adminUser.lastLogin
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    return res.status(500).json({ message: 'An error occurred while fetching profile' });
  }
};

/**
 * Change admin user password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminUser = req.adminUser;

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, adminUser.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { passwordHash }
    });

    // Create audit log
    await createAuditLog(
      req,
      'AdminUser',
      adminUser.id,
      AuditAction.PASSWORD_CHANGE,
      null,
      null
    );

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    return res.status(500).json({ message: 'An error occurred while changing password' });
  }
};