const createApp = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`api-gateway listening on port ${env.port}`);
});

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
