require('dotenv').config();

const required = [
  'JWT_SECRET',
  'USER_SERVICE_URL',
  'PRODUCT_SERVICE_URL',
  'ORDER_SERVICE_URL',
  'PAYMENT_SERVICE_URL',
  'NOTIFICATION_SERVICE_URL',
];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.API_GATEWAY_PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  services: {
    user: process.env.USER_SERVICE_URL,
    product: process.env.PRODUCT_SERVICE_URL,
    order: process.env.ORDER_SERVICE_URL,
    payment: process.env.PAYMENT_SERVICE_URL,
    notification: process.env.NOTIFICATION_SERVICE_URL,
  },
};
