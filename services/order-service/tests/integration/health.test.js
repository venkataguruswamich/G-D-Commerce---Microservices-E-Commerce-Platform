jest.mock('../../src/config/db', () => ({
  checkConnection: jest.fn(),
  query: jest.fn(),
  withTransaction: jest.fn(),
  pool: { on: jest.fn() },
}));
jest.mock('../../src/config/rabbitmq', () => ({
  checkConnection: jest.fn(),
  connect: jest.fn(),
  assertQueue: jest.fn(),
  publish: jest.fn(),
  consume: jest.fn(),
}));

const request = require('supertest');
const db = require('../../src/config/db');
const rabbitmq = require('../../src/config/rabbitmq');
const createApp = require('../../src/app');

const app = createApp();

describe('health endpoints', () => {
  test('GET /health returns 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  test('GET /ready returns 200 when postgres and rabbitmq are reachable', async () => {
    db.checkConnection.mockResolvedValueOnce();
    rabbitmq.checkConnection.mockResolvedValueOnce();
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
  });

  test('GET /ready returns 503 when rabbitmq is unreachable', async () => {
    db.checkConnection.mockResolvedValueOnce();
    rabbitmq.checkConnection.mockRejectedValueOnce(new Error('down'));
    const res = await request(app).get('/ready');
    expect(res.status).toBe(503);
  });
});
