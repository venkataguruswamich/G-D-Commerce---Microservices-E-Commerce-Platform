const rabbitmq = require('../config/rabbitmq');
const logger = require('../utils/logger');

async function publishPaymentEvent(routingKey, payment) {
  try {
    await rabbitmq.publish(routingKey, {
      eventType: routingKey,
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      status: payment.status,
      amountCents: payment.amountCents,
      currency: payment.currency,
      occurredAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Failed to publish payment event', { routingKey, paymentId: payment.id, message: err.message });
  }
}

module.exports = { publishPaymentEvent };
