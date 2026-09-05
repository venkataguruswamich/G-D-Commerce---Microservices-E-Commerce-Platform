const db = require('../config/db');

const PUBLIC_FIELDS = `
  u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName",
  r.name AS role, u.is_active AS "isActive", u.created_at AS "createdAt", u.updated_at AS "updatedAt"
`;

async function findByEmail(email) {
  const res = await db.query(
    `SELECT u.id, u.email, u.password_hash AS "passwordHash", u.first_name AS "firstName",
            u.last_name AS "lastName", r.name AS role, u.is_active AS "isActive"
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1`,
    [email]
  );
  return res.rows[0] || null;
}

async function findById(id) {
  const res = await db.query(
    `SELECT ${PUBLIC_FIELDS} FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function create({ email, passwordHash, firstName, lastName, roleName = 'CUSTOMER' }) {
  const roleRes = await db.query('SELECT id FROM roles WHERE name = $1', [roleName]);
  if (roleRes.rows.length === 0) throw new Error(`Role ${roleName} does not exist`);
  const roleId = roleRes.rows[0].id;

  const res = await db.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name AS "firstName", last_name AS "lastName", created_at AS "createdAt"`,
    [email, passwordHash, firstName, lastName, roleId]
  );
  return { ...res.rows[0], role: roleName };
}

async function updateProfile(id, { firstName, lastName }) {
  const res = await db.query(
    `UPDATE users SET
       first_name = COALESCE($2, first_name),
       last_name = COALESCE($3, last_name),
       updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [id, firstName || null, lastName || null]
  );
  if (res.rows.length === 0) return null;
  return findById(id);
}

async function list({ limit = 20, offset = 0 }) {
  const res = await db.query(
    `SELECT ${PUBLIC_FIELDS} FROM users u JOIN roles r ON r.id = u.role_id
     ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const countRes = await db.query('SELECT COUNT(*)::int AS count FROM users');
  return { items: res.rows, total: countRes.rows[0].count };
}

module.exports = { findByEmail, findById, create, updateProfile, list };
