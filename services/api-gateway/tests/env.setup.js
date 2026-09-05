process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
// Deliberately NOT the services' real dev ports (3001-3005): the gateway's
// "unreachable downstream" test needs these to actually be unreachable,
// which doesn't hold if the real stack happens to be running locally on
// its normal ports at the same time tests run.
process.env.USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:39001';
process.env.PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:39002';
process.env.ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:39003';
process.env.PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:39004';
process.env.NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:39005';
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:5173';
