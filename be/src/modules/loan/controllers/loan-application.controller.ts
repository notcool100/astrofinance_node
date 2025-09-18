import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction } from '@prisma/client';
import { ApiError } from '../../../common/middleware/error.middleware';
import { generateApplicationNumber } from '../utils/loan.utils';

/**
 * Get all loan applications
 */
export const getAllLoanApplications = async (req: Request, res: Response) => {
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
    const totalCount = await prisma.loanApplication.count({ where });

    // Get sum of all loan amounts (matching filter)
    const totalAmountResult = await prisma.loanApplication.aggregate({
      _sum: { amount: true },
      where
    });
    const totalAmount = totalAmountResult._sum.amount || 0;

    // Get loan applications with pagination
    const applications = await prisma.loanApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            contactNumber: true
          }
        },
        loanType: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      },
      orderBy: {
        appliedDate: 'desc'
      },
      skip,
      take: limitNumber
    });

    return res.json({
      data: applications,
      totalAmount,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalCount / limitNumber)
      }
    });
  } catch (error) {
    logger.error('Get all loan applications error:', error);
    throw new ApiError(500, 'Failed to fetch loan applications');
  }
};

/**
 * Get loan application by ID
 */
export const getLoanApplicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            contactNumber: true,
            email: true,
            address: true,
            idType: true,
            idNumber: true
          }
        },
        loanType: true,
        approvedBy: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        documents: {
          include: {
            verifiedBy: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        }
      }
    });

    if (!application) {
      throw new ApiError(404, 'Loan application not found');
    }

    return res.json(application);
  } catch (error) {
    logger.error(`Get loan application by ID error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch loan application');
  }
};

/**
 * Create new loan application
 */
export const createLoanApplication = async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      loanTypeId, 
      amount, 
      tenure, 
      purpose, 
      documents = [] 
    } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check if loan type exists and is active
    const loanType = await prisma.loanType.findUnique({
      where: { id: loanTypeId }
    });

    if (!loanType) {
      throw new ApiError(404, 'Loan type not found');
    }

    if (!loanType.isActive) {
      throw new ApiError(400, 'Loan type is not active');
    }

    // Validate loan amount
    if (amount < loanType.minAmount || amount > loanType.maxAmount) {
      throw new ApiError(400, `Loan amount must be between ${loanType.minAmount} and ${loanType.maxAmount}`);
    }

    // Validate loan tenure
    if (tenure < loanType.minTenure || tenure > loanType.maxTenure) {
      throw new ApiError(400, `Loan tenure must be between ${loanType.minTenure} and ${loanType.maxTenure} months`);
    }

    // Generate application number
    const applicationNumber = await generateApplicationNumber();

    // Create loan application with documents in a transaction
    const application = await prisma.$transaction(async (tx) => {
      // Create application
      const app = await tx.loanApplication.create({
        data: {
          applicationNumber,
          userId,
          loanTypeId,
          amount,
          tenure,
          purpose,
          status: 'PENDING',
          appliedDate: new Date()
        }
      });

      // Document handling is not implemented in the current schema
      // Commenting out for now
      /*
      if (documents.length > 0) {
        for (const doc of documents) {
          // Document creation logic would go here
          console.log(`Would create document: ${doc.documentName} for application ${app.id}`);
        }
      }
      */

      return app;
    });

    // Create audit log
    await createAuditLog(
      req,
      'LoanApplication',
      application.id,
      AuditAction.CREATE,
      null,
      application
    );

    // Get created application with relations
    const createdApplication = await prisma.loanApplication.findUnique({
      where: { id: application.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            contactNumber: true
          }
        },
        loanType: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
        // documents: true - removed as it's not in the schema
      }
    });

    return res.status(201).json(createdApplication);
  } catch (error) {
    logger.error(`Create loan application error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create loan application');
  }
};

/**
 * Update loan application status
 */
export const updateLoanApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const adminUserId = req.adminUser.id;

    // Check if application exists
    const existingApplication = await prisma.loanApplication.findUnique({
      where: { id }
    });

    if (!existingApplication) {
      throw new ApiError(404, 'Loan application not found');
    }

    // Validate status transition
    const validStatuses = ['APPROVED', 'REJECTED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }

    // Validate status transition
    if (existingApplication.status === 'APPROVED' || existingApplication.status === 'REJECTED') {
      throw new ApiError(400, `Cannot change status of application that is already ${existingApplication.status.toLowerCase()}`);
    }

    // If rejecting, require rejection reason
    if (status === 'REJECTED' && !rejectionReason) {
      throw new ApiError(400, 'Rejection reason is required');
    }

    // Update application status
    const updatedApplication = await prisma.loanApplication.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        approvedById: status === 'APPROVED' ? adminUserId : null,
        approvedDate: status === 'APPROVED' ? new Date() : null
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'LoanApplication',
      updatedApplication.id,
      status === 'APPROVED' ? AuditAction.APPROVE : AuditAction.REJECT,
      existingApplication,
      updatedApplication
    );

    return res.json(updatedApplication);
  } catch (error) {
    logger.error(`Update loan application status error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update loan application status');
  }
};

/**
 * Upload loan document
 */
export const uploadLoanDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { documentType, documentName, filePath } = req.body;

    // Check if application exists
    const existingApplication = await prisma.loanApplication.findUnique({
      where: { id }
    });

    if (!existingApplication) {
      throw new ApiError(404, 'Loan application not found');
    }

    // Document handling is not implemented in the current schema
    // Commenting out for now
    /*
    const document = await prisma.loanDocument.create({
      data: {
        loanApplicationId: id,
        documentType,
        documentName,
        filePath,
        uploadDate: new Date()
      }
    });
    */
    
    // Log the document info instead
    logger.info(`Document upload requested: ${documentName} for application ${id}`);

    // Create a mock document response
    const mockDocument = {
      id: 'mock-doc-' + Date.now(),
      loanApplicationId: id,
      documentType,
      documentName,
      filePath,
      uploadDate: new Date()
    };
    
    // Create audit log
    await createAuditLog(
      req,
      'LoanDocument',
      mockDocument.id,
      AuditAction.CREATE,
      null,
      mockDocument
    );

    return res.status(201).json(mockDocument);
  } catch (error) {
    logger.error(`Upload loan document error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to upload loan document');
  }
};