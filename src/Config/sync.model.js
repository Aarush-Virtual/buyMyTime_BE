const { sequelize } = require("../Config/databaseConfig");

// Import all models
const models = {
  ServiceCategoryType: require('../Models/ServiceCategory.model'),
  MasterUser: require('../Models/MasterUsers'),
  // Add other models here
};

async function syncModels() {
  try {
    // Loop through all models and synchronize each one
    for (const modelName in models) {
      if (Object.hasOwnProperty.call(models, modelName)) {
        const Model = models[modelName]; // Get the model class
        await Model.sync(); // Call sync on the model class directly
        console.log(`${modelName} synchronized with database.`);
      }
    }
    console.log('All models synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models with database:', error);
  }
}

module.exports = syncModels;
