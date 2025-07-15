import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction } from '@prisma/client';
import { InterestType } from '../utils/loan.utils';
import { ApiError } from '../../../common/middleware/error.middleware';

/**
 * Get all loan types
 */
export const getAllLoanTypes = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    
    // Filter by active status if provided
    const where = active !== undefined ? { isActive: active === 'true' } : {};
    
    const loanTypes = await prisma.loanType.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    return res.json(loanTypes);
  } catch (error) {
    logger.error('Get all loan types error:', error);
    throw new ApiError(500, 'Failed to fetch loan types');
  }
};

/**
 * Get loan type by ID
 */
export const getLoanTypeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const loanType = await prisma.loanType.findUnique({
      where: { id }
    });

    if (!loanType) {
      throw new ApiError(404, 'Loan type not found');
    }

    return res.json(loanType);
  } catch (error) {
    logger.error(`Get loan type by ID error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch loan type');
  }
};

/**
 * Create new loan type
 */
export const createLoanType = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      code, 
      interestType, 
      minAmount, 
      maxAmount, 
      minTenure, 
      maxTenure, 
      interestRate, 
      processingFeePercent, 
      lateFeeAmount, 
      isActive = true 
    } = req.body;

    // Check if loan type with same code already exists
    const existingLoanType = await prisma.loanType.findFirst({
      where: { 
        OR: [
          { code },
          { name }
        ]
      }
    });

    if (existingLoanType) {
      if (existingLoanType.code === code) {
        throw new ApiError(409, `Loan type with code '${code}' already exists`);
      } else {
        throw new ApiError(409, `Loan type with name '${name}' already exists`);
      }
    }

    // Validate interest type
    if (!Object.values(InterestType).includes(interestType as InterestType)) {
      throw new ApiError(400, 'Invalid interest type');
    }

    // Create new loan type
    const loanType = await prisma.loanType.create({
      data: {
        name,
        code,
        interestType: interestType as InterestType,
        minAmount,
        maxAmount,
        minTenure,
        maxTenure,
        interestRate,
        processingFeePercent,
        lateFeeAmount,
        isActive
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'LoanType',
      loanType.id,
      AuditAction.CREATE,
      null,
      loanType
    );

    return res.status(201).json(loanType);
  } catch (error) {
    logger.error(`Create loan type error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create loan type');
  }
};

/**
 * Update loan type
 */
export const updateLoanType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      interestType, 
      minAmount, 
      maxAmount, 
      minTenure, 
      maxTenure, 
      interestRate, 
      processingFeePercent, 
      lateFeeAmount, 
      isActive 
    } = req.body;

    // Check if loan type exists
    const existingLoanType = await prisma.loanType.findUnique({
      where: { id }
    });

    if (!existingLoanType) {
      throw new ApiError(404, 'Loan type not found');
    }

    // Check if name is already taken by another loan type
    if (name && name !== existingLoanType.name) {
      const nameExists = await prisma.loanType.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });

      if (nameExists) {
        throw new ApiError(409, `Loan type with name '${name}' already exists`);
      }
    }

    // Validate interest type if provided
    if (interestType && !Object.values(InterestType).includes(interestType as InterestType)) {
      throw new ApiError(400, 'Invalid interest type');
    }

    // Update loan type
    const updatedLoanType = await prisma.loanType.update({
      where: { id },
      data: {
        name: name || existingLoanType.name,
        interestType: interestType as InterestType || existingLoanType.interestType,
        minAmount: minAmount !== undefined ? minAmount : existingLoanType.minAmount,
        maxAmount: maxAmount !== undefined ? maxAmount : existingLoanType.maxAmount,
        minTenure: minTenure !== undefined ? minTenure : existingLoanType.minTenure,
        maxTenure: maxTenure !== undefined ? maxTenure : existingLoanType.maxTenure,
        interestRate: interestRate !== undefined ? interestRate : existingLoanType.interestRate,
        processingFeePercent: processingFeePercent !== undefined ? processingFeePercent : existingLoanType.processingFeePercent,
        lateFeeAmount: lateFeeAmount !== undefined ? lateFeeAmount : existingLoanType.lateFeeAmount,
        isActive: isActive !== undefined ? isActive : existingLoanType.isActive
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'LoanType',
      updatedLoanType.id,
      AuditAction.UPDATE,
      existingLoanType,
      updatedLoanType
    );

    return res.json(updatedLoanType);
  } catch (error) {
    logger.error(`Update loan type error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update loan type');
  }
};

/**
 * Delete loan type
 */
export const deleteLoanType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if loan type exists
    const existingLoanType = await prisma.loanType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            loans: true,
            loanApplications: true
          }
        }
      }
    });

    if (!existingLoanType) {
      throw new ApiError(404, 'Loan type not found');
    }

    // Check if loan type is used in loans or applications
    if (existingLoanType._count.loans > 0 || existingLoanType._count.loanApplications > 0) {
      throw new ApiError(400, 'Cannot delete loan type that is used in loans or applications');
    }

    // Delete loan type
    await prisma.loanType.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog(
      req,
      'LoanType',
      id,
      AuditAction.DELETE,
      existingLoanType,
      null
    );

    return res.json({ message: 'Loan type deleted successfully' });
  } catch (error) {
    logger.error(`Delete loan type error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete loan type');
  }
};