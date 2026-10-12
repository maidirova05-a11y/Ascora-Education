/**
 * =============================================================================
 * Single source of truth for everything a search engine reads.
 * =============================================================================
 * Two things consume this file, and that is the whole point:
 *
 *   • scripts/prerender-meta.mjs — bakes a static <head> per route after the
 *     Vite build, for crawlers that do not run JavaScript (Yandex especially).
 *   • the React pages — hand the same graph to <SeoHead> at runtime.
 *
 * Before this file, each page carried its own hand-copied `FAQ_RU` array and
 * the prerender script carried a second copy of the Antalya one. Two of the
 * three pages had their FAQ markup ONLY on the client, so the snapshot a
 * non-JS crawler saw and the markup a browser built were different documents —
 * and the Antalya answers existed in two places that nothing kept in step.
 *
 * ── Rules ────────────────────────────────────────────────────────────────
 *  1. Plain JavaScript, no JSX and no React imports. `node` runs this file
 *     directly during the build; anything that needs a bundler breaks it.
 *  2. Russian, deliberately. The prerendered <head> is Russian because the
 *     language switcher is client-side state with no URL of its own, so a
 *     crawler only ever sees the Russian snapshot. Markup in a language the
 *     crawler was not served is markup that disagrees with the page.
 *  3. Nothing here is invented. Every question, answer, price and address is
 *     text that already appears on the site.
 * =============================================================================
 */

export const ORIGIN = 'https://www.ascora.education';

/**
 * id of the per-page JSON-LD block.
 *
 * Shared so the build and the client agree on one element: the prerenderer
 * stamps it onto the block it bakes, and <SeoHead> rewrites that same element
 * on navigation. When they disagreed, the client appended a second script and
 * every prerendered page shipped its structured data twice.
 */
export const JSONLD_ID = 'seo-page-jsonld';

/** Real intrinsic size of public/logo.png, measured — not the conventional
 *  1200x630. Stating a size the file does not have is worse than stating none. */
const LOGO = { url: `${ORIGIN}/logo.png`, width: 1874, height: 781 };
/** The only square brand asset, so the only one usable as an icon. */
const LOGO_SQUARE = { url: `${ORIGIN}/icon-512.png`, width: 512, height: 512 };

const ORG_ID = `${ORIGIN}/#organization`;
const SITE_ID = `${ORIGIN}/#website`;
const IMAGE_ID = `${ORIGIN}/#primaryimage`;

/**
 * True on every page: who this is and what the site is.
 *
 * Emitted once, from index.html, and inherited by every prerendered route —
 * which is why nothing page-specific (a WebPage node, an FAQ) may go in here.
 * A WebPage node claiming the home page's URL, sitting in the HTML of
 * /leto-lager-v-turcii, is a claim that the two are the same document.
 */
export function siteGraph() {
  return [
    {
      '@type': 'EducationalOrganization',
      '@id': ORG_ID,
      name: 'ASCORA Education',
      url: `${ORIGIN}/`,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_SQUARE.url,
        width: LOGO_SQUARE.width,
        height: LOGO_SQUARE.height,
      },
      image: { '@id': IMAGE_ID },
      description:
        'Летние языковые, спортивные и STEM-лагеря за рубежом для детей и подростков из Казахстана.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ул. Асқар Тоқпанова 27',
        addressLocality: 'Астана',
        addressCountry: 'KZ',
      },
      areaServed: 'KZ',
      telephone: '+7-700-312-79-12',
      email: 'info@az-group.kz',
      knowsLanguage: ['ru', 'kk', 'en'],
      sameAs: ['https://www.instagram.com/ascora.education'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+7-700-312-79-12',
        email: 'info@az-group.kz',
        areaServed: 'KZ',
        availableLanguage: ['Russian', 'Kazakh', 'English'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': SITE_ID,
      url: `${ORIGIN}/`,
      name: 'ASCORA Education',
      inLanguage: 'ru',
      publisher: { '@id': ORG_ID },
    },
    {
      '@type': 'ImageObject',
      '@id': IMAGE_ID,
      url: LOGO.url,
      contentUrl: LOGO.url,
      width: LOGO.width,
      height: LOGO.height,
      caption: 'ASCORA Education',
    },
  ];
}

/**
 * Every indexable route.
 *
 * `crumbs` lists the trail BELOW the home page, and each `name` is copied from
 * the breadcrumb the page actually renders (`.seo-breadcrumb`). Google compares
 * the markup against the visible trail and drops markup that disagrees.
 */
export const ROUTES = [
  {
    path: '/',
    keywords:
      'ASCORA Education, летние лагеря за рубежом, детские лагеря за границей, летний лагерь для детей 2027, языковой лагерь за рубежом, лагерь английского языка для детей, спортивный лагерь за рубежом, STEM лагерь, лагерь в Турции, лагерь в Анталье, лагерь в Болгарии, лагерь в Испании, лагерь в Англии, лагерь в Малайзии, детский отдых за границей из Астаны, шетелдегі жазғы лагерь, балаларға арналған лагерь',
    title: 'ASCORA Education — летние лагеря за рубежом для детей и подростков',
    description:
      'ASCORA Education (Астана) — летние языковые, спортивные и STEM-лагеря за рубежом для детей и подростков из Казахстана: Турция, Болгария, Испания, Англия, Малайзия и другие страны. Подбор программы и сопровождение.',
    changefreq: 'weekly',
    priority: '1.0',
    lastmod: '2026-09-26',
    crumbs: [],
    faq: [],
    extra: [],
  },
  {
    path: '/letnie-lagerya-za-rubezhom',
    keywords:
      'летние лагеря за рубежом 2027, детский лагерь за границей, языковой лагерь за рубежом, лагерь английского языка для детей, спортивный лагерь за рубежом, STEM лагерь, лагерь в Турции, лагерь в Болгарии, лагерь в Испании, лагерь в Англии, лагерь в Малайзии, летний лагерь для подростков из Казахстана, детский отдых за границей из Астаны, шетелдегі жазғы лагерь',
    title: 'Детские летние лагеря за рубежом 2027 — Турция, Европа, Азия | ASCORA Education',
    description:
      'Летние языковые и спортивные лагеря за границей для детей 7–18 лет из Казахстана: Турция, Болгария, Испания, Англия, Малайзия и другие страны. Полное сопровождение и трансфер.',
    changefreq: 'weekly',
    priority: '0.9',
    lastmod: '2026-09-26',
    crumbs: [{ name: 'Летние лагеря за рубежом', path: '/letnie-lagerya-za-rubezhom' }],
    faq: [
      {
        q: 'С какого возраста можно поехать в летний лагерь за рубежом?',
        a: 'В зависимости от программы — от 6 до 18 лет. Мы подбираем лагерь под конкретный возраст и интересы ребёнка.',
      },
      {
        q: 'Что обычно входит в стоимость путёвки?',
        a: 'Как правило — проживание, питание, образовательная программа, трансфер и медицинская страховка. Точный состав зависит от конкретного лагеря и указан в описании каждой программы.',
      },
      {
        q: 'Кто сопровождает детей в поездке?',
        a: 'Все программы предполагают круглосуточное сопровождение и охрану на месте, а в отдельных лагерях — сопровождающего от ASCORA от вылета до прилёта.',
      },
      {
        q: 'Как выбрать подходящий лагерь?',
        a: 'Оставьте заявку — консультант ASCORA подберёт программу по возрасту ребёнка, бюджету и интересам (языковой, спортивный, STEM-лагерь).',
      },
    ],
    extra: [],
  },
  {
    path: '/leto-lager-v-turcii',
    keywords:
      'детский лагерь в Турции 2027, лагерь в Анталье, летний лагерь в Турции для детей, лагерь в Турции из Астаны, лагерь в Турции из Казахстана, языковой лагерь в Турции, лагерь английского языка в Турции, STEM и робототехника лагерь, лагерь Ultra All Inclusive, лагерь в Турции в рассрочку, Түркиядағы балалар лагері',
    title:
      'Детский летний лагерь в Турции (Анталья) 2027 из Астаны — отель 5⭐ Ultra All Inclusive | ASCORA Education',
    description:
      'Детский лагерь в Турции для детей из Казахстана: Анталья, отель 5⭐ Ultra All Inclusive, английский язык, STEM и робототехника. Перелёт из Астаны, трансфер и страховка включены. От 890 000 ₸, рассрочка на 6 месяцев.',
    changefreq: 'weekly',
    priority: '0.9',
    lastmod: '2026-09-26',
    // Three crumbs, matching the trail the page draws: Главная / хаб / страна.
    crumbs: [
      { name: 'Летние лагеря за рубежом', path: '/letnie-lagerya-za-rubezhom' },
      { name: 'Турция (Анталья)', path: '/leto-lager-v-turcii' },
    ],
    faq: [
      {
        q: 'Что входит в стоимость путёвки?',
        a: 'Перелёт из Астаны (Turkish Airlines / Air Astana), проживание в отеле 5⭐ Ultra All Inclusive, трансфер и медицинская страховка, вся образовательная и развлекательная программа, круглосуточное сопровождение и безопасность детей.',
      },
      {
        q: 'Когда будут заезды летом 2027 года?',
        a: 'Смены по 7 дней / 6 ночей летом 2027 года. Точные даты уточняются — оставьте заявку на предзапись, и консультант сообщит их первым делом.',
      },
      { q: 'С какого возраста можно поехать в лагерь?', a: 'Лагерь принимает детей от 7 до 17 лет.' },
      { q: 'Есть ли рассрочка на оплату?', a: 'Да, доступна рассрочка на 6 месяцев.' },
      {
        q: 'Как забронировать место?',
        a: 'Оставьте заявку в форме на этой странице или позвоните по номеру +7 700 312 79 12 — консультант ASCORA свяжется с вами и поможет с бронированием.',
      },
    ],
    extra: [
      {
        '@type': 'Product',
        '@id': `${ORIGIN}/leto-lager-v-turcii#product`,
        name: 'Детский летний лагерь в Турции (Анталья) — ASCORA Summer Camp 2027',
        description:
          'Летний лагерь для детей 7–17 лет в Анталье: отель 5⭐ Ultra All Inclusive, английский язык, STEM и робототехника, перелёт из Астаны, трансфер и страховка включены.',
        image: { '@id': IMAGE_ID },
        brand: { '@type': 'Brand', name: 'ASCORA Education' },
        offers: {
          '@type': 'Offer',
          url: `${ORIGIN}/leto-lager-v-turcii`,
          price: '890000',
          priceCurrency: 'KZT',
          // Summer 2027 dates are not announced yet: taking pre-bookings.
          availability: 'https://schema.org/PreOrder',
          seller: { '@id': ORG_ID },
        },
      },
    ],
  },
  {
    path: '/oferta',
    keywords:
      'публичная оферта ASCORA Education, AZ GROUP LLC, договор оказания образовательных услуг, условия оплаты, возврат средств',
    title: 'Публичная оферта | ASCORA Education',
    description:
      'Публичная оферта ТОО «AZ GROUP LLC» на оказание платных образовательных услуг ASCORA Education: условия, оплата, возврат средств и реквизиты Исполнителя.',
    changefreq: 'yearly',
    priority: '0.3',
    lastmod: '2026-10-12',
    crumbs: [{ name: 'Публичная оферта', path: '/oferta' }],
    faq: [],
    extra: [],
  },
  {
    path: '/privacy',
    keywords: 'политика конфиденциальности ASCORA Education, персональные данные, AZ GROUP LLC',
    title: 'Политика конфиденциальности | ASCORA Education',
    description:
      'Какие персональные данные ASCORA Education получает через формы заявки на сайте, зачем они нужны, где хранятся, кому передаются и как их удалить.',
    changefreq: 'yearly',
    priority: '0.3',
    lastmod: '2026-10-12',
    crumbs: [{ name: 'Политика конфиденциальности', path: '/privacy' }],
    faq: [],
    extra: [],
  },
];

export const routeFor = (path) => ROUTES.find((r) => r.path === path);

/** Absolute URL for a route path. The home page keeps its trailing slash so
 *  canonical, og:url and the sitemap all agree on one spelling. */
export const urlFor = (path) => (path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`);

/**
 * The page-specific half of the graph: this URL, its breadcrumb, its questions
 * and anything else true only of it.
 *
 * Never the organisation or the site — those come from index.html and are
 * already in the <head> of every prerendered file.
 */
export function pageGraph(route, { includeFaq = true } = {}) {
  const url = urlFor(route.path);
  const nodes = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: route.title,
      description: route.description,
      inLanguage: 'ru',
      isPartOf: { '@id': SITE_ID },
      about: { '@id': ORG_ID },
      primaryImageOfPage: { '@id': IMAGE_ID },
      breadcrumb: { '@id': `${url}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${ORIGIN}/` },
        ...route.crumbs.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 2,
          name: crumb.name,
          item: urlFor(crumb.path),
        })),
      ],
    },
  ];

  /*
   * FAQPage только когда includeFaq — то есть НЕ в пререндеренной голове.
   *
   * Правило Google: разметка FAQ действительна, только пока те же вопросы и
   * ответы видны на странице. Здесь <div id="root"> в собранных файлах пустой
   * — React-дерево не рендерится на сервере. Google страницу отрисует и увидит
   * и текст, и разметку; Яндекс и краулеры соцсетей в общем случае нет, и для
   * них статический файл выглядел бы как FAQ-разметка без единого вопроса в
   * тексте. Это ровно тот случай, за который разметку снимают.
   *
   * Поэтому FAQPage добавляет только <SeoHead> на клиенте: там он попадает в
   * DOM, где вопросы уже отрисованы. Получается согласованно в обе стороны —
   * кто рендерит, видит и то и другое; кто не рендерит, не видит ни того ни
   * другого. Вернуть FAQ в статику можно будет вместе с настоящим SSR.
   */
  if (includeFaq && route.faq.length) {
    nodes.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: 'ru',
      isPartOf: { '@id': `${url}#webpage` },
      mainEntity: route.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }

  return [...nodes, ...route.extra];
}

/**
 * Готовый JSON-LD для одного маршрута.
 *
 * `includeFaq: false` — для сборки: см. длинный комментарий в pageGraph().
 */
export const graphFor = (route, options) => ({
  '@context': 'https://schema.org',
  '@graph': pageGraph(route, options),
});

/**
 * sitemap.xml, built from the same ROUTES list.
 *
 * Generated rather than hand-kept in public/, because the previous file had no
 * <lastmod> at all and nothing tied its URL list to the routes that actually
 * exist — a page added to the router would simply never appear in it.
 *
 * `lastmod` is a per-route constant, NOT the build date. A lastmod that moves
 * on every deploy is one a search engine stops believing: it sees a page
 * "change" ten times with no edit to the text and then ignores the field
 * entirely. Bump a route's value when you change that route's content.
 *
 * No hreflang: the language switcher is client-side state with no URL of its
 * own, so /kk and /en do not exist as addresses. Declaring alternates that
 * 404 would be worse than declaring none. Giving each language a real URL is
 * the change that would unlock it.
 */
export function buildSitemap() {
  const urls = ROUTES.map((route) =>
    [
      '  <url>',
      `    <loc>${urlFor(route.path)}</loc>`,
      `    <lastmod>${route.lastmod}</lastmod>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      '  </url>',
    ].join('\n'),
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
