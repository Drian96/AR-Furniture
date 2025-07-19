// Import express-validator for input validation
// express-validator provides a set of validation functions for Express.js
const { body, validationResult } = require('express-validator');

// ============================================================================
// INPUT VALIDATION UTILITIES
// ============================================================================

/**
 * Get validation errors from express-validator
 * This function extracts error messages from validation results
 * 
 * @param {object} req - Express request object
 * @returns {array} - Array of error messages
 * 
 * Example usage:
 * const errors = getValidationErrors(req);
 * if (errors.length > 0) {
 *   return res.status(400).json({ errors });
 * }
 */
const getValidationErrors = (req) => {
  // Get validation results from the request
  const errors = validationResult(req);
  
  // If there are validation errors, format them
  if (!errors.isEmpty()) {
    // Map errors to a simple array of error messages
    return errors.array().map(error => error.msg);
  }
  
  // Return empty array if no errors
  return [];
};

/**
 * Validation rules for user registration
 * These rules define what data is required and how it should be formatted
 * 
 * Usage:
 * router.post('/register', registerValidation, registerController);
 */
const registerValidation = [
  // Validate first name
  body('firstName')
    .trim()                    // Remove whitespace
    .notEmpty()                // Must not be empty
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 }) // Must be 2-50 characters
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)  // Only letters and spaces allowed
    .withMessage('First name can only contain letters and spaces'),

  // Validate last name
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  // Validate email
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()                 // Must be valid email format
    .withMessage('Please enter a valid email address')
    .normalizeEmail()          // Normalize email (lowercase, etc.)
    .isLength({ max: 255 })    // Must not exceed 255 characters
    .withMessage('Email is too long'),

  // Validate password
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })      // Must be at least 8 characters
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) // Must contain lowercase, uppercase, and number
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  // Validate phone number (optional)
  body('phone')
    .optional()                // This field is optional
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/) // International phone format
    .withMessage('Please enter a valid phone number'),

  // Validate date of birth (optional)
  body('dateOfBirth')
    .optional()
    .isISO8601()              // Must be valid date format
    .withMessage('Please enter a valid date of birth')
    .custom((value) => {
      // Check if user is at least 13 years old
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 13) {
        throw new Error('You must be at least 13 years old to register');
      }
      
      return true;
    }),

  // Validate gender (optional)
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other']) // Must be one of these values
    .withMessage('Gender must be male, female, or other')
];

/**
 * Validation rules for user login
 * These rules validate login credentials
 * 
 * Usage:
 * router.post('/login', loginValidation, loginController);
 */
const loginValidation = [
  // Validate email
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  // Validate password
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for password change
 * These rules validate password change requests
 * 
 * Usage:
 * router.post('/change-password', changePasswordValidation, changePasswordController);
 */
const changePasswordValidation = [
  // Validate current password
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  // Validate new password
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),

  // Validate password confirmation
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      // Check if confirmation matches new password
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * Validation rules for profile update
 * These rules validate profile update requests
 * 
 * Usage:
 * router.put('/profile', profileUpdateValidation, updateProfileController);
 */
const profileUpdateValidation = [
  // Validate first name
  body('firstName')
    .optional()                // Optional for updates
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  // Validate last name
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  // Validate phone number
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),

  // Validate date of birth
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date of birth'),

  // Validate gender
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  // Validate notification preferences
  body('emailNotifications')
    .optional()
    .isBoolean()              // Must be true or false
    .withMessage('Email notifications must be true or false'),

  body('smsNotifications')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications must be true or false')
];

// Export all validation utilities
module.exports = {
  getValidationErrors,        // Function to extract validation errors
  registerValidation,         // Validation rules for registration
  loginValidation,           // Validation rules for login
  changePasswordValidation,   // Validation rules for password change
  profileUpdateValidation     // Validation rules for profile update
}; 