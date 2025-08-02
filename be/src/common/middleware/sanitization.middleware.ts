import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import logger from '../../config/logger';

/**
 * Sanitize request body, query, and params
 * Removes potentially dangerous characters and patterns
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Function to sanitize a string
  const sanitizeString = (str: string): string => {
    if (!str) return str;
    
    // Remove script tags and other potentially dangerous HTML
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/\b(alert|confirm|prompt|console\.log)\s*\(/gi, '');
  };

  // Function to recursively sanitize an object
  const sanitizeObject = (obj: any): any => {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body, query, and params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Middleware to validate request data and return appropriate errors
 * @param validations Array of validation middleware
 */
export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) break;
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Log validation errors
    logger.warn('Validation error', {
      path: req.path,
      method: req.method,
      errors: errors.array()
    });

    // Return validation errors
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: 'path' in err ? err.path : (err as any).param || 'unknown',
        message: err.msg
      }))
    });
  };
};

export default {
  sanitizeInput,
  validate
};