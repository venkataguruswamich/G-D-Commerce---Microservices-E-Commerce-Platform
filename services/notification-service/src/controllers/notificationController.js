const notificationModel = require('../models/notificationModel');

async function listNotifications(req, res, next) {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const result = await notificationModel.list({
      userId: isAdmin ? null : req.user.id,
      page,
      limit,
    });

    return res.status(200).json({ success: true, data: result, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listNotifications };
