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
 * Body: the public sub-pages (everything except "/") also get their React tree
 * rendered into <div id="root"> by src/entry-server.jsx (the `vite build --ssr`
 * half of `npm run build`), and main.jsx hydrates that markup. A visitor sees
 * the page before any JavaScript has run, and so does a crawler that never
 * runs it. The home page is NOT rendered here: its hero is a GSAP intro that
 * starts hidden and animates in, so server markup would show the headline,
 * blank it on hydration and play it again. It keeps an empty #root.
 *
 * Each route's HTML also preloads its own lazy chunk (see App.jsx), read from
 * Vite's manifest, so splitting routes does not add a request waterfall.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { ROUTES, urlFor, graphFor, buildSitemap, JSONLD_ID } from '../src/seo/pages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

const base = readFileSync(resolve(distDir, 'index.html'), 'utf8');
const manifestPath = resolve(distDir, '.vite/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const { render } = await import(pathToFileURL(resolve(__dirname, '../dist-ssr/entry-server.js')).href);

/** The lazy page component behind each route in App.jsx. */
const PAGE_SOURCE = {
  '/': 'src/pages/Landing.jsx',
  '/letnie-lagerya-za-rubezhom': 'src/pages/LagerZaRubezhom.jsx',
  '/leto-lager-v-turcii': 'src/pages/LagerAntalya.jsx',
  '/oferta': 'src/pages/Oferta.jsx',
  '/privacy': 'src/pages/Privacy.jsx',
};

/** Routes whose body is server-rendered. Not "/": see the header comment. */
const RENDER_BODY = (path) => path !== '/';

/** The home hero photo. The template preloads it at high priority, which is
 *  right for "/" and pure waste on every other route, none of which shows it. */
const HERO_PRELOAD = /\s*<link rel="preload" as="image" href="https:\/\/images\.unsplash\.com\/[^"]*"[^>]*>/;

/** <link rel="modulepreload"> for a route's chunk and the chunks it imports,
 *  minus what the template already loads (the entry and its own imports). */
function modulePreloads(path) {
  const key = PAGE_SOURCE[path];
  if (!manifest[key]) throw new Error(`prerender-meta: в манифесте нет ${key} — маршрут переименован?`);
  const seen = new Set(['index.html', ...(manifest['index.html'].imports || [])]);
  const files = [];
  (function walk(k) {
    if (seen.has(k)) return;
    seen.add(k);
    files.push(manifest[k].file);
    (manifest[k].imports || []).forEach(walk);
  })(key);
  return files.map((f) => `  <link rel="modulepreload" crossorigin href="/${f}">\n`).join('');
}

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

async function buildPage(route) {
  const url = urlFor(route.path);
  const title = esc(route.title);
  const description = esc(route.description);
  const keywords = esc(route.keywords);

  /** [regex matching the whole tag, replacement tag, label for the error]. */
  const tags = [
    [/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, '<title>'],
    [/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`, 'meta description'],
    [/<meta name="keywords" content="[^"]*"\s*\/?>/, `<meta name="keywords" content="${keywords}" />`, 'meta keywords'],
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
  // includeFaq: false — в статическом файле <div id="root"> пуст, а FAQ-разметка
  // без видимых вопросов недействительна для краулеров, которые не исполняют JS.
  // Подробности в комментарии к pageGraph() в src/seo/pages.js.
  // Теперь тело подстраниц пререндерится и вопросы в статике видны, так что
  // FAQ можно вернуть в статический JSON-LD — отдельным SEO-изменением с
  // проверкой check-seo.mjs, не в рамках оптимизации скорости.
  const json = JSON.stringify(graphFor(route, { includeFaq: false }), null, 2).replace(/<\//g, '<\\/');
  html = html.replace(
    '</head>',
    `${modulePreloads(route.path)}  <script type="application/ld+json" id="${JSONLD_ID}">\n${json}\n  </script>\n</head>`,
  );

  if (route.path !== '/') html = replaceTag(html, HERO_PRELOAD, '', 'preload фото героя');

  if (RENDER_BODY(route.path)) {
    const body = await render(route.path);
    // Everything must be resolved at build time: a streamed-in boundary would
    // arrive as an inline <script> (and the CSP-free reveal code with it).
    // \0: see entry-server.jsx — never let a broken byte reach the page.
    if (!body || /<script|\0|\uFFFD/i.test(body)) {
      throw new Error(`prerender-meta: ${route.path} — SSR вернул пустую разметку, <script> или битые символы`);
    }
    html = replaceTag(html, /<div id="root"><\/div>/, `<div id="root">${body}</div>`, '<div id="root">');
  }
  return html;
}

for (const route of ROUTES) {
  const html = await buildPage(route);

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

// Build artefacts that must not be deployed: the manifest lives inside dist/.
rmSync(resolve(distDir, '.vite'), { recursive: true, force: true });
console.log(`prerender-meta: sitemap.xml — ${ROUTES.length} адресов`);
