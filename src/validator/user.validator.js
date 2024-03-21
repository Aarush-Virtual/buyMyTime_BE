// Import Joi
const Joi = require('joi');
const MasterUser = require('../Models/MasterUsers');

// Joi schema for user input validation
exports.userSchema = Joi.object({
  fullName: Joi.string().required(),
  userName: Joi.string().alphanum().min(3).max(20).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  password: Joi.string().required(),
  preferredServiceCategoryIds: Joi.array().items(Joi.number()),
  userType : Joi.string().required().valid('serviceProvider', 'customer', 'admin')
});


exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
