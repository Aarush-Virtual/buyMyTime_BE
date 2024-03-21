const ServiceCategoryType = require("../Models/ServiceCategory.model");

const seedServiceCategoryTypes = async () => {
    const categories = [
      'Influencer',
      'Actor',
      'Musicians',
      'Fitness',
      'Artists',
      'Make Up', // Consistent capitalization
      'Mentors',
      'Trainer',
      'Models',
      'Tutor'
    ];
  
    try {
        // Check if any category types already exist
        const existingTypes = await ServiceCategoryType.findAll();
        if (existingTypes.length === 0) {
        for (const categoryName of categories) {
            await ServiceCategoryType.create({ servicecategoryName: categoryName }); // Use "name" for consistency
        }
        console.log('Service category types seeded successfully!');
        } else {
        console.log('Service category types already exist. Seeding skipped.');
        }
    } catch (error) {
      console.error(error , "error in seeding service");
    }
  };


  module.exports = {seedServiceCategoryTypes}