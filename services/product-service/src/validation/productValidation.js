const Joi = require('joi');

const listProductsQuerySchema = Joi.object({
  search: Joi.string().max(200).allow(''),
  categoryId: Joi.string().uuid(),
  minPrice: Joi.number().integer().min(0),
  maxPrice: Joi.number().integer().min(0),
  sort: Joi.string().valid('price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const createProductSchema = Joi.object({
  categoryId: Joi.string().uuid().allow(null),
  sku: Joi.string().min(1).max(100).required(),
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('', null),
  priceCents: Joi.number().integer().min(0).required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  imageUrl: Joi.string().uri().allow('', null),
});

const updateProductSchema = Joi.object({
  categoryId: Joi.string().uuid().allow(null),
  name: Joi.string().min(1).max(255),
  description: Joi.string().allow('', null),
  priceCents: Joi.number().integer().min(0),
  currency: Joi.string().length(3).uppercase(),
  imageUrl: Joi.string().uri().allow('', null),
  isActive: Joi.boolean(),
}).min(1);

const updateInventorySchema = Joi.object({
  quantity: Joi.number().integer().min(0),
  reserved: Joi.number().integer().min(0),
}).min(1);

const listInventoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = {
  listProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
  updateInventorySchema,
  listInventoryQuerySchema,
};
