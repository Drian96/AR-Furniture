// Import required modules and utilities
const User = require('../models/User'); // Our User model
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/passwordUtils'); // Password utilities
const { generateToken, verifyToken } = require('../utils/jwt'); // JWT utilities
const { getValidationErrors } = require('../utils/validation'); // Validation utilities
const { sendVerificationEmail } = require('../utils/email');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// ============================================================================
// AUTHENTICATION CONTROLLERS
// These functions handle login, signup, and user management
// ============================================================================

/**
 * User Registration Controller
 * Handles new user account creation
 * 
 * @param {object} req - Express request object (contains user data)
 * @param {object} res - Express response object (sends response to client)
 * 
 * Expected request body:
 * {
 *   firstName: "John",
 *   lastName: "Doe", 
 *   email: "john@example.com",
 *   password: "MyPassword123",
 *   phone: "+1234567890" (optional),
 *   dateOfBirth: "1990-01-01" (optional),
 *   gender: "male" (optional)
 * }
 */
const register = async (req, res) => {
  try {
    console.log('🔄 Processing user registration...');

    // Check for validation errors first
    const validationErrors = getValidationErrors(req);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Extract user data from request body
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender
    } = req.body;

    // Check if user already exists with this email
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.error
      });
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(password);

    // Create new user in database
    const newUser = await User.create({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      phone: phone || null,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      role: 'customer', // Default role for new users
      status: 'active'  // Default status
    });

    // Generate JWT token for the new user
    const token = generateToken(newUser);

    // Return success response with user data (excluding password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role,
          status: newUser.status
        },
        token: token
      }
    });

    console.log('✅ User registered successfully:', newUser.email);

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

/**
 * User Login Controller
 * Handles user authentication and login
 * 
 * @param {object} req - Express request object (contains login credentials)
 * @param {object} res - Express response object (sends response to client)
 * 
 * Expected request body:
 * {
 *   email: "john@example.com",
 *   password: "MyPassword123"
 * }
 */
const login = async (req, res) => {
  try {
    console.log('🔄 Processing user login...');

    // Check for validation errors
    const validationErrors = getValidationErrors(req);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Extract login credentials
    const { email, password } = req.body;

    // Find user by email (case-insensitive)
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user account is active
    if (!user.isActive()) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    await user.update({ last_login: new Date() });

    // Generate JWT token
    const token = generateToken(user);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
          lastLogin: user.last_login
        },
        token: token
      }
    });

    console.log('✅ User logged in successfully:', user.email);

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

/**
 * Get Current User Profile
 * Returns the profile of the currently logged-in user
 * 
 * @param {object} req - Express request object (contains user from auth middleware)
 * @param {object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    // User data is already attached to req by auth middleware
    const user = req.user;

    // Return user profile data
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          dateOfBirth: user.date_of_birth,
          gender: user.gender,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatar_url,
          emailNotifications: user.email_notifications,
          smsNotifications: user.sms_notifications,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile'
    });
  }
};

/**
 * Update User Profile
 * Allows users to update their profile information
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    console.log('🔄 Processing profile update...');

    // Check for validation errors
    const validationErrors = getValidationErrors(req);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const user = req.user; // Current user from auth middleware
    const updateData = req.body;

    // Fields that users are allowed to update
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'dateOfBirth', 
      'gender', 'emailNotifications', 'smsNotifications'
    ];

    // Filter out fields that shouldn't be updated
    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        // Map frontend field names to database field names
        switch (field) {
          case 'firstName':
            filteredData.first_name = updateData[field];
            break;
          case 'lastName':
            filteredData.last_name = updateData[field];
            break;
          case 'dateOfBirth':
            filteredData.date_of_birth = updateData[field];
            break;
          case 'emailNotifications':
            filteredData.email_notifications = updateData[field];
            break;
          case 'smsNotifications':
            filteredData.sms_notifications = updateData[field];
            break;
          default:
            filteredData[field] = updateData[field];
        }
      }
    });

    // Update user in database
    await user.update(filteredData);

    // Return updated user data
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          dateOfBirth: user.date_of_birth,
          gender: user.gender,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatar_url,
          emailNotifications: user.email_notifications,
          smsNotifications: user.sms_notifications,
          lastLogin: user.last_login,
          updatedAt: user.updated_at
        }
      }
    });

    console.log('✅ Profile updated successfully for:', user.email);

  } catch (error) {
    console.error('❌ Profile update error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating profile'
    });
  }
};

/**
 * Change Password Controller
 * Allows users to change their password
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const changePassword = async (req, res) => {
  try {
    console.log('🔄 Processing password change...');

    // Check for validation errors
    const validationErrors = getValidationErrors(req);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const user = req.user; // Current user from auth middleware
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.error
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password in database
    await user.update({ password_hash: hashedNewPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

    console.log('✅ Password changed successfully for:', user.email);

  } catch (error) {
    console.error('❌ Password change error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while changing password'
    });
  }
};

/**
 * Logout Controller
 * Handles user logout (client-side token removal)
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    // For JWT-based authentication, logout is typically handled client-side
    // by removing the token from localStorage/sessionStorage
    // However, we can log the logout event for audit purposes
    
    const user = req.user;
    console.log('👋 User logged out:', user.email);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('❌ Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required.' 
      });
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (e.g., 10 minutes from now)
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    // Remove old codes for this email
    await sequelize.query(
      'DELETE FROM verification_codes WHERE email = :email',
      { replacements: { email }, type: QueryTypes.DELETE }
    );

    // Insert new code
    await sequelize.query(
      `INSERT INTO verification_codes (email, code, expires_at) VALUES (:email, :code, :expires_at)`,
      { replacements: { email, code, expires_at }, type: QueryTypes.INSERT }
    );

    // Send email
    await sendVerificationEmail(email, code);

    console.log('✅ Verification code sent successfully to:', email);
    return res.json({ 
      success: true, 
      message: 'Verification code sent successfully.' 
    });

  } catch (error) {
    console.error('❌ Error sending verification code:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send verification code.' 
    });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and code are required.' 
      });
    }

    // Check if code exists and is not expired
    const result = await sequelize.query(
      `SELECT * FROM verification_codes 
       WHERE email = :email AND code = :code AND expires_at > NOW()`,
      { 
        replacements: { email, code }, 
        type: QueryTypes.SELECT 
      }
    );

    if (result.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification code.' 
      });
    }

    // Code is valid. Do not delete here so it can be used by subsequent flows
    // like password reset. It will be deleted upon successful reset or when expired.
    console.log('✅ Verification code verified successfully for:', email);
    return res.json({ 
      success: true, 
      message: 'Email verified successfully.' 
    });

  } catch (error) {
    console.error('❌ Error verifying code:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify code.' 
    });
  }
};

/**
 * Reset Password Controller
 * Allows a user to reset their password after verifying a code sent to email
 *
 * Expected body: { email: string, code: string, newPassword: string }
 */
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, code and newPassword are required.'
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.error
      });
    }

    // Check verification code validity (not expired)
    const codeRows = await sequelize.query(
      `SELECT * FROM verification_codes 
       WHERE email = :email AND code = :code AND expires_at > NOW()`,
      {
        replacements: { email, code },
        type: QueryTypes.SELECT
      }
    );

    if (codeRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code.'
      });
    }

    // Find the user by email
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Hash and update the new password
    const hashed = await hashPassword(newPassword);
    await user.update({ password_hash: hashed });

    // Remove any verification codes for this email
    await sequelize.query('DELETE FROM verification_codes WHERE email = :email', {
      replacements: { email },
      type: QueryTypes.DELETE
    });

    console.log('✅ Password reset successfully for:', email);
    return res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password.'
    });
  }
};

// Export all controller functions
module.exports = {
  register,      // User registration
  login,         // User login
  getProfile,    // Get user profile
  updateProfile, // Update user profile
  changePassword, // Change password
  logout,         // User logout
  sendVerificationCode, // Send verification code
  verifyCode,     // Verify verification code
  resetPassword   // Reset password with code
};
