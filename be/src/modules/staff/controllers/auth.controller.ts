import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import type { StringValue } from 'ms'; 
// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Staff login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find staff by username
    const staff = await prisma.staff.findFirst({
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
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!staff) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the staff has a password hash
    if (!staff.passwordHash) {
      // For demo purposes, if no password hash exists, use a default password
      // In production, you would require a proper password reset flow
      const isDefaultPasswordValid = password === 'staffpass'; // Temporary for testing
      
      if (isDefaultPasswordValid) {
        // Set a proper password hash for future logins
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.staff.update({
          where: { id: staff.id },
          data: { passwordHash }
        });
      } else {
        logger.warn(`Failed login attempt for staff: ${username}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      // Verify password against stored hash
      const isPasswordValid = await bcrypt.compare(password, staff.passwordHash);
      
      if (!isPasswordValid) {
        // Increment failed login attempts
        await prisma.staff.update({
          where: { id: staff.id },
          data: { failedLoginAttempts: { increment: 1 } }
        });
        
        logger.warn(`Failed login attempt for staff: ${username}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }
    
    // Reset failed login attempts and update last login time
    await prisma.staff.update({
      where: { id: staff.id },
      data: { 
        failedLoginAttempts: 0,
        lastLogin: new Date()
      }
    });

    // Create JWT token
    // Create payload object
    const payload = { 
      id: staff.id,
      employeeId: staff.employeeId,
      email: staff.email,
      userType: 'STAFF'
    };
    
    // Create options object
   const options: SignOptions = {
  expiresIn: JWT_EXPIRES_IN as StringValue
};


    // Sign the token with explicit type casting
    const token = jwt.sign(payload, String(JWT_SECRET), options);

    // Extract roles and permissions
    const roles = staff.roles.map(roleAssignment => ({
      id: roleAssignment.role.id,
      name: roleAssignment.role.name
    }));

    // Return user info and token
    return res.status(200).json({
      user: {
        id: staff.id,
        employeeId: staff.employeeId,
        email: staff.email,
        fullName: `${staff.firstName} ${staff.lastName}`,
        isActive: staff.status === 'ACTIVE',
        roles,
        userType: 'STAFF',
        department: staff.department,
        position: staff.position
      },
      token
    });
  } catch (error) {
    logger.error('Staff login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Staff logout
 */
export const logout = async (req: Request, res: Response) => {
  // JWT is stateless, so we don't need to do anything server-side
  // The client should remove the token from storage
  return res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * Get staff profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const staffId = req.staff?.id;

    if (!staffId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Extract roles
    const roles = staff.roles.map(roleAssignment => ({
      id: roleAssignment.role.id,
      name: roleAssignment.role.name
    }));

    // Return staff profile
    return res.status(200).json({
      id: staff.id,
      employeeId: staff.employeeId,
      email: staff.email,
      fullName: `${staff.firstName} ${staff.lastName}`,
      firstName: staff.firstName,
      lastName: staff.lastName,
      phone: staff.phone,
      address: staff.address,
      dateOfBirth: staff.dateOfBirth,
      joinDate: staff.joinDate,
      department: staff.department,
      position: staff.position,
      status: staff.status,
      profileImage: staff.profileImage,
      roles,
      userType: 'STAFF'
    });
  } catch (error) {
    logger.error('Get staff profile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Change staff password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const staffId = req.staff?.id;
    const { currentPassword, newPassword } = req.body;

    if (!staffId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get the staff record
    const staff = await prisma.staff.findUnique({
      where: { id: staffId }
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Check if the staff has a password hash
    if (!staff.passwordHash) {
      // For demo purposes, if no password hash exists, use a default password
      const isDefaultPasswordValid = currentPassword === 'staffpass';
      
      if (!isDefaultPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    } else {
      // Verify current password against stored hash
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, staff.passwordHash);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update the password in the database
    await prisma.staff.update({
      where: { id: staffId },
      data: { passwordHash }
    });
    
    logger.info(`Password changed for staff: ${req.staff?.employeeId}`);
    
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change staff password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};