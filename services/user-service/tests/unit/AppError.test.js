const AppError = require('../../src/utils/AppError');

describe('AppError', () => {
  test('carries code, message, and statusCode', () => {
    const err = new AppError('NOT_FOUND', 'missing', 404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('missing');
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });
});
