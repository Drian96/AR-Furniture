const fs = require('fs');
const path = require('path');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { seedAuditLogs } = require('../seed/audit-logs-seed');

const setupAuditLogs = async () => {
  try {
    console.log('🚀 Setting up audit logs...');
    
    // Read and execute the migration
    const migrationPath = path.join(__dirname, '../migrations/001_create_audit_logs.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📊 Creating audit_logs table...');
    await sequelize.query(migrationSQL, { type: QueryTypes.RAW });
    
    console.log('✅ Audit logs table created successfully!');
    
    // Check if table has any data
    const [existingLogs] = await sequelize.query(
      'SELECT COUNT(*) as count FROM audit_logs',
      { type: QueryTypes.SELECT }
    );
    
    if (existingLogs.count === 0) {
      console.log('🌱 Seeding sample audit logs...');
      await seedAuditLogs();
    } else {
      console.log(`📋 Found ${existingLogs.count} existing audit logs`);
    }
    
    console.log('🎉 Audit logs setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up audit logs:', error);
  } finally {
    // Close the database connection
    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  }
};

// Run the setup if this script is executed directly
if (require.main === module) {
  setupAuditLogs();
}

module.exports = { setupAuditLogs };
