const createApp = require('./app');
const env = require('./config/env');
const paymentEventConsumer = require('./events/consumer');
const logger = require('./utils/logger');

const app = createApp();

paymentEventConsumer.start().catch((err) => logger.error('Failed to start payment event consumer', { message: err.message }));

const server = app.listen(env.port, () => {
  logger.info(`payment-service listening on port ${env.port}`);
});

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
