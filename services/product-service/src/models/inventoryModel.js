const db = require('../config/db');

async function getByProductId(productId) {
  const res = await db.query(
    `SELECT product_id AS "productId", quantity, reserved, updated_at AS "updatedAt"
     FROM inventory WHERE product_id = $1`,
    [productId]
  );
  return res.rows[0] || null;
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

module.exports = { getByProductId, upsert };
