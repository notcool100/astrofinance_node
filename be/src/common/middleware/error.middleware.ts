import { Request, Response, NextFunction } from 'express';
import { ValidationError as ExpressValidationError } from 'express-validator';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import logger from '../../config/logger';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle specific error types
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    // Handle unique constraint violations
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[]) || ['record'];
      return res.status(409).json({
        error: `A ${field.join(', ')} with this value already exists.`
      });
    }

    // Handle record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Record not found.'
      });
    }

    // Handle other Prisma errors
    return res.status(400).json({
      error: 'Database operation failed.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Handle validation errors from express-validator
  if (Array.isArray(err) && err.length > 0 && err[0].msg !== undefined) {
    const formattedErrors = err.map(e => {
      if ('path' in e) {
        // For newer versions of express-validator
        return { field: e.path, message: e.msg };
      } else if ('param' in e) {
        // For older versions of express-validator
        return { field: e.param, message: e.msg };
      } else {
        // Fallback
        return { field: 'unknown', message: e.msg };
      }
    });

    return res.status(400).json({
      error: 'Validation failed',
      details: formattedErrors
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Invalid or expired token'
    });
  }

  // Default error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Resource not found - ${req.originalUrl}`);
  next(error);
};