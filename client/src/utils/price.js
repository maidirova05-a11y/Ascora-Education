// One price format for the whole site: Russian digit grouping ("890 000"),
// whatever the browser's locale. A bare toLocaleString() follows the visitor's
// locale, so an en-US browser showed "890,000 ₸" next to "890 000 ₸" elsewhere.
const grouping = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

/**
 * "890 000 ₸" / "$2 500". `currency` is matched case-insensitively ('kzt' in
 * the camp data, 'KZT' on stored leads); without one — rows saved before
 * camp_currency existed — the number is shown bare rather than guessed at.
 */
export function formatPrice(price, currency) {
  if (price == null || price === '') return '';
  const n = grouping.format(Number(price));
  const cur = String(currency || '').toUpperCase();
  if (cur === 'KZT') return `${n} ₸`;
  if (cur === 'USD') return `$${n}`;
  return n;
}

/** A camp from data/camps.js: priced in tenge when it says so, otherwise in dollars. */
export const formatCampPrice = (camp) => formatPrice(camp.price, camp.currency || 'USD');
