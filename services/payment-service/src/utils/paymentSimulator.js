const crypto = require('crypto');

/**
 * DEMO ONLY — deterministic, simulated payment outcome. No real payment
 * processor is contacted and no real funds ever move. The same
 * (orderId, amountCents) pair always resolves to the same outcome, which
 * keeps retries idempotent and tests reproducible. Roughly 1 in 10 orders
 * simulate a failure so failure-path behavior (order cancellation,
 * notifications) can be exercised deterministically.
 */
function simulateOutcome(orderId, amountCents) {
  const hash = crypto.createHash('sha256').update(`${orderId}:${amountCents}`).digest();
  const bucket = hash[0] % 10;
  return bucket === 0 ? 'FAILED' : 'SUCCESS';
}

module.exports = { simulateOutcome };
