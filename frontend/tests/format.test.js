import { describe, test, expect } from 'vitest';
import { formatMoney } from '../src/utils/format';

describe('formatMoney', () => {
  test('formats cents as USD currency', () => {
    expect(formatMoney(1999)).toBe('$19.99');
  });

  test('treats missing amounts as zero', () => {
    expect(formatMoney(undefined)).toBe('$0.00');
  });

  test('supports other currencies', () => {
    expect(formatMoney(500, 'EUR')).toContain('5.00');
  });
});
