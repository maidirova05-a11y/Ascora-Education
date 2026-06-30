require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./db');

const app = express();

// ── Security headers (защищает от XSS, clickjacking и др.) ──────────────────
app.use(helmet());

// ── CORS: разрешаем только наш домен ────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5175',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Разрешаем запросы без origin (мобильные, Postman) и наш домен
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' })); // Защита от огромных запросов

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
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
