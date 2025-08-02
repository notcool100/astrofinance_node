import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { ApiError } from '../../../common/middleware/error.middleware';

/**
 * Get all calculator presets for a user
 */
export const getUserCalculatorPresets = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const presets = await prisma.loanCalculatorPreset.findMany({
      where: {
        userId
      },
      include: {
        loanType: {
          select: {
            id: true,
            name: true,
            code: true,
            interestRate: true,
            interestType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json(presets);
  } catch (error) {
    logger.error(`Get user calculator presets error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to get calculator presets');
  }
};

/**
 * Get a specific calculator preset
 */
export const getCalculatorPreset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const preset = await prisma.loanCalculatorPreset.findUnique({
      where: { id },
      include: {
        loanType: {
          select: {
            id: true,
            name: true,
            code: true,
            interestRate: true,
            interestType: true
          }
        }
      }
    });

    if (!preset) {
      throw new ApiError(404, 'Calculator preset not found');
    }

    return res.json(preset);
  } catch (error) {
    logger.error(`Get calculator preset error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to get calculator preset');
  }
};

/**
 * Create a new calculator preset
 */
export const createCalculatorPreset = async (req: Request, res: Response) => {
  try {
    const {
      name,
      userId,
      loanTypeId,
      amount,
      tenure,
      interestRate,
      interestType,
      startDate,
      isDefault
    } = req.body;

    // If this preset is set as default, unset any existing default presets for this user
    if (isDefault) {
      await prisma.loanCalculatorPreset.updateMany({
        where: {
          userId,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    const preset = await prisma.loanCalculatorPreset.create({
      data: {
        name,
        userId,
        loanTypeId,
        amount,
        tenure,
        interestRate,
        interestType,
        startDate: new Date(startDate),
        isDefault: isDefault || false
      },
      include: {
        loanType: {
          select: {
            id: true,
            name: true,
            code: true,
            interestRate: true,
            interestType: true
          }
        }
      }
    });

    return res.status(201).json(preset);
  } catch (error) {
    logger.error(`Create calculator preset error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create calculator preset');
  }
};

/**
 * Update a calculator preset
 */
export const updateCalculatorPreset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      loanTypeId,
      amount,
      tenure,
      interestRate,
      interestType,
      startDate,
      isDefault
    } = req.body;

    // Get the preset to check if it exists and to get the userId
    const existingPreset = await prisma.loanCalculatorPreset.findUnique({
      where: { id }
    });

    if (!existingPreset) {
      throw new ApiError(404, 'Calculator preset not found');
    }

    // If this preset is being set as default, unset any existing default presets for this user
    if (isDefault) {
      await prisma.loanCalculatorPreset.updateMany({
        where: {
          userId: existingPreset.userId,
          isDefault: true,
          id: { not: id }
        },
        data: {
          isDefault: false
        }
      });
    }

    const updatedPreset = await prisma.loanCalculatorPreset.update({
      where: { id },
      data: {
        name,
        loanTypeId,
        amount,
        tenure,
        interestRate,
        interestType,
        startDate: startDate ? new Date(startDate) : undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined
      },
      include: {
        loanType: {
          select: {
            id: true,
            name: true,
            code: true,
            interestRate: true,
            interestType: true
          }
        }
      }
    });

    return res.json(updatedPreset);
  } catch (error) {
    logger.error(`Update calculator preset error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update calculator preset');
  }
};

/**
 * Delete a calculator preset
 */
export const deleteCalculatorPreset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if preset exists
    const preset = await prisma.loanCalculatorPreset.findUnique({
      where: { id }
    });

    if (!preset) {
      throw new ApiError(404, 'Calculator preset not found');
    }

    await prisma.loanCalculatorPreset.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error) {
    logger.error(`Delete calculator preset error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete calculator preset');
  }
};