const request = require('supertest');
const createApp = require('../../src/app');

const app = createApp();

describe('api-gateway', () => {
  test('GET /health returns 200 ok without hitting downstream services', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('api-gateway');
  });

  test('rejects an invalid bearer token before proxying', async () => {
    const res = await request(app).get('/api/orders').set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(401);
  });

  test('returns 502 when a downstream service is unreachable', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('BAD_GATEWAY');
  }, 10000);

  test('unknown route returns 404', async () => {
    const res = await request(app).get('/not-a-real-route');
    expect(res.status).toBe(404);
  });
});
