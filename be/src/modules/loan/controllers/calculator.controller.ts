import { Request, Response } from 'express';
import { InterestType } from '../utils/loan.utils';
import logger from '../../../config/logger';
import { ApiError } from '../../../common/middleware/error.middleware';
import { 
  calculateEMI, 
  generateRepaymentSchedule 
} from '../utils/loan.utils';

/**
 * Calculate EMI
 */
export const calculateLoanEMI = async (req: Request, res: Response) => {
  try {
    const { 
      principal, 
      interestRate, 
      tenure, 
      interestType 
    } = req.body;

    // Validate interest type
    if (!Object.values(InterestType).includes(interestType as InterestType)) {
      throw new ApiError(400, 'Invalid interest type');
    }

    // Calculate EMI
    const emi = calculateEMI(
      principal,
      interestRate,
      tenure,
      interestType as InterestType
    );

    // Calculate total interest and total amount
    let totalInterest = 0;
    if (interestType === InterestType.FLAT) {
      totalInterest = (principal * interestRate * tenure) / 1200;
    } else {
      totalInterest = (emi * tenure) - principal;
    }

    const totalAmount = principal + totalInterest;

    return res.json({
      principal,
      interestRate,
      tenure,
      interestType,
      emi,
      totalInterest,
      totalAmount
    });
  } catch (error) {
    logger.error(`Calculate EMI error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to calculate EMI');
  }
};

/**
 * Generate amortization schedule
 */
export const generateAmortizationSchedule = async (req: Request, res: Response) => {
  try {
    const { 
      principal, 
      interestRate, 
      tenure, 
      interestType, 
      disbursementDate = new Date(), 
      firstPaymentDate 
    } = req.body;

    // Validate interest type
    if (!Object.values(InterestType).includes(interestType as InterestType)) {
      throw new ApiError(400, 'Invalid interest type');
    }

    // Calculate first payment date if not provided
    let firstPaymentDateObj = firstPaymentDate ? new Date(firstPaymentDate) : new Date(disbursementDate);
    if (!firstPaymentDate) {
      firstPaymentDateObj.setDate(firstPaymentDateObj.getDate() + 30); // Default to 30 days after disbursement
    }

    // Generate schedule
    const schedule = generateRepaymentSchedule(
      principal,
      interestRate,
      tenure,
      interestType as InterestType,
      new Date(disbursementDate),
      firstPaymentDateObj
    );

    // Calculate summary
    const totalPrincipal = principal;
    const totalInterest = schedule.reduce((sum, item) => sum + item.interestAmount, 0);
    const totalAmount = totalPrincipal + totalInterest;
    const emi = schedule[0].totalAmount;

    return res.json({
      summary: {
        principal: totalPrincipal,
        interestRate,
        tenure,
        interestType,
        emi,
        totalInterest,
        totalAmount
      },
      schedule
    });
  } catch (error) {
    logger.error(`Generate amortization schedule error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to generate amortization schedule');
  }
};