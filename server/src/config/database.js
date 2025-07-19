// Import required modules
const { Sequelize } = require('sequelize'); // Sequelize is an ORM (Object-Relational Mapping) library
require('dotenv').config(); // Load environment variables from .env file

// Database configuration using Sequelize
// This creates a connection to your PostgreSQL database
const sequelize = new Sequelize(
  // Database name - gets from .env file or uses default
  process.env.DB_NAME || 'AR-Furniture',
  // Database username - gets from .env file or uses default
  process.env.DB_USER || 'postgres',
  // Database password - gets from .env file or uses default
  process.env.DB_PASSWORD || 'your_password',
  {
    // Database host (where your PostgreSQL server is running)
    host: process.env.DB_HOST || 'localhost',
    // Database port (PostgreSQL default is 5432)
    port: process.env.DB_PORT || 5432,
    // Type of database we're connecting to
    dialect: 'postgres',
    // Set to console.log to see SQL queries in console (useful for debugging)
    logging: false,
    // Connection pool settings (manages multiple database connections)
    pool: {
      max: 5,        // Maximum number of connections in pool
      min: 0,        // Minimum number of connections in pool
      acquire: 30000, // Maximum time (ms) to acquire a connection
      idle: 10000    // Maximum time (ms) a connection can be idle
    }
  }
);

// Function to test if we can connect to the database
// This is useful for debugging connection issues
const testConnection = async () => {
  try {
    // Try to authenticate with the database
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    // If connection fails, log the error
    console.error('❌ Unable to connect to the database:', error);
  }
};

// Export the sequelize instance and test function
// Other files can import these to use the database connection
module.exports = { sequelize, testConnection };
