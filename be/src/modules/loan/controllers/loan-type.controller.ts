import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction } from '@prisma/client';
import { InterestType } from '../utils/loan.utils';
import { ApiError } from '../../../common/middleware/error.middleware';
import cacheUtil, { caches } from '../../../common/utils/cache.util';

/**
 * Get all loan types with filtering, pagination, and search
 */
export const getAllLoanTypes = async (req: Request, res: Response) => {
  try {
    const { 
      active, 
      interestType, 
      minInterestRate, 
      maxInterestRate,
      search,
      page = '1', 
      limit = '10',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    // Generate a cache key based on query parameters
    const cacheKey = `loanTypes_${JSON.stringify({
      active,
      interestType,
      minInterestRate,
      maxInterestRate,
      search,
      page,
      limit,
      sortBy,
      sortOrder
    })}`;
    
    // Try to get from cache or fetch from database
    const result = await cacheUtil.getOrFetch(caches.loanType, cacheKey, async () => {
      // Build where clause with multiple filters
      const where: any = {};
      
      // Filter by active status if provided
      if (active !== undefined) {
        where.isActive = active === 'true';
      }
      
      // Filter by interest type if provided
      if (interestType) {
        where.interestType = interestType;
      }
      
      // Filter by interest rate range if provided
      if (minInterestRate || maxInterestRate) {
        where.interestRate = {};
        
        if (minInterestRate) {
          where.interestRate.gte = parseFloat(minInterestRate as string);
        }
        
        if (maxInterestRate) {
          where.interestRate.lte = parseFloat(maxInterestRate as string);
        }
      }
      
      // Add search functionality
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      // Calculate pagination
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      // Get total count for pagination
      const totalCount = await prisma.loanType.count({ where });
      
      // Get loan types with pagination and sorting
      const loanTypes = await prisma.loanType.findMany({
        where,
        orderBy: {
          [sortBy as string]: sortOrder
        },
        skip,
        take: parseInt(limit as string)
      });

      // Return the result object
      return {
        data: loanTypes,
        pagination: {
          total: totalCount,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(totalCount / parseInt(limit as string))
        }
      };
    });

    // Log successful retrieval
    logger.info('Loan types fetched successfully', {
      count: result.data.length,
      filters: req.query,
      fromCache: cacheKey in caches.loanType.keys()
    });

    return res.json(result);
  } catch (error: any) {
    logger.error('Get all loan types error:', {
      error: error.message || String(error),
      stack: error.stack || 'No stack trace',
      query: req.query
    });
    throw new ApiError(500, 'Failed to fetch loan types');
  }
};

/**
 * Get loan type by ID
 */
export const getLoanTypeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Generate cache key for this loan type
    const cacheKey = `loanType_${id}`;
    
    // Try to get from cache or fetch from database
    const loanType = await cacheUtil.getOrFetch(caches.loanType, cacheKey, async () => {
      const loanType = await prisma.loanType.findUnique({
        where: { id }
      });
      
      if (!loanType) {
        throw new ApiError(404, 'Loan type not found');
      }
      
      return loanType;
    });

    return res.json(loanType);
  } catch (error: any) {
    logger.error(`Get loan type by ID error:`, {
      error: error.message || String(error),
      stack: error.stack || 'No stack trace',
      loanTypeId: req.params.id
    });
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
    
    // Invalidate loan types cache
    cacheUtil.invalidateAllCache(caches.loanType);
    
    logger.info('Loan type created successfully', {
      loanTypeId: loanType.id,
      name: loanType.name,
      code: loanType.code
    });

    return res.status(201).json(loanType);
  } catch (error: any) {
    logger.error(`Create loan type error:`, {
      error: error.message || String(error),
      stack: error.stack || 'No stack trace',
      requestBody: req.body
    });
    
    if (error instanceof ApiError) throw error;
    
    if (error.code === 'P2002' && error.meta?.target) {
      // Prisma unique constraint violation
      throw new ApiError(409, `Loan type with this ${error.meta.target[0]} already exists`);
    }
    
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
    
    // Invalidate specific loan type cache and all loan types cache
    cacheUtil.invalidateCache(caches.loanType, `loanType_${id}`);
    cacheUtil.invalidateAllCache(caches.loanType);
    
    logger.info('Loan type updated successfully', {
      loanTypeId: updatedLoanType.id,
      name: updatedLoanType.name,
      changes: Object.keys(req.body).join(', ')
    });

    return res.json(updatedLoanType);
  } catch (error: any) {
    logger.error(`Update loan type error:`, {
      error: error.message || String(error),
      stack: error.stack || 'No stack trace',
      loanTypeId: req.params.id,
      requestBody: req.body
    });
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
    
    // Invalidate specific loan type cache and all loan types cache
    cacheUtil.invalidateCache(caches.loanType, `loanType_${id}`);
    cacheUtil.invalidateAllCache(caches.loanType);
    
    logger.info('Loan type deleted successfully', {
      loanTypeId: id,
      name: existingLoanType.name,
      code: existingLoanType.code
    });

    return res.json({ message: 'Loan type deleted successfully' });
  } catch (error: any) {
    logger.error(`Delete loan type error:`, {
      error: error.message || String(error),
      stack: error.stack || 'No stack trace',
      loanTypeId: req.params.id
    });
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete loan type');
  }
};

/**
 * Bulk update loan type status
 */
export const bulkUpdateLoanTypeStatus = async (req: Request, res: Response) => {
  try {
    const { ids, isActive } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(400, 'No loan type IDs provided');
    }
    
    if (typeof isActive !== 'boolean') {
      throw new ApiError(400, 'isActive must be a boolean value');
    }
    
    // Update multiple loan types at once
    const result = await prisma.loanType.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        isActive
      }
    });
    
    // Create audit logs for each updated loan type
    for (const id of ids) {
      const loanType = await prisma.loanType.findUnique({
        where: { id }
      });
      
      if (loanType) {
        await createAuditLog(
          req,
          'LoanType',
          id,
          AuditAction.UPDATE,
          { ...loanType, isActive: !isActive },
          { ...loanType, isActive }
        );
        
        // Invalidate individual loan type cache
        cacheUtil.invalidateCache(caches.loanType, `loanType_${id}`);
      }
    }
    
    // Invalidate all loan types cache
    cacheUtil.invalidateAllCache(caches.loanType);
    
    logger.info('Bulk update loan types completed', {
      count: result.count,
      ids,
      isActive
    });
    
    return res.json({
      message: `Successfully updated ${result.count} loan types`,
      count: result.count
    });
  } catch (error: any) {
    logger.error(`Bulk update loan types error:`, {
      error: error.message || String(error),
      stack: error.stack || 'No stack trace',
      requestBody: req.body
    });
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update loan types');
  }
};