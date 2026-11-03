-- Ascora Education Database Schema
--
-- Reference copy. The server applies the same statements on every boot via
-- ensureSchema() in db.js — everything here is idempotent (IF NOT EXISTS), so
-- a database created from an older version of this file is brought up to date
-- without a migration step.

CREATE TABLE IF NOT EXISTS inquiries (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  phone         VARCHAR(50)  NOT NULL,
  email         VARCHAR(200),
  camp_name     VARCHAR(300),
  camp_price    INTEGER,
  camp_currency VARCHAR(3),            -- KZT | USD; NULL for rows saved before the column existed
  lang          VARCHAR(5)   DEFAULT 'ru',
  message       TEXT,
  status        VARCHAR(30)  DEFAULT 'new',  -- new | contacted | enrolled | cancelled | spam (server/inquiry.js)
  -- Marketing attribution, captured by the client on the first page view of
  -- the session and sent with the form. All optional.
  utm_source    VARCHAR(120),
  utm_medium    VARCHAR(120),
  utm_campaign  VARCHAR(120),
  utm_content   VARCHAR(120),
  utm_term      VARCHAR(120),
  referrer      VARCHAR(500),          -- document.referrer of the landing page
  landing_path  VARCHAR(255),          -- first path of the session
  page          VARCHAR(255),          -- path the form was submitted from
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- Columns added after the table first shipped; a no-op on a fresh database.
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS camp_currency VARCHAR(3);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_source   VARCHAR(120);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_medium   VARCHAR(120);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(120);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_content  VARCHAR(120);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_term     VARCHAR(120);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS referrer     VARCHAR(500);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS landing_path VARCHAR(255);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS page         VARCHAR(255);

-- The admin list is "newest first" (created_at DESC, id DESC), optionally
-- filtered by status: one index per shape, so pages come off the index in
-- order. The status one also covers SELECT status, COUNT(*) ... GROUP BY status.
CREATE INDEX IF NOT EXISTS inquiries_list_idx        ON inquiries (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS inquiries_status_list_idx ON inquiries (status, created_at DESC, id DESC);
-- Superseded by the two above (first version of this file).
DROP INDEX IF EXISTS inquiries_created_at_idx;
DROP INDEX IF EXISTS inquiries_status_idx;

-- Value constraints (NOT VALID: applied to new/updated rows only; existing
-- rows are never scanned, so this cannot fail on legacy data).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_status_chk') THEN
    ALTER TABLE inquiries ADD CONSTRAINT inquiries_status_chk
      CHECK (status IN ('new','contacted','enrolled','cancelled','spam')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_price_chk') THEN
    ALTER TABLE inquiries ADD CONSTRAINT inquiries_price_chk
      CHECK (camp_price IS NULL OR camp_price >= 0) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_currency_chk') THEN
    ALTER TABLE inquiries ADD CONSTRAINT inquiries_currency_chk
      CHECK (camp_currency IS NULL OR camp_currency IN ('KZT','USD')) NOT VALID;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- No default admin is seeded: a known password hash in a public repo is a
-- standing backdoor. Create the account with `node change-password.js`.
