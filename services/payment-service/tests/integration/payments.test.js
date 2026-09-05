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
jest.mock('../../src/models/paymentModel');
jest.mock('../../src/utils/orderClient');

const jwt = require('jsonwebtoken');
const request = require('supertest');
const createApp = require('../../src/app');
const paymentModel = require('../../src/models/paymentModel');
const orderClient = require('../../src/utils/orderClient');

const app = createApp();

function tokenFor(role, id = 'user-1') {
  return jwt.sign({ sub: id, email: `${id}@example.com`, role }, process.env.JWT_SECRET);
}

describe('POST /payments', () => {
  test('requires authentication', async () => {
    const res = await request(app).post('/payments').send({ orderId: '11111111-1111-1111-1111-111111111111' });
    expect(res.status).toBe(401);
  });

  test('returns 404 when the order does not exist', async () => {
    orderClient.getOrder.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${tokenFor('CUSTOMER')}`)
      .send({ orderId: '11111111-1111-1111-1111-111111111111' });
    expect(res.status).toBe(404);
  });

  test('rejects paying for an order that is not PENDING', async () => {
    orderClient.getOrder.mockResolvedValueOnce({ id: 'o1', userId: 'user-1', status: 'CONFIRMED', totalCents: 1000, currency: 'USD' });
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${tokenFor('CUSTOMER')}`)
      .send({ orderId: '22222222-2222-2222-2222-222222222222' });
    expect(res.status).toBe(409);
  });

  test('rejects a duplicate payment for the same order', async () => {
    orderClient.getOrder.mockResolvedValueOnce({ id: 'o1', userId: 'user-1', status: 'PENDING', totalCents: 1000, currency: 'USD' });
    paymentModel.findByOrderId.mockResolvedValueOnce({ id: 'existing-payment' });
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${tokenFor('CUSTOMER')}`)
      .send({ orderId: '22222222-2222-2222-2222-222222222222' });
    expect(res.status).toBe(409);
  });

  test('creates and resolves a payment for a valid PENDING order', async () => {
    orderClient.getOrder.mockResolvedValueOnce({ id: 'o1', userId: 'user-1', status: 'PENDING', totalCents: 1000, currency: 'USD' });
    paymentModel.findByOrderId.mockResolvedValueOnce(null);
    paymentModel.create.mockResolvedValueOnce({ id: 'pay-1', status: 'PENDING' });
    paymentModel.updateStatus.mockResolvedValueOnce({ id: 'pay-1', status: 'SUCCESS', orderId: 'o1' });

    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${tokenFor('CUSTOMER')}`)
      .send({ orderId: '22222222-2222-2222-2222-222222222222' });

    expect(res.status).toBe(201);
    expect(['SUCCESS', 'FAILED']).toContain(res.body.data.status);
  });
});

describe('GET /payments', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/payments');
    expect(res.status).toBe(401);
  });

  test('rejects a non-ADMIN role with 403', async () => {
    const res = await request(app).get('/payments').set('Authorization', `Bearer ${tokenFor('CUSTOMER')}`);
    expect(res.status).toBe(403);
  });

  test('returns a paginated payment list for an ADMIN', async () => {
    paymentModel.list.mockResolvedValueOnce({ items: [{ id: 'pay-1', status: 'SUCCESS' }], total: 1, page: 1, limit: 20 });
    const res = await request(app).get('/payments').set('Authorization', `Bearer ${tokenFor('ADMIN')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  test('rejects an invalid status filter with 400', async () => {
    const res = await request(app).get('/payments?status=NOT_REAL').set('Authorization', `Bearer ${tokenFor('ADMIN')}`);
    expect(res.status).toBe(400);
  });
});

describe('GET /payments/:id', () => {
  test('forbids access to another user’s payment', async () => {
    paymentModel.findById.mockResolvedValueOnce({ id: 'pay-1', userId: 'someone-else' });
    const res = await request(app).get('/payments/pay-1').set('Authorization', `Bearer ${tokenFor('CUSTOMER', 'user-1')}`);
    expect(res.status).toBe(403);
  });
});
