const winston = require('winston');
const env = require('../config/env');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'notification-service', env: env.nodeEnv },
  transports: [new winston.transports.Console()],
});

const SENSITIVE_KEYS = ['password', 'passwordHash', 'password_hash', 'jwtSecret', 'token', 'authorization', 'smtpPassword'];

function sanitize(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  const clean = { ...meta };
  for (const key of Object.keys(clean)) {
    if (SENSITIVE_KEYS.includes(key)) clean[key] = '[REDACTED]';
  }
  return clean;
}

module.exports = {
  info: (message, meta) => logger.info(message, sanitize(meta)),
  warn: (message, meta) => logger.warn(message, sanitize(meta)),
  error: (message, meta) => logger.error(message, sanitize(meta)),
  debug: (message, meta) => logger.debug(message, sanitize(meta)),
};
