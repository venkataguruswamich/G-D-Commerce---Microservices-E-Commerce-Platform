const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const requestId = require('./middleware/requestId');
const validateToken = require('./middleware/validateToken');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const registerProxyRoutes = require('./routes/proxy');
const logger = require('./utils/logger');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsAllowedOrigins.length > 0 ? env.corsAllowedOrigins : false,
    })
  );
  app.use(requestId);

  app.use((req, res, next) => {
    logger.info('Incoming request', { requestId: req.requestId, method: req.method, path: req.path });
    next();
  });

  app.use(
    rateLimit({
      windowMs: env.rateLimitWindowMs,
      max: env.rateLimitMaxRequests,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Health/readiness are handled locally, before proxying, and are never forwarded upstream.
  app.use('/', healthRoutes);

  // Deliberately NOT using express.json() here: request bodies must remain an
  // unconsumed stream so http-proxy-middleware can pipe them upstream as-is.
  // JSON parsing and validation happen in the owning service.
  app.use(validateToken);
  registerProxyRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
