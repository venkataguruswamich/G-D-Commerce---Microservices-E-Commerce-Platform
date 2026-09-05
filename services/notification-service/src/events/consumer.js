const rabbitmq = require('../config/rabbitmq');
const notificationModel = require('../models/notificationModel');
const { getProvider } = require('../providers');
const logger = require('../utils/logger');

const QUEUE_NAME = 'notification.queue';
const BINDING_PATTERNS = [
  'order.created',
  'order.confirmed',
  'order.shipped',
  'order.delivered',
  'payment.success',
  'payment.failed',
];

/**
 * Persists a notification record for every bound event, then attempts
 * delivery via the configured provider. A delivery-channel failure (e.g.
 * SMTP down) is recorded as a FAILED notification but does not fail the
 * message — the event has been durably captured and is visible via
 * GET /notifications. A failure to persist the record at all *does*
 * propagate, so the RabbitMQ retry/DLQ path in config/rabbitmq.js applies
 * and the event is never silently dropped.
 */
async function handleEvent(payload) {
  const provider = getProvider();
  let status = 'SENT';

  try {
    await provider.send(payload);
  } catch (err) {
    logger.warn('Notification provider failed to deliver', { eventType: payload.eventType, message: err.message });
    status = 'FAILED';
  }

  await notificationModel.create({
    userId: payload.userId,
    type: payload.eventType,
    channel: provider.NAME,
    payload,
    status,
  });

  logger.info('Notification recorded', { eventType: payload.eventType, userId: payload.userId, status });
}

async function start() {
  await rabbitmq.assertQueue(QUEUE_NAME, BINDING_PATTERNS);
  await rabbitmq.consume(QUEUE_NAME, handleEvent);
  logger.info(`Consuming ${QUEUE_NAME}`, { bindings: BINDING_PATTERNS });
}

module.exports = { start, handleEvent, QUEUE_NAME };
