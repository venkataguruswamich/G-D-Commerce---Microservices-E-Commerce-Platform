const rabbitmq = require('../config/rabbitmq');
const logger = require('../utils/logger');

async function publishOrderEvent(routingKey, order) {
  try {
    await rabbitmq.publish(routingKey, {
      eventType: routingKey,
      orderId: order.id,
      userId: order.userId,
      status: order.status,
      totalCents: order.totalCents,
      currency: order.currency,
      occurredAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Failed to publish order event', { routingKey, orderId: order.id, message: err.message });
  }
}

module.exports = { publishOrderEvent };
