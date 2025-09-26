// Import required modules
const express = require('express'); // Express.js web framework
const cors = require('cors'); // Cross-Origin Resource Sharing middleware
const helmet = require('helmet'); // Security middleware
const morgan = require('morgan'); // HTTP request logger
const rateLimit = require('express-rate-limit'); // Rate limiting middleware

// Import database configuration
const { sequelize, testConnection } = require('./config/database');
require('./models'); // ensure models and associations are registered before syncing

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const addressRoutes = require('./routes/addresses');

// Import error handling middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ============================================================================
// EXPRESS APPLICATION SETUP
// This file configures the Express.js server and connects all components
// ============================================================================

// Create Express application instance
const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// Middleware functions are executed in order for every request
// ============================================================================

// Security middleware - adds various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS middleware - allows requests from frontend
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Allow specific origins from environment variable
    const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Default fallback
    callback(null, true);
  },
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

// Request logging middleware - logs all HTTP requests
app.use(morgan('combined')); // Logs: method, URL, status, response time, etc.

// Rate limiting middleware - prevents abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

// Body parsing middleware - parses incoming request bodies
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies, max 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// ============================================================================
// ROUTE CONFIGURATION
// Define API endpoints and their handlers
// ============================================================================

// Health check endpoint - basic server status
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AR-Furniture API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API version prefix - all API routes start with /api/v1
const API_PREFIX = '/api/v1';

// Authentication routes - handles login, signup, profile management
// All auth routes will be prefixed with /api/v1/auth
app.use(`${API_PREFIX}/auth`, authRoutes);

// Admin analytics and audit routes
const adminRoutes = require('./routes/admin');
app.use(`${API_PREFIX}/admin`, adminRoutes);

// User management routes - admin only
app.use(`${API_PREFIX}/users`, userRoutes);

// Address management routes - authenticated users
app.use(`${API_PREFIX}/addresses`, addressRoutes);

// Root endpoint - API information
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to AR-Furniture API',
    version: '1.0.0',
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      addresses: `${API_PREFIX}/addresses`,
      health: '/health'
    },
    documentation: 'API documentation coming soon...'
  });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// These must be the last middleware in the chain
// ============================================================================

// 404 Not Found handler - handles requests to non-existent routes
app.use(notFoundHandler);

// Global error handler - catches all errors and sends appropriate responses
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP FUNCTION
// Initializes the server and database connection
// ============================================================================

/**
 * Start the Express server
 * This function initializes the database connection and starts the HTTP server
 * 
 * @param {number} port - The port number to run the server on
 */
const startServer = async (port = process.env.PORT || 5000) => {
  try {
    console.log('🚀 Starting AR-Furniture API server...');
    
    // Test database connection
    console.log('📊 Testing database connection...');
    await testConnection();
    
    // Sync database schema (create/update tables in Supabase)
    console.log('🛠 Syncing database schema...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synced.');
    
    // Start the HTTP server
    app.listen(port, () => {
      console.log('✅ Server started successfully!');
      console.log(`🌐 Server running on: http://localhost:${port}`);
      console.log(`🔗 API Base URL: http://localhost:${port}${API_PREFIX}`);
      console.log(`🏥 Health Check: http://localhost:${port}/health`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('=====================================');
      console.log('🎉 Ready to handle requests!');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1); // Exit the process with error code 1
  }
};

// ============================================================================
// GRACEFUL SHUTDOWN HANDLING
// Handles server shutdown gracefully
// ============================================================================

// Handle graceful shutdown on SIGTERM (termination signal)
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

// Handle graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Export the app and startServer function
module.exports = { app, startServer };
