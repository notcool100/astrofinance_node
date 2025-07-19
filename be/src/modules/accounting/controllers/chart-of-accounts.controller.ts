import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction, AccountType_COA } from '@prisma/client';
import { ApiError } from '../../../common/middleware/error.middleware';

/**
 * Get all accounts
 */
export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const { type, active } = req.query;
    
    // Build filter conditions
    const where: any = {};
    
    if (type) {
      where.accountType = type;
    }
    
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    
    const accounts = await prisma.account_COA.findMany({
      where,
      orderBy: [
        { accountType: 'asc' },
        { accountCode: 'asc' }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Accounts retrieved successfully',
      data: accounts
    });
  } catch (error) {
    logger.error('Get all accounts error:', error);
    throw new ApiError(500, 'Failed to fetch accounts');
  }
};

/**
 * Get account by ID
 */
export const getAccountById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const account = await prisma.account_COA.findUnique({
      where: { id }
    });

    if (!account) {
      throw new ApiError(404, 'Account not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Account retrieved successfully',
      data: account
    });
  } catch (error) {
    logger.error(`Get account by ID error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch account');
  }
};

/**
 * Create new account
 */
export const createAccount = async (req: Request, res: Response) => {
  try {
    const { 
      accountName, 
      accountCode, 
      accountType, 
      description, 
      parentAccountId, 
      isActive = true 
    } = req.body;

    // Check if account with same code already exists
    const existingAccount = await prisma.account_COA.findFirst({
      where: { 
        OR: [
          { accountCode },
          { name: accountName }
        ]
      }
    });

    if (existingAccount) {
      if (existingAccount.accountCode === accountCode) {
        throw new ApiError(409, `Account with code '${accountCode}' already exists`);
      } else {
        throw new ApiError(409, `Account with name '${accountName}' already exists`);
      }
    }

    // Validate account type
    if (!Object.values(AccountType_COA).includes(accountType as AccountType_COA)) {
      throw new ApiError(400, 'Invalid account type');
    }

    // Validate parent account if provided
    if (parentAccountId) {
      const parentAccount = await prisma.account_COA.findUnique({
        where: { id: parentAccountId }
      });

      if (!parentAccount) {
        throw new ApiError(404, 'Parent account not found');
      }
    }

    // Create new account
    const account = await prisma.account_COA.create({
      data: {
        name: accountName,
        accountCode,
        accountType: accountType as AccountType_COA,
        description,
        parentId: parentAccountId,
        isActive
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'Account_COA',
      account.id,
      AuditAction.CREATE,
      null,
      account
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account
    });
  } catch (error) {
    logger.error(`Create account error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create account');
  }
};

/**
 * Update account
 */
export const updateAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      accountName, 
      description, 
      parentAccountId, 
      isActive 
    } = req.body;

    // Check if account exists
    const existingAccount = await prisma.account_COA.findUnique({
      where: { id }
    });

    if (!existingAccount) {
      throw new ApiError(404, 'Account not found');
    }

    // Check if name is already taken by another account
    if (accountName && accountName !== existingAccount.name) {
      const nameExists = await prisma.account_COA.findFirst({
        where: {
          name: accountName,
          id: { not: id }
        }
      });

      if (nameExists) {
        throw new ApiError(409, `Account with name '${accountName}' already exists`);
      }
    }

    // Validate parent account if provided
    if (parentAccountId && parentAccountId !== existingAccount.parentId) {
      // Prevent circular reference
      if (parentAccountId === id) {
        throw new ApiError(400, 'Account cannot be its own parent');
      }

      const parentAccount = await prisma.account_COA.findUnique({
        where: { id: parentAccountId }
      });

      if (!parentAccount) {
        throw new ApiError(404, 'Parent account not found');
      }
    }

    // Update account
    const updatedAccount = await prisma.account_COA.update({
      where: { id },
      data: {
        name: accountName || existingAccount.name,
        description: description !== undefined ? description : existingAccount.description,
        parentId: parentAccountId !== undefined ? parentAccountId : existingAccount.parentId,
        isActive: isActive !== undefined ? isActive : existingAccount.isActive
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'Account_COA',
      updatedAccount.id,
      AuditAction.UPDATE,
      existingAccount,
      updatedAccount
    );

    return res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      data: updatedAccount
    });
  } catch (error) {
    logger.error(`Update account error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update account');
  }
};

/**
 * Delete account
 */
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if account exists
    const existingAccount = await prisma.account_COA.findUnique({
      where: { id }
    });

    if (!existingAccount) {
      throw new ApiError(404, 'Account not found');
    }

    // Check if account has child accounts
    const childCount = await prisma.account_COA.count({
      where: { parentId: id }
    });
    
    if (childCount > 0) {
      throw new ApiError(400, 'Cannot delete account that has child accounts');
    }

    // Check if account is used in journal entries
    const journalEntryCount = await prisma.journalEntryLine.count({
      where: { accountId: id }
    });
    
    if (journalEntryCount > 0) {
      throw new ApiError(400, 'Cannot delete account that is used in journal entries');
    }

    // Delete account
    await prisma.account_COA.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog(
      req,
      'Account_COA',
      id,
      AuditAction.DELETE,
      existingAccount,
      null
    );

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete account error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete account');
  }
};

/**
 * Get account structure
 */
export const getAccountStructure = async (req: Request, res: Response) => {
  try {
    // Get all top-level accounts (no parent)
    const topLevelAccounts = await prisma.account_COA.findMany({
      where: {
        parentId: null
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        }
      },
      orderBy: [
        { accountType: 'asc' },
        { accountCode: 'asc' }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Account structure retrieved successfully',
      data: topLevelAccounts
    });
  } catch (error) {
    logger.error('Get account structure error:', error);
    throw new ApiError(500, 'Failed to fetch account structure');
  }
};