import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';

/**
 * Get staff dashboard summary
 */
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const staffId = req.staff?.id;

    if (!staffId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get all users count
    const assignedUsersCount = await prisma.user.count({
      where: { 
        isActive: true
      }
    });

    // Get active loans count
    const activeLoansCount = await prisma.loan.count({
      where: { 
        status: 'ACTIVE'
      }
    });

    // Get pending applications count
    const pendingApplicationsCount = await prisma.loanApplication.count({
      where: { 
        status: 'PENDING'
      }
    });

    // Get today's payments count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPaymentsCount = await prisma.loanInstallment.count({
      where: {
        dueDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get overdue payments count
    const overduePaymentsCount = await prisma.loanInstallment.count({
      where: {
        dueDate: {
          lt: today
        },
        status: 'OVERDUE'
      }
    });

    // Get recent activities
    // This would typically come from an activity log table
    // For now, we'll create some sample activities based on recent data
    
    // Get recent loan applications
    const recentApplications = await prisma.loanApplication.findMany({
      take: 3,
      orderBy: { appliedDate: 'desc' },
      include: {
        user: true
      }
    });

    // Get recent loan payments
    const recentPayments = await prisma.loanPayment.findMany({
      take: 2,
      orderBy: { paymentDate: 'desc' },
      include: {
        loan: {
          include: {
            user: true
          }
        }
      }
    });
    
    // Get recent user registrations
    const recentRegistrations = await prisma.user.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' }
    });

    // Combine and format activities
    const recentActivities = [
      ...recentApplications.map(app => ({
        id: app.id,
        type: 'LOAN_APPLICATION',
        description: 'New loan application submitted by',
        timestamp: app.appliedDate.toISOString(),
        user: {
          id: app.userId,
          name: `${app.user.fullName}`
        }
      })),
      ...recentPayments.map(payment => ({
        id: payment.id,
        type: 'PAYMENT',
        description: 'Loan payment received from',
        timestamp: payment.paymentDate.toISOString(),
        user: {
          id: payment.loan.userId,
          name: `${payment.loan.user.fullName}`
        }
      })),
      ...recentRegistrations.map(user => ({
        id: user.id,
        type: 'USER_REGISTRATION',
        description: 'New user registered',
        timestamp: user.createdAt.toISOString(),
        user: {
          id: user.id,
          name: user.fullName
        }
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Return dashboard summary
    return res.status(200).json({
      assignedUsers: assignedUsersCount,
      activeLoans: activeLoansCount,
      pendingApplications: pendingApplicationsCount,
      todayPayments: todayPaymentsCount,
      overduePayments: overduePaymentsCount,
      recentActivities: recentActivities.slice(0, 5) // Limit to 5 activities
    });
  } catch (error) {
    logger.error('Get staff dashboard summary error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};