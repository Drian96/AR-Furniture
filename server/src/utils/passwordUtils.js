// Import bcryptjs for password hashing and comparison
// bcryptjs is a library that helps us securely hash passwords
const bcrypt = require('bcryptjs');

// ============================================================================
// PASSWORD HASHING AND VERIFICATION UTILITIES
// ============================================================================

/**
 * Hash a password using bcrypt
 * This function takes a plain text password and converts it to a secure hash
 * 
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - The hashed password
 * 
 * Example usage:
 * const hashedPassword = await hashPassword('myPassword123');
 * console.log(hashedPassword); // '$2a$10$hashedpasswordstring...'
 */
const hashPassword = async (password) => {
  try {
    // Salt rounds determine how secure the hash will be
    // Higher number = more secure but slower
    // 10 is a good balance between security and performance
    const saltRounds = 10;
    
    // Hash the password with the salt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    return hashedPassword;
  } catch (error) {
    // If hashing fails, throw an error
    throw new Error('Failed to hash password: ' + error.message);
  }
};

/**
 * Compare a plain text password with a hashed password
 * This function checks if a password matches the stored hash
 * 
 * @param {string} password - The plain text password to check
 * @param {string} hashedPassword - The hashed password from database
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 * 
 * Example usage:
 * const isMatch = await comparePassword('myPassword123', hashedPassword);
 * if (isMatch) {
 *   console.log('Password is correct!');
 * } else {
 *   console.log('Password is wrong!');
 * }
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    // Compare the plain text password with the hashed password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    
    return isMatch;
  } catch (error) {
    // If comparison fails, throw an error
    throw new Error('Failed to compare passwords: ' + error.message);
  }
};

/**
 * Validate password strength
 * This function checks if a password meets security requirements
 * 
 * @param {string} password - The password to validate
 * @returns {object} - Object with isValid boolean and error message
 * 
 * Example usage:
 * const validation = validatePasswordStrength('weak');
 * if (!validation.isValid) {
 *   console.log(validation.error); // "Password must be at least 8 characters long"
 * }
 */
const validatePasswordStrength = (password) => {
  // Check if password exists
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required'
    };
  }

  // Check minimum length (8 characters)
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long'
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter'
    };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter'
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number'
    };
  }

  // If all checks pass, password is valid
  return {
    isValid: true,
    error: null
  };
};

// Export all the password utility functions
module.exports = {
  hashPassword,           // Function to hash passwords
  comparePassword,        // Function to compare passwords
  validatePasswordStrength // Function to validate password strength
};
