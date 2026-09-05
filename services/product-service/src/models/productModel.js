const db = require('../config/db');

const SORT_MAP = {
  price_asc: 'p.price_cents ASC',
  price_desc: 'p.price_cents DESC',
  name_asc: 'p.name ASC',
  name_desc: 'p.name DESC',
  newest: 'p.created_at DESC',
};

const SELECT_FIELDS = `
  p.id, p.category_id AS "categoryId", p.sku, p.name, p.description,
  p.price_cents AS "priceCents", p.currency, p.image_url AS "imageUrl",
  p.is_active AS "isActive", p.created_at AS "createdAt", p.updated_at AS "updatedAt",
  c.name AS "categoryName"
`;

async function search({ search, categoryId, minPrice, maxPrice, sort, page = 1, limit = 20 }) {
  const conditions = ['p.is_active = true'];
  const params = [];

  if (search) {
    params.push(search);
    conditions.push(`to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', $${params.length})`);
  }
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`p.category_id = $${params.length}`);
  }
  if (minPrice !== undefined) {
    params.push(minPrice);
    conditions.push(`p.price_cents >= $${params.length}`);
  }
  if (maxPrice !== undefined) {
    params.push(maxPrice);
    conditions.push(`p.price_cents <= $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = `ORDER BY ${SORT_MAP[sort] || SORT_MAP.newest}`;
  const offset = (page - 1) * limit;

  params.push(limit);
  const limitParamIndex = params.length;
  params.push(offset);
  const offsetParamIndex = params.length;

  const rowsRes = await db.query(
    `SELECT ${SELECT_FIELDS} FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereClause}
     ${orderClause}
     LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
    params
  );

  const countRes = await db.query(
    `SELECT COUNT(*)::int AS count FROM products p ${whereClause}`,
    params.slice(0, params.length - 2)
  );

  return {
    items: rowsRes.rows,
    total: countRes.rows[0].count,
    page,
    limit,
  };
}

async function findById(id) {
  const res = await db.query(
    `SELECT ${SELECT_FIELDS} FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function create({ categoryId, sku, name, description, priceCents, currency = 'USD', imageUrl }) {
  const res = await db.query(
    `INSERT INTO products (category_id, sku, name, description, price_cents, currency, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, category_id AS "categoryId", sku, name, description,
               price_cents AS "priceCents", currency, image_url AS "imageUrl",
               is_active AS "isActive", created_at AS "createdAt"`,
    [categoryId || null, sku, name, description || null, priceCents, currency, imageUrl || null]
  );
  return res.rows[0];
}

async function update(id, fields) {
  const res = await db.query(
    `UPDATE products SET
       category_id = COALESCE($2, category_id),
       name = COALESCE($3, name),
       description = COALESCE($4, description),
       price_cents = COALESCE($5, price_cents),
       currency = COALESCE($6, currency),
       image_url = COALESCE($7, image_url),
       is_active = COALESCE($8, is_active),
       updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [
      id,
      fields.categoryId ?? null,
      fields.name ?? null,
      fields.description ?? null,
      fields.priceCents ?? null,
      fields.currency ?? null,
      fields.imageUrl ?? null,
      fields.isActive ?? null,
    ]
  );
  if (res.rows.length === 0) return null;
  return findById(id);
}

async function remove(id) {
  const res = await db.query(`DELETE FROM products WHERE id = $1 RETURNING id`, [id]);
  return res.rows.length > 0;
}

module.exports = { search, findById, create, update, remove };
