#!/usr/bin/env node
/**
 * Seeds development data: roles, an admin user, a customer user, categories,
 * products, and inventory. DEVELOPMENT CREDENTIALS ONLY — never reuse in
 * production.
 *
 * Usage: node seeds/seed.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const DEV_ADMIN_EMAIL = 'admin@example.com';
const DEV_ADMIN_PASSWORD = 'Admin123!';
const DEV_CUSTOMER_EMAIL = 'customer@example.com';
const DEV_CUSTOMER_PASSWORD = 'Customer123!';

async function seed(client) {
  await client.query('BEGIN');
  try {
    await client.query(
      `INSERT INTO roles (name) VALUES ('ADMIN'), ('CUSTOMER') ON CONFLICT (name) DO NOTHING;`
    );

    const adminRole = await client.query(`SELECT id FROM roles WHERE name = 'ADMIN';`);
    const customerRole = await client.query(`SELECT id FROM roles WHERE name = 'CUSTOMER';`);
    const adminRoleId = adminRole.rows[0].id;
    const customerRoleId = customerRole.rows[0].id;

    const adminHash = await bcrypt.hash(DEV_ADMIN_PASSWORD, 12);
    const customerHash = await bcrypt.hash(DEV_CUSTOMER_PASSWORD, 12);

    await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
       VALUES ($1, $2, 'Admin', 'User', $3)
       ON CONFLICT (email) DO NOTHING;`,
      [DEV_ADMIN_EMAIL, adminHash, adminRoleId]
    );

    await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
       VALUES ($1, $2, 'Test', 'Customer', $3)
       ON CONFLICT (email) DO NOTHING;`,
      [DEV_CUSTOMER_EMAIL, customerHash, customerRoleId]
    );

    const categories = [
      { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, and gadgets' },
      { name: 'Clothing', slug: 'clothing', description: 'Apparel for all seasons' },
      { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Everything for your home' },
    ];

    const categoryIds = {};
    for (const c of categories) {
      const res = await client.query(
        `INSERT INTO categories (name, slug, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id;`,
        [c.name, c.slug, c.description]
      );
      categoryIds[c.slug] = res.rows[0].id;
    }

    const products = [
      { sku: 'ELEC-001', name: 'Wireless Headphones', description: 'Noise-cancelling over-ear headphones', price_cents: 9999, category: 'electronics', qty: 50 },
      { sku: 'ELEC-002', name: 'Smartphone Stand', description: 'Adjustable aluminum phone stand', price_cents: 1999, category: 'electronics', qty: 200 },
      { sku: 'CLTH-001', name: 'Cotton T-Shirt', description: 'Unisex crew-neck cotton t-shirt', price_cents: 1499, category: 'clothing', qty: 150 },
      { sku: 'HOME-001', name: 'Ceramic Coffee Mug', description: '350ml ceramic mug', price_cents: 899, category: 'home-kitchen', qty: 300 },
    ];

    for (const p of products) {
      const res = await client.query(
        `INSERT INTO products (category_id, sku, name, description, price_cents)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name
         RETURNING id;`,
        [categoryIds[p.category], p.sku, p.name, p.description, p.price_cents]
      );
      const productId = res.rows[0].id;

      await client.query(
        `INSERT INTO inventory (product_id, quantity)
         VALUES ($1, $2)
         ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;`,
        [productId, p.qty]
      );
    }

    await client.query('COMMIT');
    console.log('Seed complete.');
    console.log(`  Admin login:    ${DEV_ADMIN_EMAIL} / ${DEV_ADMIN_PASSWORD} (development only)`);
    console.log(`  Customer login: ${DEV_CUSTOMER_EMAIL} / ${DEV_CUSTOMER_PASSWORD} (development only)`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await seed(client);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
