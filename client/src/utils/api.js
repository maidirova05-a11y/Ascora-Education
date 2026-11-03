/*
 * POST /api/inquiries for the three lead forms. The server answers every
 * failure as { error, code } (server/errors.js); this maps the code to the
 * i18n key of the message the visitor should read, so a rate limit or a bad
 * phone number is not reported as a generic "sending error".
 */
const ERROR_KEYS = {
  RATE_LIMITED: 'enroll.error.rate',
  VALIDATION: 'enroll.error.invalid',
};

/** Resolves on 201; throws an Error whose `key` is the i18n key to show. */
export async function postInquiry(body) {
  let res;
  try {
    res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw Object.assign(new Error('network'), { key: 'enroll.error' });
  }
  if (res.ok) return;
  const data = await res.json().catch(() => ({}));
  throw Object.assign(new Error(data.code || `HTTP ${res.status}`), {
    key: ERROR_KEYS[data.code] || (res.status === 429 ? ERROR_KEYS.RATE_LIMITED : 'enroll.error'),
  });
}
