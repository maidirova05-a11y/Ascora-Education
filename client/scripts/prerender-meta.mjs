// Generates per-route static HTML files after `vite build`.
// The site is a SPA: without this, every URL serves the homepage's
// <head>, and crawlers that don't execute JS (Yandex especially)
// index wrong titles/descriptions. Vercel serves filesystem paths
// before applying rewrites, so dist/<route>/index.html wins.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

const ORIGIN = 'https://www.ascora.education';

const antalyaFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { q: 'Что входит в стоимость путёвки?', a: 'Перелёт из Астаны (Turkish Airlines / Air Astana), проживание в отеле 5⭐ Ultra All Inclusive, трансфер и медицинская страховка, вся образовательная и развлекательная программа, круглосуточное сопровождение и безопасность детей.' },
    { q: 'Какие даты заездов доступны в 2026 году?', a: 'Три смены по 7 дней / 6 ночей: 20–26 июля, 28 июля – 3 августа и 2–8 августа 2026 года.' },
    { q: 'С какого возраста можно поехать в лагерь?', a: 'Лагерь принимает детей от 7 до 17 лет.' },
    { q: 'Есть ли рассрочка на оплату?', a: 'Да, доступна рассрочка на 6 месяцев.' },
    { q: 'Как забронировать место?', a: 'Оставьте заявку на этой странице или позвоните по номеру +7 700 312 79 12 — консультант ASCORA свяжется с вами и поможет с бронированием.' },
  ].map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const antalyaProduct = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Детский летний лагерь в Турции (Анталья) — ASCORA Summer Camp 2026',
  description: 'Летний лагерь для детей 7–17 лет в Анталье: отель 5⭐ Ultra All Inclusive, английский язык, STEM и робототехника, перелёт из Астаны, трансфер и страховка включены.',
  image: `${ORIGIN}/logo.png`,
  brand: { '@type': 'Brand', name: 'ASCORA Education' },
  offers: {
    '@type': 'Offer',
    url: `${ORIGIN}/leto-lager-v-turcii`,
    price: '890000',
    priceCurrency: 'KZT',
    priceValidUntil: '2026-07-05',
    availability: 'https://schema.org/InStock',
    seller: { '@type': 'Organization', name: 'ASCORA Education' },
  },
};

const ROUTES = [
  {
    path: '/leto-lager-v-turcii',
    title: 'Детский летний лагерь в Турции (Анталья) 2026 из Астаны — отель 5⭐ Ultra All Inclusive | ASCORA Education',
    description: 'Детский лагерь в Турции для детей из Казахстана: Анталья, отель 5⭐ Ultra All Inclusive, английский язык, STEM и робототехника. Перелёт из Астаны, трансфер и страховка включены. От 890 000 ₸, рассрочка на 6 месяцев.',
    jsonLd: [antalyaFaq, antalyaProduct],
  },
  {
    path: '/letnie-lagerya-za-rubezhom',
    title: 'Летние лагеря за рубежом для детей 2026 — Турция, Европа, Азия | ASCORA Education',
    description: 'Летние языковые и спортивные лагеря за рубежом для детей 7–18 лет из Казахстана: Турция, Болгария, Испания, Англия, Малайзия и другие страны. Полное сопровождение и трансфер.',
    jsonLd: [],
  },
  {
    path: '/obuchenie-za-rubezhom',
    title: 'Обучение за рубежом — поступление в университеты мира | ASCORA Education',
    description: 'Поступление в университеты Великобритании, США, Канады и Европы для студентов из Казахстана. Личный консультант, полное сопровождение до визы. 300+ студентов, 95% успешных поступлений.',
    jsonLd: [],
  },
];

const base = readFileSync(resolve(distDir, 'index.html'), 'utf8');

for (const route of ROUTES) {
  const url = `${ORIGIN}${route.path}`;
  let html = base
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${route.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${route.description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${route.title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${route.description}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${route.title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${route.description}$2`);

  if (route.jsonLd.length) {
    const blocks = route.jsonLd
      .map((d) => `<script type="application/ld+json">${JSON.stringify(d)}</script>`)
      .join('\n  ');
    html = html.replace('</head>', `  ${blocks}\n</head>`);
  }

  const outDir = resolve(distDir, `.${route.path}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), html);
  console.log(`prerender-meta: ${route.path}/index.html written`);
}
