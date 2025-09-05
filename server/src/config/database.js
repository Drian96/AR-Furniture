// Import required modules
const { Sequelize } = require('sequelize'); // Sequelize is an ORM (Object-Relational Mapping) library
require('dotenv').config(); // Load environment variables from .env file

// Database configuration using Sequelize for Supabase
// This creates a connection to your Supabase PostgreSQL database
const sequelize = new Sequelize(
  // Database name - Supabase uses 'postgres' as default
  process.env.DB_NAME || 'postgres',
  // Database username - Supabase uses 'postgres' as default
  process.env.DB_USER || 'postgres',
  // Database password - from your Supabase project
  process.env.DB_PASSWORD,
  {
    // Supabase database host
    host: process.env.DB_HOST,
    // Supabase database port (5432 is standard)
    port: process.env.DB_PORT || 5432,
    // Type of database we're connecting to
    dialect: 'postgres',
    // Set to console.log to see SQL queries in console (useful for debugging)
    logging: false,
    // SSL configuration for Supabase (required for remote connections)
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Supabase uses self-signed certificates
      }
    },
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
    console.log('✅ Supabase database connection established successfully.');
    
    // Optional: Log which database we're connected to
    console.log(`📊 Connected to: ${process.env.DB_HOST}`);
  } catch (error) {
    // If connection fails, log the error
    console.error('❌ Unable to connect to Supabase database:', error.message);
    console.error('🔍 Check your .env file and Supabase credentials');
  }
};

// Export the sequelize instance and test function
// Other files can import these to use the database connection
module.exports = { sequelize, testConnection };



// Add this before creating Sequelize instance
console.log('🔍 Connection details:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
console.log('Port:', process.env.DB_PORT);