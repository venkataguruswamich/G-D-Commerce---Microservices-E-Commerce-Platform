const db = require('../config/db');

async function getByProductId(productId) {
  const res = await db.query(
    `SELECT product_id AS "productId", quantity, reserved, updated_at AS "updatedAt"
     FROM inventory WHERE product_id = $1`,
    [productId]
  );
  return res.rows[0] || null;
}

async function list({ page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const rowsRes = await db.query(
    `SELECT p.id AS "productId", p.sku, p.name, i.quantity, i.reserved, i.updated_at AS "updatedAt"
     FROM products p
     LEFT JOIN inventory i ON i.product_id = p.id
     ORDER BY p.name ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countRes = await db.query('SELECT COUNT(*)::int AS count FROM products');

  return {
    items: rowsRes.rows.map((row) => ({
      productId: row.productId,
      sku: row.sku,
      name: row.name,
      quantity: row.quantity ?? 0,
      reserved: row.reserved ?? 0,
      updatedAt: row.updatedAt,
    })),
    total: countRes.rows[0].count,
    page,
    limit,
  };
}

async function upsert(productId, { quantity, reserved }) {
  const res = await db.query(
    `INSERT INTO inventory (product_id, quantity, reserved)
     VALUES ($1, COALESCE($2, 0), COALESCE($3, 0))
     ON CONFLICT (product_id) DO UPDATE SET
       quantity = COALESCE($2, inventory.quantity),
       reserved = COALESCE($3, inventory.reserved),
       updated_at = now()
     RETURNING product_id AS "productId", quantity, reserved, updated_at AS "updatedAt"`,
    [productId, quantity ?? null, reserved ?? null]
  );
  return res.rows[0];
}

module.exports = { getByProductId, list, upsert };
