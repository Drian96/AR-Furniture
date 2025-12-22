const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Audit logging middleware
 * Automatically logs user actions for audit purposes
 */
const auditLogger = (action, category, description) => {
  return async (req, res, next) => {
    // Store original res.json to intercept the response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log the action after the response is sent
      logAuditAction(req, action, category, description, data)
        .catch(err => console.error('Audit logging error:', err));
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Log audit action to database
 */
const logAuditAction = async (req, action, category, description, responseData) => {
  try {
    // Prefer authenticated user email; fall back to incoming email (e.g., login) or anonymous
    const userEmail = req.user?.email || req.body?.email || 'anonymous';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const success = responseData?.success !== false; // Default to true unless explicitly false
    
    const details = {
      endpoint: req.originalUrl,
      method: req.method,
      response_status: responseData?.success ? 'success' : 'error',
      timestamp: new Date().toISOString()
    };
    
    await sequelize.query(
      `INSERT INTO audit_logs (user_email, action, category, description, ip_address, user_agent, success, details)
       VALUES (:user_email, :action, :category, :description, :ip_address, :user_agent, :success, :details)`,
      {
        type: QueryTypes.INSERT,
        replacements: {
          user_email: userEmail,
          action: action,
          category: category,
          description: description,
          ip_address: ipAddress,
          user_agent: userAgent,
          success: success,
          details: JSON.stringify(details)
        }
      }
    );
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
};

/**
 * Manual audit logging function
 * Use this for specific actions that need to be logged
 */
const logManualAudit = async (userEmail, action, category, description, ipAddress, userAgent, success = true, additionalDetails = {}) => {
  try {
    const details = {
      ...additionalDetails,
      timestamp: new Date().toISOString(),
      manual_log: true
    };
    
    await sequelize.query(
      `INSERT INTO audit_logs (user_email, action, category, description, ip_address, user_agent, success, details)
       VALUES (:user_email, :action, :category, :description, :ip_address, :user_agent, :success, :details)`,
      {
        type: QueryTypes.INSERT,
        replacements: {
          user_email: userEmail,
          action: action,
          category: category,
          description: description,
          ip_address: ipAddress || 'unknown',
          user_agent: userAgent || 'unknown',
          success: success,
          details: JSON.stringify(details)
        }
      }
    );
  } catch (error) {
    console.error('Failed to log manual audit action:', error);
  }
};

module.exports = {
  auditLogger,
  logManualAudit
};
