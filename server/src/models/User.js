// Import required modules
const { DataTypes } = require('sequelize'); // DataTypes define the type of each field
const { sequelize } = require('../config/database'); // Import our database connection

// Define the User model using Sequelize
// This creates a JavaScript representation of your 'users' table
const User = sequelize.define('User', {
  // Primary key - unique identifier for each user
  id: {
    type: DataTypes.INTEGER, // Integer type
    primaryKey: true,        // This is the primary key
    autoIncrement: true      // Automatically increases for each new user
  },
  
  // Email field - must be unique for each user
  email: {
    type: DataTypes.STRING(255), // String with max 255 characters
    allowNull: false,            // This field cannot be empty
    unique: true,                // No two users can have the same email
    validate: {
      isEmail: true              // Ensures the email format is valid
    }
  },
  
  // Password hash - stores the encrypted password (never store plain passwords!)
  password_hash: {
    type: DataTypes.STRING(255), // String with max 255 characters
    allowNull: false             // This field cannot be empty
  },
  
  // User's first name
  first_name: {
    type: DataTypes.STRING(100), // String with max 100 characters
    allowNull: false             // This field cannot be empty
  },
  
  // User's last name
  last_name: {
    type: DataTypes.STRING(100), // String with max 100 characters
    allowNull: false             // This field cannot be empty
  },
  
  // Phone number - optional field
  phone: {
    type: DataTypes.STRING(20),  // String with max 20 characters
    allowNull: true              // This field can be empty
  },
  
  // Date of birth - stores only the date (no time)
  date_of_birth: {
    type: DataTypes.DATEONLY,    // Date only (no time)
    allowNull: true              // This field can be empty
  },
  
  // Gender - must be one of the specified values
  gender: {
    type: DataTypes.STRING(10),  // String with max 10 characters
    allowNull: true,             // This field can be empty
    validate: {
      isIn: [['male', 'female', 'other']] // Only these values are allowed
    }
  },
  
  // User role - determines what the user can do in the system
  role: {
    type: DataTypes.STRING(20),  // String with max 20 characters
    allowNull: false,            // This field cannot be empty
    defaultValue: 'customer',    // If not specified, default to 'customer'
    validate: {
      isIn: [['admin', 'manager', 'staff', 'customer']] // Only these roles are allowed
    }
  },
  
  // Account status - whether the account is active or not
  status: {
    type: DataTypes.STRING(20),  // String with max 20 characters
    allowNull: false,            // This field cannot be empty
    defaultValue: 'active',      // If not specified, default to 'active'
    validate: {
      isIn: [['active', 'inactive']] // Only these statuses are allowed
    }
  },
  
  // Profile picture URL - optional field
  avatar_url: {
    type: DataTypes.STRING(500), // String with max 500 characters
    allowNull: true              // This field can be empty
  },
  
  // Email notification preference
  email_notifications: {
    type: DataTypes.BOOLEAN,     // True or false
    allowNull: false,            // This field cannot be empty
    defaultValue: true           // If not specified, default to true
  },
  
  // SMS notification preference
  sms_notifications: {
    type: DataTypes.BOOLEAN,     // True or false
    allowNull: false,            // This field cannot be empty
    defaultValue: false          // If not specified, default to false
  },
  
  // Last login timestamp - tracks when user last logged in
  last_login: {
    type: DataTypes.DATE,        // Date and time
    allowNull: true              // This field can be empty
  }
}, {
  // Model configuration options
  tableName: 'users',            // Maps to the 'users' table in database
  timestamps: true,              // Automatically adds created_at and updated_at
  createdAt: 'created_at',       // Custom name for created timestamp
  updatedAt: 'updated_at'        // Custom name for updated timestamp
});

// ============================================================================
// INSTANCE METHODS - These are functions that can be called on user objects
// ============================================================================

// Method to get the user's full name
// Usage: user.getFullName() returns "John Doe"
User.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

// Method to check if the user is an admin
// Usage: user.isAdmin() returns true or false
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

// Method to check if the user account is active
// Usage: user.isActive() returns true or false
User.prototype.isActive = function() {
  return this.status === 'active';
};

// Export the User model so other files can use it
module.exports = User;
