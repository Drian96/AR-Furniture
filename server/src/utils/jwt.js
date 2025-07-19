// Import jsonwebtoken for creating and verifying JWT tokens
// JWT (JSON Web Token) is a way to securely transmit information between parties
const jwt = require('jsonwebtoken');

// ============================================================================
// JWT (JSON WEB TOKEN) UTILITIES FOR AUTHENTICATION
// ============================================================================

/**
 * Generate a JWT token for a user
 * This function creates a secure token that contains user information
 * 
 * @param {object} user - The user object (should contain id, email, role)
 * @returns {string} - The generated JWT token
 * 
 * Example usage:
 * const token = generateToken({ id: 1, email: 'john@example.com', role: 'customer' });
 * console.log(token); // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 */
const generateToken = (user) => {
  try {
    // Create a payload (the data that will be stored in the token)
    // Only include necessary information, never include sensitive data like passwords
    const payload = {
      id: user.id,           // User's unique ID
      email: user.email,     // User's email
      role: user.role,       // User's role (admin, customer, etc.)
      firstName: user.first_name, // User's first name
      lastName: user.last_name    // User's last name
    };

    // Get the secret key from environment variables
    // This secret is used to sign the token - keep it secure!
    const secret = process.env.JWT_SECRET;
    
    // Get token expiration time from environment variables (default: 24 hours)
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    // Sign the token with the payload, secret, and options
    const token = jwt.sign(payload, secret, {
      expiresIn: expiresIn,  // Token expires after specified time
      issuer: 'AR-Furniture', // Who issued the token
      audience: 'AR-Furniture-Users' // Who the token is for
    });

    return token;
  } catch (error) {
    // If token generation fails, throw an error
    throw new Error('Failed to generate token: ' + error.message);
  }
};

/**
 * Verify and decode a JWT token
 * This function checks if a token is valid and extracts the user information
 * 
 * @param {string} token - The JWT token to verify
 * @returns {object} - The decoded token payload (user information)
 * 
 * Example usage:
 * try {
 *   const decoded = verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 *   console.log(decoded); // { id: 1, email: 'john@example.com', role: 'customer', ... }
 * } catch (error) {
 *   console.log('Invalid token!');
 * }
 */
const verifyToken = (token) => {
  try {
    // Get the secret key from environment variables
    const secret = process.env.JWT_SECRET;
    
    // Verify and decode the token
    // This will throw an error if the token is invalid, expired, or tampered with
    const decoded = jwt.verify(token, secret, {
      issuer: 'AR-Furniture',     // Must match the issuer from generateToken
      audience: 'AR-Furniture-Users' // Must match the audience from generateToken
    });

    return decoded;
  } catch (error) {
    // If token verification fails, throw an error
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed: ' + error.message);
    }
  }
};

/**
 * Extract token from Authorization header
 * This function gets the token from the 'Bearer token' format in HTTP headers
 * 
 * @param {string} authHeader - The Authorization header (e.g., 'Bearer token123')
 * @returns {string|null} - The token or null if not found
 * 
 * Example usage:
 * const token = extractTokenFromHeader('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * console.log(token); // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 */
const extractTokenFromHeader = (authHeader) => {
  // Check if the authorization header exists and has the correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Extract the token part (remove 'Bearer ' prefix)
  // 'Bearer token123' becomes 'token123'
  const token = authHeader.substring(7); // Remove first 7 characters ('Bearer ')
  
  return token;
};

/**
 * Refresh a JWT token
 * This function creates a new token with the same user information
 * Useful for extending user sessions
 * 
 * @param {string} oldToken - The existing token to refresh
 * @returns {string} - The new JWT token
 * 
 * Example usage:
 * const newToken = await refreshToken(oldToken);
 */
const refreshToken = async (oldToken) => {
  try {
    // First verify the old token to get user information
    const decoded = verifyToken(oldToken);
    
    // Create a new token with the same user information
    const newToken = generateToken(decoded);
    
    return newToken;
  } catch (error) {
    throw new Error('Failed to refresh token: ' + error.message);
  }
};

// Export all the JWT utility functions
module.exports = {
  generateToken,           // Function to create JWT tokens
  verifyToken,             // Function to verify and decode tokens
  extractTokenFromHeader,  // Function to extract token from headers
  refreshToken             // Function to refresh tokens
};
