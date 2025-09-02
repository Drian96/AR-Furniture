const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');

// All routes require authentication
router.use(authenticateToken);

// GET /api/addresses - Get all addresses for the authenticated user
router.get('/', getUserAddresses);

// POST /api/addresses - Create a new address
router.post('/', createAddress);

// PUT /api/addresses/:id - Update an existing address
router.put('/:id', updateAddress);

// DELETE /api/addresses/:id - Delete an address
router.delete('/:id', deleteAddress);

// PUT /api/addresses/:id/default - Set an address as default
router.put('/:id/default', setDefaultAddress);

module.exports = router;
