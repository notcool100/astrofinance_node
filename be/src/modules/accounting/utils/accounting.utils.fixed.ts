import { AccountType_COA, Prisma } from '@prisma/client';
import prisma from '../../../config/database';
import { format } from 'date-fns';

/**
 * Generate a unique journal entry number
 */
export const generateJournalEntryNumber = async (): Promise<string> => {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const prefix = `JE${year}${month}${day}`;
  
  // Get the count of entries for today to generate a sequential number
  const entriesCount = await prisma.journalEntry.count({
    where: {
      entryNumber: {
        startsWith: prefix
      }
    }
  });
  
  // Generate the sequential number (starting from 1)
  const sequentialNumber = (entriesCount + 1).toString().padStart(4, '0');
  
  return `${prefix}-${sequentialNumber}`;
};

/**
 * Calculate account balance
 * For asset and expense accounts: Debit - Credit
 * For liability, equity, and income accounts: Credit - Debit
 */
export const calculateAccountBalance = async (
  accountId: string,
  accountType: AccountType_COA,
  startDate?: Date,
  endDate?: Date
): Promise<number> => {
  // Build date filter if dates are provided
  const dateFilter: any = {};
  
  if (startDate) {
    dateFilter.gte = startDate;
  }
  
  if (endDate) {
    dateFilter.lte = endDate;
  }
  
  // Build journal entry filter
  const journalFilter: Prisma.JournalEntryWhereInput = {
    status: 'POSTED',
    ...(Object.keys(dateFilter).length > 0 ? { entryDate: dateFilter } : {})
  };

  // Get sum of debit and credit entries
  const journalLines = await prisma.journalEntryLine.findMany({
    where: {
      accountId,
      journalEntry: journalFilter
    },
    select: {
      debitAmount: true,
      creditAmount: true
    }
  });
  
  // Calculate total debits and credits
  const totalDebits = journalLines.reduce((sum, line) => 
    sum + Number(line.debitAmount), 0);
  
  const totalCredits = journalLines.reduce((sum, line) => 
    sum + Number(line.creditAmount), 0);

  // Calculate balance based on account type
  let balance = 0;
  
  if (accountType === AccountType_COA.ASSET || accountType === AccountType_COA.EXPENSE) {
    balance = totalDebits - totalCredits;
  } else {
    balance = totalCredits - totalDebits;
  }
  
  return balance;
};

/**
 * Generate trial balance
 */
export const generateTrialBalance = async (
  asOfDate: Date = new Date()
): Promise<any> => {
  // Get all active accounts
  const accounts = await prisma.account_COA.findMany({
    where: {
      isActive: true
    }
  });
  
  // Calculate balance for each account
  const trialBalance = await Promise.all(
    accounts.map(async (account) => {
      const balance = await calculateAccountBalance(
        account.id,
        account.accountType,
        undefined,
        asOfDate
      );
      
      return {
        ...account,
        balance
      };
    })
  );
  
  // Filter out accounts with zero balance
  const nonZeroAccounts = trialBalance.filter(account => account.balance !== 0);
  
  // Calculate totals
  const totalDebits = nonZeroAccounts.reduce((sum, account) => {
    if (account.balance > 0 && 
        (account.accountType === AccountType_COA.ASSET || 
         account.accountType === AccountType_COA.EXPENSE)) {
      return sum + account.balance;
    }
    if (account.balance < 0 && 
        (account.accountType === AccountType_COA.LIABILITY || 
         account.accountType === AccountType_COA.EQUITY || 
         account.accountType === AccountType_COA.INCOME)) {
      return sum + Math.abs(account.balance);
    }
    return sum;
  }, 0);
  
  const totalCredits = nonZeroAccounts.reduce((sum, account) => {
    if (account.balance < 0 && 
        (account.accountType === AccountType_COA.ASSET || 
         account.accountType === AccountType_COA.EXPENSE)) {
      return sum + Math.abs(account.balance);
    }
    if (account.balance > 0 && 
        (account.accountType === AccountType_COA.LIABILITY || 
         account.accountType === AccountType_COA.EQUITY || 
         account.accountType === AccountType_COA.INCOME)) {
      return sum + account.balance;
    }
    return sum;
  }, 0);
  
  return {
    asOfDate,
    accounts: nonZeroAccounts,
    totalDebits,
    totalCredits
  };
};

/**
 * Generate income statement
 */
export const generateIncomeStatement = async (
  startDate: Date,
  endDate: Date
): Promise<any> => {
  // Get all active income and expense accounts
  const accounts = await prisma.account_COA.findMany({
    where: {
      isActive: true,
      accountType: {
        in: [AccountType_COA.INCOME, AccountType_COA.EXPENSE]
      }
    }
  });
  
  // Calculate balance for each account within the date range
  const accountsWithBalance = await Promise.all(
    accounts.map(async (account) => {
      const balance = await calculateAccountBalance(
        account.id,
        account.accountType,
        startDate,
        endDate
      );
      
      return {
        ...account,
        balance
      };
    })
  );
  
  // Filter out accounts with zero balance
  const nonZeroAccounts = accountsWithBalance.filter(account => account.balance !== 0);
  
  // Separate income and expense accounts
  const incomeAccounts = nonZeroAccounts.filter(
    account => account.accountType === AccountType_COA.INCOME
  );
  
  const expenseAccounts = nonZeroAccounts.filter(
    account => account.accountType === AccountType_COA.EXPENSE
  );
  
  // Calculate totals
  const totalIncome = incomeAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalExpenses = expenseAccounts.reduce((sum, account) => sum + account.balance, 0);
  const netIncome = totalIncome - totalExpenses;
  
  return {
    startDate,
    endDate,
    incomeAccounts,
    expenseAccounts,
    totalIncome,
    totalExpenses,
    netIncome
  };
};

/**
 * Generate balance sheet
 */
export const generateBalanceSheet = async (
  asOfDate: Date = new Date()
): Promise<any> => {
  // Get all active asset, liability, and equity accounts
  const accounts = await prisma.account_COA.findMany({
    where: {
      isActive: true,
      accountType: {
        in: [AccountType_COA.ASSET, AccountType_COA.LIABILITY, AccountType_COA.EQUITY]
      }
    }
  });
  
  // Calculate balance for each account
  const accountsWithBalance = await Promise.all(
    accounts.map(async (account) => {
      const balance = await calculateAccountBalance(
        account.id,
        account.accountType,
        undefined,
        asOfDate
      );
      
      return {
        ...account,
        balance
      };
    })
  );
  
  // Filter out accounts with zero balance
  const nonZeroAccounts = accountsWithBalance.filter(account => account.balance !== 0);
  
  // Separate accounts by type
  const assetAccounts = nonZeroAccounts.filter(
    account => account.accountType === AccountType_COA.ASSET
  );
  
  const liabilityAccounts = nonZeroAccounts.filter(
    account => account.accountType === AccountType_COA.LIABILITY
  );
  
  const equityAccounts = nonZeroAccounts.filter(
    account => account.accountType === AccountType_COA.EQUITY
  );
  
  // Calculate net income for the current year
  const startOfYear = new Date(asOfDate.getFullYear(), 0, 1);
  const { netIncome } = await generateIncomeStatement(startOfYear, asOfDate);
  
  // Add retained earnings to equity accounts if not zero
  if (netIncome !== 0) {
    equityAccounts.push({
      id: 'retained-earnings',
      accountCode: 'RE',
      name: 'Retained Earnings (Current Year)',
      accountType: AccountType_COA.EQUITY,
      balance: netIncome,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: null,
      parentId: null
    });
  }
  
  // Calculate totals
  const totalAssets = assetAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalEquity = equityAccounts.reduce((sum, account) => sum + account.balance, 0);
  
  return {
    asOfDate,
    assetAccounts,
    liabilityAccounts,
    equityAccounts,
    totalAssets,
    totalLiabilities,
    totalEquity,
    liabilitiesAndEquity: totalLiabilities + totalEquity
  };
};