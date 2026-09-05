jest.mock('../../src/config/db', () => ({
  checkConnection: jest.fn(),
  query: jest.fn(),
  pool: { on: jest.fn() },
}));
jest.mock('../../src/config/redis', () => ({
  checkConnection: jest.fn(),
  connect: jest.fn().mockResolvedValue(),
  client: { get: jest.fn(), set: jest.fn(), del: jest.fn(), on: jest.fn() },
}));

const request = require('supertest');
const db = require('../../src/config/db');
const redis = require('../../src/config/redis');
const createApp = require('../../src/app');

const app = createApp();

describe('health endpoints', () => {
  test('GET /health returns 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /ready returns 200 when postgres and redis are reachable', async () => {
    db.checkConnection.mockResolvedValueOnce();
    redis.checkConnection.mockResolvedValueOnce();
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.dependencies).toEqual({ postgres: 'ok', redis: 'ok' });
  });

  test('GET /ready returns 503 when a dependency is unreachable', async () => {
    db.checkConnection.mockResolvedValueOnce();
    redis.checkConnection.mockRejectedValueOnce(new Error('down'));
    const res = await request(app).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body.dependencies.redis).toBe('unreachable');
  });
});
