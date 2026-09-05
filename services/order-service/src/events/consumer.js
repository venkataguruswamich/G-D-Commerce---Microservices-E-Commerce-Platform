const rabbitmq = require('../config/rabbitmq');
const orderModel = require('../models/orderModel');
const { publishOrderEvent } = require('./publisher');
const logger = require('../utils/logger');

const QUEUE_NAME = 'order.queue';
const BINDING_PATTERNS = ['payment.success', 'payment.failed'];

async function handlePaymentEvent(payload) {
  const { orderId, eventType } = payload;
  if (!orderId) {
    logger.warn('Received payment event without orderId, ignoring', { eventType });
    return;
  }

  const order = await orderModel.findById(orderId);
  if (!order) {
    logger.warn('Received payment event for unknown order', { orderId, eventType });
    return;
  }

  const nextStatus = eventType === 'payment.success' ? 'CONFIRMED' : 'CANCELLED';
  if (order.status !== 'PENDING') {
    logger.info('Ignoring payment event for order not in PENDING state', { orderId, currentStatus: order.status });
    return;
  }

  const updated = await orderModel.updateStatus(orderId, nextStatus);
  logger.info('Order status updated from payment event', { orderId, nextStatus, eventType });
  await publishOrderEvent(`order.${nextStatus.toLowerCase()}`, updated);
}

async function start() {
  await rabbitmq.assertQueue(QUEUE_NAME, BINDING_PATTERNS);
  await rabbitmq.consume(QUEUE_NAME, handlePaymentEvent);
  logger.info(`Consuming ${QUEUE_NAME}`, { bindings: BINDING_PATTERNS });
}

module.exports = { start, handlePaymentEvent, QUEUE_NAME };
