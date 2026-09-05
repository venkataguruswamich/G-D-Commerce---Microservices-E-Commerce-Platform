const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

const NAME = 'smtp';

const EVENT_MESSAGES = {
  'order.created': 'Your order has been received.',
  'order.confirmed': 'Your order has been confirmed.',
  'order.shipped': 'Your order has shipped.',
  'order.delivered': 'Your order has been delivered.',
  'payment.success': 'Your payment was successful.',
  'payment.failed': 'Your payment could not be processed.',
};

let transporter = null;
function getTransporter() {
  if (!transporter) {
    if (!env.notification.smtpHost) {
      throw new Error('SMTP_HOST is not configured');
    }
    transporter = nodemailer.createTransport({
      host: env.notification.smtpHost,
      port: env.notification.smtpPort,
      auth: env.notification.smtpUser ? { user: env.notification.smtpUser, pass: env.notification.smtpPassword } : undefined,
    });
  }
  return transporter;
}

async function send(event) {
  const message = EVENT_MESSAGES[event.eventType] || `Event: ${event.eventType}`;

  if (!event.recipientEmail) {
    logger.warn('SMTP provider has no recipient email for event, skipping delivery', { eventType: event.eventType });
    return;
  }

  await getTransporter().sendMail({
    from: env.notification.fromAddress,
    to: event.recipientEmail,
    subject: `Order update: ${event.eventType}`,
    text: message,
  });
}

module.exports = { NAME, send };
