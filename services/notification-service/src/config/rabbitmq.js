const amqp = require('amqplib');
const env = require('./env');
const logger = require('../utils/logger');

const EXCHANGE = env.rabbitmqExchange;
const DLX = `${EXCHANGE}.dlx`;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_TTL_MS = 5000;

let connection = null;
let channel = null;

const CONNECT_MAX_ATTEMPTS = 10;
const CONNECT_BACKOFF_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries internally with a fixed backoff: `depends_on: service_healthy`
 * in Compose narrows the startup race against RabbitMQ but does not fully
 * eliminate it, and unlike publish() (called per-request, which naturally
 * retries on the next call since a failed attempt never caches `channel`),
 * a consumer's one-shot start() call at boot would otherwise never get a
 * second chance if that first attempt lost the race.
 */
async function connect() {
  if (channel) return channel;

  let lastErr;
  for (let attempt = 1; attempt <= CONNECT_MAX_ATTEMPTS; attempt += 1) {
    try {
      connection = await amqp.connect(env.rabbitmqUrl);
      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      await channel.assertExchange(DLX, 'topic', { durable: true });

      connection.on('error', (err) => logger.error('RabbitMQ connection error', { message: err.message }));
      connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        channel = null;
        connection = null;
      });

      return channel;
    } catch (err) {
      lastErr = err;
      logger.warn(`RabbitMQ connect attempt ${attempt}/${CONNECT_MAX_ATTEMPTS} failed`, { message: err.message });
      if (attempt < CONNECT_MAX_ATTEMPTS) await sleep(CONNECT_BACKOFF_MS);
    }
  }

  throw lastErr;
}

async function assertQueue(queueName, bindingPatterns = []) {
  const ch = await connect();
  const dlqName = `${queueName}.dlq`;
  const retryName = `${queueName}.retry`;

  await ch.assertQueue(dlqName, { durable: true });
  await ch.bindQueue(dlqName, DLX, dlqName);

  await ch.assertQueue(queueName, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': DLX,
      'x-dead-letter-routing-key': dlqName,
    },
  });

  await ch.assertQueue(retryName, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': '',
      'x-dead-letter-routing-key': queueName,
      'x-message-ttl': RETRY_TTL_MS,
    },
  });

  for (const pattern of bindingPatterns) {
    // eslint-disable-next-line no-await-in-loop
    await ch.bindQueue(queueName, EXCHANGE, pattern);
  }

  return { queueName, dlqName, retryName };
}

async function publish(routingKey, payload, options = {}) {
  const ch = await connect();
  const buffer = Buffer.from(JSON.stringify(payload));
  return ch.publish(EXCHANGE, routingKey, buffer, {
    persistent: true,
    contentType: 'application/json',
    timestamp: Date.now(),
    ...options,
  });
}

async function consume(queueName, handler, { maxRetries = DEFAULT_MAX_RETRIES } = {}) {
  const ch = await connect();
  await ch.prefetch(10);

  return ch.consume(queueName, async (msg) => {
    if (!msg) return;
    const headers = msg.properties.headers || {};
    const retryCount = parseInt(headers['x-retry-count'] || '0', 10);

    try {
      const payload = JSON.parse(msg.content.toString());
      await handler(payload, msg);
      ch.ack(msg);
    } catch (err) {
      logger.error('Message handler failed', { queue: queueName, retryCount, message: err.message });

      if (retryCount < maxRetries) {
        ch.publish('', `${queueName}.retry`, msg.content, {
          persistent: true,
          headers: { ...headers, 'x-retry-count': retryCount + 1 },
        });
        ch.ack(msg);
      } else {
        logger.error('Max retries exceeded, routing to dead-letter queue', { queue: queueName });
        ch.nack(msg, false, false);
      }
    }
  });
}

async function checkConnection() {
  await connect();
}

module.exports = { connect, assertQueue, publish, consume, checkConnection, EXCHANGE, DLX };
