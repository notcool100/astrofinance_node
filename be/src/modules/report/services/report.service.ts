import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { ReportTemplate } from '@prisma/client';

/**
 * Replace parameters in SQL query
 * 
 * @param query - SQL query with parameters
 * @param parameters - Object containing parameter values
 * @returns Query with parameters replaced
 */
export const replaceParameters = (query: string, parameters: Record<string, any>): string => {
  let result = query;
  
  for (const [key, value] of Object.entries(parameters)) {
    const placeholder = `:${key}`;
    
    // Handle different types of parameters
    let replacement: string;
    if (value === null) {
      replacement = 'NULL';
    } else if (typeof value === 'string') {
      replacement = `'${value.replace(/'/g, "''")}'`; // Escape single quotes
    } else if (value instanceof Date) {
      replacement = `'${value.toISOString()}'`;
    } else if (Array.isArray(value)) {
      // Handle array parameters (for IN clauses)
      const items = value.map(item => {
        if (typeof item === 'string') {
          return `'${item.replace(/'/g, "''")}'`;
        }
        return item;
      });
      replacement = items.join(', ');
    } else {
      replacement = String(value);
    }
    
    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  }
  
  return result;
};

/**
 * Generate report based on template and parameters
 * 
 * @param template - Report template
 * @param parameters - Report parameters
 * @returns Generated report
 */
export const generateReport = async (
  template: ReportTemplate,
  parameters: Record<string, any> = {}
): Promise<any> => {
  try {
    // Validate required parameters
    const requiredParams = Object.entries(template.parameterDefinition as Record<string, any>)
      .filter(([_, config]) => config.required)
      .map(([name]) => name);
    
    const missingParams = requiredParams.filter(param => !(param in parameters));
    if (missingParams.length > 0) {
      throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }
    
    // Replace parameters in query
    const query = replaceParameters(template.queryDefinition as string, parameters);
    
    logger.info(`Executing report query: ${query}`);
    
    // Execute query
    // Note: In a production environment, you would use a more secure way to execute queries
    // This is a simplified implementation for demonstration purposes
    const result = await prisma.$queryRawUnsafe(query);
    
    return {
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category
      },
      parameters,
      generatedAt: new Date(),
      data: result
    };
  } catch (error) {
    logger.error(`Failed to generate report: ${error}`);
    throw new Error(`Failed to generate report: ${error}`);
  }
};