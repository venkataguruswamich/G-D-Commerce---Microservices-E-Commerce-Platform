process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:5173';
