import { Request, Response, NextFunction } from 'express';
import logger from '../../config/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Performance monitoring middleware
 * Tracks API request duration and logs performance metrics
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  // Generate a unique request ID if not already present
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = requestId;
  
  // Record start time
  const start = process.hrtime();
  
  // Log incoming request
  logger.debug('API Request', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Listen for response finish event
  res.on('finish', () => {
    // Calculate duration in milliseconds
    const end = process.hrtime(start);
    const duration = (end[0] * 1e9 + end[1]) / 1e6; // Convert to milliseconds
    
    // Determine log level based on status code and duration
    // Log performance metrics
    if (res.statusCode >= 500) {
      logger.error('API Performance', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`,
        userAgent: req.headers['user-agent'],
        userId: (req as any).user?.id
      });
    } else if (res.statusCode >= 400 || duration > 1000) { // Client errors or slow requests
      logger.warn('API Performance', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`,
        userAgent: req.headers['user-agent'],
        userId: (req as any).user?.id
      });
    } else {
      logger.info('API Performance', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`,
        userAgent: req.headers['user-agent'],
        userId: (req as any).user?.id
      });
    }
  });
  
  next();
};

/**
 * Track API usage for analytics
 * @param data Usage data to record
 */
export const trackApiUsage = async (data: any) => {
  try {
    // This could be implemented to store API usage in database
    // For now, just log it
    logger.info('API Usage', data);
    
    // Example implementation with database:
    // await prisma.apiUsageLog.create({ data });
  } catch (error) {
    logger.error('Failed to track API usage', { error });
  }
};

export default {
  performanceMonitor,
  trackApiUsage
};