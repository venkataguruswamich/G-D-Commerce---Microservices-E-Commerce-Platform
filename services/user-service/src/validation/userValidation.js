const Joi = require('joi');

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().min(1).max(100),
}).min(1);

module.exports = { updateProfileSchema };
