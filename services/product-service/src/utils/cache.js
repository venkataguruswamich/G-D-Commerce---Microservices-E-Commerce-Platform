const redis = require('../config/redis');
const env = require('../config/env');
const logger = require('../utils/logger');

const PRODUCT_KEY_PREFIX = 'product:';

function productCacheKey(id) {
  return `${PRODUCT_KEY_PREFIX}${id}`;
}

/**
 * Cache-aside read: return cached value if present, otherwise compute via
 * `loader`, cache the result with a TTL, and return it.
 */
async function getOrSet(key, ttlSeconds, loader) {
  try {
    await redis.connect();
    const cached = await redis.client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.warn('Redis read failed, falling back to source', { key, message: err.message });
  }

  const value = await loader();

  if (value !== null && value !== undefined) {
    try {
      await redis.client.set(key, JSON.stringify(value), { EX: ttlSeconds || env.productCacheTtlSeconds });
    } catch (err) {
      logger.warn('Redis write failed', { key, message: err.message });
    }
  }

  return value;
}

async function invalidate(key) {
  try {
    await redis.connect();
    await redis.client.del(key);
  } catch (err) {
    logger.warn('Redis invalidation failed', { key, message: err.message });
  }
}

module.exports = { getOrSet, invalidate, productCacheKey };
