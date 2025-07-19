// ============================================================================
// ERROR HANDLING MIDDLEWARE
// These functions handle different types of errors in the application
// ============================================================================

/**
 * Global Error Handler Middleware
 * This middleware catches all errors that occur in the application
 * It should be the LAST middleware in the chain
 * 
 * @param {Error} error - The error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * 
 * Usage:
 * app.use(errorHandler); // Add this at the end of your middleware chain
 * 
 * How it works:
 * 1. Catches any error thrown in previous middleware or route handlers
 * 2. Logs the error for debugging
 * 3. Sends appropriate error response to client
 * 4. Never exposes sensitive information in production
 */
const errorHandler = (error, req, res, next) => {
  // Log the error for debugging (in development)
  console.error('❌ Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle different types of errors
  if (error.name === 'SequelizeValidationError') {
    // Database validation errors
    const validationErrors = error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    // Database unique constraint errors (e.g., duplicate email)
    return res.status(400).json({
      success: false,
      message: 'Data already exists',
      error: 'This record already exists in the database'
    });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    // Database foreign key errors
    return res.status(400).json({
      success: false,
      message: 'Invalid reference',
      error: 'Referenced data does not exist'
    });
  }

  if (error.name === 'JsonWebTokenError') {
    // JWT token errors
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'Please login again'
    });
  }

  if (error.name === 'TokenExpiredError') {
    // JWT token expiration errors
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: 'Please login again'
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message: message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * 404 Not Found Handler
 * This middleware handles requests to routes that don't exist
 * It should be placed BEFORE the error handler but AFTER all other routes
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * 
 * Usage:
 * app.use(notFoundHandler); // Add this before errorHandler
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.url}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async Error Wrapper
 * This utility function wraps async route handlers to catch errors
 * Without this, async errors might not be caught by the error handler
 * 
 * @param {function} fn - The async route handler function
 * @returns {function} - Wrapped function that catches errors
 * 
 * Usage:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.findAll();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom Error Class
 * This class allows you to create custom errors with status codes
 * 
 * Usage:
 * throw new AppError('User not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * Validation Error Handler
 * This middleware specifically handles validation errors from express-validator
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const validationErrorHandler = (req, res, next) => {
  // Check if there are validation errors
  const errors = req.validationErrors;
  
  if (errors && errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  next();
};

/**
 * Rate Limiting Error Handler
 * This middleware handles rate limiting errors
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const rateLimitErrorHandler = (req, res, next) => {
  if (req.rateLimit) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests',
      error: 'Please try again later',
      retryAfter: req.rateLimit.resetTime
    });
  }
  
  next();
};

// Export all error handling utilities
module.exports = {
  errorHandler,           // Main error handler
  notFoundHandler,        // 404 handler
  asyncHandler,           // Async error wrapper
  AppError,               // Custom error class
  validationErrorHandler, // Validation error handler
  rateLimitErrorHandler   // Rate limiting error handler
};
