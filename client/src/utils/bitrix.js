const BASE = import.meta.env.VITE_BITRIX_WEBHOOK;

export async function sendLeadToBitrix({ name, phone, email, topic, message }) {
  if (!BASE) return;
  const params = new URLSearchParams();
  params.append('fields[TITLE]', `Заявка с сайта — ${name}`);
  params.append('fields[NAME]', name);
  params.append('fields[SOURCE_ID]', 'WEB');
  if (phone) {
    params.append('fields[PHONE][0][VALUE]', phone);
    params.append('fields[PHONE][0][VALUE_TYPE]', 'WORK');
  }
  if (email) {
    params.append('fields[EMAIL][0][VALUE]', email);
    params.append('fields[EMAIL][0][VALUE_TYPE]', 'WORK');
  }
  const comments = [topic, message].filter(Boolean).join('\n');
  if (comments) params.append('fields[COMMENTS]', comments);

  await fetch(`${BASE}crm.lead.add.json`, { method: 'POST', body: params }).catch(() => {});
}
