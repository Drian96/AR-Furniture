const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('../middleware/auth');
const admin = require('../controllers/adminController');

// Staff access to dashboard/reports; admin for creating logs
router.get('/dashboard', authenticateToken, requireRole(['admin','manager','staff']), admin.getDashboard);
router.get('/reports', authenticateToken, requireRole(['admin','manager','staff']), admin.getReports);
router.get('/audit-logs', authenticateToken, requireRole(['admin','manager','staff']), admin.getAuditLogs);
router.post('/audit-logs', authenticateToken, requireRole(['admin']), admin.createAuditLog);

module.exports = router;


