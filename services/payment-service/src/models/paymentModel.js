const db = require('../config/db');

async function findByOrderId(orderId) {
  const res = await db.query(
    `SELECT id, order_id AS "orderId", user_id AS "userId", amount_cents AS "amountCents",
            currency, status, method, transaction_ref AS "transactionRef",
            created_at AS "createdAt", updated_at AS "updatedAt"
     FROM payments WHERE order_id = $1`,
    [orderId]
  );
  return res.rows[0] || null;
}

async function findById(id) {
  const res = await db.query(
    `SELECT id, order_id AS "orderId", user_id AS "userId", amount_cents AS "amountCents",
            currency, status, method, transaction_ref AS "transactionRef",
            created_at AS "createdAt", updated_at AS "updatedAt"
     FROM payments WHERE id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function create({ orderId, userId, amountCents, currency, method, transactionRef, status }) {
  const res = await db.query(
    `INSERT INTO payments (order_id, user_id, amount_cents, currency, status, method, transaction_ref)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, order_id AS "orderId", user_id AS "userId", amount_cents AS "amountCents",
               currency, status, method, transaction_ref AS "transactionRef", created_at AS "createdAt"`,
    [orderId, userId, amountCents, currency, status, method, transactionRef]
  );
  return res.rows[0];
}

async function updateStatus(id, status) {
  const res = await db.query(
    `UPDATE payments SET status = $2, updated_at = now() WHERE id = $1
     RETURNING id, order_id AS "orderId", user_id AS "userId", amount_cents AS "amountCents",
               currency, status, method, transaction_ref AS "transactionRef", updated_at AS "updatedAt"`,
    [id, status]
  );
  return res.rows[0] || null;
}

module.exports = { findByOrderId, findById, create, updateStatus };
