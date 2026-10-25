// Vocabulary shared by the inquiry pipeline: the API routes, the Bitrix24 deal
// and the Google Sheets row. One list, so a status the admin can set is always
// one the filter accepts and the sheet knows how to label.

/** Allowed values of inquiries.status. `enrolled` / `cancelled` are the
 *  pipeline's "won" / "lost"; renaming them would orphan every existing row. */
const STATUSES = ['new', 'contacted', 'enrolled', 'cancelled', 'spam'];

const STATUS_LABELS = {
  new: 'Новая',
  contacted: 'Связались',
  enrolled: 'Записан',
  cancelled: 'Отменена',
  spam: 'Спам',
};

/** Optional marketing fields a lead may carry, with the column widths. */
const ATTRIBUTION_FIELDS = {
  utm_source: 120,
  utm_medium: 120,
  utm_campaign: 120,
  utm_content: 120,
  utm_term: 120,
  referrer: 500,
  landing_path: 255,
  page: 255,
};

const CURRENCIES = ['KZT', 'USD'];

/**
 * "890 000 ₸" or "$2 500". Rows saved before camp_currency existed carry no
 * currency; those are shown as a bare number rather than guessed at — the old
 * code prefixed everything with "$", which labelled the tenge price of the
 * Antalya camp as $890000.
 */
function formatPrice(price, currency) {
  if (price == null || price === '') return '';
  const n = Number(price).toLocaleString('ru-RU');
  if (currency === 'KZT') return `${n} ₸`;
  if (currency === 'USD') return `$${n}`;
  return n;
}

module.exports = { STATUSES, STATUS_LABELS, ATTRIBUTION_FIELDS, CURRENCIES, formatPrice };
