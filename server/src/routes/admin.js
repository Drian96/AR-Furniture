const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLogger');
const admin = require('../controllers/adminController');

// Staff access to dashboard/reports; admin for creating logs
// Note: We no longer audit simple page/views to keep logs action-focused.
router.get('/dashboard', authenticateToken, requireRole(['admin','manager','staff']), admin.getDashboard);
router.get('/reports', authenticateToken, requireRole(['admin','manager','staff']), admin.getReports);
router.get('/audit-logs', authenticateToken, requireRole(['admin','manager','staff']), admin.getAuditLogs);
router.post('/audit-logs', authenticateToken, requireRole(['admin']), admin.createAuditLog);
router.get('/customer/:id/orders', authenticateToken, requireRole(['admin','manager','staff']), admin.getCustomerOrders);

module.exports = router;


