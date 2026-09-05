const logger = require('../utils/logger');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` },
    requestId: req.requestId,
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = isAppError || env.nodeEnv !== 'production' ? err.message : 'An unexpected error occurred';

  logger.error(err.message, {
    requestId: req.requestId,
    code,
    statusCode,
    stack: env.nodeEnv !== 'production' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: { code, message },
    requestId: req.requestId,
  });
}

module.exports = { errorHandler, notFoundHandler };
