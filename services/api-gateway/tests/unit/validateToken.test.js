const jwt = require('jsonwebtoken');
const validateToken = require('../../src/middleware/validateToken');

function mockReqRes(headers = {}) {
  const req = { headers, requestId: 'test-request-id' };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return { req, res };
}

describe('validateToken middleware', () => {
  test('calls next() when no Authorization header is present', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    validateToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('rejects a malformed Authorization header with 401', () => {
    const { req, res } = mockReqRes({ authorization: 'NotBearer abc' });
    const next = jest.fn();
    validateToken(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects an invalid token with 401', () => {
    const { req, res } = mockReqRes({ authorization: 'Bearer not-a-real-token' });
    const next = jest.fn();
    validateToken(req, res, next);
    expect(res.statusCode).toBe(401);
  });

  test('calls next() for a valid token', () => {
    const token = jwt.sign({ sub: 'u1' }, process.env.JWT_SECRET);
    const { req, res } = mockReqRes({ authorization: `Bearer ${token}` });
    const next = jest.fn();
    validateToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
