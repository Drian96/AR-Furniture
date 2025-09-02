// Import all models
const User = require('./User');
const Address = require('./Address');

// Define associations
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export all models
module.exports = {
  User,
  Address
};
