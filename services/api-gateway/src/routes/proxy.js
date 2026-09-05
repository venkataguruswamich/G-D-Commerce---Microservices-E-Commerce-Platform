const { createProxyMiddleware } = require('http-proxy-middleware');
const env = require('../config/env');
const logger = require('../utils/logger');

// http-proxy-middleware v3 moved event handlers under `on.error` (the v2
// top-level `onError` option is silently ignored in v3, which left this
// gateway falling back to the library's own default error handler — plain
// text, and a 504 for ECONNREFUSED — instead of the app's standard JSON
// error envelope). `res` here is the raw Node ServerResponse, not an
// Express response, so this uses writeHead/end rather than res.json().
function proxyErrorHandler(err, req, res) {
  logger.error('Upstream proxy error', { requestId: req.requestId, target: req.originalUrl, message: err.message });
  if (res && typeof res.writeHead === 'function' && !res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: false,
        error: { code: 'BAD_GATEWAY', message: 'Upstream service is unavailable' },
        requestId: req.requestId,
      })
    );
  }
}

function mount(app, routePath, target, pathRewrite) {
  app.use(
    routePath,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite,
      on: { error: proxyErrorHandler },
    })
  );
}

// Express strips the app.use() mount prefix from req.url before the proxy
// middleware ever sees it (e.g. a request to /api/auth/register arrives
// here as just /register), so pathRewrite must PREPEND the upstream
// service's own base path rather than try to replace the (already gone)
// gateway prefix.
function registerProxyRoutes(app) {
  mount(app, '/api/auth', env.services.user, { '^/': '/auth/' });
  mount(app, '/api/users', env.services.user, { '^/': '/users/' });
  mount(app, '/api/products', env.services.product, { '^/': '/products/' });
  mount(app, '/api/categories', env.services.product, { '^/': '/categories/' });
  mount(app, '/api/orders', env.services.order, { '^/': '/orders/' });
  mount(app, '/api/payments', env.services.payment, { '^/': '/payments/' });
  mount(app, '/api/notifications', env.services.notification, { '^/': '/notifications/' });
}

module.exports = registerProxyRoutes;
