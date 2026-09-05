const env = require('../config/env');
const AppError = require('./AppError');

/**
 * Fetches the authoritative order (amount, currency, owner, status) from
 * order-service rather than trusting client-supplied payment amounts.
 * Forwards the caller's bearer token so order-service's own ownership
 * check applies.
 */
async function getOrder(orderId, bearerToken) {
  const res = await fetch(`${env.orderServiceUrl}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${bearerToken}` },
  });
  if (res.status === 404) return null;
  if (res.status === 401 || res.status === 403) {
    throw new AppError('FORBIDDEN', 'You do not have access to this order', 403);
  }
  if (!res.ok) {
    throw new AppError('ORDER_SERVICE_ERROR', 'Failed to fetch order details', 502);
  }
  const body = await res.json();
  return body.data;
}

module.exports = { getOrder };
