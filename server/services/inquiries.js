// Inquiry data access + business rules. Routes parse HTTP, this talks to
// Postgres and the integrations; nothing here touches req/res.
const db = require('../db');
const { STATUSES, CURRENCIES, ATTRIBUTION_FIELDS } = require('../inquiry');
const { badRequest } = require('../errors');
const { appendInquiry, updateInquiryStatus } = require('../sheets');
const { sendLead } = require('../bitrix');

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : null) || null;

/** Validates and normalises a public form body; throws ApiError(400). */
function parseInquiry(body) {
  const name = clean(body.name, 200);
  const phone = clean(body.phone, 50);
  const email = clean(body.email, 200);
  if (!name || !phone) throw badRequest('name and phone are required', 'VALIDATION');
  // 7-15 digits once formatting is stripped (E.164 upper bound).
  if (!/^\d{7,15}$/.test(phone.replace(/[\s()+\-.]/g, ''))) throw badRequest('invalid phone', 'VALIDATION');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw badRequest('invalid email', 'VALIDATION');

  // null / '' / absent mean "no price" — Number(null) is 0, which would be stored as a 0 price.
  const price = ['number', 'string'].includes(typeof body.camp_price) && String(body.camp_price).trim() !== ''
    ? Number(body.camp_price) : NaN;
  // INTEGER column: anything outside 0..2^31 would crash the insert with a 500.
  const camp_price = Number.isInteger(price) && price >= 0 && price < 2147483647 ? price : null;
  const currency = typeof body.camp_currency === 'string' ? body.camp_currency.toUpperCase() : null;
  const attribution = {};
  for (const [field, max] of Object.entries(ATTRIBUTION_FIELDS)) attribution[field] = clean(body[field], max);

  return {
    name, phone, email,
    camp_name: clean(body.camp_name, 300),
    message: clean(body.message, 3000),
    lang: ['ru', 'kz', 'en'].includes(body.lang) ? body.lang : 'ru',
    camp_price,
    camp_currency: camp_price !== null && CURRENCIES.includes(currency) ? currency : null,
    ...attribution,
  };
}

async function createInquiry(input) {
  // Memoised: resolves immediately on a healthy server, retries if boot failed.
  await db.ensureSchema();
  const { rows } = await db.query(
    `INSERT INTO inquiries
       (name, phone, email, camp_name, camp_price, camp_currency, lang, message,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, landing_path, page)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id, created_at`,
    [
      input.name, input.phone, input.email, input.camp_name, input.camp_price, input.camp_currency,
      input.lang, input.message, input.utm_source, input.utm_medium, input.utm_campaign,
      input.utm_content, input.utm_term, input.referrer, input.landing_path, input.page,
    ]
  );
  const saved = { ...input, id: rows[0].id, created_at: rows[0].created_at };
  appendInquiry(saved); // fire-and-forget, logs its own errors
  sendLead(saved);      // fire-and-forget (Bitrix24)
  return saved;
}

const MAX_LIMIT = 200;
const MAX_OFFSET = 1000000;

/** Admin list: window + matching total + per-status counts over everything. */
async function listInquiries({ status, limit, offset }) {
  const where = status ? 'WHERE status=$3' : '';
  const params = status ? [limit, offset, status] : [limit, offset];
  const [{ rows }, { rows: grouped }] = await Promise.all([
    db.query(`SELECT * FROM inquiries ${where} ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2`, params),
    db.query('SELECT status, COUNT(*)::int AS n FROM inquiries GROUP BY status'),
  ]);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  let all = 0;
  for (const { status: s, n } of grouped) {
    all += n;
    if (s in counts) counts[s] = n;
  }
  return { inquiries: rows, total: status ? counts[status] : all, counts };
}

/** @returns {Promise<boolean>} false when the id does not exist */
async function setStatus(id, status) {
  const { rowCount } = await db.query('UPDATE inquiries SET status=$1 WHERE id=$2', [status, id]);
  if (rowCount === 0) return false;
  updateInquiryStatus(id, status); // fire-and-forget
  return true;
}

async function deleteInquiry(id) {
  const { rowCount } = await db.query('DELETE FROM inquiries WHERE id=$1', [id]);
  return rowCount > 0;
}

module.exports = { parseInquiry, createInquiry, listInquiries, setStatus, deleteInquiry, MAX_LIMIT, MAX_OFFSET };
