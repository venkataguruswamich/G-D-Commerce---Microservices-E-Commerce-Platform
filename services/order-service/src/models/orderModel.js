const db = require('../config/db');

async function createWithItems({ userId, items, shippingAddress, totalCents, currency = 'USD' }) {
  return db.withTransaction(async (client) => {
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, status, total_cents, currency, shipping_address)
       VALUES ($1, 'PENDING', $2, $3, $4)
       RETURNING id, user_id AS "userId", status, total_cents AS "totalCents", currency,
                 shipping_address AS "shippingAddress", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [userId, totalCents, currency, JSON.stringify(shippingAddress)]
    );
    const order = orderRes.rows[0];

    const insertedItems = [];
    for (const item of items) {
      // eslint-disable-next-line no-await-in-loop
      const itemRes = await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, product_id AS "productId", product_name AS "productName",
                   unit_price_cents AS "unitPriceCents", quantity`,
        [order.id, item.productId, item.productName, item.unitPriceCents, item.quantity]
      );
      insertedItems.push(itemRes.rows[0]);
    }

    return { ...order, items: insertedItems };
  });
}

async function findById(id) {
  const orderRes = await db.query(
    `SELECT id, user_id AS "userId", status, total_cents AS "totalCents", currency,
            shipping_address AS "shippingAddress", created_at AS "createdAt", updated_at AS "updatedAt"
     FROM orders WHERE id = $1`,
    [id]
  );
  const order = orderRes.rows[0];
  if (!order) return null;

  const itemsRes = await db.query(
    `SELECT id, product_id AS "productId", product_name AS "productName",
            unit_price_cents AS "unitPriceCents", quantity
     FROM order_items WHERE order_id = $1`,
    [id]
  );

  return { ...order, items: itemsRes.rows };
}

async function list({ userId = null, status = null, page = 1, limit = 20 }) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const rowsRes = await db.query(
    `SELECT id, user_id AS "userId", status, total_cents AS "totalCents", currency, created_at AS "createdAt"
     FROM orders ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  const countRes = await db.query(`SELECT COUNT(*)::int AS count FROM orders ${whereClause}`, params.slice(0, params.length - 2));

  return { items: rowsRes.rows, total: countRes.rows[0].count, page, limit };
}

async function updateStatus(id, status) {
  const res = await db.query(
    `UPDATE orders SET status = $2, updated_at = now() WHERE id = $1
     RETURNING id, user_id AS "userId", status, total_cents AS "totalCents", currency, updated_at AS "updatedAt"`,
    [id, status]
  );
  return res.rows[0] || null;
}

module.exports = { createWithItems, findById, list, updateStatus };
