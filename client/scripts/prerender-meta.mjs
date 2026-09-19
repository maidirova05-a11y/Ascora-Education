/**
 * Generates per-route static HTML files after `vite build`.
 *
 * The site is a SPA: without this, every URL serves the homepage's <head>, and
 * crawlers that don't execute JS (Yandex especially) index wrong titles and
 * descriptions. Vercel serves filesystem paths before applying rewrites, so
 * dist/<route>/index.html wins.
 *
 * Route content — titles, descriptions, breadcrumbs, FAQ, structured data —
 * lives in src/seo/pages.js, which the React pages import too. Before that
 * split, each page carried its own hand-copied FAQ array and this script
 * carried a second copy of the Antalya one; two of the three pages had their
 * FAQ markup only on the client, so the snapshot a non-JS crawler saw and the
 * markup a browser built were different documents.
 *
 * WHAT THIS DOES NOT DO: render the React tree. <div id="root"> is still empty
 * in these files, so a crawler that does not run JavaScript gets a correct
 * <head> and no body copy. Fixing that means real SSR (renderToString +
 * StaticRouter) — worth doing, and a larger change than a metadata pass.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROUTES, urlFor, graphFor, buildSitemap, JSONLD_ID } from '../src/seo/pages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

const base = readFileSync(resolve(distDir, 'index.html'), 'utf8');

/** Replaces exactly one tag, and throws when the template no longer contains
 *  it. Meta tags that silently stop being rewritten are far harder to notice
 *  than a build that fails. */
function replaceTag(html, pattern, replacement, what) {
  if (!pattern.test(html)) {
    throw new Error(`prerender-meta: не нашёл ${what} в dist/index.html — шаблон изменился?`);
  }
  return html.replace(pattern, () => replacement);
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildPage(route) {
  const url = urlFor(route.path);
  const title = esc(route.title);
  const description = esc(route.description);

  /** [regex matching the whole tag, replacement tag, label for the error]. */
  const tags = [
    [/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, '<title>'],
    [/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`, 'meta description'],
    [/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`, 'canonical'],
    [/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`, 'og:url'],
    [/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`, 'og:title'],
    [/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`, 'og:description'],
    [/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`, 'twitter:title'],
    [/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`, 'twitter:description'],
  ];

  let html = base;
  for (const [pattern, replacement, what] of tags) {
    html = replaceTag(html, pattern, replacement, what);
  }

  /*
   * The template's own JSON-LD stays: it holds the organisation, the site and
   * the brand image, which are true on every page. This block adds only what
   * is true of THIS url — its WebPage node, its breadcrumb, its questions.
   *
   * The id matters: <SeoHead> looks this element up on the client and rewrites
   * its contents when the SPA navigates. Without it the component appended a
   * SECOND <script> and the page carried two copies of its own WebPage,
   * BreadcrumbList, FAQPage and Product nodes.
   *
   * `</` is escaped because a literal `</script>` inside a data block would end
   * the tag early. JSON.stringify cannot emit a raw `<`, so this is belt and
   * braces against a future value arriving from somewhere less trusted.
   */
  const json = JSON.stringify(graphFor(route), null, 2).replace(/<\//g, '<\\/');
  return html.replace(
    '</head>',
    `  <script type="application/ld+json" id="${JSONLD_ID}">\n${json}\n  </script>\n</head>`,
  );
}

for (const route of ROUTES) {
  const html = buildPage(route);

  if (route.path === '/') {
    // The home page overwrites dist/index.html in place — it IS the template,
    // so it must also pick up its own WebPage and breadcrumb nodes.
    writeFileSync(resolve(distDir, 'index.html'), html);
    console.log('prerender-meta: index.html обновлён');
    continue;
  }

  const outDir = resolve(distDir, `.${route.path}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), html);
  console.log(`prerender-meta: ${route.path}/index.html written`);
}

/*
 * Built here rather than kept by hand in public/, so the URL list can never
 * drift from the routes that actually exist, and so every entry has a lastmod.
 */
writeFileSync(resolve(distDir, 'sitemap.xml'), buildSitemap());
console.log(`prerender-meta: sitemap.xml — ${ROUTES.length} адресов`);
