import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { ApiError } from '../../../common/middleware/error.middleware';

/**
 * Get calculation history for a user
 * 
 * @route GET /api/loan/calculator-history/user/:userId
 * @param {string} userId - The ID of the user
 * @param {number} limit - Number of records to return (default: 10)
 * @param {number} page - Page number (default: 1)
 * @returns {Object} Calculation history with pagination
 */
export const getUserCalculationHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const skip = (page - 1) * limit;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const [history, total] = await Promise.all([
      prisma.loanCalculatorHistory.findMany({
        where: {
          userId
        },
        include: {
          loanType: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        orderBy: {
          calculatedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.loanCalculatorHistory.count({
        where: {
          userId
        }
      })
    ]);

    return res.json({
      data: history,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Get user calculation history error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to get calculation history');
  }
};

/**
 * Record a new calculation in history
 * 
 * @route POST /api/loan/calculator-history
 * @param {Object} req.body - Calculation details
 * @returns {Object} Created calculation record
 */
export const recordCalculation = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      loanTypeId,
      amount,
      tenure,
      interestRate,
      interestType,
      emi,
      totalInterest,
      totalAmount
    } = req.body;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Validate loan type if provided
    if (loanTypeId) {
      const loanType = await prisma.loanType.findUnique({
        where: { id: loanTypeId }
      });

      if (!loanType) {
        throw new ApiError(404, 'Loan type not found');
      }
    }

    const calculationRecord = await prisma.loanCalculatorHistory.create({
      data: {
        userId,
        loanTypeId,
        amount,
        tenure,
        interestRate,
        interestType,
        emi,
        totalInterest,
        totalAmount
      },
      include: {
        loanType: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return res.status(201).json(calculationRecord);
  } catch (error) {
    logger.error(`Record calculation error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to record calculation');
  }
};

/**
 * Get calculation statistics for a user
 * 
 * @route GET /api/loan/calculator-history/user/:userId/stats
 * @param {string} userId - The ID of the user
 * @returns {Object} Calculation statistics
 */
export const getUserCalculationStats = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get count of calculations
    const totalCalculations = await prisma.loanCalculatorHistory.count({
      where: {
        userId
      }
    });

    // If no calculations, return empty stats
    if (totalCalculations === 0) {
      return res.json({
        totalCalculations: 0,
        averages: {
          amount: 0,
          tenure: 0,
          interestRate: 0,
          emi: 0,
          totalInterest: 0
        },
        maximums: null,
        minimums: null,
        mostUsedLoanType: null,
        mostUsedInterestType: null
      });
    }

    // Get average loan amount, tenure, and interest rate
    const aggregations = await prisma.loanCalculatorHistory.aggregate({
      where: {
        userId
      },
      _avg: {
        amount: true,
        tenure: true,
        interestRate: true,
        emi: true,
        totalInterest: true
      },
      _max: {
        amount: true,
        tenure: true,
        interestRate: true,
        emi: true,
        totalInterest: true
      },
      _min: {
        amount: true,
        tenure: true,
        interestRate: true,
        emi: true,
        totalInterest: true
      }
    });

    // Get most used loan type
    const loanTypeUsage = await prisma.loanCalculatorHistory.groupBy({
      by: ['loanTypeId'],
      where: {
        userId,
        loanTypeId: {
          not: null
        }
      },
      _count: {
        loanTypeId: true
      },
      orderBy: {
        _count: {
          loanTypeId: 'desc'
        }
      },
      take: 1
    });

    let mostUsedLoanType = null;
    if (loanTypeUsage.length > 0 && loanTypeUsage[0].loanTypeId) {
      mostUsedLoanType = await prisma.loanType.findUnique({
        where: {
          id: loanTypeUsage[0].loanTypeId
        },
        select: {
          id: true,
          name: true,
          code: true
        }
      });
    }

    // Get most used interest type
    const interestTypeUsage = await prisma.loanCalculatorHistory.groupBy({
      by: ['interestType'],
      where: {
        userId
      },
      _count: {
        interestType: true
      },
      orderBy: {
        _count: {
          interestType: 'desc'
        }
      },
      take: 1
    });

    const mostUsedInterestType = interestTypeUsage.length > 0 ? interestTypeUsage[0].interestType : null;

    // Format the response
    const response = {
      totalCalculations,
      averages: {
        amount: parseFloat(aggregations._avg.amount?.toFixed(2) || '0'),
        tenure: parseFloat(aggregations._avg.tenure?.toFixed(2) || '0'),
        interestRate: parseFloat(aggregations._avg.interestRate?.toFixed(2) || '0'),
        emi: parseFloat(aggregations._avg.emi?.toFixed(2) || '0'),
        totalInterest: parseFloat(aggregations._avg.totalInterest?.toFixed(2) || '0')
      },
      maximums: {
        amount: parseFloat(aggregations._max.amount?.toFixed(2) || '0'),
        tenure: aggregations._max.tenure || 0,
        interestRate: parseFloat(aggregations._max.interestRate?.toFixed(2) || '0'),
        emi: parseFloat(aggregations._max.emi?.toFixed(2) || '0'),
        totalInterest: parseFloat(aggregations._max.totalInterest?.toFixed(2) || '0')
      },
      minimums: {
        amount: parseFloat(aggregations._min.amount?.toFixed(2) || '0'),
        tenure: aggregations._min.tenure || 0,
        interestRate: parseFloat(aggregations._min.interestRate?.toFixed(2) || '0'),
        emi: parseFloat(aggregations._min.emi?.toFixed(2) || '0'),
        totalInterest: parseFloat(aggregations._min.totalInterest?.toFixed(2) || '0')
      },
      mostUsedLoanType,
      mostUsedInterestType
    };

    return res.json(response);
  } catch (error) {
    logger.error(`Get user calculation stats error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to get calculation statistics');
  }
};

/**
 * Delete calculation history for a user
 * 
 * @route DELETE /api/loan/calculator-history/user/:userId
 * @param {string} userId - The ID of the user
 * @returns {Object} Empty response with 204 status
 */
export const clearUserCalculationHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Delete all calculation history for the user
    await prisma.loanCalculatorHistory.deleteMany({
      where: {
        userId
      }
    });

    return res.status(204).send();
  } catch (error) {
    logger.error(`Clear user calculation history error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to clear calculation history');
  }
};