const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { appendInquiry } = require('../sheets');
const { sendLead } = require('../bitrix');

// Отдельный строгий лимит на создание заявок: живому родителю хватит,
// бот-спам в CRM отрезается (общий лимит 60/мин для этого слишком щедрый)
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Слишком много заявок с этого адреса. Попробуйте позже или позвоните нам.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : null) || null;

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, phone VARCHAR(50) NOT NULL,
      email VARCHAR(200), camp_name VARCHAR(300), camp_price INTEGER,
      lang VARCHAR(5) DEFAULT 'ru', message TEXT, status VARCHAR(30) DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

router.post('/', inquiryLimiter, async (req, res) => {
  // Honeypot: скрытое поле, которое видят только боты. Заполнено —
  // отвечаем «успехом», но ничего не сохраняем (бот не поймёт, что пойман).
  if (req.body.website) {
    return res.status(201).json({ ok: true, id: 0 });
  }

  const name = clean(req.body.name, 200);
  const phone = clean(req.body.phone, 50);
  const email = clean(req.body.email, 200);
  const camp_name = clean(req.body.camp_name, 300);
  const message = clean(req.body.message, 3000);
  const lang = clean(req.body.lang, 5) || 'ru';
  const camp_price = Number.isFinite(Number(req.body.camp_price)) ? Number(req.body.camp_price) : null;

  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }
  try {
    await ensureTable();
    const { rows } = await db.query(
      `INSERT INTO inquiries (name, phone, email, camp_name, camp_price, lang, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at`,
      [name, phone, email, camp_name, camp_price, lang, message]
    );
    const saved = { name, phone, email, camp_name, camp_price, lang, message, id: rows[0].id, created_at: rows[0].created_at };
    appendInquiry(saved); // не ждём — не блокируем ответ пользователю
    sendLead(saved);      // отправка лида в Bitrix24 (fire-and-forget)
    res.status(201).json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
