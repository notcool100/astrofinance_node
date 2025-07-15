import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';

/**
 * Get users assigned to staff
 */
export const getAssignedUsers = async (req: Request, res: Response) => {
  try {
    const staffId = req.staff?.id;

    if (!staffId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { page = '1', limit = '10', search = '', status } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter conditions
    const where: any = {};

    // Add search filter
    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { contactNumber: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Add status filter
    if (status) {
      where.isActive = status === 'active';
    }

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        contactNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        loans: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where });

    // Format response
    const formattedUsers = users.map(user => ({
      ...user,
      activeLoans: user.loans.filter(loan => loan.status === 'ACTIVE').length,
      totalLoans: user.loans.length,
      loans: undefined // Remove loans array from response
    }));

    return res.status(200).json({
      users: formattedUsers,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limitNumber)
      }
    });
  } catch (error) {
    logger.error('Get assigned users error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user details
 */
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const staffId = req.staff?.id;
    const userId = req.params.id;

    if (!staffId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get user details
    const user = await prisma.user.findFirst({
      where: {
        id: userId
      },
      include: {
        loans: {
          include: {
            loanType: true
          }
        },
        loanApplications: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    logger.error('Get user details error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};