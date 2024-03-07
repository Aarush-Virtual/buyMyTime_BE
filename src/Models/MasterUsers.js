// Import Sequelize
const { Sequelize, DataTypes } = require('sequelize');

// Import Sequelize instance (assuming it's initialized in database.js)
const { sequelize } = require('../Config/databaseConfig');

// Define the model for the master_user table
const MasterUser = sequelize.define('master_user', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Assuming phone numbers should be unique
  }
});

// Synchronize the model with the database (create the table if it doesn't exist)
async function syncModel() {
  try {
    await MasterUser.sync();
    console.log('MasterUser table created successfully.');
  } catch (error) {
    console.error('Error creating MasterUser table:', error);
  }
}

// Export the MasterUser model and syncModel function
module.exports = { MasterUser, syncModel };
