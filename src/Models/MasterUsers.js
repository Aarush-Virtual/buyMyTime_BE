// Import Sequelize
const { Sequelize, DataTypes } = require('sequelize');

// Import Sequelize instance (assuming it's initialized in database.js)
const { sequelize } = require('../Config/databaseConfig');

const MasterUser = sequelize.define('MasterUsers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isVerifiedUser: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  userType: {
    type: DataTypes.ENUM('serviceProvider', 'customer', 'admin'),
    allowNull: false
  },
  preferredServiceCategoryIds: {
    type: DataTypes.JSON,
    allowNull: true, // Allow an empty array for no preferences
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull : true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  passportNumber : {
    type : DataTypes.STRING,
    allowNull : true,
    unique : true
  },
  passportURL : {
    type : DataTypes.STRING,
    allowNull : true,
    unique : true
  },
},{
  timestamps: false // Disable timestamps
});

// Export the MasterUser model and syncModel function
module.exports = MasterUser;