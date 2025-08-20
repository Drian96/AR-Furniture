const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('../middleware/auth');
const { listUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');

// Staff management routes - only admin can manage users
router.get('/', authenticateToken, requireRole('admin'), listUsers);
router.post('/', authenticateToken, requireRole('admin'), createUser);
router.put('/:id', authenticateToken, requireRole('admin'), updateUser);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteUser);

module.exports = router;


