const rabbitmq = require('../config/rabbitmq');
const logger = require('../utils/logger');

const QUEUE_NAME = 'payment.queue';
const BINDING_PATTERNS = ['order.created'];

/**
 * payment-service's primary flow is synchronous (client calls
 * POST /payments after checkout), per the spec's REST-only payment
 * endpoints. This queue still exists and is consumed — per spec §13's
 * explicit `payment.queue` requirement — as an audit/observability hook
 * on every order.created event, and is the natural extension point for a
 * future auto-charge-on-order flow without changing the REST contract.
 */
async function handleOrderCreated(payload) {
  logger.info('Observed order.created on payment.queue', {
    orderId: payload.orderId,
    userId: payload.userId,
    totalCents: payload.totalCents,
  });
}

async function start() {
  await rabbitmq.assertQueue(QUEUE_NAME, BINDING_PATTERNS);
  await rabbitmq.consume(QUEUE_NAME, handleOrderCreated);
  logger.info(`Consuming ${QUEUE_NAME}`, { bindings: BINDING_PATTERNS });
}

module.exports = { start, handleOrderCreated, QUEUE_NAME };
