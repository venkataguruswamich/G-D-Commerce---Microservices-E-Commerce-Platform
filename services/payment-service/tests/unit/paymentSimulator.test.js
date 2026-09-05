const { simulateOutcome } = require('../../src/utils/paymentSimulator');

describe('paymentSimulator', () => {
  test('is deterministic for the same orderId and amount', () => {
    const a = simulateOutcome('order-123', 5000);
    const b = simulateOutcome('order-123', 5000);
    expect(a).toBe(b);
  });

  test('only ever returns SUCCESS or FAILED', () => {
    for (let i = 0; i < 50; i += 1) {
      const outcome = simulateOutcome(`order-${i}`, 1000 * i);
      expect(['SUCCESS', 'FAILED']).toContain(outcome);
    }
  });

  test('different orders can produce different outcomes', () => {
    const outcomes = new Set();
    for (let i = 0; i < 50; i += 1) {
      outcomes.add(simulateOutcome(`order-${i}`, 1000));
    }
    expect(outcomes.size).toBeGreaterThan(1);
  });
});
