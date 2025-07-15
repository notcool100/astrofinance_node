import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import bcrypt from 'bcrypt';

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

    // Format the response to exclude sensitive information
    const { passwordHash, ...staffData } = staff;
    
    // Format roles
    const formattedRoles = staff.roles.map(role => ({
      id: role.role.id,
      name: role.role.name,
      description: role.role.description
    }));

    return res.status(200).json({
      ...staffData,
      roles: formattedRoles
    });
  } catch (error) {
    logger.error('Get staff profile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update staff profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const staffId = req.staff?.id;

    if (!staffId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address,
      profileImage
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !address) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email is already in use by another staff
    const existingStaff = await prisma.staff.findFirst({
      where: {
        email,
        id: { not: staffId }
      }
    });

    if (existingStaff) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Update staff profile
    const updatedStaff = await prisma.staff.update({
      where: { id: staffId },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        profileImage: profileImage || undefined
      }
    });

    // Format the response to exclude sensitive information
    const { passwordHash, ...staffData } = updatedStaff;

    return res.status(200).json({
      ...staffData,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Update staff profile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update staff password
 */
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const staffId = req.staff?.id;

    if (!staffId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Get staff record
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
    
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Update staff password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};