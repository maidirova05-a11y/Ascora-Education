// Server-side Bitrix24 integration.
// Webhook URL lives only in server env (BITRIX_WEBHOOK) — never exposed to the browser.
// Fire-and-forget: never blocks or fails the inquiry response.

const WEBHOOK = (process.env.BITRIX_WEBHOOK || '').replace(/\/?$/, '/'); // ensure trailing slash

async function sendLead(inq) {
  if (!WEBHOOK) {
    console.warn('Bitrix: BITRIX_WEBHOOK not set — skipping lead');
    return;
  }
  try {
    const commentParts = [];
    if (inq.camp_name) commentParts.push(`Программа: ${inq.camp_name}`);
    if (inq.camp_price) commentParts.push(`Цена: $${inq.camp_price}`);
    if (inq.lang) commentParts.push(`Язык: ${String(inq.lang).toUpperCase()}`);
    if (inq.message) commentParts.push(`Сообщение: ${inq.message}`);
    commentParts.push('Источник: сайт ascora.education');

    const fields = {
      TITLE: `Заявка с сайта — ${inq.name}`,
      NAME: inq.name,
      SOURCE_ID: 'WEB',
      COMMENTS: commentParts.join('\n'),
    };
    if (inq.phone) fields.PHONE = [{ VALUE: inq.phone, VALUE_TYPE: 'WORK' }];
    if (inq.email) fields.EMAIL = [{ VALUE: inq.email, VALUE_TYPE: 'WORK' }];

    const res = await fetch(`${WEBHOOK}crm.lead.add.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, params: { REGISTER_SONET_EVENT: 'Y' } }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.error) {
      console.error('Bitrix lead error:', data.error, data.error_description);
    } else {
      console.log('Bitrix lead created, id=', data.result);
    }
  } catch (err) {
    console.error('Bitrix sendLead error:', err.message);
  }
}

module.exports = { sendLead };
