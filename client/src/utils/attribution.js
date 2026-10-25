/**
 * Marketing attribution for the inquiry forms.
 *
 * On the first page view of a browser session, `captureAttribution()` reads the
 * utm_* parameters from the URL, together with document.referrer and the path
 * the visitor landed on, and keeps them in sessionStorage. A parent who arrives
 * from an ad, browses to the Turkey page and only then fills in the form still
 * sends the campaign that brought them. sessionStorage, not localStorage: the
 * next visit from a different source is a different attribution.
 *
 * `attributionFields()` returns what every form spreads into its POST body —
 * the stored first-touch data plus the path the form is being submitted from.
 * Every value is optional; the server stores NULL for whatever is missing.
 */

const KEY = 'ascora_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function read() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function captureAttribution() {
  if (typeof window === 'undefined') return;
  try {
    if (sessionStorage.getItem(KEY)) return; // first touch wins for the session
    const params = new URLSearchParams(window.location.search);
    const data = { landing_path: window.location.pathname };
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) data[key] = value.slice(0, 120);
    }
    if (document.referrer) data.referrer = document.referrer.slice(0, 500);
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Private mode or blocked storage: the form simply sends no attribution.
  }
}

export function attributionFields() {
  const stored = read() || {};
  return {
    ...stored,
    page: typeof window !== 'undefined' ? window.location.pathname.slice(0, 255) : undefined,
  };
}
