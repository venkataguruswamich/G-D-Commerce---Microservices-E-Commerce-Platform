jest.mock('../../src/config/db', () => ({
  checkConnection: jest.fn(),
  query: jest.fn(),
  pool: { on: jest.fn() },
}));

const request = require('supertest');
const db = require('../../src/config/db');
const createApp = require('../../src/app');

const app = createApp();

describe('health endpoints', () => {
  test('GET /health returns 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /ready returns 200 when database is reachable', async () => {
    db.checkConnection.mockResolvedValueOnce();
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  test('GET /ready returns 503 when database is unreachable', async () => {
    db.checkConnection.mockRejectedValueOnce(new Error('connection refused'));
    const res = await request(app).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('not_ready');
  });
});
