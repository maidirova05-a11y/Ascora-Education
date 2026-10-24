const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { appendInquiry } = require('../sheets');
const { sendLead } = require('../bitrix');
const { ATTRIBUTION_FIELDS, CURRENCIES } = require('../inquiry');

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

router.post('/', inquiryLimiter, async (req, res) => {
  req.body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
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
  const lang = ['ru', 'kz', 'en'].includes(req.body.lang) ? req.body.lang : 'ru';
  const price = Number(req.body.camp_price);
  // INTEGER column: anything outside 0..2^31 would crash the insert with a 500.
  const camp_price = Number.isInteger(price) && price >= 0 && price < 2147483647 ? price : null;
  // Only meaningful next to a price; an unknown code is dropped, not stored.
  const currency = typeof req.body.camp_currency === 'string' ? req.body.camp_currency.toUpperCase() : null;
  const camp_currency = camp_price !== null && CURRENCIES.includes(currency) ? currency : null;

  // Marketing attribution: optional strings, same trimming and caps as the
  // rest. Missing or non-string values become NULL, never an error — a lead
  // without its utm tags is still a lead.
  const attribution = {};
  for (const [field, max] of Object.entries(ATTRIBUTION_FIELDS)) {
    attribution[field] = clean(req.body[field], max);
  }

  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }
  // 7–15 digits once formatting is stripped (E.164 upper bound).
  const digits = phone.replace(/[\s()+\-.]/g, '');
  if (!/^\d{7,15}$/.test(digits)) {
    return res.status(400).json({ error: 'invalid phone' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid email' });
  }
  try {
    // Memoised: resolved long ago on a healthy server, retried here if the
    // startup run failed (see db.js).
    await db.ensureSchema();
    const { rows } = await db.query(
      `INSERT INTO inquiries
         (name, phone, email, camp_name, camp_price, camp_currency, lang, message,
          utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, landing_path, page)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING id, created_at`,
      [
        name, phone, email, camp_name, camp_price, camp_currency, lang, message,
        attribution.utm_source, attribution.utm_medium, attribution.utm_campaign,
        attribution.utm_content, attribution.utm_term, attribution.referrer,
        attribution.landing_path, attribution.page,
      ]
    );
    const saved = {
      name, phone, email, camp_name, camp_price, camp_currency, lang, message,
      ...attribution,
      id: rows[0].id,
      created_at: rows[0].created_at,
    };
    appendInquiry(saved); // не ждём — не блокируем ответ пользователю
    sendLead(saved);      // отправка лида в Bitrix24 (fire-and-forget)
    res.status(201).json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
