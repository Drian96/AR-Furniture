// Import required modules
const express = require('express'); // Express.js framework
const router = express.Router(); // Create a new router instance

// Import authentication controllers
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  sendVerificationCode,
  verifyCode
} = require('../controllers/authController');

// Import authentication middleware
const {
  authenticateToken,
  requireCustomer
} = require('../middleware/auth');

// Import validation middleware
const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  profileUpdateValidation
} = require('../utils/validation');

// ============================================================================
// AUTHENTICATION ROUTES
// These routes handle user authentication and profile management
// ============================================================================

/**
 * POST /api/auth/register
 * Register a new user account
 * 
 * Request Body:
 * {
 *   firstName: "John",
 *   lastName: "Doe",
 *   email: "john@example.com",
 *   password: "MyPassword123",
 *   phone: "+1234567890" (optional),
 *   dateOfBirth: "1990-01-01" (optional),
 *   gender: "male" (optional)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "User registered successfully",
 *   data: {
 *     user: { id, email, firstName, lastName, role, status },
 *     token: "jwt_token_here"
 *   }
 * }
 */
router.post('/register', registerValidation, register);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * 
 * Request Body:
 * {
 *   email: "john@example.com",
 *   password: "MyPassword123"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Login successful",
 *   data: {
 *     user: { id, email, firstName, lastName, role, status, lastLogin },
 *     token: "jwt_token_here"
 *   }
 * }
 */
router.post('/login', loginValidation, login);

/**
 * GET /api/auth/profile
 * Get current user's profile information
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     user: {
 *       id, email, firstName, lastName, phone, dateOfBirth,
 *       gender, role, status, avatarUrl, emailNotifications,
 *       smsNotifications, lastLogin, createdAt, updatedAt
 *     }
 *   }
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token and attaches user to req.user
 * - requireCustomer: Ensures only customers can access this route
 */
router.get('/profile', authenticateToken, requireCustomer, getProfile);

/**
 * PUT /api/auth/profile
 * Update current user's profile information
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Request Body (all fields optional):
 * {
 *   firstName: "John",
 *   lastName: "Doe",
 *   phone: "+1234567890",
 *   dateOfBirth: "1990-01-01",
 *   gender: "male",
 *   emailNotifications: true,
 *   smsNotifications: false
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Profile updated successfully",
 *   data: {
 *     user: { updated user data }
 *   }
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token and attaches user to req.user
 * - requireCustomer: Ensures only customers can access this route
 * - profileUpdateValidation: Validates the update data
 */
router.put('/profile', 
  authenticateToken, 
  requireCustomer, 
  profileUpdateValidation, 
  updateProfile
);

/**
 * POST /api/auth/change-password
 * Change user's password
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Request Body:
 * {
 *   currentPassword: "OldPassword123",
 *   newPassword: "NewPassword123",
 *   confirmPassword: "NewPassword123"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Password changed successfully"
 * }
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token and attaches user to req.user
 * - requireCustomer: Ensures only customers can access this route
 * - changePasswordValidation: Validates password change data
 */
router.post('/change-password',
  authenticateToken,
  requireCustomer,
  changePasswordValidation,
  changePassword
);

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Logout successful"
 * }
 * 
 * Note: For JWT-based authentication, logout is typically handled
 * client-side by removing the token from localStorage/sessionStorage.
 * This endpoint is mainly for logging purposes.
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token and attaches user to req.user
 * - requireCustomer: Ensures only customers can access this route
 */
router.post('/logout', authenticateToken, requireCustomer, logout);

/**
 * GET /api/auth/verify
 * Verify if a JWT token is valid
 * 
 * Headers:
 * Authorization: Bearer jwt_token_here
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Token is valid",
 *   data: {
 *     user: { id, email, firstName, lastName, role }
 *   }
 * }
 * 
 * This route is useful for:
 * - Checking if a stored token is still valid
 * - Getting user information from a token
 * - Refreshing user data in the frontend
 * 
 * Middleware:
 * - authenticateToken: Verifies JWT token and attaches user to req.user
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        role: req.user.role,
        status: req.user.status
      }
    }
  });
});

/**
 * GET /api/auth/health
 * Health check endpoint for authentication service
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Authentication service is running",
 *   timestamp: "2024-01-15T10:30:00.000Z"
 * }
 * 
 * This route is useful for:
 * - Checking if the authentication service is running
 * - Load balancer health checks
 * - Monitoring and debugging
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/v1/auth/send-verification-code
 * Send a verification code to the user's email address
 * 
 * Request Body:
 * {
 *   email: "example@gmail.com"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Verification code sent successfully"
 * }
 */
router.post('/send-verification-code', sendVerificationCode);

/**
 * POST /api/v1/auth/verify-code
 * Verify a verification code sent to the user's email
 * 
 * Request Body:
 * {
 *   email: "example@gmail.com",
 *   code: "123456"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Email verified successfully"
 * }
 */
router.post('/verify-code', verifyCode);

// Export the router
module.exports = router;
