const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('../middleware/auth');
const { listUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');

// Staff management routes - admin, manager, and staff can view users (customers)
// Only admin can create, update, and delete users
router.get('/', authenticateToken, requireRole(['admin', 'manager', 'staff']), listUsers);
router.post('/', authenticateToken, requireRole('admin'), createUser);
router.put('/:id', authenticateToken, requireRole('admin'), updateUser);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteUser);

module.exports = router;


