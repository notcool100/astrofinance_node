import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a unique account number based on account type
 * Format: [Type Prefix][Year][Month][5-digit sequence]
 * Example: SB2023070001 for a Savings account created in July 2023
 * 
 * @param accountType The type of account (SAVINGS, LOAN, FIXED_DEPOSIT)
 * @returns A unique account number
 */
export const generateAccountNumber = async (accountType: string): Promise<string> => {
  // Define prefix based on account type
  const typePrefix = accountType === 'SAVINGS' ? 'SB' : 
                     accountType === 'LOAN' ? 'LN' : 
                     accountType === 'FIXED_DEPOSIT' ? 'FD' : 'AC';
  
  // Get current date components
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  // Create the base prefix for the account number
  const prefix = `${typePrefix}${year}${month}`;
  
  // Find the latest account with this prefix
  const latestAccount = await prisma.account.findFirst({
    where: {
      accountNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      accountNumber: 'desc'
    }
  });
  
  // Extract sequence number or start from 1
  let sequenceNumber = 1;
  
  if (latestAccount) {
    const latestSequence = latestAccount.accountNumber.substring(prefix.length);
    sequenceNumber = parseInt(latestSequence, 10) + 1;
  }
  
  // Format the sequence number with leading zeros
  const formattedSequence = sequenceNumber.toString().padStart(5, '0');
  
  // Combine to create the final account number
  return `${prefix}${formattedSequence}`;
};

/**
 * Calculate maturity date for a fixed deposit or recurring deposit account
 * 
 * @param startDate The start date of the deposit
 * @param termMonths The term in months
 * @returns The maturity date
 */
export const calculateMaturityDate = (startDate: Date, termMonths: number): Date => {
  const maturityDate = new Date(startDate);
  maturityDate.setMonth(maturityDate.getMonth() + termMonths);
  return maturityDate;
};

/**
 * Calculate interest for a savings account
 * 
 * @param principal The principal amount
 * @param interestRate The annual interest rate (in percentage)
 * @param days The number of days for which interest is calculated
 * @returns The interest amount
 */
export const calculateSavingsInterest = (
  principal: number, 
  interestRate: number, 
  days: number
): number => {
  // Convert annual interest rate to daily rate
  const dailyRate = interestRate / 365 / 100;
  
  // Calculate interest
  const interest = principal * dailyRate * days;
  
  // Round to 2 decimal places
  return Math.round(interest * 100) / 100;
};

/**
 * Check if an account can be closed
 * 
 * @param accountType The type of account
 * @param balance The current balance
 * @param hasActiveLoans Whether the user has active loans linked to this account
 * @returns An object with a boolean indicating if the account can be closed and a reason if not
 */
export const canCloseAccount = (
  accountType: string,
  balance: number,
  hasActiveLoans: boolean
): { canClose: boolean; reason?: string } => {
  // Cannot close account with positive balance
  if (balance > 0) {
    return { canClose: false, reason: 'Account has a positive balance' };
  }
  
  // Cannot close account with active loans
  if (hasActiveLoans) {
    return { canClose: false, reason: 'Account has active loans' };
  }
  
  return { canClose: true };
};