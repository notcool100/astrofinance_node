import { Request, Response, NextFunction } from 'express';
import { Schema } from 'yup';

/**
 * Middleware to validate request data using Yup schemas
 * @param schema Yup schema for validation
 */
export const validateRequest = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request against schema
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params
      }, { abortEarly: false });
      
      // If validation passes, proceed to the next middleware
      return next();
    } catch (error: any) {
      // Format Yup validation errors
      const errors = error.inner.map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
  };
};