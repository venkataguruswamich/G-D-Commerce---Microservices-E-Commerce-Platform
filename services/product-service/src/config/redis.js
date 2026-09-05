const { createClient } = require('redis');
const env = require('./env');
const logger = require('../utils/logger');

const client = createClient({ url: env.redisUrl });

client.on('error', (err) => logger.error('Redis client error', { message: err.message }));

let connectPromise = null;
function connect() {
  if (!connectPromise) connectPromise = client.connect();
  return connectPromise;
}

async function checkConnection() {
  await connect();
  await client.ping();
}

module.exports = { client, connect, checkConnection };
