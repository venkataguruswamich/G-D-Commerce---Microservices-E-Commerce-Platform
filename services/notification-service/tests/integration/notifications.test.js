jest.mock('../../src/config/db', () => ({
  checkConnection: jest.fn(),
  query: jest.fn(),
  pool: { on: jest.fn() },
}));
jest.mock('../../src/config/rabbitmq', () => ({
  checkConnection: jest.fn(),
  connect: jest.fn(),
  assertQueue: jest.fn().mockResolvedValue(),
  publish: jest.fn().mockResolvedValue(),
  consume: jest.fn().mockResolvedValue(),
}));
jest.mock('../../src/models/notificationModel');

const jwt = require('jsonwebtoken');
const request = require('supertest');
const createApp = require('../../src/app');
const notificationModel = require('../../src/models/notificationModel');

const app = createApp();

function tokenFor(role, id = 'user-1') {
  return jwt.sign({ sub: id, email: `${id}@example.com`, role }, process.env.JWT_SECRET);
}

describe('GET /notifications', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/notifications');
    expect(res.status).toBe(401);
  });

  test('scopes results to the current user for CUSTOMER role', async () => {
    notificationModel.list.mockResolvedValueOnce({ items: [], total: 0, page: 1, limit: 20 });
    const res = await request(app).get('/notifications').set('Authorization', `Bearer ${tokenFor('CUSTOMER', 'user-1')}`);
    expect(res.status).toBe(200);
    expect(notificationModel.list).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }));
  });

  test('returns all notifications for ADMIN role', async () => {
    notificationModel.list.mockResolvedValueOnce({ items: [], total: 0, page: 1, limit: 20 });
    const res = await request(app).get('/notifications').set('Authorization', `Bearer ${tokenFor('ADMIN')}`);
    expect(res.status).toBe(200);
    expect(notificationModel.list).toHaveBeenCalledWith(expect.objectContaining({ userId: null }));
  });
});
