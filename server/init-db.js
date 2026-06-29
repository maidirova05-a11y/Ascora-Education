const { Pool } = require('pg');
const pool = new Pool({ database: 'ascora_education', host: 'localhost', user: 'postgres', password: 'postgres123' });
pool.query(`
  CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, phone VARCHAR(50) NOT NULL,
    email VARCHAR(200), camp_name VARCHAR(300), camp_price INTEGER,
    lang VARCHAR(5) DEFAULT 'ru', message TEXT, status VARCHAR(30) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY, username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
  );
  INSERT INTO admin_users (username, password_hash)
  VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
  ON CONFLICT (username) DO NOTHING;
`).then(() => { console.log('Tables ready'); process.exit(0); })
  .catch(e => { console.error('Error:', e.message); process.exit(1); })
  .finally(() => pool.end());
