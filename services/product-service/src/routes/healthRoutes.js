const express = require('express');
const db = require('../config/db');
const redis = require('../config/redis');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'product-service' });
});

router.get('/ready', async (req, res) => {
  const dependencies = { postgres: 'unknown', redis: 'unknown' };
  let ready = true;

  try {
    await db.checkConnection();
    dependencies.postgres = 'ok';
  } catch (err) {
    dependencies.postgres = 'unreachable';
    ready = false;
  }

  try {
    await redis.checkConnection();
    dependencies.redis = 'ok';
  } catch (err) {
    dependencies.redis = 'unreachable';
    ready = false;
  }

  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', service: 'product-service', dependencies });
});

module.exports = router;
