// Integration tests against a REAL PostgreSQL. They spawn the actual server
// process, so boot, config validation, health checks, auth, CRUD, constraints,
// the schema advisory lock and graceful shutdown are all exercised end to end.
//
//   DATABASE_URL=postgresql://user@127.0.0.1:5432/scratch npm test
//
// Skipped when DATABASE_URL is not set. Use a throwaway database: the tests
// insert rows tagged "__test__" and remove them, and one test creates and drops
// a scratch database (skipped if the role may not CREATE DATABASE). Never point
// this at production. No Google Sheets / Bitrix credentials are passed to the
// server, so those integrations stay off.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const crypto = require('node:crypto');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;
const SKIP = DATABASE_URL ? false : 'DATABASE_URL is not set';
const INDEX = path.join(__dirname, '..', 'index.js');
const SECRET = 'test-only-secret-' + crypto.randomBytes(16).toString('hex');
const TAG = '__test__';

let portCounter = 0;
const freePort = () => 20000 + ((process.pid + portCounter++ * 7) % 20000);

/** Starts the server; resolves once it logs "server listening". */
function startServer(extraEnv = {}) {
  const port = freePort();
  const env = {
    PATH: process.env.PATH,
    NODE_ENV: 'test',
    PORT: String(port),
    DATABASE_URL,
    JWT_SECRET: SECRET,
    TRUST_PROXY: '1', // tests pick the client IP via X-Forwarded-For
    GOOGLE_SHEET_ID: 'unused',
    LOG_LEVEL: 'info',
    ...extraEnv,
  };
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const child = spawn(process.execPath, [INDEX], { env, cwd: path.join(__dirname, '..') });
  const srv = { child, port, base: `http://127.0.0.1:${port}`, out: '', exit: null };
  srv.exited = new Promise((resolve) => child.on('exit', (code, signal) => { srv.exit = { code, signal }; resolve(srv.exit); }));
  const onData = (d) => { srv.out += d; };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  srv.ready = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server did not start:\n' + srv.out)), 15000);
    const poll = setInterval(() => {
      if (srv.out.includes('server listening')) { clearTimeout(t); clearInterval(poll); resolve(srv); }
    }, 25);
    srv.exited.then(() => { clearTimeout(t); clearInterval(poll); reject(new Error('server exited early:\n' + srv.out)); });
  });
  return srv;
}

async function stop(srv) {
  if (!srv || srv.exit) return;
  srv.child.kill('SIGTERM');
  await srv.exited;
}

let ipN = 0;
/** Fresh fake client IP per call so the per-IP rate limits never interfere. */
const nextIp = () => `10.1.${(ipN >> 8) & 255}.${++ipN & 255}`;

async function call(srv, method, url, { body, token, ip = nextIp(), raw } = {}) {
  const headers = { 'x-forwarded-for': ip };
  if (body !== undefined || raw !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(srv.base + url, { method, headers, body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, json, text, headers: res.headers };
}

const lead = (extra = {}) => ({ name: TAG, phone: '+7 701 123 45 67', ...extra });

describe('config validation', { skip: SKIP }, () => {
  test('exits 1 with a clear message when DATABASE_URL and JWT_SECRET are missing', async () => {
    const srv = startServer({ DATABASE_URL: undefined, JWT_SECRET: undefined });
    srv.ready.catch(() => {});
    const exit = await srv.exited;
    assert.equal(exit.code, 1);
    assert.match(srv.out, /DATABASE_URL is not set/);
    assert.match(srv.out, /JWT_SECRET is not set/);
  });

  test('exits 1 on an invalid PORT', async () => {
    const srv = startServer({ PORT: 'abc' });
    srv.ready.catch(() => {});
    const exit = await srv.exited;
    assert.equal(exit.code, 1);
    assert.match(srv.out, /PORT must be an integer/);
  });
});

describe('health when the database is unreachable', { skip: SKIP }, () => {
  test('/api/health is 200, /api/health/db and lead POST are 503 DB_DOWN', async () => {
    const dead = new URL(DATABASE_URL);
    dead.port = '1'; // nothing listens there
    const srv = startServer({ DATABASE_URL: dead.toString() });
    try {
      await srv.ready;
      const live = await call(srv, 'GET', '/api/health');
      assert.equal(live.status, 200);
      const ready = await call(srv, 'GET', '/api/health/db');
      assert.equal(ready.status, 503);
      assert.equal(ready.json.code, 'DB_DOWN');
      // a lead while the database is down is a retryable 503, not a 500
      const post = await call(srv, 'POST', '/api/inquiries', { body: lead() });
      assert.equal(post.status, 503);
      assert.equal(post.json.code, 'DB_DOWN');
    } finally { await stop(srv); }
  });
});

describe('API against a real database', { skip: SKIP }, () => {
  let srv; let admin; let token; let pg;
  const username = `test_admin_${crypto.randomBytes(4).toString('hex')}`;
  const password = 'test-password-' + crypto.randomBytes(6).toString('hex');

  before(async () => {
    srv = startServer();
    await srv.ready;
    // The server creates the schema on boot; wait until it is there.
    pg = new Client({ connectionString: DATABASE_URL });
    await pg.connect();
    for (let i = 0; i < 100; i++) {
      const { rows } = await pg.query("SELECT to_regclass('admin_users') IS NOT NULL AND to_regclass('inquiries') IS NOT NULL AS ok");
      if (rows[0].ok) break;
      await new Promise((r) => setTimeout(r, 50));
    }
    const hash = await bcrypt.hash(password, 4);
    const { rows } = await pg.query('INSERT INTO admin_users (username, password_hash) VALUES ($1,$2) RETURNING id', [username, hash]);
    admin = rows[0];
  });

  after(async () => {
    if (pg) {
      await pg.query('DELETE FROM inquiries WHERE name=$1', [TAG]).catch(() => {});
      await pg.query('DELETE FROM admin_users WHERE username=$1', [username]).catch(() => {});
      await pg.end().catch(() => {});
    }
    await stop(srv);
  });

  test('/api/health and /api/health/db return 200', async () => {
    assert.deepEqual((await call(srv, 'GET', '/api/health')).json, { ok: true });
    const db = await call(srv, 'GET', '/api/health/db');
    assert.equal(db.status, 200);
    assert.equal(db.json.db, true);
  });

  test('API responses are never cacheable and unknown API routes are JSON 404', async () => {
    const r = await call(srv, 'GET', '/api/nope');
    assert.equal(r.status, 404);
    assert.equal(r.json.code, 'NOT_FOUND');
    assert.equal(r.headers.get('cache-control'), 'no-store');
  });

  test('admin endpoints require a token', async () => {
    assert.equal((await call(srv, 'GET', '/api/admin/inquiries')).status, 401);
    assert.equal((await call(srv, 'GET', '/api/admin/inquiries', { token: 'garbage' })).status, 401);
    // auth is checked before id validation: no hint about id shapes
    assert.equal((await call(srv, 'DELETE', '/api/admin/inquiries/abc')).status, 401);
  });

  test('login: wrong password and unknown user both 401, bad input 400, good login returns a token', async () => {
    assert.equal((await call(srv, 'POST', '/api/admin/login', { body: { username, password: 'nope' } })).status, 401);
    assert.equal((await call(srv, 'POST', '/api/admin/login', { body: { username: 'no_such_user', password: 'x' } })).status, 401);
    assert.equal((await call(srv, 'POST', '/api/admin/login', { body: { username } })).status, 400);
    assert.equal((await call(srv, 'POST', '/api/admin/login', { body: { username: { $ne: 1 }, password: 'x' } })).status, 400);
    const ok = await call(srv, 'POST', '/api/admin/login', { body: { username, password } });
    assert.equal(ok.status, 200);
    assert.ok(ok.json.token);
    token = ok.json.token;
  });

  test('login lockout: the 6th attempt from one IP in the window is 429', async () => {
    const ip = nextIp();
    const codes = [];
    for (let i = 0; i < 7; i++) {
      codes.push((await call(srv, 'POST', '/api/admin/login', { ip, body: { username, password: 'wrong' } })).status);
    }
    assert.deepEqual(codes, [401, 401, 401, 401, 401, 429, 429]);
    // a different IP is unaffected
    assert.equal((await call(srv, 'POST', '/api/admin/login', { body: { username, password } })).status, 200);
  });

  test('public lead form: validation, honeypot, malformed and oversized JSON', async () => {
    assert.equal((await call(srv, 'POST', '/api/inquiries', { body: { name: TAG } })).json.code, 'VALIDATION');
    assert.equal((await call(srv, 'POST', '/api/inquiries', { body: lead({ phone: 'abc' }) })).status, 400);
    assert.equal((await call(srv, 'POST', '/api/inquiries', { body: lead({ email: 'not-an-email' }) })).status, 400);
    const before = (await pg.query('SELECT count(*)::int AS n FROM inquiries')).rows[0].n;
    const bot = await call(srv, 'POST', '/api/inquiries', { body: lead({ website: 'spam.example' }) });
    assert.equal(bot.status, 201);
    assert.equal(bot.json.id, 0);
    assert.equal((await call(srv, 'POST', '/api/inquiries', { raw: '{bad json' })).json.code, 'INVALID_JSON');
    assert.equal((await call(srv, 'POST', '/api/inquiries', { body: lead({ message: 'x'.repeat(20000) }) })).status, 413);
    assert.equal((await pg.query('SELECT count(*)::int AS n FROM inquiries')).rows[0].n, before, 'honeypot submissions must not be stored');
  });

  test('public lead form is rate limited to 5 per IP', async () => {
    const ip = nextIp();
    const codes = [];
    for (let i = 0; i < 6; i++) codes.push((await call(srv, 'POST', '/api/inquiries', { ip, body: { name: TAG } })).status);
    assert.deepEqual(codes, [400, 400, 400, 400, 400, 429]);
  });

  describe('CRUD', () => {
    let id;

    test('create: stores the lead and normalises currency / out-of-range price', async () => {
      const r = await call(srv, 'POST', '/api/inquiries', { body: lead({ camp_name: 'Antalya', camp_price: 890000, camp_currency: 'kzt', lang: 'kz' }) });
      assert.equal(r.status, 201);
      id = r.json.id;
      assert.ok(id > 0);
      const { rows } = await pg.query('SELECT * FROM inquiries WHERE id=$1', [id]);
      assert.equal(rows[0].camp_currency, 'KZT');
      assert.equal(rows[0].camp_price, 890000);
      assert.equal(rows[0].status, 'new');
      assert.equal(rows[0].lang, 'kz');

      const big = await call(srv, 'POST', '/api/inquiries', { body: lead({ camp_price: 99999999999, camp_currency: 'USD' }) });
      assert.equal(big.status, 201); // not a 500: the price is dropped
      const { rows: r2 } = await pg.query('SELECT camp_price, camp_currency FROM inquiries WHERE id=$1', [big.json.id]);
      assert.equal(r2[0].camp_price, null);
      assert.equal(r2[0].camp_currency, null);
    });

    test('list: shape, filter, paging clamps, counts', async () => {
      const r = await call(srv, 'GET', '/api/admin/inquiries?limit=1', { token });
      assert.equal(r.status, 200);
      assert.equal(r.json.inquiries.length, 1);
      assert.equal(r.json.limit, 1);
      assert.ok(r.json.total >= 2);
      assert.deepEqual(Object.keys(r.json.counts).sort(), ['cancelled', 'contacted', 'enrolled', 'new', 'spam']);
      assert.equal(r.json.inquiries[0].id, Math.max(...(await pg.query('SELECT id FROM inquiries')).rows.map((x) => x.id)));

      const clamped = await call(srv, 'GET', '/api/admin/inquiries?limit=99999&offset=-5', { token });
      assert.equal(clamped.json.limit, 200);
      assert.equal(clamped.json.offset, 0);
      const filtered = await call(srv, 'GET', '/api/admin/inquiries?status=spam', { token });
      assert.ok(filtered.json.inquiries.every((x) => x.status === 'spam'));
      // unknown status is ignored, not an error
      assert.equal((await call(srv, 'GET', '/api/admin/inquiries?status=bogus', { token })).status, 200);
    });

    test('update status: valid, invalid, missing', async () => {
      const ok = await call(srv, 'PATCH', `/api/admin/inquiries/${id}`, { token, body: { status: 'contacted' } });
      assert.deepEqual(ok.json, { ok: true, id, status: 'contacted' });
      assert.equal((await pg.query('SELECT status FROM inquiries WHERE id=$1', [id])).rows[0].status, 'contacted');
      assert.equal((await call(srv, 'PATCH', `/api/admin/inquiries/${id}`, { token, body: { status: 'bogus' } })).json.code, 'VALIDATION');
      assert.equal((await call(srv, 'PATCH', `/api/admin/inquiries/${id}`, { token, body: {} })).status, 400);
      assert.equal((await call(srv, 'PATCH', '/api/admin/inquiries/2000000000', { token, body: { status: 'new' } })).status, 404);
    });

    test('ids: non-numeric and zero are 400; beyond INTEGER is 404 (never a Postgres 500)', async () => {
      for (const bad of ['abc', '0', '-1', '01', '1.5', '12345678901']) {
        const r = await call(srv, 'DELETE', `/api/admin/inquiries/${bad}`, { token });
        assert.equal(r.status, 400, `id ${bad}`);
      }
      for (const huge of ['2147483648', '9999999999']) {
        assert.equal((await call(srv, 'PATCH', `/api/admin/inquiries/${huge}`, { token, body: { status: 'new' } })).status, 404, `PATCH ${huge}`);
        assert.equal((await call(srv, 'DELETE', `/api/admin/inquiries/${huge}`, { token })).status, 404, `DELETE ${huge}`);
      }
    });

    test('delete: removes the row, then 404', async () => {
      assert.deepEqual((await call(srv, 'DELETE', `/api/admin/inquiries/${id}`, { token })).json, { ok: true });
      assert.equal((await pg.query('SELECT 1 FROM inquiries WHERE id=$1', [id])).rowCount, 0);
      assert.equal((await call(srv, 'DELETE', `/api/admin/inquiries/${id}`, { token })).status, 404);
    });
  });

  test('a token signed with another secret or algorithm is rejected', async () => {
    const jwt = require('jsonwebtoken');
    const forged = jwt.sign({ id: admin.id, username }, 'another-secret-another-secret-0000', { issuer: 'ascora-admin' });
    assert.equal((await call(srv, 'GET', '/api/admin/inquiries', { token: forged })).status, 401);
    const noIssuer = jwt.sign({ id: admin.id, username }, SECRET);
    assert.equal((await call(srv, 'GET', '/api/admin/inquiries', { token: noIssuer })).status, 401);
  });
});

describe('database constraints', { skip: SKIP }, () => {
  let pg; let srv;
  before(async () => {
    srv = startServer();
    await srv.ready;
    pg = new Client({ connectionString: DATABASE_URL });
    await pg.connect();
    for (let i = 0; i < 100; i++) {
      const { rows } = await pg.query("SELECT count(*)::int AS n FROM pg_constraint WHERE conname LIKE 'inquiries\\_%\\_chk'");
      if (rows[0].n === 3) break;
      await new Promise((r) => setTimeout(r, 50));
    }
  });
  after(async () => { await pg?.end().catch(() => {}); await stop(srv); });

  test('CHECK constraints reject bad status, negative price, unknown currency', async () => {
    const bad = [
      ['status', "INSERT INTO inquiries (name, phone, status) VALUES ($1,'1','weird')", 'inquiries_status_chk'],
      ['price', "INSERT INTO inquiries (name, phone, camp_price) VALUES ($1,'1',-1)", 'inquiries_price_chk'],
      ['currency', "INSERT INTO inquiries (name, phone, camp_currency) VALUES ($1,'1','EUR')", 'inquiries_currency_chk'],
    ];
    for (const [, sql, constraint] of bad) {
      await assert.rejects(pg.query(sql, [TAG]), (e) => e.code === '23514' && e.constraint === constraint);
    }
  });

  test('constraints are NOT VALID, and VALIDATE fails on legacy rows until they are fixed', async () => {
    const { rows } = await pg.query("SELECT conname, convalidated FROM pg_constraint WHERE conname LIKE 'inquiries\\_%\\_chk'");
    assert.equal(rows.length, 3);
    // NOT VALID is what lets a boot succeed on a table with old odd rows. Prove that and the
    // VALIDATE outcome inside a transaction that is always rolled back.
    await pg.query('BEGIN');
    try {
      await pg.query('ALTER TABLE inquiries DROP CONSTRAINT inquiries_status_chk');
      await pg.query("INSERT INTO inquiries (name, phone, status) VALUES ($1,'1','legacy-status')", [TAG]);
      await pg.query("ALTER TABLE inquiries ADD CONSTRAINT inquiries_status_chk CHECK (status IN ('new','contacted','enrolled','cancelled','spam')) NOT VALID");
      await pg.query('SAVEPOINT v');
      await assert.rejects(pg.query('ALTER TABLE inquiries VALIDATE CONSTRAINT inquiries_status_chk'), (e) => e.code === '23514');
      await pg.query('ROLLBACK TO SAVEPOINT v');
      await pg.query("UPDATE inquiries SET status='new' WHERE name=$1 AND status='legacy-status'", [TAG]);
      await pg.query('ALTER TABLE inquiries VALIDATE CONSTRAINT inquiries_status_chk');
    } finally { await pg.query('ROLLBACK'); }
  });
});

describe('boot', { skip: SKIP }, () => {
  test('two servers booting at once against an empty database both succeed (advisory lock)', async (t) => {
    const admin = new Client({ connectionString: DATABASE_URL });
    await admin.connect();
    const name = `ascora_boot_${crypto.randomBytes(4).toString('hex')}`;
    try { await admin.query(`CREATE DATABASE ${name}`); } catch (e) {
      await admin.end();
      return t.skip(`role cannot CREATE DATABASE: ${e.message}`);
    }
    const url = new URL(DATABASE_URL);
    url.pathname = '/' + name;
    const servers = [];
    try {
      for (let round = 0; round < 3; round++) {
        // fresh database each round so the DDL really races
        await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
        await admin.query(`CREATE DATABASE ${name}`);
        const pair = [startServer({ DATABASE_URL: url.toString() }), startServer({ DATABASE_URL: url.toString() })];
        servers.push(...pair);
        await Promise.all(pair.map((s) => s.ready));
        await Promise.all(pair.map(async (s) => {
          for (let i = 0; i < 200 && !/DB schema ready|DB init error/.test(s.out); i++) await new Promise((r) => setTimeout(r, 25));
          assert.match(s.out, /DB schema ready/);
          assert.doesNotMatch(s.out, /DB init error/);
        }));
        await Promise.all(pair.map(stop));
      }
    } finally {
      await Promise.all(servers.map(stop));
      await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`).catch(() => {});
      await admin.end();
    }
  });

  test('the schema DDL itself is safe to run from 8 connections at once (advisory lock)', async (t) => {
    const admin = new Client({ connectionString: DATABASE_URL });
    await admin.connect();
    const name = `ascora_ddl_${crypto.randomBytes(4).toString('hex')}`;
    try { await admin.query(`CREATE DATABASE ${name}`); } catch (e) {
      await admin.end();
      return t.skip(`role cannot CREATE DATABASE: ${e.message}`);
    }
    const url = new URL(DATABASE_URL);
    url.pathname = '/' + name;
    const SCHEMA_SQL = require('../db').SCHEMA_SQL;
    try {
      const clients = await Promise.all(Array.from({ length: 8 }, async () => {
        const c = new Client({ connectionString: url.toString() });
        await c.connect();
        return c;
      }));
      // Same statements the server runs on boot, all released at the same moment.
      const results = await Promise.allSettled(clients.map((c) => c.query(SCHEMA_SQL)));
      const failed = results.filter((r) => r.status === 'rejected').map((r) => r.reason.message);
      assert.deepEqual(failed, []);
      await Promise.all(clients.map((c) => c.end()));
    } finally {
      await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`).catch(() => {});
      await admin.end();
    }
  });

  test('SIGTERM shuts down gracefully with exit code 0', async () => {
    const srv = startServer();
    await srv.ready;
    assert.equal((await call(srv, 'GET', '/api/health')).status, 200);
    srv.child.kill('SIGTERM');
    const exit = await Promise.race([srv.exited, new Promise((r) => setTimeout(() => r('timeout'), 8000))]);
    assert.notEqual(exit, 'timeout', 'server did not exit within 8s');
    assert.equal(exit.code, 0);
    assert.match(srv.out, /shutting down/);
  });
});
