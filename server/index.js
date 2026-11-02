const config = require('./config');
config.assertValid(); // refuse to boot on a missing DATABASE_URL / weak JWT_SECRET
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const log = require('./logger');
const { rateLimited, errorHandler } = require('./errors');

const app = express();

if (config.jwtSecret.length < 32) {
  log.warn('JWT_SECRET is shorter than 32 characters — replace it with `openssl rand -base64 48`');
}

// ── Real client IP behind proxies ───────────────────────────────────────────
// Requests arrive via the Vercel rewrite and then Forge's nginx: two hops. Without
// this every visitor shares the proxy's IP, so the rate limits below would lock
// out all parents at once after a handful of leads. Override with TRUST_PROXY.
app.set('trust proxy', config.trustProxy);
app.disable('x-powered-by');

// ── Security headers (защищает от XSS, clickjacking и др.) ──────────────────
app.use(helmet({
  // CSP is set per area below: the API and the site pages need different ones.
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: false },
}));
// The API only ever returns JSON — nothing on it needs to load or frame anything.
app.use('/api/', helmet.contentSecurityPolicy({
  useDefaults: false,
  directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
}));

// API responses carry personal data — never let a browser or CDN cache them.
app.use('/api/', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// ── CORS: разрешаем только наш домен ────────────────────────────────────────
const allowedOrigins = [
  config.clientUrl,
  'https://ascora.education',
  'https://www.ascora.education',
  // Local dev servers are not an allowed origin in production.
  ...(config.isProd ? [] : ['http://localhost:5173', 'http://localhost:5175']),
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Разрешаем запросы без origin (мобильные, Postman) и наш домен
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    // No CORS headers → the browser blocks the response; no 500 and no stack trace.
    cb(null, false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb', strict: true })); // Защита от огромных запросов

// ── Rate limiting: максимум 60 запросов в минуту с одного IP ────────────────
app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: rateLimited('Слишком много запросов. Попробуйте через минуту.'),
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Особая защита для логина: только 5 попыток в 15 минут ───────────────────
app.use('/api/admin/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: rateLimited('Слишком много попыток входа. Попробуйте через 15 минут.'),
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── База данных ──────────────────────────────────────────────────────────────
// Tables, added columns and indexes — see schema.sql and ensureSchema() in
// db.js. Runs once here; POST /api/inquiries awaits the same memoised promise,
// so a lead that arrives before this finishes still waits for the schema, and
// one that arrives after it pays nothing.
db.ensureSchema()
  .then(() => log.info('DB schema ready'))
  .catch((e) => log.error('DB init error', { err: e.message }));

const { initSheet } = require('./sheets');
initSheet();

// Пинг каждые 4 минуты чтобы Neon не засыпал (cold start = +2 сек для пользователя)
const keepAlive = setInterval(async () => {
  try { await db.ping(); } catch (e) { log.warn('db keep-alive failed', { err: e.message }); }
}, 4 * 60 * 1000);
keepAlive.unref();

// ── Маршруты ─────────────────────────────────────────────────────────────────
app.use('/api/inquiries', require('./routes/inquiries'));
// Compressed (brotli/gzip, negotiated; replies under 1 KB are left alone):
// the admin list is ~30 KB of JSON per page of 50 and ~120 KB at limit=200,
// 2–5 KB compressed. Not mounted for the public endpoints — their replies are
// tiny, and the middleware's per-request cost showed up in the load test.
app.use('/api/admin', compression(), require('./routes/admin'));
// Liveness: no dependencies, used by the Docker/Render health checks.
app.get('/api/health', (_req, res) => res.json({ ok: true }));
// Readiness: also proves the database answers.
app.get('/api/health/db', async (_req, res) => {
  try { await db.ping(); res.json({ ok: true, db: true }); }
  catch (e) {
    log.error('health db check failed', { err: e.message });
    res.status(503).json({ error: 'Database unavailable', code: 'DB_DOWN' });
  }
});
// Unknown API route → JSON 404. Registered before the site-page handlers below
// so it keeps the API's CSP (default-src 'none') instead of the page one.
app.use('/api/', (_req, res) => res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' }));

// ── Статика для продакшна ─────────────────────────────────────────────────────
// Used by the Docker image, where this server also hosts the site; in the
// Vercel + Forge setup Vercel serves client/ and applies client/vercel.json.
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../client/dist');
  // Same page CSP and admin noindex as client/vercel.json.
  app.use(helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      // vercel.json sets no default-src either; helmet wants that said explicitly.
      defaultSrc: helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
      objectSrc: ["'none'"], baseUri: ["'self'"], frameAncestors: ["'none'"],
      formAction: ["'self'"], upgradeInsecureRequests: [],
    },
  }));
  app.use('/admin', (_req, res, next) => { res.set('X-Robots-Tag', 'noindex, nofollow'); next(); });
  // The study-abroad page was removed — the company runs camps only. Send old
  // links and search results to the camps hub, as vercel.json does.
  app.get('/obuchenie-za-rubezhom', (_req, res) => res.redirect(301, '/letnie-lagerya-za-rubezhom'));
  // Here this process is the web server too: compress the HTML, JS and CSS
  // (Vercel does that on its own in the main setup).
  app.use(compression());
  // Hashed bundles never change under the same name.
  app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
  // redirect: false — like Vercel, /page is served from page/index.html as is,
  // without a 301 to /page/ (the prerendered canonicals have no trailing slash).
  app.use(express.static(dist, { redirect: false }));
  app.get('*', (req, res) => {
    const page = path.resolve(dist, `.${req.path}`, 'index.html');
    const prerendered = page.startsWith(dist + path.sep) && fs.existsSync(page);
    res.sendFile(prerendered ? page : path.join(dist, 'index.html'));
  });
}

// ── Глобальный обработчик ошибок (не показываем детали ошибок пользователю) ──
app.use(errorHandler);

const server = app.listen(config.port, () => log.info('server listening', { port: config.port, env: config.nodeEnv }));

// A rejected promise nobody awaited must not be silent (or, on Node 22, crash
// with no context): log it. Exceptions are fatal — exit and let the platform restart.
process.on('unhandledRejection', (reason) => log.error('unhandled rejection', log.errFields(reason)));
process.on('uncaughtException', (err) => { log.error('uncaught exception', log.errFields(err)); process.exit(1); });

// Graceful shutdown on deploy/restart: stop accepting, finish in-flight, close the pool.
function shutdown(signal) {
  log.info('shutting down', { signal });
  server.close(() => db.end().finally(() => process.exit(0)));
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
