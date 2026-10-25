/**
 * The FAQ a page renders, in the visitor's language.
 *
 * `route.faq` (src/seo/pages.js) is the single source of truth and is Russian:
 * it is what the FAQPage JSON-LD carries, and the only language a crawler is
 * served. For Russian the page therefore renders that array as is — the markup
 * and the visible text can no longer drift apart, as they could when i18n.js
 * kept its own hand-copied Russian answers.
 *
 * Kazakh and English come from i18n.js under `${prefix}.q${n}` / `.a${n}`
 * (1-based, in the order of `route.faq`). A question that has no translation
 * yet falls back to the Russian text rather than to the raw key.
 */
export function localizedFaq(route, prefix, lang, t) {
  return route.faq.map((item, i) => {
    if (lang === 'ru') return item;
    const qKey = `${prefix}.q${i + 1}`;
    const aKey = `${prefix}.a${i + 1}`;
    const q = t(qKey);
    const a = t(aKey);
    return { q: q === qKey ? item.q : q, a: a === aKey ? item.a : a };
  });
}
