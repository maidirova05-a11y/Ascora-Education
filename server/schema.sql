-- Ascora Education Database Schema

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

-- Default admin (password: admin123 — change in production)
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (username) DO NOTHING;
