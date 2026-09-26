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

module.exports = pool;
