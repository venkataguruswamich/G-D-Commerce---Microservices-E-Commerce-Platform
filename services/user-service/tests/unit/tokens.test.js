const jwt = require('jsonwebtoken');
const tokens = require('../../src/utils/tokens');

describe('tokens util', () => {
  const user = { id: 'user-123', email: 'a@example.com', role: 'CUSTOMER' };

  test('signAccessToken produces a verifiable JWT with expected claims', () => {
    const token = tokens.signAccessToken(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.sub).toBe(user.id);
    expect(decoded.email).toBe(user.email);
    expect(decoded.role).toBe(user.role);
  });

  test('signRefreshToken produces a JWT verifiable only with the refresh secret', () => {
    const token = tokens.signRefreshToken(user);
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow();
    const decoded = tokens.verifyRefreshToken(token);
    expect(decoded.sub).toBe(user.id);
  });

  test('refreshTokenExpiryDate returns a future date', () => {
    const expiry = tokens.refreshTokenExpiryDate();
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });
});
