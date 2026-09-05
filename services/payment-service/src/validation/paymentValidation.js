const Joi = require('joi');

const PAYMENT_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];

const createPaymentSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  method: Joi.string().valid('SIMULATED', 'CARD', 'WALLET').default('SIMULATED'),
});

const listPaymentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid(...PAYMENT_STATUSES),
});

module.exports = { PAYMENT_STATUSES, createPaymentSchema, listPaymentsQuerySchema };
