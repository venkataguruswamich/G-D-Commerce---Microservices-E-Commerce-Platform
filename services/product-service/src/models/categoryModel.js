const db = require('../config/db');

async function list() {
  const res = await db.query(
    `SELECT id, name, slug, description, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM categories ORDER BY name ASC`
  );
  return res.rows;
}

async function findById(id) {
  const res = await db.query(
    `SELECT id, name, slug, description, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM categories WHERE id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function create({ name, slug, description }) {
  const res = await db.query(
    `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)
     RETURNING id, name, slug, description, created_at AS "createdAt"`,
    [name, slug, description || null]
  );
  return res.rows[0];
}

async function update(id, { name, slug, description }) {
  const res = await db.query(
    `UPDATE categories SET
       name = COALESCE($2, name),
       slug = COALESCE($3, slug),
       description = COALESCE($4, description),
       updated_at = now()
     WHERE id = $1
     RETURNING id, name, slug, description, updated_at AS "updatedAt"`,
    [id, name || null, slug || null, description || null]
  );
  return res.rows[0] || null;
}

async function remove(id) {
  const res = await db.query(`DELETE FROM categories WHERE id = $1 RETURNING id`, [id]);
  return res.rows.length > 0;
}

module.exports = { list, findById, create, update, remove };
