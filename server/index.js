require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./db');

const app = express();

// ── Fail fast on a missing or weak secret ───────────────────────────────────
// With an empty JWT_SECRET every admin token would be signed with a guessable
// key; better to refuse to boot than to run like that.
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set — refusing to start');
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  JWT_SECRET is shorter than 32 characters — replace it with `openssl rand -base64 48`');
}

// ── Real client IP behind proxies ───────────────────────────────────────────
// Requests arrive via the Vercel rewrite and then Forge's nginx: two hops. Without
// this every visitor shares the proxy's IP, so the rate limits below would lock
// out all parents at once after a handful of leads. Override with TRUST_PROXY.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 2));
app.disable('x-powered-by');

// ── Security headers (защищает от XSS, clickjacking и др.) ──────────────────
app.use(helmet({
  // The API only ever returns JSON — nothing on it needs to load or frame anything.
  contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
  crossOriginResourcePolicy: { policy: 'same-site' },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: false },
}));

// API responses carry personal data — never let a browser or CDN cache them.
app.use('/api/', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// ── CORS: разрешаем только наш домен ────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://ascora.education',
  'https://www.ascora.education',
  'http://localhost:5173',
  'http://localhost:5175',
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
  message: { error: 'Слишком много запросов. Попробуйте через минуту.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Особая защита для логина: только 5 попыток в 15 минут ───────────────────
app.use('/api/admin/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── База данных ──────────────────────────────────────────────────────────────
async function initDb() {
  await db.query(`
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
  `);
  console.log('✅ DB tables ready');
}
initDb().catch(e => console.error('❌ DB init error:', e.message));

const { initSheet } = require('./sheets');
initSheet();

// Пинг каждые 4 минуты чтобы Neon не засыпал (cold start = +2 сек для пользователя)
setInterval(async () => {
  try { await db.query('SELECT 1'); } catch (_) {}
}, 4 * 60 * 1000);

// ── Маршруты ─────────────────────────────────────────────────────────────────
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/admin', require('./routes/admin'));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── Статика для продакшна ─────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../client/dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// ── Глобальный обработчик ошибок (не показываем детали ошибок пользователю) ──
app.use('/api/', (_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, _req, res, _next) => {
  // Malformed / oversized JSON bodies are the client's fault, not ours.
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large' });
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
