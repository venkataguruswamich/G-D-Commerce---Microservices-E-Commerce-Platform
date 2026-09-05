const env = require('../config/env');
const AppError = require('./AppError');

/**
 * Fetches authoritative product data (price, active status) from
 * product-service rather than trusting client-supplied prices.
 */
async function getProduct(productId) {
  const res = await fetch(`${env.productServiceUrl}/products/${productId}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new AppError('PRODUCT_SERVICE_ERROR', 'Failed to fetch product details', 502);
  }
  const body = await res.json();
  return body.data;
}

module.exports = { getProduct };
