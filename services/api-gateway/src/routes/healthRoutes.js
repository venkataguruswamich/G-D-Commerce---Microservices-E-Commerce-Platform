const express = require('express');
const env = require('../config/env');

const router = express.Router();

async function pingService(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${url}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch (err) {
    return false;
  }
}

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

router.get('/ready', async (req, res) => {
  const entries = Object.entries(env.services);
  const results = await Promise.all(entries.map(([, url]) => pingService(url)));

  const dependencies = {};
  entries.forEach(([name], i) => {
    dependencies[name] = results[i] ? 'ok' : 'unreachable';
  });

  const ready = results.every(Boolean);
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', service: 'api-gateway', dependencies });
});

module.exports = router;
