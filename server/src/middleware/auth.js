// Import required modules and utilities
const User = require('../models/User'); // Our User model
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt'); // JWT utilities

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// These functions protect routes and handle user authentication
// ============================================================================

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user data to request
 * This middleware should be used on routes that require authentication
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function (calls next middleware)
 * 
 * Usage:
 * router.get('/profile', authenticateToken, getProfileController);
 * 
 * How it works:
 * 1. Extracts token from Authorization header
 * 2. Verifies the token is valid
 * 3. Finds the user in database
 * 4. Attaches user data to req.user
 * 5. Calls next() to continue to the route handler
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get the Authorization header from the request
    const authHeader = req.headers.authorization;
    
    // Extract the token from the header (removes 'Bearer ' prefix)
    const token = extractTokenFromHeader(authHeader);
    
    // If no token is provided, return unauthorized error
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify the token and get the decoded payload
    const decoded = verifyToken(token);
    
    // Find the user in the database using the ID from the token
    const user = await User.findByPk(decoded.id);
    
    // If user doesn't exist, return unauthorized error
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user account is active
    if (!user.isActive()) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Attach the user data to the request object
    // This makes user data available in route handlers via req.user
    req.user = user;
    
    // Call next() to continue to the next middleware or route handler
    next();

  } catch (error) {
    // Handle different types of JWT errors
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    } else if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    } else {
      console.error('❌ Authentication middleware error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  }
};

/**
 * Role-Based Access Control Middleware
 * Checks if the authenticated user has the required role
 * This middleware should be used AFTER authenticateToken middleware
 * 
 * @param {string|array} allowedRoles - Role(s) that are allowed to access the route
 * @returns {function} - Middleware function
 * 
 * Usage:
 * // Single role
 * router.get('/admin', authenticateToken, requireRole('admin'), adminController);
 * 
 * // Multiple roles
 * router.get('/management', authenticateToken, requireRole(['admin', 'manager']), managementController);
 * 
 * How it works:
 * 1. Gets user from req.user (set by authenticateToken)
 * 2. Checks if user's role is in the allowed roles
 * 3. If allowed, calls next() to continue
 * 4. If not allowed, returns forbidden error
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Get user from request (set by authenticateToken middleware)
      const user = req.user;
      
      // Convert single role to array for easier handling
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      // Check if user's role is in the allowed roles
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }
      
      // If user has required role, continue to next middleware/route handler
      next();
      
    } catch (error) {
      console.error('❌ Role middleware error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Optional Authentication Middleware
 * Similar to authenticateToken but doesn't require authentication
 * If token is provided and valid, attaches user data to request
 * If no token or invalid token, continues without user data
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * 
 * Usage:
 * router.get('/public-data', optionalAuth, publicDataController);
 * 
 * How it works:
 * 1. Tries to extract and verify token
 * 2. If valid, attaches user data to req.user
 * 3. If invalid or no token, continues without user data
 * 4. Always calls next() to continue
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get the Authorization header from the request
    const authHeader = req.headers.authorization;
    
    // If no authorization header, continue without authentication
    if (!authHeader) {
      return next();
    }
    
    // Extract the token from the header
    const token = extractTokenFromHeader(authHeader);
    
    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    // Try to verify the token
    const decoded = verifyToken(token);
    
    // Find the user in the database
    const user = await User.findByPk(decoded.id);
    
    // If user exists and is active, attach to request
    if (user && user.isActive()) {
      req.user = user;
    }
    
    // Always continue to next middleware/route handler
    next();

  } catch (error) {
    // If token verification fails, continue without user data
    // Don't return error since authentication is optional
    console.log('⚠️ Optional auth: Invalid token provided, continuing without authentication');
    next();
  }
};

/**
 * Admin Only Middleware
 * Convenience middleware that requires admin role
 * This is equivalent to requireRole('admin')
 * 
 * Usage:
 * router.get('/admin-only', authenticateToken, requireAdmin, adminController);
 */
const requireAdmin = requireRole('admin');

/**
 * Customer Only Middleware
 * Convenience middleware that requires customer role
 * 
 * Usage:
 * router.get('/customer-only', authenticateToken, requireCustomer, customerController);
 */
const requireCustomer = requireRole('customer');

/**
 * Staff Only Middleware
 * Convenience middleware that requires staff role (admin, manager, or staff)
 * 
 * Usage:
 * router.get('/staff-only', authenticateToken, requireStaff, staffController);
 */
const requireStaff = requireRole(['admin', 'manager', 'staff']);

// Export all middleware functions
module.exports = {
  authenticateToken,  // Main authentication middleware
  requireRole,        // Role-based access control
  optionalAuth,       // Optional authentication
  requireAdmin,       // Admin-only access
  requireCustomer,    // Customer-only access
  requireStaff        // Staff-only access
};
