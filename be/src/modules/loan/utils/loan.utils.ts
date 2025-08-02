// Define InterestType enum locally since Prisma client may not be properly generated
export enum InterestType {
  FLAT = 'FLAT',
  DIMINISHING = 'DIMINISHING'
}

import prisma from '../../../config/database';

/**
 * Generate a unique loan application number
 */
export const generateApplicationNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Get count of applications for today
  const todayStart = new Date(date.setHours(0, 0, 0, 0));
  const todayEnd = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await prisma.loanApplication.count({
    where: {
      appliedDate: {
        gte: todayStart,
        lte: todayEnd
      }
    }
  });
  
  // Format: APP-YYMMDD-XXXX (where XXXX is a sequential number)
  const sequentialNumber = (count + 1).toString().padStart(4, '0');
  const applicationNumber = `APP-${year}${month}${day}-${sequentialNumber}`;
  
  return applicationNumber;
};

/**
 * Generate a unique loan number
 */
export const generateLoanNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Get count of loans for this month
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const count = await prisma.loan.count({
    where: {
      disbursementDate: {
        gte: monthStart,
        lte: monthEnd
      }
    }
  });
  
  // Format: LN-YYMM-XXXX (where XXXX is a sequential number)
  const sequentialNumber = (count + 1).toString().padStart(4, '0');
  const loanNumber = `LN-${year}${month}-${sequentialNumber}`;
  
  return loanNumber;
};

/**
 * Calculate EMI (Equated Monthly Installment)
 * 
 * @param principal - Loan amount
 * @param interestRate - Annual interest rate (in percentage)
 * @param tenure - Loan tenure in months
 * @param interestType - Type of interest calculation (FLAT or DIMINISHING)
 * @returns Monthly EMI amount
 */
export const calculateEMI = (
  principal: number,
  interestRate: number,
  tenure: number,
  interestType: InterestType
): number => {
  if (interestType === InterestType.FLAT) {
    // Flat interest calculation
    const monthlyInterest = (principal * interestRate) / 1200; // Monthly interest amount
    const emi = (principal / tenure) + monthlyInterest; // Principal component + Interest component
    return parseFloat(emi.toFixed(2));
  } else {
    // Diminishing interest calculation (reducing balance)
    const monthlyRate = interestRate / 1200; // Monthly interest rate
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return parseFloat(emi.toFixed(2));
  }
};

/**
 * Generate loan repayment schedule
 * 
 * @param principal - Loan amount
 * @param interestRate - Annual interest rate (in percentage)
 * @param tenure - Loan tenure in months
 * @param interestType - Type of interest calculation (FLAT or DIMINISHING)
 * @param disbursementDate - Date of loan disbursement
 * @param firstPaymentDate - Date of first payment
 * @returns Array of installments with payment details
 */
export const generateRepaymentSchedule = (
  principal: number,
  interestRate: number,
  tenure: number,
  interestType: InterestType,
  disbursementDate: Date,
  firstPaymentDate: Date
): any[] => {
  const schedule = [];
  const emi = calculateEMI(principal, interestRate, tenure, interestType);
  let remainingPrincipal = principal;
  
  for (let i = 1; i <= tenure; i++) {
    let principalComponent: number;
    let interestComponent: number;
    
    if (interestType === InterestType.FLAT) {
      // Flat interest calculation
      interestComponent = (principal * interestRate) / 1200;
      principalComponent = principal / tenure;
    } else {
      // Diminishing interest calculation
      interestComponent = (remainingPrincipal * interestRate) / 1200;
      principalComponent = emi - interestComponent;
    }
    
    // Round to 2 decimal places
    principalComponent = parseFloat(principalComponent.toFixed(2));
    interestComponent = parseFloat(interestComponent.toFixed(2));
    
    // Adjust last installment to account for rounding errors
    if (i === tenure) {
      principalComponent = remainingPrincipal;
    }
    
    // Calculate due date
    const dueDate = new Date(firstPaymentDate);
    dueDate.setMonth(dueDate.getMonth() + i - 1);
    
    // Update remaining principal
    remainingPrincipal -= principalComponent;
    remainingPrincipal = parseFloat(remainingPrincipal.toFixed(2));
    
    // Ensure remaining principal doesn't go below zero
    if (remainingPrincipal < 0) remainingPrincipal = 0;
    
    schedule.push({
      installmentNumber: i,
      dueDate,
      principalAmount: principalComponent,
      interestAmount: interestComponent,
      totalAmount: parseFloat((principalComponent + interestComponent).toFixed(2)),
      remainingPrincipal
    });
  }
  
  return schedule;
};

/**
 * Compare flat and diminishing interest calculation methods
 * 
 * @param principal - Loan amount
 * @param interestRate - Annual interest rate (in percentage)
 * @param tenure - Loan tenure in months
 * @returns Comparison of both methods with EMI, total interest, and total amount
 */
export const compareInterestMethods = (
  principal: number,
  interestRate: number,
  tenure: number
): {
  flat: { emi: number; totalInterest: number; totalAmount: number };
  diminishing: { emi: number; totalInterest: number; totalAmount: number };
  difference: { emi: number; totalInterest: number; totalAmount: number };
  recommendation: string;
} => {
  // Calculate for flat rate
  const flatEmi = calculateEMI(principal, interestRate, tenure, InterestType.FLAT);
  const flatTotalInterest = (principal * interestRate * tenure) / 1200;
  const flatTotalAmount = principal + flatTotalInterest;
  
  // Calculate for diminishing balance
  const diminishingEmi = calculateEMI(principal, interestRate, tenure, InterestType.DIMINISHING);
  const diminishingTotalInterest = diminishingEmi * tenure - principal;
  const diminishingTotalAmount = principal + diminishingTotalInterest;
  
  // Calculate differences
  const emiDifference = Math.abs(flatEmi - diminishingEmi);
  const interestDifference = Math.abs(flatTotalInterest - diminishingTotalInterest);
  const totalDifference = Math.abs(flatTotalAmount - diminishingTotalAmount);
  
  // Determine which method is better
  const isFlatBetter = flatTotalInterest < diminishingTotalInterest;
  const recommendation = isFlatBetter
    ? 'The Flat Rate method results in lower total interest payments for this specific scenario.'
    : 'The Reducing Balance method is generally more favorable as it results in lower total interest payments.';
  
  return {
    flat: {
      emi: parseFloat(flatEmi.toFixed(2)),
      totalInterest: parseFloat(flatTotalInterest.toFixed(2)),
      totalAmount: parseFloat(flatTotalAmount.toFixed(2))
    },
    diminishing: {
      emi: parseFloat(diminishingEmi.toFixed(2)),
      totalInterest: parseFloat(diminishingTotalInterest.toFixed(2)),
      totalAmount: parseFloat(diminishingTotalAmount.toFixed(2))
    },
    difference: {
      emi: parseFloat(emiDifference.toFixed(2)),
      totalInterest: parseFloat(interestDifference.toFixed(2)),
      totalAmount: parseFloat(totalDifference.toFixed(2))
    },
    recommendation
  };
};