import { useLang } from '../context/LangContext';
import { campsData } from '../data/camps';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';
import LeadForm from '../components/LeadForm';

const camp = campsData.find((c) => c.id === 11);

// FAQPage structured data stays in Russian to match the statically
// prerendered <head> crawlers see (scripts/prerender-meta.mjs) —
// duplicating per-language JSON-LD would fight that snapshot.
const FAQ_RU = [
  { q: 'Что входит в стоимость путёвки?', a: 'Перелёт из Астаны (Turkish Airlines / Air Astana), проживание в отеле 5⭐ Ultra All Inclusive, трансфер и медицинская страховка, вся образовательная и развлекательная программа, круглосуточное сопровождение и безопасность детей.' },
  { q: 'Какие даты заездов доступны в 2026 году?', a: 'Три смены по 7 дней / 6 ночей: 20–26 июля, 28 июля – 3 августа и 2–8 августа 2026 года.' },
  { q: 'С какого возраста можно поехать в лагерь?', a: 'Лагерь принимает детей от 7 до 17 лет.' },
  { q: 'Есть ли рассрочка на оплату?', a: 'Да, доступна рассрочка на 6 месяцев.' },
  { q: 'Как забронировать место?', a: 'Оставьте заявку в форме на этой странице или позвоните по номеру +7 700 312 79 12 — консультант ASCORA свяжется с вами и поможет с бронированием.' },
];

export default function LagerAntalya() {
  const { t, lang } = useLang();
  if (!camp) return null;

  const FAQ = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`seo.antalya.faq.q${i}`),
    a: t(`seo.antalya.faq.a${i}`),
  }));

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_RU.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Детский летний лагерь в Турции (Анталья) — ASCORA Summer Camp 2026',
      description: 'Летний лагерь для детей 7–17 лет в Анталье: отель 5⭐ Ultra All Inclusive, английский язык, STEM и робототехника, перелёт из Астаны, трансфер и страховка включены.',
      image: 'https://www.ascora.education/logo.png',
      brand: { '@type': 'Brand', name: 'ASCORA Education' },
      offers: {
        '@type': 'Offer',
        url: 'https://www.ascora.education/leto-lager-v-turcii',
        price: '890000',
        priceCurrency: 'KZT',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'ASCORA Education' },
      },
    },
  ];

  return (
    <>
      <SeoHead
        title={t('seo.antalya.meta.title')}
        description={t('seo.antalya.meta.desc')}
        path="/leto-lager-v-turcii"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main>
        <section className="seo-hero">
          <div className="seo-breadcrumb">
            <a href="/">{t('seo.breadcrumb.home')}</a><span>／</span>
            <a href="/letnie-lagerya-za-rubezhom">{t('seo.antalya.breadcrumb.hub')}</a><span>／</span>
            <span>{t('seo.antalya.breadcrumb.current')}</span>
          </div>
          <h1>{t('seo.antalya.h1')}</h1>
          <p className="seo-hero-desc">{t('seo.antalya.hero.desc')}</p>
          <a href="#zayavka" className="btn-primary seo-hero-cta">
            <span>{t('seo.antalya.cta1')}</span>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </a>
        </section>

        <section className="seo-section">
          <div className="container">
            <div className="section-label">{t('seo.antalya.section1.label')}</div>
            <h2>{t('seo.antalya.section1.h2')}</h2>
            <div className="seo-key-facts">
              {(camp.includes[lang] || camp.includes.ru).map((item, i) => (
                <div key={i} className="about-feature">
                  <div className="feat-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A84C" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <div><p style={{ margin: 0, color: 'var(--text)', fontSize: 15 }}>{item}</p></div>
                </div>
              ))}
            </div>

            <div className="seo-price-band">
              <div>
                <div className="seo-price-band-label">{t('seo.antalya.price.label')}</div>
                <div className="seo-price-band-val">890 000 ₸</div>
                <div className="seo-price-band-note">{t('seo.antalya.price.note')}</div>
              </div>
              <a href="#zayavka" className="btn-primary">{t('seo.antalya.price.cta')}</a>
            </div>
          </div>
        </section>

        <section className="seo-section seo-section--alt">
          <div className="container">
            <div className="section-label">{t('seo.antalya.dates.label')}</div>
            <h2>{t('seo.antalya.dates.h2')}</h2>
            <div className="seo-key-facts">
              {(camp.dates[lang] || camp.dates.ru).split('\n').map((d, i) => (
                <div key={i} className="about-feature">
                  <div className="feat-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A84C" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  </div>
                  <div><p style={{ margin: 0, color: 'var(--text)', fontSize: 15, fontWeight: 600 }}>{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="seo-section">
          <div className="container">
            <div className="section-label">{t('seo.antalya.about.label')}</div>
            <h2>{t('seo.antalya.about.h2')}</h2>
            <div className="seo-faq" style={{ maxWidth: 800 }}>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 18 }}>
                {t('seo.antalya.about.p1')}
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 18 }}>
                {t('seo.antalya.about.p2')}
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                {t('seo.antalya.about.p3')}
              </p>
            </div>
          </div>
        </section>

        <section className="seo-section seo-section--alt">
          <div className="container">
            <div className="section-label">{t('seo.antalya.faq.label')}</div>
            <h2>{t('seo.antalya.faq.h2')}</h2>
            <div className="seo-faq">
              {FAQ.map((f, i) => (
                <div key={i} className="faq-item">
                  <div className="faq-q">{f.q}</div>
                  <div className="faq-a">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="seo-lead-band">
          <div className="container">
            <div className="section-label">{t('seo.antalya.lead.label')}</div>
            <h2>{t('seo.antalya.lead.h2')}</h2>
            <LeadForm id="zayavka" topic="Летний лагерь в Турции (Анталья)" price={890000} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
