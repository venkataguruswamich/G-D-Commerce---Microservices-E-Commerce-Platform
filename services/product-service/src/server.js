const createApp = require('./app');
const env = require('./config/env');
const redis = require('./config/redis');
const logger = require('./utils/logger');

const app = createApp();

redis.connect().catch((err) => logger.error('Initial Redis connection failed', { message: err.message }));

const server = app.listen(env.port, () => {
  logger.info(`product-service listening on port ${env.port}`);
});

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
