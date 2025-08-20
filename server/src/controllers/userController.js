const User = require('../models/User');
const { hashPassword } = require('../utils/passwordUtils');

// Allowed staff roles that admins can manage
const MANAGEABLE_ROLES = ['admin', 'manager', 'staff'];

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  phone: user.phone,
  role: user.role,
  status: user.status,
  lastLogin: user.last_login,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

// GET /api/v1/users
const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'role',
        'status',
        'last_login',
        'created_at',
        'updated_at',
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: { users: users.map(sanitizeUser) },
    });
  } catch (error) {
    console.error('❌ listUsers error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// POST /api/v1/users
const createUser = async (req, res) => {
  try {
    const { fullName, email, contact, role, password } = req.body;

    if (!fullName || !email || !role || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const normalizedRole = String(role).toLowerCase();
    if (!MANAGEABLE_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Split full name -> first/last
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts.shift();
    const lastName = parts.join(' ') || '-';

    const passwordHash = await hashPassword(password);

    const created = await User.create({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      phone: contact || null,
      role: normalizedRole,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: sanitizeUser(created) },
    });
  } catch (error) {
    console.error('❌ createUser error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

// PUT /api/v1/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, contact, role, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updates = {};
    if (email) {
      const lower = email.toLowerCase();
      if (lower !== user.email) {
        const exists = await User.findOne({ where: { email: lower } });
        if (exists) {
          return res.status(400).json({ success: false, message: 'Email already in use' });
        }
      }
      updates.email = lower;
    }
    if (typeof contact !== 'undefined') updates.phone = contact;
    if (typeof role !== 'undefined') {
      const normalizedRole = String(role).toLowerCase();
      if (!MANAGEABLE_ROLES.includes(normalizedRole)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      updates.role = normalizedRole;
    }
    if (typeof status !== 'undefined') {
      const normalizedStatus = String(status).toLowerCase();
      if (!['active', 'inactive'].includes(normalizedStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      updates.status = normalizedStatus;
    }
    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      updates.first_name = parts.shift();
      updates.last_name = parts.join(' ') || '-';
    }

    await user.update(updates);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    console.error('❌ updateUser error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

// DELETE /api/v1/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.destroy();

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ deleteUser error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};


