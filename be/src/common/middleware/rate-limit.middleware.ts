import rateLimit from 'express-rate-limit';
import logger from '../../config/logger';

/**
 * Standard API rate limiter
 * Limits requests to 100 per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent']
    });
    res.status(options.statusCode).json({
      status: 'error',
      message: options.message
    });
  }
});

/**
 * Stricter rate limiter for authentication routes
 * Limits requests to 20 per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    logger.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent']
    });
    res.status(options.statusCode).json({
      status: 'error',
      message: options.message
    });
  }
});

export default {
  apiLimiter,
  authLimiter
};