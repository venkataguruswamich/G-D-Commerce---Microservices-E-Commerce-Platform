const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(150).required(),
  slug: Joi.string().min(1).max(150).pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().allow('', null),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(150),
  slug: Joi.string().min(1).max(150).pattern(/^[a-z0-9-]+$/),
  description: Joi.string().allow('', null),
}).min(1);

module.exports = { createCategorySchema, updateCategorySchema };
