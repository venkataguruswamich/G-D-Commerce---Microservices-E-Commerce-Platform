const createApp = require('./app');
const env = require('./config/env');
const notificationConsumer = require('./events/consumer');
const logger = require('./utils/logger');

const app = createApp();

notificationConsumer.start().catch((err) => logger.error('Failed to start notification consumer', { message: err.message }));

const server = app.listen(env.port, () => {
  logger.info(`notification-service listening on port ${env.port}`);
});

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
