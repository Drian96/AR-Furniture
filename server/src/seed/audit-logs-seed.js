const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const sampleAuditLogs = [
  {
    user_email: 'admin@arfurniture.com',
    action: 'User Login',
    category: 'Authentication',
    description: 'Admin user successfully logged into the system',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: { login_method: 'email', session_duration: '2h 30m' }
  },
  {
    user_email: 'admin@arfurniture.com',
    action: 'View Dashboard',
    category: 'User Management',
    description: 'Admin accessed the main dashboard',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: { page: 'dashboard', timestamp: new Date().toISOString() }
  },
  {
    user_email: 'admin@arfurniture.com',
    action: 'Create User',
    category: 'User Management',
    description: 'Created new staff user account for john.doe@arfurniture.com',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: { new_user_email: 'john.doe@arfurniture.com', role: 'staff' }
  },
  {
    user_email: 'admin@arfurniture.com',
    action: 'Update Product',
    category: 'Inventory',
    description: 'Updated product information for Modern Sofa Set',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: { product_id: 'prod_001', changes: ['price', 'description'] }
  },
  {
    user_email: 'admin@arfurniture.com',
    action: 'View Orders',
    category: 'Orders',
    description: 'Admin viewed order list with filters applied',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: { filter_status: 'all', total_orders: 15 }
  },
  {
    user_email: 'manager@arfurniture.com',
    action: 'User Login',
    category: 'Authentication',
    description: 'Manager user successfully logged into the system',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    success: true,
    details: { login_method: 'email', session_duration: '1h 45m' }
  },
  {
    user_email: 'manager@arfurniture.com',
    action: 'Update Order Status',
    category: 'Orders',
    description: 'Updated order #ORD-001 status from pending to processing',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    success: true,
    details: { order_id: 'ORD-001', old_status: 'pending', new_status: 'processing' }
  },
  {
    user_email: 'staff@arfurniture.com',
    action: 'Failed Login Attempt',
    category: 'Authentication',
    description: 'Failed login attempt with incorrect password',
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    success: false,
    details: { attempt_count: 3, lockout_triggered: false }
  },
  {
    user_email: 'admin@arfurniture.com',
    action: 'Delete User',
    category: 'User Management',
    description: 'Deleted inactive user account for old.user@example.com',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: { deleted_user_email: 'old.user@example.com', reason: 'inactive_account' }
  },
  {
    user_email: 'admin@arfurniture.com',
    action: 'System Configuration',
    category: 'User Management',
    description: 'Updated system settings for email notifications',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: { setting_type: 'email_notifications', enabled: true }
  }
];

const seedAuditLogs = async () => {
  try {
    console.log('🌱 Seeding audit logs...');
    
    // Insert sample audit logs with different timestamps
    for (let i = 0; i < sampleAuditLogs.length; i++) {
      const log = sampleAuditLogs[i];
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - (i * 2)); // Spread over last 20 hours
      
      await sequelize.query(
        `INSERT INTO audit_logs (user_email, action, category, description, ip_address, user_agent, success, details, created_at)
         VALUES (:user_email, :action, :category, :description, :ip_address, :user_agent, :success, :details, :created_at)`,
        {
          type: QueryTypes.INSERT,
          replacements: {
            user_email: log.user_email,
            action: log.action,
            category: log.category,
            description: log.description,
            ip_address: log.ip_address,
            user_agent: log.user_agent,
            success: log.success,
            details: JSON.stringify(log.details),
            created_at: createdAt.toISOString()
          }
        }
      );
    }
    
    console.log('✅ Audit logs seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding audit logs:', error);
  }
};

module.exports = { seedAuditLogs };

// Run the seed if this script is executed directly
if (require.main === module) {
  seedAuditLogs().then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
}
