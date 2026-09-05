jest.mock('../../src/config/redis', () => ({
  connect: jest.fn().mockResolvedValue(),
  client: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
}));

const redis = require('../../src/config/redis');
const cache = require('../../src/utils/cache');

describe('cache-aside helper', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns cached value without calling the loader on a hit', async () => {
    redis.client.get.mockResolvedValueOnce(JSON.stringify({ id: 'p1' }));
    const loader = jest.fn();

    const result = await cache.getOrSet('product:p1', 60, loader);

    expect(result).toEqual({ id: 'p1' });
    expect(loader).not.toHaveBeenCalled();
  });

  test('calls the loader and caches the result on a miss', async () => {
    redis.client.get.mockResolvedValueOnce(null);
    const loader = jest.fn().mockResolvedValueOnce({ id: 'p2' });

    const result = await cache.getOrSet('product:p2', 60, loader);

    expect(result).toEqual({ id: 'p2' });
    expect(redis.client.set).toHaveBeenCalledWith('product:p2', JSON.stringify({ id: 'p2' }), { EX: 60 });
  });

  test('falls back to the loader if Redis read fails', async () => {
    redis.client.get.mockRejectedValueOnce(new Error('connection refused'));
    const loader = jest.fn().mockResolvedValueOnce({ id: 'p3' });

    const result = await cache.getOrSet('product:p3', 60, loader);

    expect(result).toEqual({ id: 'p3' });
  });
});
