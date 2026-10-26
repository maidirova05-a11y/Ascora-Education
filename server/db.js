const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon presents a publicly trusted certificate, so verify it — an unverified
  // TLS link can be silently intercepted. Other hosts keep the old behaviour
  // unless DB_SSL_VERIFY=1.
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: /neon\.tech/.test(process.env.DATABASE_URL || '') || process.env.DB_SSL_VERIFY === '1' }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 15000,
});

// An idle pooled client can lose its connection (database restart, Neon
// suspending, network blip). pg reports that as an 'error' event on the pool,
// and an unhandled 'error' event would crash the whole process. The pool drops
// the broken client by itself; the next query opens a fresh one.
pool.on('error', (err) => {
  console.error('Postgres idle client error:', err.message);
});

/**
 * Brings the database up to the shape in schema.sql: tables, the columns added
 * since the table was first created, and the indexes the admin list relies on.
 *
 * Every statement is idempotent (IF NOT EXISTS), so this is safe to run against
 * a database that already has everything — which is what happens on every boot.
 * schema.sql stays the readable reference; this is the copy that actually runs.
 */
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS inquiries (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    phone       VARCHAR(50)  NOT NULL,
    email       VARCHAR(200),
    camp_name   VARCHAR(300),
    camp_price  INTEGER,
    lang        VARCHAR(5)   DEFAULT 'ru',
    message     TEXT,
    status      VARCHAR(30)  DEFAULT 'new',
    created_at  TIMESTAMPTZ  DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS admin_users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );
  -- Currency of camp_price: the Antalya camp is priced in tenge, the rest in
  -- dollars, and a bare integer cannot say which.
  ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS camp_currency VARCHAR(3);
  -- Marketing attribution, captured by the client on the first page view.
  ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_source   VARCHAR(120);
  ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_medium   VARCHAR(120);
  ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(120);
  ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_content  VARCHAR(120);
  ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_term     VARCHAR(120);
  ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS referrer     VARCHAR(500);
  ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS landing_path VARCHAR(255);
  ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS page         VARCHAR(255);
  -- The admin list is always "newest first" (created_at DESC, id DESC as the
  -- tie-break), optionally for one status. Each index matches one of the two
  -- shapes exactly, so the page is read off the index in order — no sort, and
  -- no reading every row of a status to sort it when paging deep. The status
  -- one also answers the stat cards' GROUP BY status from the index alone.
  -- They replace the single-column indexes of the first version.
  CREATE INDEX IF NOT EXISTS inquiries_list_idx        ON inquiries (created_at DESC, id DESC);
  CREATE INDEX IF NOT EXISTS inquiries_status_list_idx ON inquiries (status, created_at DESC, id DESC);
  DROP INDEX IF EXISTS inquiries_created_at_idx;
  DROP INDEX IF EXISTS inquiries_status_idx;
`;

let schemaReady = null;

/**
 * Runs the schema once per process and hands every caller the same promise.
 *
 * Called at startup from index.js and awaited by POST /api/inquiries: after the
 * first success it resolves immediately, so the insert no longer pays for a
 * CREATE TABLE round-trip on every lead. A failure (database still waking up,
 * network blip at boot) clears the memo so the next request retries instead of
 * being stuck with a rejected promise for the life of the process.
 */
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool.query(SCHEMA_SQL).then(() => undefined).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

pool.ensureSchema = ensureSchema;

module.exports = pool;
