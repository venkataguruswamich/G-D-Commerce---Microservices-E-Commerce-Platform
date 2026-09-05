jest.mock('../../src/config/db', () => ({
  checkConnection: jest.fn(),
  query: jest.fn(),
  withTransaction: jest.fn(),
  pool: { on: jest.fn() },
}));
jest.mock('../../src/config/rabbitmq', () => ({
  checkConnection: jest.fn(),
  connect: jest.fn(),
  assertQueue: jest.fn().mockResolvedValue(),
  publish: jest.fn().mockResolvedValue(),
  consume: jest.fn().mockResolvedValue(),
}));
jest.mock('../../src/models/orderModel');
jest.mock('../../src/utils/productClient');

const jwt = require('jsonwebtoken');
const request = require('supertest');
const createApp = require('../../src/app');
const orderModel = require('../../src/models/orderModel');
const productClient = require('../../src/utils/productClient');

const app = createApp();

function tokenFor(role, id = 'user-1') {
  return jwt.sign({ sub: id, email: `${id}@example.com`, role }, process.env.JWT_SECRET);
}

const shippingAddress = {
  line1: '123 Main St',
  city: 'Metropolis',
  state: 'NY',
  postalCode: '10001',
  country: 'US',
};

describe('POST /orders', () => {
  test('requires authentication', async () => {
    const res = await request(app).post('/orders').send({ items: [], shippingAddress });
    expect(res.status).toBe(401);
  });

  test('rejects an order containing an unavailable product', async () => {
    productClient.getProduct.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${tokenFor('CUSTOMER')}`)
      .send({ items: [{ productId: '11111111-1111-1111-1111-111111111111', quantity: 1 }], shippingAddress });
    expect(res.status).toBe(422);
  });

  test('creates an order and computes the total from authoritative product prices', async () => {
    productClient.getProduct.mockResolvedValueOnce({ id: 'p1', name: 'Widget', priceCents: 1000, isActive: true });
    orderModel.createWithItems.mockResolvedValueOnce({
      id: 'order-1',
      userId: 'user-1',
      status: 'PENDING',
      totalCents: 2000,
      currency: 'USD',
      items: [{ productId: '33333333-3333-3333-3333-333333333333', productName: 'Widget', unitPriceCents: 1000, quantity: 2 }],
    });

    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${tokenFor('CUSTOMER')}`)
      .send({ items: [{ productId: '33333333-3333-3333-3333-333333333333', quantity: 2 }], shippingAddress });

    expect(res.status).toBe(201);
    expect(res.body.data.totalCents).toBe(2000);
  });
});

describe('GET /orders/:id', () => {
  test('forbids a customer from viewing another customer order', async () => {
    orderModel.findById.mockResolvedValueOnce({ id: 'order-1', userId: 'someone-else', status: 'PENDING' });
    const res = await request(app).get('/orders/order-1').set('Authorization', `Bearer ${tokenFor('CUSTOMER', 'user-1')}`);
    expect(res.status).toBe(403);
  });

  test('allows ADMIN to view any order', async () => {
    orderModel.findById.mockResolvedValueOnce({ id: 'order-1', userId: 'someone-else', status: 'PENDING' });
    const res = await request(app).get('/orders/order-1').set('Authorization', `Bearer ${tokenFor('ADMIN', 'admin-1')}`);
    expect(res.status).toBe(200);
  });
});

describe('PUT /orders/:id/status', () => {
  test('rejects non-ADMIN with 403', async () => {
    const res = await request(app)
      .put('/orders/order-1/status')
      .set('Authorization', `Bearer ${tokenFor('CUSTOMER')}`)
      .send({ status: 'CONFIRMED' });
    expect(res.status).toBe(403);
  });

  test('rejects an invalid status transition with 409', async () => {
    orderModel.findById.mockResolvedValueOnce({ id: 'order-1', userId: 'user-1', status: 'DELIVERED' });
    const res = await request(app)
      .put('/orders/order-1/status')
      .set('Authorization', `Bearer ${tokenFor('ADMIN')}`)
      .send({ status: 'CONFIRMED' });
    expect(res.status).toBe(409);
  });
});
