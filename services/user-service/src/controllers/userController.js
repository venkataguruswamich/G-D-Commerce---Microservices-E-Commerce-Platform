const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');

async function getMe(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return next(new AppError('NOT_FOUND', 'User not found', 404));
    return res.status(200).json({ success: true, data: user, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const updated = await userModel.updateProfile(req.user.id, req.body);
    if (!updated) return next(new AppError('NOT_FOUND', 'User not found', 404));
    return res.status(200).json({ success: true, data: updated, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await userModel.list({ limit, offset });
    return res.status(200).json({ success: true, data: result, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return next(new AppError('NOT_FOUND', 'User not found', 404));
    return res.status(200).json({ success: true, data: user, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMe, updateMe, listUsers, getUserById };
