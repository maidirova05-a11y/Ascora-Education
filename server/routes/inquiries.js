const router = require('express').Router();
const db = require('../db');
const { appendInquiry } = require('../sheets');

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

router.post('/', async (req, res) => {
  const { name, phone, email, camp_name, camp_price, lang, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }
  try {
    await ensureTable();
    const { rows } = await db.query(
      `INSERT INTO inquiries (name, phone, email, camp_name, camp_price, lang, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at`,
      [name, phone, email || null, camp_name || null, camp_price || null, lang || 'ru', message || null]
    );
    const saved = { ...req.body, id: rows[0].id, created_at: rows[0].created_at };
    appendInquiry(saved); // не ждём — не блокируем ответ пользователю
    res.status(201).json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
