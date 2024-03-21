// models/ServiceCategoryTypes.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/databaseConfig');

const ServiceCategoryType = sequelize.define('ServiceCategoryType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  servicecategoryName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Add other required fields here
}, {
  timestamps: false // Disable timestamps
});

module.exports = ServiceCategoryType;
