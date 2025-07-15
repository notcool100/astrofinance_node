import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction, Prisma, InterestType as PrismaInterestType } from '@prisma/client';
import { InterestType } from '../utils/loan.utils';
import { ApiError } from '../../../common/middleware/error.middleware';
import { 
  generateLoanNumber, 
  calculateEMI, 
  generateRepaymentSchedule 
} from '../utils/loan.utils';

// Helper function to convert Prisma InterestType to local InterestType
const convertInterestType = (type: PrismaInterestType): InterestType => {
  return type === 'FLAT' ? InterestType.FLAT : InterestType.DIMINISHING;
};

// Helper function to convert Prisma Decimal to number
const toNumber = (decimal: Prisma.Decimal | number): number => {
  if (typeof decimal === 'number') return decimal;
  return decimal.toNumber();
};

/**
 * Get all loans
 */
export const getAllLoans = async (req: Request, res: Response) => {
  try {
    const { status, userId, page = '1', limit = '10' } = req.query;
    
    // Parse pagination parameters
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Build filter conditions
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    // Get total count for pagination
    const totalCount = await prisma.loan.count({ where });
    
    // Get loans with pagination
    const loans = await prisma.loan.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            contactNumber: true
          }
        },
        loanType: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNumber
    });
    
    return res.json({
      data: loans,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalCount / limitNumber)
      }
    });
  } catch (error) {
    logger.error('Get all loans error:', error);
    throw new ApiError(500, 'Failed to fetch loans');
  }
};

/**
 * Get loan by ID
 */
export const getLoanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            contactNumber: true,
            email: true,
            address: true
          }
        },
        loanType: true,
        application: true
      }
    });

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    return res.json(loan);
  } catch (error) {
    logger.error(`Get loan by ID error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch loan');
  }
};

/**
 * Get loan installments
 */
export const getLoanInstallments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        installments: {
          orderBy: {
            dueDate: 'asc'
          }
        },
        loanType: true
      }
    });

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    // If installments exist, return them
    if (loan.installments.length > 0) {
      return res.json(loan.installments);
    }

    // If no installments exist, generate them based on loan details
    const installments = generateRepaymentSchedule(
      toNumber(loan.principalAmount),
      toNumber(loan.interestRate),
      loan.tenure,
      convertInterestType(loan.loanType.interestType),
      loan.disbursementDate ? new Date(loan.disbursementDate) : new Date(),
      loan.firstPaymentDate ? new Date(loan.firstPaymentDate) : new Date()
    );

    return res.json(installments);
  } catch (error) {
    logger.error(`Get loan installments error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch loan installments');
  }
};

/**
 * Disburse loan
 */
export const disburseLoan = async (req: Request, res: Response) => {
  try {
    const { applicationId, disbursementDate, firstPaymentDate } = req.body;
    const adminUserId = req.adminUser.id;

    // Check if application exists and is approved
    const application = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        loanType: true
      }
    });

    if (!application) {
      throw new ApiError(404, 'Loan application not found');
    }

    if (application.status !== 'APPROVED') {
      throw new ApiError(400, 'Loan application must be approved before disbursement');
    }

    // Check if loan already exists for this application
    const existingLoan = await prisma.loan.findFirst({
      where: { applicationId }
    });

    if (existingLoan) {
      throw new ApiError(409, 'Loan has already been disbursed for this application');
    }

    // Generate loan number
    const loanNumber = await generateLoanNumber();

    // Calculate EMI - convert Decimal to number and InterestType
    const principalAmount = toNumber(application.amount);
    const interestRate = toNumber(application.loanType.interestRate);
    const interestType = convertInterestType(application.loanType.interestType);
    const emiAmount = calculateEMI(
      principalAmount,
      interestRate,
      application.tenure,
      interestType
    );

    // Calculate total interest and total amount
    let totalInterest = 0;
    if (interestType === InterestType.FLAT) {
      totalInterest = (principalAmount * interestRate * application.tenure) / 1200;
    } else {
      totalInterest = (emiAmount * application.tenure) - principalAmount;
    }

    const totalAmount = principalAmount + totalInterest;

    // Calculate processing fee
    const processingFee = (principalAmount * toNumber(application.loanType.processingFeePercent)) / 100;

    // Set disbursement date and first payment date
    const disbursementDateTime = new Date(disbursementDate);
    const firstPaymentDateTime = new Date(firstPaymentDate);
    
    // Calculate last payment date
    const lastPaymentDateTime = new Date(firstPaymentDateTime);
    lastPaymentDateTime.setMonth(lastPaymentDateTime.getMonth() + application.tenure - 1);

    // Create loan and installments in a transaction
    const loan = await prisma.$transaction(async (tx) => {
      // Create loan
      const newLoan = await tx.loan.create({
        data: {
          loanNumber,
          applicationId,
          userId: application.userId,
          loanTypeId: application.loanTypeId,
          principalAmount: application.amount,
          interestRate: application.loanType.interestRate,
          tenure: application.tenure,
          emiAmount,
          disbursementDate: disbursementDateTime,
          firstPaymentDate: firstPaymentDateTime,
          lastPaymentDate: lastPaymentDateTime,
          totalInterest,
          totalAmount,
          processingFee,
          outstandingPrincipal: application.amount,
          outstandingInterest: totalInterest,
          status: 'ACTIVE'
        }
      });

      // Generate repayment schedule
      const installments = generateRepaymentSchedule(
        toNumber(application.amount),
        interestRate,
        application.tenure,
        interestType,
        disbursementDateTime,
        firstPaymentDateTime
      );

      // Create installments
      for (const installment of installments) {
        await tx.loanInstallment.create({
          data: {
            loanId: newLoan.id,
            installmentNumber: installment.installmentNumber,
            dueDate: installment.dueDate,
            principalAmount: installment.principalAmount,
            interestAmount: installment.interestAmount,
            totalAmount: installment.totalAmount,
            paidAmount: 0,
            remainingPrincipal: installment.remainingPrincipal || 0,
            status: 'PENDING'
          }
        });
      }

      return newLoan;
    });

    // Create audit log
    await createAuditLog(
      req,
      'Loan',
      loan.id,
      AuditAction.CREATE,
      null,
      loan
    );

    return res.status(201).json(loan);
  } catch (error) {
    logger.error(`Disburse loan error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to disburse loan');
  }
};

/**
 * Process loan payment
 */
export const processLoanPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      installmentId, 
      amount, 
      paymentDate, 
      paymentMethod, 
      referenceNumber 
    } = req.body;
    const adminUserId = req.adminUser.id;

    // Check if loan exists and is active
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        loanType: true
      }
    });

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    if (loan.status !== 'ACTIVE') {
      throw new ApiError(400, 'Payment can only be processed for active loans');
    }

    // Check if installment exists
    const installment = await prisma.loanInstallment.findUnique({
      where: { id: installmentId }
    });

    if (!installment) {
      throw new ApiError(404, 'Installment not found');
    }

    if (installment.loanId !== id) {
      throw new ApiError(400, 'Installment does not belong to this loan');
    }

    // Calculate late fee if payment is overdue
    const today = new Date();
    const dueDate = new Date(installment.dueDate);
    let lateFee = 0;

    if (today > dueDate && installment.status !== 'PAID') {
      lateFee = toNumber(loan.loanType.lateFeeAmount);
    }

    // Calculate payment components
    const totalDue = toNumber(installment.totalAmount) + lateFee - toNumber(installment.paidAmount);
    
    if (amount > totalDue) {
      throw new ApiError(400, `Payment amount (${amount}) exceeds total due (${totalDue})`);
    }

    // Allocate payment to principal and interest
    let principalComponent = 0;
    let interestComponent = 0;
    let lateFeeComponent = 0;

    // First allocate to late fee if any
    if (lateFee > 0) {
      lateFeeComponent = Math.min(amount, lateFee);
      const remainingAmount = amount - lateFeeComponent;
      
      // Then allocate to interest
      interestComponent = Math.min(remainingAmount, toNumber(installment.interestAmount));
      
      // Finally allocate to principal
      principalComponent = remainingAmount - interestComponent;
    } else {
      // If no late fee, allocate proportionally to principal and interest
      const principalRatio = toNumber(installment.principalAmount) / toNumber(installment.totalAmount);
      principalComponent = amount * principalRatio;
      interestComponent = amount - principalComponent;
    }

    // Process payment in a transaction
    const payment = await prisma.$transaction(async (tx) => {
      // Create payment record
      const newPayment = await tx.loanPayment.create({
        data: {
          loanId: id,
          installmentId,
          paymentDate: new Date(paymentDate),
          amount,
          principalComponent,
          interestComponent,
          lateFeeComponent,
          paymentMethod,
          referenceNumber,
          receivedById: adminUserId
        }
      });

      // Update installment
      const updatedPaidAmount = toNumber(installment.paidAmount) + amount;
      const newStatus = updatedPaidAmount >= toNumber(installment.totalAmount) ? 'PAID' : 'PARTIAL';
      
      await tx.loanInstallment.update({
        where: { id: installmentId },
        data: {
          paidAmount: updatedPaidAmount,
          status: newStatus,
          paymentDate: new Date(paymentDate)
        }
      });

      // Update loan outstanding amounts
      await tx.loan.update({
        where: { id },
        data: {
          outstandingPrincipal: {
            decrement: principalComponent
          },
          outstandingInterest: {
            decrement: interestComponent
          },
          lastPaymentDate: new Date(paymentDate)
        }
      });

      // Check if loan is fully paid
      const remainingInstallments = await tx.loanInstallment.count({
        where: {
          loanId: id,
          status: {
            in: ['PENDING', 'PARTIAL', 'OVERDUE']
          }
        }
      });

      if (remainingInstallments === 0) {
        await tx.loan.update({
          where: { id },
          data: {
            status: 'CLOSED',
            closureDate: new Date(paymentDate)
          }
        });
      }

      return newPayment;
    });

    // Create audit log
    await createAuditLog(
      req,
      'LoanPayment',
      payment.id,
      AuditAction.CREATE,
      null,
      payment
    );

    return res.status(201).json(payment);
  } catch (error) {
    logger.error(`Process loan payment error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to process loan payment');
  }
};

/**
 * Calculate early settlement
 */
export const calculateEarlySettlement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        loanType: true,
        installments: {
          where: {
            status: {
              in: ['PENDING', 'PARTIAL', 'OVERDUE']
            }
          },
          orderBy: {
            dueDate: 'asc'
          }
        }
      }
    });

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    if (loan.status !== 'ACTIVE') {
      throw new ApiError(400, 'Early settlement can only be calculated for active loans');
    }

    // Calculate settlement amount
    const outstandingPrincipal = loan.outstandingPrincipal;
    
    // For flat interest loans, we might offer a discount on remaining interest
    let outstandingInterest = toNumber(loan.outstandingInterest);
    let interestDiscount = 0;
    let outstandingPrincipalNum = toNumber(outstandingPrincipal);
    
    if (convertInterestType(loan.loanType.interestType) === InterestType.FLAT) {
      // Apply a 10% discount on remaining interest as an example
      interestDiscount = outstandingInterest * 0.1;
      outstandingInterest -= interestDiscount;
    }

    const settlementAmount = outstandingPrincipalNum + outstandingInterest;

    // Get next installment due
    const nextInstallment = loan.installments.length > 0 ? loan.installments[0] : null;

    return res.json({
      loanId: loan.id,
      loanNumber: loan.loanNumber,
      outstandingPrincipal: outstandingPrincipalNum,
      outstandingInterest,
      interestDiscount,
      settlementAmount,
      nextInstallmentDue: nextInstallment ? {
        id: nextInstallment.id,
        dueDate: nextInstallment.dueDate,
        amount: toNumber(nextInstallment.totalAmount)
      } : null
    });
  } catch (error) {
    logger.error(`Calculate early settlement error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to calculate early settlement');
  }
};

/**
 * Process early settlement
 */
export const processEarlySettlement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      settlementAmount, 
      paymentDate, 
      paymentMethod, 
      referenceNumber 
    } = req.body;
    const adminUserId = req.adminUser.id;

    // Check if loan exists and is active
    const loan = await prisma.loan.findUnique({
      where: { id }
    });

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    if (loan.status !== 'ACTIVE') {
      throw new ApiError(400, 'Early settlement can only be processed for active loans');
    }

    // Process settlement in a transaction
    const settlement = await prisma.$transaction(async (tx) => {
      // Create payment record for settlement
      const payment = await tx.loanPayment.create({
        data: {
          loanId: id,
          paymentDate: new Date(paymentDate),
          amount: settlementAmount,
          principalComponent: loan.outstandingPrincipal,
          interestComponent: settlementAmount - toNumber(loan.outstandingPrincipal),
          lateFeeComponent: 0,
          paymentMethod,
          referenceNumber,
          receivedById: adminUserId
        }
      });

      // Get all remaining installments
      const remainingInstallments = await tx.loanInstallment.findMany({
        where: {
          loanId: id,
          status: {
            in: ['PENDING', 'PARTIAL', 'OVERDUE']
          }
        }
      });
      
      // Update each installment individually to set paidAmount = totalAmount
      for (const installment of remainingInstallments) {
        await tx.loanInstallment.update({
          where: { id: installment.id },
          data: {
            paidAmount: installment.totalAmount,
            status: 'PAID',
            paymentDate: new Date(paymentDate)
          }
        });
      }

      // Update loan status to CLOSED
      await tx.loan.update({
        where: { id },
        data: {
          outstandingPrincipal: 0,
          outstandingInterest: 0,
          status: 'CLOSED',
          closureDate: new Date(paymentDate)
        }
      });

      return payment;
    });

    // Create audit log
    await createAuditLog(
      req,
      'LoanPayment',
      settlement.id,
      AuditAction.CREATE,
      null,
      {
        ...settlement,
        isSettlementPayment: true
      }
    );

    return res.status(201).json({
      message: 'Loan settled successfully',
      payment: settlement
    });
  } catch (error) {
    logger.error(`Process early settlement error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to process early settlement');
  }
};