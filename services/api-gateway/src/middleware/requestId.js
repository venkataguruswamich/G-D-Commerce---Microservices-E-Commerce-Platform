const { v4: uuidv4 } = require('uuid');

module.exports = function requestId(req, res, next) {
  req.requestId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = req.requestId;
  res.setHeader('x-request-id', req.requestId);
  next();
};
