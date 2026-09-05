const createApp = require('./app');
const env = require('./config/env');
const orderEventConsumer = require('./events/consumer');
const logger = require('./utils/logger');

const app = createApp();

orderEventConsumer.start().catch((err) => logger.error('Failed to start order event consumer', { message: err.message }));

const server = app.listen(env.port, () => {
  logger.info(`order-service listening on port ${env.port}`);
});

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
