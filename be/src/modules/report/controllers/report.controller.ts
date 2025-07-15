import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction } from '@prisma/client';
import { ApiError } from '../../../common/middleware/error.middleware';
import { generateReport } from '../services/report.service';

/**
 * Get all report templates
 */
export const getAllReportTemplates = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    // Build filter conditions
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    const templates = await prisma.reportTemplate.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    return res.json(templates);
  } catch (error) {
    logger.error('Get all report templates error:', error);
    throw new ApiError(500, 'Failed to fetch report templates');
  }
};

/**
 * Get report template by ID
 */
export const getReportTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const template = await prisma.reportTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      throw new ApiError(404, 'Report template not found');
    }

    return res.json(template);
  } catch (error) {
    logger.error(`Get report template by ID error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch report template');
  }
};

/**
 * Create new report template
 */
export const createReportTemplate = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      category, 
      query, 
      parameters, 
      isActive = true 
    } = req.body;

    // Check if template with same name already exists
    const existingTemplate = await prisma.reportTemplate.findFirst({
      where: { name }
    });

    if (existingTemplate) {
      throw new ApiError(409, `Report template with name '${name}' already exists`);
    }

    // Create new report template
    const template = await prisma.reportTemplate.create({
      data: {
        name,
        description,
        category,
        queryDefinition: query,
        parameterDefinition: parameters || {},
        layoutDefinition: {}, // Adding required field
        isActive
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'ReportTemplate',
      template.id,
      AuditAction.CREATE,
      null,
      template
    );

    return res.status(201).json(template);
  } catch (error) {
    logger.error(`Create report template error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create report template');
  }
};

/**
 * Update report template
 */
export const updateReportTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      category, 
      query, 
      parameters, 
      isActive 
    } = req.body;

    // Check if report template exists
    const existingTemplate = await prisma.reportTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      throw new ApiError(404, 'Report template not found');
    }

    // Check if name is already taken by another template
    if (name && name !== existingTemplate.name) {
      const nameExists = await prisma.reportTemplate.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });

      if (nameExists) {
        throw new ApiError(409, `Report template with name '${name}' already exists`);
      }
    }

    // Update report template
    const updatedTemplate = await prisma.reportTemplate.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        category: category || undefined,
        queryDefinition: query || undefined,
        parameterDefinition: parameters || undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'ReportTemplate',
      updatedTemplate.id,
      AuditAction.UPDATE,
      existingTemplate,
      updatedTemplate
    );

    return res.json(updatedTemplate);
  } catch (error) {
    logger.error(`Update report template error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update report template');
  }
};

/**
 * Delete report template
 */
export const deleteReportTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if report template exists
    const existingTemplate = await prisma.reportTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      throw new ApiError(404, 'Report template not found');
    }

    // Delete report template
    await prisma.reportTemplate.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog(
      req,
      'ReportTemplate',
      id,
      AuditAction.DELETE,
      existingTemplate,
      null
    );

    return res.json({ message: 'Report template deleted successfully' });
  } catch (error) {
    logger.error(`Delete report template error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete report template');
  }
};

/**
 * Generate report
 */
export const runReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { parameters } = req.body;

    // Check if report template exists
    const template = await prisma.reportTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      throw new ApiError(404, 'Report template not found');
    }

    if (!template.isActive) {
      throw new ApiError(400, 'Report template is inactive');
    }

    // Generate report
    const report = await generateReport(template, parameters);

    // Create audit log
    await createAuditLog(
      req,
      'ReportTemplate',
      id,
      AuditAction.CREATE, // Using CREATE instead of RUN which doesn't exist
      { parameters },
      { reportGenerated: true, rowCount: report.data.length }
    );

    return res.json(report);
  } catch (error) {
    logger.error(`Generate report error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to generate report');
  }
};