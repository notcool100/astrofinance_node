import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction } from '@prisma/client';
import { ApiError } from '../../../common/middleware/error.middleware';

/**
 * Get all tax types
 */
export const getAllTaxTypes = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    
    // Build filter conditions
    const where: any = {};
    
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    
    const taxTypes = await prisma.taxType.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    return res.json(taxTypes);
  } catch (error) {
    logger.error('Get all tax types error:', error);
    throw new ApiError(500, 'Failed to fetch tax types');
  }
};

/**
 * Get tax type by ID
 */
export const getTaxTypeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const taxType = await prisma.taxType.findUnique({
      where: { id },
      include: {
        taxRates: {
          orderBy: {
            effectiveFrom: 'desc'
          }
        }
      }
    });

    if (!taxType) {
      throw new ApiError(404, 'Tax type not found');
    }

    return res.json(taxType);
  } catch (error) {
    logger.error(`Get tax type by ID error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch tax type');
  }
};

/**
 * Create new tax type
 */
export const createTaxType = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      code, 
      description, 
      isActive = true 
    } = req.body;

    // Check if tax type with same code already exists
    const existingTaxType = await prisma.taxType.findFirst({
      where: { 
        OR: [
          { code },
          { name }
        ]
      }
    });

    if (existingTaxType) {
      if (existingTaxType.code === code) {
        throw new ApiError(409, `Tax type with code '${code}' already exists`);
      } else {
        throw new ApiError(409, `Tax type with name '${name}' already exists`);
      }
    }

    // Create new tax type
    const taxType = await prisma.taxType.create({
      data: {
        name,
        code,
        description,
        isActive
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'TaxType',
      taxType.id,
      AuditAction.CREATE,
      null,
      taxType
    );

    return res.status(201).json(taxType);
  } catch (error) {
    logger.error(`Create tax type error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create tax type');
  }
};

/**
 * Update tax type
 */
export const updateTaxType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      isActive 
    } = req.body;

    // Check if tax type exists
    const existingTaxType = await prisma.taxType.findUnique({
      where: { id }
    });

    if (!existingTaxType) {
      throw new ApiError(404, 'Tax type not found');
    }

    // Check if name is already taken by another tax type
    if (name && name !== existingTaxType.name) {
      const nameExists = await prisma.taxType.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });

      if (nameExists) {
        throw new ApiError(409, `Tax type with name '${name}' already exists`);
      }
    }

    // Update tax type
    const updatedTaxType = await prisma.taxType.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'TaxType',
      updatedTaxType.id,
      AuditAction.UPDATE,
      existingTaxType,
      updatedTaxType
    );

    return res.json(updatedTaxType);
  } catch (error) {
    logger.error(`Update tax type error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update tax type');
  }
};

/**
 * Delete tax type
 */
export const deleteTaxType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if tax type exists
    const existingTaxType = await prisma.taxType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            taxRates: true
          }
        }
      }
    });

    if (!existingTaxType) {
      throw new ApiError(404, 'Tax type not found');
    }

    // Check if tax type has rates
    if (existingTaxType._count.taxRates > 0) {
      throw new ApiError(400, 'Cannot delete tax type that has tax rates');
    }

    // Delete tax type
    await prisma.taxType.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog(
      req,
      'TaxType',
      id,
      AuditAction.DELETE,
      existingTaxType,
      null
    );

    return res.json({ message: 'Tax type deleted successfully' });
  } catch (error) {
    logger.error(`Delete tax type error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete tax type');
  }
};

/**
 * Get all tax rates
 */
export const getAllTaxRates = async (req: Request, res: Response) => {
  try {
    const { taxTypeId, active } = req.query;
    
    // Build filter conditions
    const where: any = {};
    
    if (taxTypeId) {
      where.taxTypeId = taxTypeId;
    }
    
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    
    const taxRates = await prisma.taxRate.findMany({
      where,
      include: {
        taxType: true
      },
      orderBy: [
        {
          taxType: {
            name: 'asc'
          }
        },
        {
          effectiveFrom: 'desc'
        }
      ]
    });

    return res.json(taxRates);
  } catch (error) {
    logger.error('Get all tax rates error:', error);
    throw new ApiError(500, 'Failed to fetch tax rates');
  }
};

/**
 * Get tax rate by ID
 */
export const getTaxRateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const taxRate = await prisma.taxRate.findUnique({
      where: { id },
      include: {
        taxType: true
      }
    });

    if (!taxRate) {
      throw new ApiError(404, 'Tax rate not found');
    }

    return res.json(taxRate);
  } catch (error) {
    logger.error(`Get tax rate by ID error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch tax rate');
  }
};

/**
 * Create new tax rate
 */
export const createTaxRate = async (req: Request, res: Response) => {
  try {
    const { 
      taxTypeId, 
      rate, 
      effectiveDate, 
      expiryDate, 
      isActive = true 
    } = req.body;

    // Check if tax type exists
    const taxType = await prisma.taxType.findUnique({
      where: { id: taxTypeId }
    });

    if (!taxType) {
      throw new ApiError(404, 'Tax type not found');
    }

    // Check if there's an overlapping tax rate
    if (effectiveDate) {
      const overlappingRate = await prisma.taxRate.findFirst({
        where: {
          taxTypeId,
          OR: [
            {
              effectiveFrom: { lte: new Date(effectiveDate) },
              effectiveTo: { gte: new Date(effectiveDate) }
            },
            {
              effectiveFrom: { 
                lte: expiryDate ? new Date(expiryDate) : new Date('9999-12-31') 
              },
              effectiveTo: { 
                gte: expiryDate ? new Date(expiryDate) : new Date('9999-12-31') 
              }
            }
          ]
        }
      });

      if (overlappingRate) {
        throw new ApiError(409, 'There is already a tax rate for this period');
      }
    }

    // Create new tax rate
    const taxRate = await prisma.taxRate.create({
      data: {
        taxTypeId,
        rate: parseFloat(rate as any),
        effectiveFrom: effectiveDate ? new Date(effectiveDate) : new Date(),
        effectiveTo: expiryDate ? new Date(expiryDate) : null,
        isActive
      },
      include: {
        taxType: true
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'TaxRate',
      taxRate.id,
      AuditAction.CREATE,
      null,
      taxRate
    );

    return res.status(201).json(taxRate);
  } catch (error) {
    logger.error(`Create tax rate error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create tax rate');
  }
};

/**
 * Update tax rate
 */
export const updateTaxRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      rate, 
      effectiveDate, 
      expiryDate, 
      isActive 
    } = req.body;

    // Check if tax rate exists
    const existingTaxRate = await prisma.taxRate.findUnique({
      where: { id }
    });

    if (!existingTaxRate) {
      throw new ApiError(404, 'Tax rate not found');
    }

    // Check if there's an overlapping tax rate
    if (effectiveDate || expiryDate) {
      const newEffectiveDate = effectiveDate 
        ? new Date(effectiveDate) 
        : existingTaxRate.effectiveFrom;
      
      const newExpiryDate = expiryDate 
        ? new Date(expiryDate) 
        : existingTaxRate.effectiveTo || new Date('9999-12-31');
      
      const overlappingRate = await prisma.taxRate.findFirst({
        where: {
          taxTypeId: existingTaxRate.taxTypeId,
          id: { not: id },
          OR: [
            {
              effectiveFrom: { lte: newEffectiveDate },
              effectiveTo: { gte: newEffectiveDate }
            },
            {
              effectiveFrom: { lte: newExpiryDate },
              effectiveTo: { gte: newExpiryDate }
            }
          ]
        }
      });

      if (overlappingRate) {
        throw new ApiError(409, 'There is already a tax rate for this period');
      }
    }

    // Update tax rate
    const updatedTaxRate = await prisma.taxRate.update({
      where: { id },
      data: {
        rate: rate ? parseFloat(rate as any) : undefined,
        effectiveFrom: effectiveDate ? new Date(effectiveDate) : undefined,
        effectiveTo: expiryDate ? new Date(expiryDate) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      },
      include: {
        taxType: true
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'TaxRate',
      updatedTaxRate.id,
      AuditAction.UPDATE,
      existingTaxRate,
      updatedTaxRate
    );

    return res.json(updatedTaxRate);
  } catch (error) {
    logger.error(`Update tax rate error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update tax rate');
  }
};

/**
 * Delete tax rate
 */
export const deleteTaxRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if tax rate exists
    const existingTaxRate = await prisma.taxRate.findUnique({
      where: { id }
    });

    if (!existingTaxRate) {
      throw new ApiError(404, 'Tax rate not found');
    }

    // Delete tax rate
    await prisma.taxRate.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog(
      req,
      'TaxRate',
      id,
      AuditAction.DELETE,
      existingTaxRate,
      null
    );

    return res.json({ message: 'Tax rate deleted successfully' });
  } catch (error) {
    logger.error(`Delete tax rate error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete tax rate');
  }
};

/**
 * Calculate tax
 */
export const calculateTax = async (req: Request, res: Response) => {
  try {
    const { 
      taxTypeId, 
      amount, 
      date = new Date() 
    } = req.body;

    // Check if tax type exists
    const taxType = await prisma.taxType.findUnique({
      where: { id: taxTypeId }
    });

    if (!taxType) {
      throw new ApiError(404, 'Tax type not found');
    }

    // Find applicable tax rate
    const taxRate = await prisma.taxRate.findFirst({
      where: {
        taxTypeId,
        effectiveFrom: { lte: new Date(date) },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date(date) } }
        ],
        isActive: true
      },
      orderBy: {
        effectiveFrom: 'desc'
      }
    });

    if (!taxRate) {
      throw new ApiError(404, 'No applicable tax rate found for the given date');
    }

    // Calculate tax
    const amountValue = parseFloat(amount as any);
    const taxAmount = amountValue * (Number(taxRate.rate) / 100);
    const totalAmount = amountValue + taxAmount;

    return res.json({
      taxType: taxType.name,
      taxTypeId: taxType.id,
      taxRate: taxRate.rate,
      amount: amountValue,
      taxAmount,
      totalAmount,
      calculationDate: date
    });
  } catch (error) {
    logger.error(`Calculate tax error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to calculate tax');
  }
};