const Joi = require('joi');

const createPaymentSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  method: Joi.string().valid('SIMULATED', 'CARD', 'WALLET').default('SIMULATED'),
});

module.exports = { createPaymentSchema };
