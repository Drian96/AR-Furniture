const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  recipient_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  region: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  province: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  barangay: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  postal_code: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  
  street_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  address_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'home',
    validate: {
      isIn: [['home', 'work', 'other']]
    }
  },
  
  is_default: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'addresses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance method to get full address
Address.prototype.getFullAddress = function() {
  const parts = [
    this.street_address,
    this.barangay,
    this.city,
    this.province,
    this.region,
    this.postal_code
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Instance method to check if address is complete
Address.prototype.isComplete = function() {
  return this.recipient_name && this.street_address && this.city && this.province;
};

module.exports = Address;
