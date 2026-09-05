#!/usr/bin/env node
/**
 * Minimal, dependency-light migration runner.
 * Applies/rolls back the numbered *.up.sql / *.down.sql pairs in
 * database/migrations, tracking applied versions in schema_migrations.
 *
 * Usage:
 *   node migrate.js up            # apply all pending migrations
 *   node migrate.js down          # roll back the most recently applied migration
 *   node migrate.js status        # list applied / pending migrations
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

function loadMigrations() {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.up.sql'));
  return files
    .map((f) => {
      const version = f.split('_')[0];
      const name = f.replace('.up.sql', '');
      return {
        version,
        name,
        upFile: path.join(MIGRATIONS_DIR, f),
        downFile: path.join(MIGRATIONS_DIR, `${name}.down.sql`),
      };
    })
    .sort((a, b) => a.version.localeCompare(b.version));
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version     VARCHAR(20) PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedVersions(client) {
  const res = await client.query('SELECT version FROM schema_migrations ORDER BY version;');
  return new Set(res.rows.map((r) => r.version));
}

async function up(client) {
  await ensureMigrationsTable(client);
  const applied = await getAppliedVersions(client);
  const migrations = loadMigrations();
  let count = 0;

  for (const m of migrations) {
    if (applied.has(m.version)) continue;
    const sql = fs.readFileSync(m.upFile, 'utf8');
    console.log(`Applying ${m.name}...`);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version, name) VALUES ($1, $2);', [m.version, m.name]);
      await client.query('COMMIT');
      count += 1;
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${m.name} failed: ${err.message}`);
    }
  }

  console.log(count === 0 ? 'No pending migrations.' : `Applied ${count} migration(s).`);
}

async function down(client) {
  await ensureMigrationsTable(client);
  const res = await client.query('SELECT version, name FROM schema_migrations ORDER BY version DESC LIMIT 1;');
  if (res.rows.length === 0) {
    console.log('No migrations to roll back.');
    return;
  }
  const { version, name } = res.rows[0];
  const migrations = loadMigrations();
  const m = migrations.find((mm) => mm.version === version);
  if (!m) throw new Error(`Cannot find migration files for applied version ${version}`);

  const sql = fs.readFileSync(m.downFile, 'utf8');
  console.log(`Rolling back ${name}...`);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('DELETE FROM schema_migrations WHERE version = $1;', [version]);
    await client.query('COMMIT');
    console.log(`Rolled back ${name}.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw new Error(`Rollback of ${name} failed: ${err.message}`);
  }
}

async function status(client) {
  await ensureMigrationsTable(client);
  const applied = await getAppliedVersions(client);
  const migrations = loadMigrations();
  for (const m of migrations) {
    console.log(`[${applied.has(m.version) ? 'x' : ' '}] ${m.name}`);
  }
}

async function main() {
  const command = process.argv[2];
  if (!['up', 'down', 'status'].includes(command)) {
    console.error('Usage: node migrate.js <up|down|status>');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    if (command === 'up') await up(client);
    if (command === 'down') await down(client);
    if (command === 'status') await status(client);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
