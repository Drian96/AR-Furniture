const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLogger');
const admin = require('../controllers/adminController');

// Staff access to dashboard/reports; admin for creating logs
router.get('/dashboard', authenticateToken, requireRole(['admin','manager','staff']), auditLogger('View Dashboard', 'User Management', 'Admin accessed the main dashboard'), admin.getDashboard);
router.get('/reports', authenticateToken, requireRole(['admin','manager','staff']), auditLogger('View Reports', 'User Management', 'Admin accessed reports section'), admin.getReports);
router.get('/audit-logs', authenticateToken, requireRole(['admin','manager','staff']), auditLogger('View Audit Logs', 'User Management', 'Admin accessed audit logs'), admin.getAuditLogs);
router.post('/audit-logs', authenticateToken, requireRole(['admin']), admin.createAuditLog);
router.get('/customer/:id/orders', authenticateToken, requireRole(['admin','manager','staff']), auditLogger('View Customer Orders', 'User Management', 'Admin viewed customer order details'), admin.getCustomerOrders);

module.exports = router;


