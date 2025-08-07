// Import the startServer function from our app configuration
const { startServer } = require('./src/app');

// Load environment variables
require('dotenv').config();

// ============================================================================
// SERVER ENTRY POINT
// This is the main file that starts the AR-Furniture API server
// ============================================================================

console.log('🎯 AR-Furniture API Server');
console.log('=====================================');

// Start the server
startServer(); 