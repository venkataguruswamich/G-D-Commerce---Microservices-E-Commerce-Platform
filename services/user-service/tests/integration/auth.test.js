jest.mock('../../src/config/db', () => ({
  checkConnection: jest.fn(),
  query: jest.fn(),
  pool: { on: jest.fn() },
}));
jest.mock('../../src/models/userModel');
jest.mock('../../src/models/refreshTokenModel');

const request = require('supertest');
const bcrypt = require('bcryptjs');
const createApp = require('../../src/app');
const userModel = require('../../src/models/userModel');
const refreshTokenModel = require('../../src/models/refreshTokenModel');

const app = createApp();

describe('POST /auth/register', () => {
  test('rejects invalid payloads with 400', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('rejects duplicate email with 409', async () => {
    userModel.findByEmail.mockResolvedValueOnce({ id: 'existing' });
    const res = await request(app).post('/auth/register').send({
      email: 'taken@example.com',
      password: 'password123',
      firstName: 'A',
      lastName: 'B',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_IN_USE');
  });

  test('creates a user on valid payload', async () => {
    userModel.findByEmail.mockResolvedValueOnce(null);
    userModel.create.mockResolvedValueOnce({ id: 'new-user', email: 'new@example.com', role: 'CUSTOMER' });

    const res = await request(app).post('/auth/register').send({
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('new-user');
  });
});

describe('POST /auth/login', () => {
  test('returns 401 for unknown email', async () => {
    userModel.findByEmail.mockResolvedValueOnce(null);
    const res = await request(app).post('/auth/login').send({ email: 'nobody@example.com', password: 'x' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('returns access + refresh tokens for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    userModel.findByEmail.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash,
      firstName: 'A',
      lastName: 'B',
      role: 'CUSTOMER',
      isActive: true,
    });
    refreshTokenModel.store.mockResolvedValueOnce();

    const res = await request(app).post('/auth/login').send({ email: 'user@example.com', password: 'correct-password' });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });
});
