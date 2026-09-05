const logger = require('../utils/logger');

const NAME = 'console';

async function send(event) {
  logger.info('Notification (console channel)', {
    eventType: event.eventType,
    userId: event.userId,
    orderId: event.orderId,
    paymentId: event.paymentId,
  });
}

module.exports = { NAME, send };
