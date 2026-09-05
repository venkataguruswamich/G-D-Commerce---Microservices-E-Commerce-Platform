const express = require('express');
const db = require('../config/db');
const rabbitmq = require('../config/rabbitmq');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notification-service' });
});

router.get('/ready', async (req, res) => {
  const dependencies = { postgres: 'unknown', rabbitmq: 'unknown' };
  let ready = true;

  try {
    await db.checkConnection();
    dependencies.postgres = 'ok';
  } catch (err) {
    dependencies.postgres = 'unreachable';
    ready = false;
  }

  try {
    await rabbitmq.checkConnection();
    dependencies.rabbitmq = 'ok';
  } catch (err) {
    dependencies.rabbitmq = 'unreachable';
    ready = false;
  }

  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', service: 'notification-service', dependencies });
});

module.exports = router;
