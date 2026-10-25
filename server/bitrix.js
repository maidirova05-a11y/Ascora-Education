// Server-side Bitrix24 integration.
// Webhook URL lives only in server env (BITRIX_WEBHOOK) — never exposed to the browser.
// Fire-and-forget: never blocks or fails the inquiry response.
//
// Flow: create a Contact (with phone/email) → create a Deal in the
// "ASCORA EDU" pipeline (CATEGORY_ID=19, stage C19:NEW) linked to that contact.

const { formatPrice } = require('./inquiry');

// Empty when unset so the guard in sendLead skips the call ('' .replace() would
// yield '/', a truthy URL, and every lead logged a failed fetch instead).
const WEBHOOK = process.env.BITRIX_WEBHOOK ? process.env.BITRIX_WEBHOOK.replace(/\/?$/, '/') : '';
const CATEGORY_ID = process.env.BITRIX_CATEGORY_ID || '19';             // ASCORA EDU pipeline
const STAGE_ID = process.env.BITRIX_STAGE_ID || `C${CATEGORY_ID}:NEW`;  // "Новая" stage

/** Bitrix24's built-in marketing fields on crm.deal (and crm.contact). */
const UTM_FIELDS = {
  utm_source: 'UTM_SOURCE',
  utm_medium: 'UTM_MEDIUM',
  utm_campaign: 'UTM_CAMPAIGN',
  utm_content: 'UTM_CONTENT',
  utm_term: 'UTM_TERM',
};

/**
 * One Bitrix REST call. Errors name the method, never the webhook URL — the
 * URL is the secret. A hung Bitrix cannot hold the request open for long: the
 * call is abandoned after 15 s. A reply without `result` counts as a failure,
 * so the caller never logs "created id=undefined".
 */
async function call(method, payload) {
  const res = await fetch(`${WEBHOOK}${method}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (data.error) {
    throw new Error(`${method}: ${data.error}: ${data.error_description || ''}`);
  }
  if (!res.ok) {
    throw new Error(`${method}: HTTP ${res.status}`);
  }
  if (data.result == null || data.result === false) {
    throw new Error(`${method}: no result in the response`);
  }
  return data.result;
}

/** The utm_* values a lead carries, keyed by Bitrix field name. */
function utmFields(inq) {
  const out = {};
  for (const [field, bitrixName] of Object.entries(UTM_FIELDS)) {
    if (inq[field]) out[bitrixName] = inq[field];
  }
  return out;
}

async function sendLead(inq) {
  if (!WEBHOOK) {
    console.warn('Bitrix: BITRIX_WEBHOOK not set — skipping deal');
    return;
  }
  try {
    const utm = utmFields(inq);

    // 1) Create the contact with phone/email so the deal shows a client
    const contactFields = { NAME: inq.name, SOURCE_ID: 'WEB', OPENED: 'Y', ...utm };
    if (inq.phone) contactFields.PHONE = [{ VALUE: inq.phone, VALUE_TYPE: 'WORK' }];
    if (inq.email) contactFields.EMAIL = [{ VALUE: inq.email, VALUE_TYPE: 'WORK' }];
    const contactId = await call('crm.contact.add', { fields: contactFields });

    // 2) Create the deal in the ASCORA EDU pipeline, linked to the contact
    const commentParts = [];
    if (inq.phone) commentParts.push(`Телефон: ${inq.phone}`);
    if (inq.email) commentParts.push(`Email: ${inq.email}`);
    if (inq.camp_name) commentParts.push(`Программа: ${inq.camp_name}`);
    if (inq.camp_price) commentParts.push(`Цена: ${formatPrice(inq.camp_price, inq.camp_currency)}`);
    if (inq.lang) commentParts.push(`Язык: ${String(inq.lang).toUpperCase()}`);
    if (inq.message) commentParts.push(`Сообщение: ${inq.message}`);
    commentParts.push('Источник: сайт ascora.education');
    if (inq.page) commentParts.push(`Страница формы: ${inq.page}`);
    if (inq.landing_path) commentParts.push(`Страница входа: ${inq.landing_path}`);
    if (inq.referrer) commentParts.push(`Referrer: ${inq.referrer}`);
    const utmSummary = Object.entries(UTM_FIELDS)
      .filter(([field]) => inq[field])
      .map(([field]) => `${field}=${inq[field]}`)
      .join(', ');
    if (utmSummary) commentParts.push(`UTM: ${utmSummary}`);

    const dealFields = {
      TITLE: `Заявка с сайта — ${inq.name}`,
      CATEGORY_ID,
      STAGE_ID,
      CONTACT_ID: contactId,
      SOURCE_ID: 'WEB',
      OPENED: 'Y',
      COMMENTS: commentParts.join('\n'),
      ...utm,
    };
    if (inq.camp_price && inq.camp_currency) {
      dealFields.OPPORTUNITY = inq.camp_price;
      dealFields.CURRENCY_ID = inq.camp_currency;
    }
    const dealId = await call('crm.deal.add', { fields: dealFields });
    console.log(`Bitrix deal created id=${dealId} (contact=${contactId}) in ASCORA EDU`);
  } catch (err) {
    // fetch() failures (DNS, reset, timeout) carry no URL in their message.
    console.error('Bitrix sendLead error:', err.name === 'TimeoutError' ? 'timed out after 15 s' : err.message);
  }
}

module.exports = { sendLead };
