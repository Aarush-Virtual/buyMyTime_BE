// Import Sequelize
const { Sequelize } = require('sequelize');

// Initialize Sequelize with database credentials
const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
  host: 'localhost',
  port: 5432, 
  dialect: 'postgres',
});

// Test the connection
async function connectDB() {
  try {
    const dbConnectionResponse = await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    return dbConnectionResponse;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return error;
    }
}

// Export the Sequelize instance
module.exports = { sequelize, connectDB };
