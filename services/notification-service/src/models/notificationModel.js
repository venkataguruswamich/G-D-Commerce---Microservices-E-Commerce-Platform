const db = require('../config/db');

async function create({ userId, type, channel, payload, status }) {
  const res = await db.query(
    `INSERT INTO notifications (user_id, type, channel, payload, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id AS "userId", type, channel, payload, status, created_at AS "createdAt"`,
    [userId || null, type, channel, JSON.stringify(payload || {}), status]
  );
  return res.rows[0];
}

async function list({ userId = null, page = 1, limit = 20 }) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const rowsRes = await db.query(
    `SELECT id, user_id AS "userId", type, channel, payload, status, created_at AS "createdAt"
     FROM notifications ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  const countRes = await db.query(`SELECT COUNT(*)::int AS count FROM notifications ${whereClause}`, params.slice(0, params.length - 2));

  return { items: rowsRes.rows, total: countRes.rows[0].count, page, limit };
}

module.exports = { create, list };
