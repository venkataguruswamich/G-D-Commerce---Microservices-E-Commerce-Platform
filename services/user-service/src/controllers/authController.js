const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const refreshTokenModel = require('../models/refreshTokenModel');
const tokens = require('../utils/tokens');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const BCRYPT_ROUNDS = 12;

async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return next(new AppError('EMAIL_IN_USE', 'An account with this email already exists', 409));
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await userModel.create({ email, passwordHash, firstName, lastName });

    logger.info('User registered', { requestId: req.requestId, userId: user.id });
    return res.status(201).json({ success: true, data: user, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user || !user.isActive) {
      return next(new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401));
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return next(new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401));
    }

    const accessToken = tokens.signAccessToken(user);
    const refreshToken = tokens.signRefreshToken(user);
    await refreshTokenModel.store(user.id, refreshToken, tokens.refreshTokenExpiryDate());

    logger.info('User logged in', { requestId: req.requestId, userId: user.id });
    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      },
      requestId: req.requestId,
    });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    let payload;
    try {
      payload = tokens.verifyRefreshToken(refreshToken);
    } catch (err) {
      return next(new AppError('INVALID_TOKEN', 'Invalid or expired refresh token', 401));
    }

    const stored = await refreshTokenModel.findValid(refreshToken);
    if (!stored) {
      return next(new AppError('INVALID_TOKEN', 'Refresh token not recognized or revoked', 401));
    }

    const user = await userModel.findById(payload.sub);
    if (!user || !user.isActive) {
      return next(new AppError('INVALID_TOKEN', 'User no longer active', 401));
    }

    await refreshTokenModel.revoke(refreshToken);
    const newAccessToken = tokens.signAccessToken(user);
    const newRefreshToken = tokens.signRefreshToken(user);
    await refreshTokenModel.store(user.id, newRefreshToken, tokens.refreshTokenExpiryDate());

    return res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      requestId: req.requestId,
    });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await refreshTokenModel.revoke(refreshToken);
    return res.status(200).json({ success: true, data: { message: 'Logged out' }, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, refresh, logout };
