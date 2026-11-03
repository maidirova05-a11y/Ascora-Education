# Backend standard (server/)

**Layering** — `routes/` parse HTTP and validate input, `services/` hold business rules and SQL, `db.js` owns the pool. Integrations (`sheets.js`, `bitrix.js`) are fire-and-forget: they log failures and never fail a request. Routes never write SQL; services never touch `req`/`res`.

**Config** — only `config.js` reads `process.env`. `config.assertValid()` runs first in `index.js` and exits on a missing `DATABASE_URL` / `JWT_SECRET`. Secrets live in env only (`server/.env.example` lists every variable); none in code. `JWT_SECRET` < 32 chars logs a warning.

**Validation** — every endpoint validates before touching the DB: body types and lengths (`parseInquiry`), enums (`STATUSES`), ids (`/^[1-9]\d{0,9}$/` and <= INT max), clamped `limit`/`offset`. Body cap 10 kb.

**Errors** — all non-2xx are `{ "error": "<message>", "code": "<CODE>" }`. Throw `ApiError` helpers from `errors.js` (400 `VALIDATION`, 401 `UNAUTHORIZED`, 404 `NOT_FOUND`, 429 `RATE_LIMITED`, 503 `DB_DOWN`). Wrap async handlers in `asyncHandler`; the one `errorHandler` turns anything else into a generic 500 and logs the detail.

**Logging** — `logger.js` writes one JSON line per event (`time`, `level`, `msg`, fields). No `console.*` in server code. Never log secrets, webhook URLs or request bodies.

**Auth** — admin routes sit behind `middleware/auth.js` (HS256 JWT, issuer-checked, 8 h). Login is rate limited (5 / 15 min) and constant-time for unknown users. Single admin role, so there is no per-row ownership to check.

**Rate limits** — 60 req/min per IP on `/api/`, 5 leads / 15 min, 5 logins / 15 min. `TRUST_PROXY` must equal the real number of proxy hops.

**Database** — parameterized queries only. One `pg` Pool (`DB_POOL_MAX`, statement timeout 15 s, idle-error handler). Use the pooled URL for the app and a direct URL for migrations/dumps (Neon). Indexes match the admin query shapes; value rules are CHECK constraints added `NOT VALID` so legacy rows can never block boot.

**Migrations** — `schema.sql` is the readable reference, `SCHEMA_SQL` in `db.js` is what runs at boot. Rules: idempotent (`IF NOT EXISTS`), additive, under an advisory lock, constraints `NOT VALID`; drop/rename only in a separate reviewed step tested on a branch first.

**Health** — `GET /api/health` liveness (no dependencies, used by Docker/Render); `GET /api/health/db` readiness (503 if Postgres is down).

**Process** — `unhandledRejection` is logged, `uncaughtException` exits, `SIGTERM` drains and closes the pool.

**Tests** — `cd server && DATABASE_URL=postgresql://user@127.0.0.1:5432/scratch npm test` (Node's built-in runner, skipped without `DATABASE_URL`). They start the real server against a throwaway Postgres: boot with bad env, health 200/503, login and lockout, CRUD incl. oversized ids, CHECK constraints (and `VALIDATE` failing on legacy rows), concurrent DDL under the advisory lock, SIGTERM. Never point them at production; no Sheets/Bitrix credentials are passed. A database that is down or dropping connections yields 503 `DB_DOWN` on every endpoint, not 500.

**Full stack without Docker** — `docker/local-stack.sh up` starts a throwaway local PostgreSQL with TLS, runs the server in production mode (serving `client/dist`) and runs `docker/smoke.sh check` against it (site, prerendered pages, lead POST, admin login). `down` removes everything. Local database and dummy secrets only.
