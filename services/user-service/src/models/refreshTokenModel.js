const crypto = require('crypto');
const db = require('../config/db');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function store(userId, token, expiresAt) {
  const tokenHash = hashToken(token);
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

async function findValid(token) {
  const tokenHash = hashToken(token);
  const res = await db.query(
    `SELECT id, user_id AS "userId", expires_at AS "expiresAt", revoked_at AS "revokedAt"
     FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash]
  );
  const row = res.rows[0];
  if (!row) return null;
  if (row.revokedAt) return null;
  if (new Date(row.expiresAt) < new Date()) return null;
  return row;
}

async function revoke(token) {
  const tokenHash = hashToken(token);
  await db.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`, [tokenHash]);
}

async function revokeAllForUser(userId) {
  await db.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);
}

module.exports = { store, findValid, revoke, revokeAllForUser, hashToken };
