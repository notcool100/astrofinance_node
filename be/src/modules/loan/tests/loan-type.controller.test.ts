import { Request, Response } from 'express';
import { getAllLoanTypes, getLoanTypeById, createLoanType, updateLoanType, deleteLoanType, bulkUpdateLoanTypeStatus } from '../controllers/loan-type.controller';
import prisma from '../../../config/database';
import { createAuditLog } from '../../../common/utils/audit.util';
import { ApiError } from '../../../common/middleware/error.middleware';
import cacheUtil, { caches } from '../../../common/utils/cache.util';

// Mock dependencies
jest.mock('../../../config/database', () => ({
  loanType: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn()
  }
}));

jest.mock('../../../common/utils/audit.util', () => ({
  createAuditLog: jest.fn()
}));

jest.mock('../../../common/utils/cache.util', () => ({
  getOrFetch: jest.fn(),
  invalidateCache: jest.fn(),
  invalidateAllCache: jest.fn(),
  caches: {
    loanType: {
      keys: jest.fn().mockReturnValue([])
    }
  }
}));

describe('Loan Type Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {},
      body: {},
      user: { id: 'admin-123' }
    };
    
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    // Reset all mocks
    jest.clearAllMocks();
  });
  
  describe('getAllLoanTypes', () => {
    it('should return all loan types with pagination', async () => {
      const mockLoanTypes = [
        { id: '1', name: 'Personal Loan', code: 'PL', isActive: true },
        { id: '2', name: 'Home Loan', code: 'HL', isActive: true }
      ];
      
      const mockCount = 2;
      
      (prisma.loanType.count as jest.Mock).mockResolvedValue(mockCount);
      (cacheUtil.getOrFetch as jest.Mock).mockImplementation(async (cache, key, fetchFn) => {
        return await fetchFn();
      });
      (prisma.loanType.findMany as jest.Mock).mockResolvedValue(mockLoanTypes);
      
      await getAllLoanTypes(mockRequest as Request, mockResponse as Response);
      
      expect(prisma.loanType.count).toHaveBeenCalled();
      expect(prisma.loanType.findMany).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockLoanTypes,
        pagination: {
          total: mockCount,
          page: 1,
          limit: 10,
          pages: 1
        }
      });
    });
    
    it('should filter by active status', async () => {
      mockRequest.query = { active: 'true' };
      
      const mockLoanTypes = [
        { id: '1', name: 'Personal Loan', code: 'PL', isActive: true }
      ];
      
      const mockCount = 1;
      
      (prisma.loanType.count as jest.Mock).mockResolvedValue(mockCount);
      (cacheUtil.getOrFetch as jest.Mock).mockImplementation(async (cache, key, fetchFn) => {
        return await fetchFn();
      });
      (prisma.loanType.findMany as jest.Mock).mockResolvedValue(mockLoanTypes);
      
      await getAllLoanTypes(mockRequest as Request, mockResponse as Response);
      
      expect(prisma.loanType.count).toHaveBeenCalledWith({
        where: { isActive: true }
      });
      
      expect(prisma.loanType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true }
        })
      );
    });
    
    it('should handle search functionality', async () => {
      mockRequest.query = { search: 'personal' };
      
      const mockLoanTypes = [
        { id: '1', name: 'Personal Loan', code: 'PL', isActive: true }
      ];
      
      const mockCount = 1;
      
      (prisma.loanType.count as jest.Mock).mockResolvedValue(mockCount);
      (cacheUtil.getOrFetch as jest.Mock).mockImplementation(async (cache, key, fetchFn) => {
        return await fetchFn();
      });
      (prisma.loanType.findMany as jest.Mock).mockResolvedValue(mockLoanTypes);
      
      await getAllLoanTypes(mockRequest as Request, mockResponse as Response);
      
      expect(prisma.loanType.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'personal', mode: 'insensitive' } },
            { code: { contains: 'personal', mode: 'insensitive' } }
          ]
        }
      });
    });
  });
  
  describe('getLoanTypeById', () => {
    it('should return a loan type by ID', async () => {
      mockRequest.params = { id: '1' };
      
      const mockLoanType = {
        id: '1',
        name: 'Personal Loan',
        code: 'PL',
        isActive: true
      };
      
      (cacheUtil.getOrFetch as jest.Mock).mockImplementation(async (cache, key, fetchFn) => {
        return await fetchFn();
      });
      (prisma.loanType.findUnique as jest.Mock).mockResolvedValue(mockLoanType);
      
      await getLoanTypeById(mockRequest as Request, mockResponse as Response);
      
      expect(prisma.loanType.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      
      expect(mockResponse.json).toHaveBeenCalledWith(mockLoanType);
    });
    
    it('should throw an error if loan type is not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      
      (cacheUtil.getOrFetch as jest.Mock).mockImplementation(async (cache, key, fetchFn) => {
        return await fetchFn();
      });
      (prisma.loanType.findUnique as jest.Mock).mockResolvedValue(null);
      
      await expect(getLoanTypeById(mockRequest as Request, mockResponse as Response))
        .rejects
        .toThrow(new ApiError(404, 'Loan type not found'));
    });
  });
  
  describe('createLoanType', () => {
    it('should create a new loan type', async () => {
      mockRequest.body = {
        name: 'New Loan',
        code: 'NL',
        interestType: 'FLAT',
        minAmount: 1000,
        maxAmount: 10000,
        minTenure: 3,
        maxTenure: 12,
        interestRate: 10,
        isActive: true
      };
      
      const mockCreatedLoanType = {
        id: '3',
        ...mockRequest.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      (prisma.loanType.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.loanType.create as jest.Mock).mockResolvedValue(mockCreatedLoanType);
      
      await createLoanType(mockRequest as Request, mockResponse as Response);
      
      expect(prisma.loanType.findFirst).toHaveBeenCalled();
      expect(prisma.loanType.create).toHaveBeenCalledWith({
        data: mockRequest.body
      });
      expect(createAuditLog).toHaveBeenCalled();
      expect(cacheUtil.invalidateAllCache).toHaveBeenCalledWith(caches.loanType);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedLoanType);
    });
    
    it('should throw an error if loan type with same code already exists', async () => {
      mockRequest.body = {
        name: 'New Loan',
        code: 'PL',
        interestType: 'FLAT',
        minAmount: 1000,
        maxAmount: 10000,
        minTenure: 3,
        maxTenure: 12,
        interestRate: 10,
        isActive: true
      };
      
      const existingLoanType = {
        id: '1',
        name: 'Personal Loan',
        code: 'PL',
        isActive: true
      };
      
      (prisma.loanType.findFirst as jest.Mock).mockResolvedValue(existingLoanType);
      
      await expect(createLoanType(mockRequest as Request, mockResponse as Response))
        .rejects
        .toThrow(new ApiError(409, "Loan type with code 'PL' already exists"));
    });
  });
  
  describe('updateLoanType', () => {
    it('should update a loan type', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Updated Loan',
        interestRate: 12
      };
      
      const existingLoanType = {
        id: '1',
        name: 'Personal Loan',
        code: 'PL',
        interestType: 'FLAT',
        minAmount: 1000,
        maxAmount: 10000,
        minTenure: 3,
        maxTenure: 12,
        interestRate: 10,
        isActive: true
      };
      
      const updatedLoanType = {
        ...existingLoanType,
        name: 'Updated Loan',
        interestRate: 12
      };
      
      (prisma.loanType.findUnique as jest.Mock).mockResolvedValue(existingLoanType);
      (prisma.loanType.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.loanType.update as jest.Mock).mockResolvedValue(updatedLoanType);
      
      await updateLoanType(mockRequest as Request, mockResponse as Response);
      
      expect(prisma.loanType.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(prisma.loanType.update).toHaveBeenCalled();
      expect(createAuditLog).toHaveBeenCalled();
      expect(cacheUtil.invalidateCache).toHaveBeenCalledWith(caches.loanType, 'loanType_1');
      expect(cacheUtil.invalidateAllCache).toHaveBeenCalledWith(caches.loanType);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedLoanType);
    });
    
    it('should throw an error if loan type is not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockRequest.body = {
        name: 'Updated Loan'
      };
      
      (prisma.loanType.findUnique as jest.Mock).mockResolvedValue(null);
      
      await expect(updateLoanType(mockRequest as Request, mockResponse as Response))
        .rejects
        .toThrow(new ApiError(404, 'Loan type not found'));
    });
  });
  
  describe('deleteLoanType', () => {
    it('should delete a loan type', async () => {
      mockRequest.params = { id: '1' };
      
      const existingLoanType = {
        id: '1',
        name: 'Personal Loan',
        code: 'PL',
        isActive: true,
        _count: {
          loans: 0,
          loanApplications: 0
        }
      };
      
      (prisma.loanType.findUnique as jest.Mock).mockResolvedValue(existingLoanType);
      (prisma.loanType.delete as jest.Mock).mockResolvedValue(existingLoanType);
      
      await deleteLoanType(mockRequest as Request, mockResponse as Response);
      
      expect(prisma.loanType.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          _count: {
            select: {
              loans: true,
              loanApplications: true
            }
          }
        }
      });
      expect(prisma.loanType.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(createAuditLog).toHaveBeenCalled();
      expect(cacheUtil.invalidateCache).toHaveBeenCalledWith(caches.loanType, 'loanType_1');
      expect(cacheUtil.invalidateAllCache).toHaveBeenCalledWith(caches.loanType);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Loan type deleted successfully' });
    });
    
    it('should throw an error if loan type is used in loans or applications', async () => {
      mockRequest.params = { id: '1' };
      
      const existingLoanType = {
        id: '1',
        name: 'Personal Loan',
        code: 'PL',
        isActive: true,
        _count: {
          loans: 1,
          loanApplications: 0
        }
      };
      
      (prisma.loanType.findUnique as jest.Mock).mockResolvedValue(existingLoanType);
      
      await expect(deleteLoanType(mockRequest as Request, mockResponse as Response))
        .rejects
        .toThrow(new ApiError(400, 'Cannot delete loan type that is used in loans or applications'));
    });
  });
  
  describe('bulkUpdateLoanTypeStatus', () => {
    it('should update multiple loan types status', async () => {
      mockRequest.body = {
        ids: ['1', '2'],
        isActive: false
      };
      
      const loanType1 = {
        id: '1',
        name: 'Personal Loan',
        code: 'PL',
        isActive: true
      };
      
      const loanType2 = {
        id: '2',
        name: 'Home Loan',
        code: 'HL',
        isActive: true
      };
      
      (prisma.loanType.updateMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.loanType.findUnique as jest.Mock)
        .mockResolvedValueOnce(loanType1)
        .mockResolvedValueOnce(loanType2);
      
      await bulkUpdateLoanTypeStatus(mockRequest as Request, mockResponse as Response);
      
      expect(prisma.loanType.updateMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['1', '2']
          }
        },
        data: {
          isActive: false
        }
      });
      expect(createAuditLog).toHaveBeenCalledTimes(2);
      expect(cacheUtil.invalidateCache).toHaveBeenCalledTimes(2);
      expect(cacheUtil.invalidateAllCache).toHaveBeenCalledWith(caches.loanType);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Successfully updated 2 loan types',
        count: 2
      });
    });
    
    it('should throw an error if no IDs are provided', async () => {
      mockRequest.body = {
        ids: [],
        isActive: false
      };
      
      await expect(bulkUpdateLoanTypeStatus(mockRequest as Request, mockResponse as Response))
        .rejects
        .toThrow(new ApiError(400, 'No loan type IDs provided'));
    });
  });
});