const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

function refreshTokenExpiryDate() {
  const match = /^(\d+)([smhd])$/.exec(env.jwtRefreshExpiresIn);
  const unitMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const ms = match ? parseInt(match[1], 10) * unitMs[match[2]] : 7 * 86400000;
  return new Date(Date.now() + ms);
}

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, refreshTokenExpiryDate };
