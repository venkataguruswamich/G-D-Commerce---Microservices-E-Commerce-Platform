jest.mock('../../src/config/db', () => ({
  checkConnection: jest.fn(),
  query: jest.fn(),
  pool: { on: jest.fn() },
}));
jest.mock('../../src/config/redis', () => ({
  checkConnection: jest.fn(),
  connect: jest.fn().mockResolvedValue(),
  client: { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn(), on: jest.fn() },
}));
jest.mock('../../src/models/productModel');

const jwt = require('jsonwebtoken');
const request = require('supertest');
const createApp = require('../../src/app');
const productModel = require('../../src/models/productModel');

const app = createApp();

function adminToken() {
  return jwt.sign({ sub: 'admin-1', email: 'admin@example.com', role: 'ADMIN' }, process.env.JWT_SECRET);
}

describe('GET /products', () => {
  test('returns paginated product list', async () => {
    productModel.search.mockResolvedValueOnce({ items: [{ id: 'p1', name: 'Widget' }], total: 1, page: 1, limit: 20 });
    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  test('rejects invalid query params with 400', async () => {
    const res = await request(app).get('/products?minPrice=-5');
    expect(res.status).toBe(400);
  });
});

describe('GET /products/:id', () => {
  test('returns 404 for unknown product', async () => {
    productModel.findById.mockResolvedValueOnce(null);
    const res = await request(app).get('/products/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

describe('POST /products', () => {
  test('rejects requests without a token', async () => {
    const res = await request(app).post('/products').send({ sku: 'X', name: 'X', priceCents: 100 });
    expect(res.status).toBe(401);
  });

  test('allows an ADMIN to create a product', async () => {
    productModel.create.mockResolvedValueOnce({ id: 'p1', sku: 'SKU-1', name: 'New Product', priceCents: 500 });
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ sku: 'SKU-1', name: 'New Product', priceCents: 500 });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('p1');
  });

  test('rejects a non-ADMIN role with 403', async () => {
    const token = jwt.sign({ sub: 'u1', email: 'c@example.com', role: 'CUSTOMER' }, process.env.JWT_SECRET);
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ sku: 'SKU-2', name: 'X', priceCents: 100 });
    expect(res.status).toBe(403);
  });
});
