import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

/**
 * Middleware to validate request data using Joi
 * @param schema Joi schema to validate against
 * @param property Request property to validate (body, params, query)
 * @param additionalParams Additional parameters to include from other properties
 */
export const validateRequest = (
  schema: Schema,
  property: 'body' | 'params' | 'query' = 'body',
  additionalParams: string[] = []
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Create an object with the data to validate
    let dataToValidate = { ...req[property] };
    
    // Add additional parameters from other properties if specified
    if (additionalParams.length > 0) {
      additionalParams.forEach(param => {
        if (param in req.params) {
          dataToValidate[param] = req.params[param];
        } else if (param in req.query) {
          dataToValidate[param] = req.query[param];
        } else if (param in req.body) {
          dataToValidate[param] = req.body[param];
        }
      });
    }
    
    // Validate the data against the schema
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      // Format validation errors
      const formattedErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formattedErrors
      });
    }
    
    // Update the validated data in the request
    req[property] = value;
    next();
  };
};