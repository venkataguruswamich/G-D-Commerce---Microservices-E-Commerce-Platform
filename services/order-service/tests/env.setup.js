process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://test:test@localhost:5672';
process.env.PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:5173';
