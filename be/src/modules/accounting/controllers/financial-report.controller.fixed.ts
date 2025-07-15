import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { ApiError } from '../../../common/middleware/error.middleware';
import { AccountType_COA } from '@prisma/client';
import { 
  calculateAccountBalance, 
  generateTrialBalance, 
  generateIncomeStatement, 
  generateBalanceSheet 
} from '../utils/accounting.utils';

/**
 * Get account balance
 */
export const getAccountBalance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Check if account exists
    const account = await prisma.account_COA.findUnique({
      where: { id }
    });

    if (!account) {
      throw new ApiError(404, 'Account not found');
    }

    // Parse date parameters
    const startDateObj = startDate ? new Date(startDate as string) : undefined;
    const endDateObj = endDate ? new Date(endDate as string) : undefined;

    // Calculate balance
    const balance = await calculateAccountBalance(
      id, 
      account.accountType,
      startDateObj, 
      endDateObj
    );

    return res.json({
      account,
      balance,
      period: {
        startDate: startDateObj,
        endDate: endDateObj
      }
    });
  } catch (error) {
    logger.error(`Get account balance error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to calculate account balance');
  }
};

/**
 * Generate trial balance
 */
export const getTrialBalance = async (req: Request, res: Response) => {
  try {
    const { asOfDate } = req.query;

    // Parse date parameter
    const asOfDateObj = asOfDate ? new Date(asOfDate as string) : new Date();

    // Generate trial balance
    const trialBalanceData = await generateTrialBalance(asOfDateObj);

    return res.json({
      asOfDate: asOfDateObj,
      accounts: trialBalanceData.accounts,
      totals: {
        debit: trialBalanceData.totalDebits,
        credit: trialBalanceData.totalCredits,
        difference: trialBalanceData.totalDebits - trialBalanceData.totalCredits
      }
    });
  } catch (error) {
    logger.error(`Generate trial balance error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to generate trial balance');
  }
};

/**
 * Generate income statement
 */
export const getIncomeStatement = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Parse date parameters
    const startDateObj = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const endDateObj = endDate ? new Date(endDate as string) : new Date();

    // Generate income statement
    const incomeStatement = await generateIncomeStatement(startDateObj, endDateObj);

    return res.json({
      period: {
        startDate: startDateObj,
        endDate: endDateObj
      },
      ...incomeStatement
    });
  } catch (error) {
    logger.error(`Generate income statement error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to generate income statement');
  }
};

/**
 * Generate balance sheet
 */
export const getBalanceSheet = async (req: Request, res: Response) => {
  try {
    const { asOfDate } = req.query;

    // Parse date parameter
    const asOfDateObj = asOfDate ? new Date(asOfDate as string) : new Date();

    // Generate balance sheet
    const balanceSheet = await generateBalanceSheet(asOfDateObj);

    return res.json({
      asOfDate: asOfDateObj,
      ...balanceSheet
    });
  } catch (error) {
    logger.error(`Generate balance sheet error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to generate balance sheet');
  }
};

/**
 * Generate general ledger
 */
export const getGeneralLedger = async (req: Request, res: Response) => {
  try {
    const { accountId, startDate, endDate } = req.query;
    
    // Build filter conditions
    const where: any = {};
    
    // Only include posted entries
    where.status = 'POSTED';
    
    // Date filters
    if (startDate && endDate) {
      where.entryDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    } else if (startDate) {
      where.entryDate = {
        gte: new Date(startDate as string)
      };
    } else if (endDate) {
      where.entryDate = {
        lte: new Date(endDate as string)
      };
    }
    
    // Get journal entries with lines
    const journalEntries = await prisma.journalEntry.findMany({
      where,
      include: {
        journalEntryLines: {
          include: {
            account: true
          }
        }
      },
      orderBy: {
        entryDate: 'asc'
      }
    });
    
    // If filtering by account, calculate opening balance
    let openingBalance = 0;
    if (accountId) {
      const account = await prisma.account_COA.findUnique({
        where: { id: accountId as string }
      });
      
      if (!account) {
        throw new ApiError(404, 'Account not found');
      }
      
      // Calculate opening balance as of startDate
      if (startDate) {
        openingBalance = await calculateAccountBalance(
          accountId as string,
          account.accountType,
          undefined, 
          new Date(new Date(startDate as string).setDate(new Date(startDate as string).getDate() - 1))
        );
      }
    }
    
    // Format ledger entries
    const ledgerEntries = journalEntries.map(entry => {
      // Filter lines for the specified account if needed
      const relevantLines = accountId 
        ? entry.journalEntryLines.filter(line => line.accountId === accountId)
        : entry.journalEntryLines;
      
      // Group by debit and credit
      const debitLines = relevantLines.filter(line => line.debitAmount > 0);
      const creditLines = relevantLines.filter(line => line.creditAmount > 0);
      
      return {
        entryDate: entry.entryDate,
        entryNumber: entry.entryNumber,
        reference: entry.reference,
        narration: entry.narration,
        debitAmount: debitLines.reduce((sum, line) => sum + Number(line.debitAmount), 0),
        creditAmount: creditLines.reduce((sum, line) => sum + Number(line.creditAmount), 0),
        debitAccounts: debitLines.map(line => line.account),
        creditAccounts: creditLines.map(line => line.account)
      };
    });
    
    return res.json({
      period: {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      },
      account: accountId ? await prisma.account_COA.findUnique({
        where: { id: accountId as string }
      }) : null,
      openingBalance,
      entries: ledgerEntries
    });
  } catch (error) {
    logger.error(`Generate general ledger error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to generate general ledger');
  }
};