const Joi = require('joi');

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    line1: Joi.string().max(255).required(),
    line2: Joi.string().max(255).allow('', null),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    postalCode: Joi.string().max(20).required(),
    country: Joi.string().max(100).required(),
  }).required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...ORDER_STATUSES)
    .required(),
});

const listOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid(...ORDER_STATUSES),
});

module.exports = { ORDER_STATUSES, createOrderSchema, updateStatusSchema, listOrdersQuerySchema };
