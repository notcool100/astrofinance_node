import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';

/**
 * Middleware to validate request data using express-validator
 * @param validations Array of validation chains
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Return validation errors
    const formattedErrors = errors.array().map((err: ValidationError) => {
      if ('path' in err) {
        // For newer versions of express-validator
        return {
          field: err.path,
          message: err.msg
        };
      } else if ('param' in err) {
        // For older versions of express-validator
        return {
          field: err.param,
          message: err.msg
        };
      } else {
        // Fallback
        return {
          field: 'unknown',
          message: err.msg
        };
      }
    });
    
    return res.status(400).json({
      error: 'Validation failed',
      details: formattedErrors
    });
  };
};