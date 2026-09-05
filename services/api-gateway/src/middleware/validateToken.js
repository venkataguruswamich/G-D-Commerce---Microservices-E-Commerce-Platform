const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Edge-level JWT validation: if a bearer token is present, it must be
 * well-formed and unexpired or the request is rejected here (defense in
 * depth). Requests with no Authorization header are passed through
 * untouched — many routes (product browsing, registration, login) are
 * public, and per-route authorization is enforced by the owning service.
 */
module.exports = function validateToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return next();

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Malformed Authorization header' },
      requestId: req.requestId,
    });
  }

  try {
    jwt.verify(token, env.jwtSecret);
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
      requestId: req.requestId,
    });
  }
};
