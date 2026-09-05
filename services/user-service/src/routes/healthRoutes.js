const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

router.get('/ready', async (req, res) => {
  try {
    await db.checkConnection();
    res.status(200).json({ status: 'ready', service: 'user-service', dependencies: { postgres: 'ok' } });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', service: 'user-service', dependencies: { postgres: 'unreachable' } });
  }
});

module.exports = router;
