import { useEffect } from 'react';

import { ORIGIN, JSONLD_ID } from '../seo/pages';

/**
 * Keeps the document <head> in step with the route the SPA has navigated to.
 *
 * ── What this is and is not ──────────────────────────────────────────────
 * This runs in an effect, i.e. after JavaScript. A crawler that does not
 * execute JS never sees any of it — it sees the static <head> that
 * scripts/prerender-meta.mjs bakes at build time. Both are generated from the
 * SAME src/seo/pages.js, so the two can no longer disagree; before that split
 * each page hand-copied its own FAQ array and two of the three pages had their
 * structured data only here, on the client.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Every tag it sets, it restores on unmount. Previously only the JSON-LD was
 * cleaned up, so navigating from /leto-lager-v-turcii back to "/" left the
 * camp's title, description and canonical on the home page — the SPA does not
 * reload, nothing else rewrote them, and a canonical pointing at another URL
 * is the one meta tag that can deindex a page outright.
 */

function upsertMeta(attr, key, content) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);
  const created = !el;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  const previous = el.getAttribute('content');
  el.setAttribute('content', content);
  return () => {
    if (created) el.remove();
    else if (previous !== null) el.setAttribute('content', previous);
  };
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  const created = !el;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  const previous = el.getAttribute('href');
  el.setAttribute('href', href);
  return () => {
    if (created) el.remove();
    else if (previous !== null) el.setAttribute('href', previous);
  };
}

/**
 * Rewrites the per-page JSON-LD block, reusing the one the build baked in.
 *
 * `scripts/prerender-meta.mjs` stamps the same id onto the block it writes, so
 * on a prerendered route this updates that element rather than adding a second
 * one — the page used to ship its WebPage, BreadcrumbList, FAQPage and Product
 * nodes twice, once from the snapshot and once from here.
 *
 * On unmount the previous contents are put back rather than the element being
 * deleted. Navigating from a camp page to "/" would otherwise strip the home
 * page's own prerendered graph, since the landing page renders no <SeoHead> to
 * put one back.
 */
function setJsonLd(data) {
  const existing = document.getElementById(JSONLD_ID);

  /*
   * `data == null` means this route has no structured data of its own, and the
   * baked-in block has to GO rather than be left alone. The 404 is served by
   * the host as a rewrite to index.html, so it arrives carrying the home page's
   * prerendered WebPage node — a document at /whatever asserting that its url
   * is "/". Removing it and putting it back on unmount keeps the real home page
   * intact, since the landing page renders no <SeoHead> to restore one.
   */
  if (data == null) {
    if (!existing) return () => {};
    const anchor = existing.nextSibling;
    const parent = existing.parentNode;
    existing.remove();
    return () => parent.insertBefore(existing, anchor);
  }

  let el = existing;
  const created = !el;
  if (!el) {
    el = document.createElement('script');
    el.id = JSONLD_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  const previous = el.textContent;
  el.textContent = JSON.stringify(data);
  return () => {
    if (created) el.remove();
    else el.textContent = previous;
  };
}

export default function SeoHead({ title, description, path = '/', jsonLd, noindex = false }) {
  useEffect(() => {
    window.scrollTo(0, 0);

    const url = path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`;
    const previousTitle = document.title;
    document.title = title;

    const undo = [
      upsertMeta('name', 'description', description),
      upsertCanonical(url),
      upsertMeta('property', 'og:title', title),
      upsertMeta('property', 'og:description', description),
      upsertMeta('property', 'og:url', url),
      upsertMeta('name', 'twitter:title', title),
      upsertMeta('name', 'twitter:description', description),
      // A page that must not rank says so itself. robots.txt asks a crawler not
      // to fetch a URL; it does not stop one indexing it from an inbound link.
      upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow'),
    ];

    undo.push(setJsonLd(jsonLd ?? null));

    return () => {
      document.title = previousTitle;
      // Reverse order, so a tag this component created is removed before an
      // earlier one restores a value onto it.
      for (const restore of undo.reverse()) restore();
    };
  }, [title, description, path, jsonLd, noindex]);

  return null;
}
