// Load environment variables from .env file
require('dotenv').config();

const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');

const createAdminUser = async () => {
  try {
    // Read credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if the variables are set
    if (!adminEmail || !adminPassword) {
      console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set.');
      process.exit(1);
    }
    
    // Connect to Supabase database
    await sequelize.authenticate();
    console.log('✅ Connected to Supabase database');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('🔐 Password hashed');
    
    // Insert admin user
    await sequelize.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (email) DO NOTHING
    `, {
      replacements: [adminEmail, hashedPassword, 'Admin', 'User', 'admin', 'active']
    });
    
    console.log('✅ Admin user created in Supabase!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: (from .env)`);
    
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1); // Exit with error
  }
};

createAdminUser();