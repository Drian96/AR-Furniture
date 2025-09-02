const { Address, User } = require('../models');

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    const addresses = await Address.findAll({
      where: { user_id: userId },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });
    
    // Align response shape with frontend expectations: wrap in data
    res.json({ success: true, data: { addresses } });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
  }
};

// Create new address
const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      recipient_name,
      phone,
      region,
      province,
      city,
      barangay,
      postal_code,
      street_address,
      address_type
    } = req.body;
    
    // Validate required fields
    if (!recipient_name || !street_address || !city || !province) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name, street address, city, and province are required'
      });
    }
    
    // If this is the first address, make it default
    const existingAddresses = await Address.count({ where: { user_id: userId } });
    const is_default = existingAddresses === 0;
    
    const address = await Address.create({
      user_id: userId,
      recipient_name,
      phone,
      region,
      province,
      city,
      barangay,
      postal_code,
      street_address,
      address_type: address_type || 'home',
      is_default
    });
    
    // Return created address wrapped in data
    res.status(201).json({ success: true, data: { address } });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ success: false, message: 'Failed to create address' });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    
    const address = await Address.findOne({
      where: { id: addressId, user_id: userId }
    });
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    const {
      recipient_name,
      phone,
      region,
      province,
      city,
      barangay,
      postal_code,
      street_address,
      address_type
    } = req.body;
    
    // Validate required fields
    if (!recipient_name || !street_address || !city || !province) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name, street address, city, and province are required'
      });
    }
    
    await address.update({
      recipient_name,
      phone,
      region,
      province,
      city,
      barangay,
      postal_code,
      street_address,
      address_type: address_type || 'home'
    });
    
    // Return updated address wrapped in data
    res.json({ success: true, data: { address } });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    
    const address = await Address.findOne({
      where: { id: addressId, user_id: userId }
    });
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // If deleting default address, make another address default
    if (address.is_default) {
      const nextAddress = await Address.findOne({
        where: { user_id: userId, id: { [require('sequelize').Op.ne]: addressId } },
        order: [['created_at', 'ASC']]
      });
      
      if (nextAddress) {
        await nextAddress.update({ is_default: true });
      }
    }
    
    await address.destroy();
    
    // Deletion returns success message (no data payload required)
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};

// Set address as default
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    
    const address = await Address.findOne({
      where: { id: addressId, user_id: userId }
    });
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Remove default from all other addresses
    await Address.update(
      { is_default: false },
      { where: { user_id: userId } }
    );
    
    // Set this address as default
    await address.update({ is_default: true });
    
    // Return updated default address wrapped in data
    res.json({ success: true, data: { address } });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: 'Failed to set default address' });
  }
};

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
