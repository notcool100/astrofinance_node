import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { createAuditLog } from '../../../common/utils/audit.util';
import { AuditAction } from '@prisma/client';
import { ApiError } from '../../../common/middleware/error.middleware';
import { sendSMS } from '../services/sms.service';

/**
 * Get all SMS templates
 */
export const getAllSmsTemplates = async (req: Request, res: Response) => {
  try {
    const { event } = req.query;
    
    // Build filter conditions
    const where: any = {};
    
    if (event) {
      where.smsEvents = {
        some: {
          id: event as string
        }
      };
    }
    
    const templates = await prisma.smsTemplate.findMany({
      where,
      include: {
        smsEvents: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return res.json(templates);
  } catch (error) {
    logger.error('Get all SMS templates error:', error);
    throw new ApiError(500, 'Failed to fetch SMS templates');
  }
};

/**
 * Get SMS template by ID
 */
export const getSmsTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const template = await prisma.smsTemplate.findUnique({
      where: { id },
      include: {
        smsEvents: true
      }
    });

    if (!template) {
      throw new ApiError(404, 'SMS template not found');
    }

    return res.json(template);
  } catch (error) {
    logger.error(`Get SMS template by ID error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch SMS template');
  }
};

/**
 * Create new SMS template
 */
export const createSmsTemplate = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      content, 
      category = 'GENERAL', // Default category
      smsEventId, 
      isActive = true 
    } = req.body;

    // Check if SMS event exists
    const smsEvent = await prisma.smsEvent.findUnique({
      where: { id: smsEventId }
    });

    if (!smsEvent) {
      throw new ApiError(404, 'SMS event not found');
    }

    // Check if template with same name already exists
    const existingTemplate = await prisma.smsTemplate.findFirst({
      where: { name }
    });

    if (existingTemplate) {
      throw new ApiError(409, `SMS template with name '${name}' already exists`);
    }

    // Create new SMS template
    const template = await prisma.smsTemplate.create({
      data: {
        name,
        content,
        category,
        characterCount: content.length, // Calculate character count
        smsEvents: {
          connect: { id: smsEventId }
        },
        isActive
      },
      include: {
        smsEvents: true
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'SmsTemplate',
      template.id,
      AuditAction.CREATE,
      null,
      template
    );

    return res.status(201).json(template);
  } catch (error) {
    logger.error(`Create SMS template error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create SMS template');
  }
};

/**
 * Update SMS template
 */
export const updateSmsTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      content, 
      category,
      smsEventId, 
      isActive 
    } = req.body;

    // Check if SMS template exists
    const existingTemplate = await prisma.smsTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      throw new ApiError(404, 'SMS template not found');
    }

    // Check if name is already taken by another template
    if (name && name !== existingTemplate.name) {
      const nameExists = await prisma.smsTemplate.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });

      if (nameExists) {
        throw new ApiError(409, `SMS template with name '${name}' already exists`);
      }
    }

    // Check if SMS event exists if provided
    if (smsEventId) {
      const smsEvent = await prisma.smsEvent.findUnique({
        where: { id: smsEventId }
      });

      if (!smsEvent) {
        throw new ApiError(404, 'SMS event not found');
      }
    }

    // Update SMS template
    const updatedTemplate = await prisma.smsTemplate.update({
      where: { id },
      data: {
        name: name || undefined,
        content: content || undefined,
        category: category || undefined,
        ...(content ? { characterCount: content.length } : {}),
        ...(smsEventId ? {
          smsEvents: {
            connect: { id: smsEventId }
          }
        } : {}),
        isActive: isActive !== undefined ? isActive : undefined
      },
      include: {
        smsEvents: true
      }
    });

    // Create audit log
    await createAuditLog(
      req,
      'SmsTemplate',
      updatedTemplate.id,
      AuditAction.UPDATE,
      existingTemplate,
      updatedTemplate
    );

    return res.json(updatedTemplate);
  } catch (error) {
    logger.error(`Update SMS template error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update SMS template');
  }
};

/**
 * Delete SMS template
 */
export const deleteSmsTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if SMS template exists
    const existingTemplate = await prisma.smsTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      throw new ApiError(404, 'SMS template not found');
    }

    // Delete SMS template
    await prisma.smsTemplate.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog(
      req,
      'SmsTemplate',
      id,
      AuditAction.DELETE,
      existingTemplate,
      null
    );

    return res.json({ message: 'SMS template deleted successfully' });
  } catch (error) {
    logger.error(`Delete SMS template error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete SMS template');
  }
};

/**
 * Get all SMS events
 */
export const getAllSmsEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.smsEvent.findMany({
      orderBy: {
        eventCode: 'asc'
      }
    });

    return res.json(events);
  } catch (error) {
    logger.error('Get all SMS events error:', error);
    throw new ApiError(500, 'Failed to fetch SMS events');
  }
};

/**
 * Send test SMS
 */
export const sendTestSms = async (req: Request, res: Response) => {
  try {
    const { 
      templateId, 
      phoneNumber, 
      placeholders 
    } = req.body;

    // Check if SMS template exists
    const template = await prisma.smsTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new ApiError(404, 'SMS template not found');
    }

    // Send test SMS
    const result = await sendSMS(phoneNumber, template.content, placeholders);

    // Create audit log
    await createAuditLog(
      req,
      'SmsTemplate',
      templateId,
      AuditAction.CREATE, // Using CREATE instead of TEST which doesn't exist
      null,
      { templateId, phoneNumber, placeholders, result }
    );

    return res.json({
      success: true,
      message: 'Test SMS sent successfully',
      details: result
    });
  } catch (error) {
    logger.error(`Send test SMS error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to send test SMS');
  }
};