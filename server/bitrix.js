// Server-side Bitrix24 integration.
// Webhook URL lives only in server env (BITRIX_WEBHOOK) — never exposed to the browser.
// Fire-and-forget: never blocks or fails the inquiry response.
//
// Flow: create a Contact (with phone/email) → create a Deal in the
// "ASCORA EDU" pipeline (CATEGORY_ID=19, stage C19:NEW) linked to that contact.

const WEBHOOK = (process.env.BITRIX_WEBHOOK || '').replace(/\/?$/, '/'); // ensure trailing slash
const CATEGORY_ID = process.env.BITRIX_CATEGORY_ID || '19';             // ASCORA EDU pipeline
const STAGE_ID = process.env.BITRIX_STAGE_ID || `C${CATEGORY_ID}:NEW`;  // "Новая" stage

async function call(method, payload) {
  const res = await fetch(`${WEBHOOK}${method}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (data.error) {
    throw new Error(`${data.error}: ${data.error_description || ''}`);
  }
  return data.result;
}

async function sendLead(inq) {
  if (!WEBHOOK) {
    console.warn('Bitrix: BITRIX_WEBHOOK not set — skipping deal');
    return;
  }
  try {
    // 1) Create the contact with phone/email so the deal shows a client
    const contactFields = { NAME: inq.name, SOURCE_ID: 'WEB', OPENED: 'Y' };
    if (inq.phone) contactFields.PHONE = [{ VALUE: inq.phone, VALUE_TYPE: 'WORK' }];
    if (inq.email) contactFields.EMAIL = [{ VALUE: inq.email, VALUE_TYPE: 'WORK' }];
    const contactId = await call('crm.contact.add', { fields: contactFields });

    // 2) Create the deal in the ASCORA EDU pipeline, linked to the contact
    const commentParts = [];
    if (inq.phone) commentParts.push(`Телефон: ${inq.phone}`);
    if (inq.email) commentParts.push(`Email: ${inq.email}`);
    if (inq.camp_name) commentParts.push(`Программа: ${inq.camp_name}`);
    if (inq.camp_price) commentParts.push(`Цена: $${inq.camp_price}`);
    if (inq.lang) commentParts.push(`Язык: ${String(inq.lang).toUpperCase()}`);
    if (inq.message) commentParts.push(`Сообщение: ${inq.message}`);
    commentParts.push('Источник: сайт ascora.education');

    const dealFields = {
      TITLE: `Заявка с сайта — ${inq.name}`,
      CATEGORY_ID,
      STAGE_ID,
      CONTACT_ID: contactId,
      SOURCE_ID: 'WEB',
      OPENED: 'Y',
      COMMENTS: commentParts.join('\n'),
    };
    const dealId = await call('crm.deal.add', { fields: dealFields });
    console.log(`Bitrix deal created id=${dealId} (contact=${contactId}) in ASCORA EDU`);
  } catch (err) {
    console.error('Bitrix sendLead error:', err.message);
  }
}

module.exports = { sendLead };
