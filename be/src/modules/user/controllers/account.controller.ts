import { Request, Response } from 'express';
import { PrismaClient, AuditAction, Prisma } from '@prisma/client';
import { ApiError } from '../../../common/middleware/error.middleware';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { generateAccountNumber } from '../utils/account.utils';

const prisma = new PrismaClient();

/**
 * Get all accounts for a user
 */
export const getUserAccounts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { accountType, status, page = 1, limit = 10 } = req.query;
    
    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new ApiError(404, `User with ID ${userId} not found`);
    }
    
    // Build filter conditions
    const where: any = { userId };
    
    if (accountType) {
      where.accountType = accountType;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get accounts with pagination
    const [accounts, totalCount] = await Promise.all([
      prisma.account.findMany({
        where,
        include: {
          bbAccountDetails: true,
          mbAccountDetails: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.account.count({ where })
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / Number(limit));
    
    return res.status(200).json({
      data: accounts,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    logger.error(`Get user accounts error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch user accounts');
  }
};

/**
 * Get account by ID
 */
export const getAccountById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        bbAccountDetails: true,
        mbAccountDetails: true,
        user: {
          select: {
            id: true,
            fullName: true,
            contactNumber: true,
            email: true,
            userType: true
          }
        }
      }
    });
    
    if (!account) {
      throw new ApiError(404, `Account with ID ${id} not found`);
    }
    
    return res.status(200).json(account);
  } catch (error) {
    logger.error(`Get account by ID error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch account details');
  }
};

/**
 * Create new account
 */
export const createAccount = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      accountType,
      interestRate,
      openingDate = new Date(),
      balance = 0,
      bbAccountDetails,
      mbAccountDetails
    } = req.body;
    
    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new ApiError(404, `User with ID ${userId} not found`);
    }
    
    // Generate account number
    const accountNumber = await generateAccountNumber(accountType);
    
    // Create account with transaction to ensure all related data is created atomically
    const account = await prisma.$transaction(async (prisma) => {
      // Create the main account
      const newAccount = await prisma.account.create({
        data: {
          accountNumber,
          userId,
          accountType,
          interestRate: parseFloat(interestRate),
          balance: parseFloat(balance),
          openingDate: new Date(openingDate),
          status: 'ACTIVE'
        }
      });
      
      // Create BB account details if provided
      if (accountType === 'SAVINGS' && user.userType === 'BB' && bbAccountDetails) {
        await prisma.bbAccountDetails.create({
          data: {
            accountId: newAccount.id,
            guardianName: bbAccountDetails.guardianName,
            guardianRelation: bbAccountDetails.guardianRelation,
            guardianContact: bbAccountDetails.guardianContact,
            guardianIdType: bbAccountDetails.guardianIdType,
            guardianIdNumber: bbAccountDetails.guardianIdNumber,
            maturityDate: bbAccountDetails.maturityDate ? new Date(bbAccountDetails.maturityDate) : null
          }
        });
      }
      
      // Create MB account details if provided
      if (accountType === 'SAVINGS' && user.userType === 'MB' && mbAccountDetails) {
        const maturityDate = new Date(openingDate);
        maturityDate.setMonth(maturityDate.getMonth() + mbAccountDetails.termMonths);
        
        await prisma.mbAccountDetails.create({
          data: {
            accountId: newAccount.id,
            monthlyDepositAmount: parseFloat(mbAccountDetails.monthlyDepositAmount),
            depositDay: mbAccountDetails.depositDay,
            termMonths: mbAccountDetails.termMonths,
            maturityDate: mbAccountDetails.maturityDate ? new Date(mbAccountDetails.maturityDate) : maturityDate
          }
        });
      }
      
      return prisma.account.findUnique({
        where: { id: newAccount.id },
        include: {
          bbAccountDetails: true,
          mbAccountDetails: true
        }
      });
    });
    
    // Create audit log
    if (account) {
      await createAuditLog(
        req,
        'Account',
        account.id,
        AuditAction.CREATE,
        null,
        account
      );
    }
    
    return res.status(201).json(account);
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
      interestRate,
      status,
      bbAccountDetails,
      mbAccountDetails
    } = req.body;
    
    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id },
      include: {
        bbAccountDetails: true,
        mbAccountDetails: true
      }
    });
    
    if (!existingAccount) {
      throw new ApiError(404, `Account with ID ${id} not found`);
    }
    
    // Update account with transaction to ensure all related data is updated atomically
    const updatedAccount = await prisma.$transaction(async (prisma) => {
      // Update main account
      const accountData: any = {};
      
      if (interestRate !== undefined) {
        accountData.interestRate = parseFloat(interestRate);
      }
      
      if (status !== undefined) {
        accountData.status = status;
      }
      
      // Only update if there are changes
      if (Object.keys(accountData).length > 0) {
        await prisma.account.update({
          where: { id },
          data: accountData
        });
      }
      
      // Update BB account details if provided
      if (bbAccountDetails && existingAccount.bbAccountDetails) {
        const bbData: any = {};
        
        if (bbAccountDetails.guardianName !== undefined) {
          bbData.guardianName = bbAccountDetails.guardianName;
        }
        
        if (bbAccountDetails.guardianRelation !== undefined) {
          bbData.guardianRelation = bbAccountDetails.guardianRelation;
        }
        
        if (bbAccountDetails.guardianContact !== undefined) {
          bbData.guardianContact = bbAccountDetails.guardianContact;
        }
        
        if (bbAccountDetails.guardianIdType !== undefined) {
          bbData.guardianIdType = bbAccountDetails.guardianIdType;
        }
        
        if (bbAccountDetails.guardianIdNumber !== undefined) {
          bbData.guardianIdNumber = bbAccountDetails.guardianIdNumber;
        }
        
        if (bbAccountDetails.maturityDate !== undefined) {
          bbData.maturityDate = bbAccountDetails.maturityDate ? new Date(bbAccountDetails.maturityDate) : null;
        }
        
        // Only update if there are changes
        if (Object.keys(bbData).length > 0) {
          await prisma.bbAccountDetails.update({
            where: { accountId: id },
            data: bbData
          });
        }
      }
      
      // Update MB account details if provided
      if (mbAccountDetails && existingAccount.mbAccountDetails) {
        const mbData: any = {};
        
        if (mbAccountDetails.monthlyDepositAmount !== undefined) {
          mbData.monthlyDepositAmount = parseFloat(mbAccountDetails.monthlyDepositAmount);
        }
        
        if (mbAccountDetails.depositDay !== undefined) {
          mbData.depositDay = mbAccountDetails.depositDay;
        }
        
        if (mbAccountDetails.termMonths !== undefined) {
          mbData.termMonths = mbAccountDetails.termMonths;
        }
        
        if (mbAccountDetails.maturityDate !== undefined) {
          mbData.maturityDate = new Date(mbAccountDetails.maturityDate);
        }
        
        // Only update if there are changes
        if (Object.keys(mbData).length > 0) {
          await prisma.mbAccountDetails.update({
            where: { accountId: id },
            data: mbData
          });
        }
      }
      
      return prisma.account.findUnique({
        where: { id },
        include: {
          bbAccountDetails: true,
          mbAccountDetails: true
        }
      });
    });
    
    // Create audit log
    await createAuditLog(
      req,
      'Account',
      id,
      AuditAction.UPDATE,
      existingAccount,
      updatedAccount
    );
    
    return res.status(200).json(updatedAccount);
  } catch (error) {
    logger.error(`Update account error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update account');
  }
};

/**
 * Close account
 */
export const closeAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { closureReason } = req.body;
    
    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id }
    });
    
    if (!existingAccount) {
      throw new ApiError(404, `Account with ID ${id} not found`);
    }
    
    // Validate account can be closed (e.g., zero balance for savings)
    if (existingAccount.accountType === 'SAVINGS' && Number(existingAccount.balance) > 0) {
      throw new ApiError(400, 'Cannot close account with positive balance');
    }
    
    // Update account status to CLOSED
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        status: 'CLOSED',
        updatedAt: new Date()
      },
      include: {
        bbAccountDetails: true,
        mbAccountDetails: true
      }
    });
    
    // Create audit log
    await createAuditLog(
      req,
      'Account',
      id,
      AuditAction.UPDATE,
      existingAccount,
      updatedAccount,
      { closureReason }
    );
    
    return res.status(200).json(updatedAccount);
  } catch (error) {
    logger.error(`Close account error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to close account');
  }
};

/**
 * Get all accounts (admin function)
 */
export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      accountType, 
      status, 
      userType,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter conditions
    const where: any = {};
    
    if (search) {
      where.OR = [
        { accountNumber: { contains: search as string, mode: 'insensitive' } },
        { user: { fullName: { contains: search as string, mode: 'insensitive' } } },
        { user: { contactNumber: { contains: search as string, mode: 'insensitive' } } }
      ];
    }
    
    if (accountType) {
      where.accountType = accountType;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (userType) {
      where.user = { userType };
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get accounts with pagination
    const [accounts, totalCount] = await Promise.all([
      prisma.account.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              contactNumber: true,
              email: true,
              userType: true
            }
          },
          bbAccountDetails: true,
          mbAccountDetails: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.account.count({ where })
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / Number(limit));
    
    return res.status(200).json({
      data: accounts,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    logger.error(`Get all accounts error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch accounts');
  }
};