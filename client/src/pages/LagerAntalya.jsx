import { useLang } from '../context/LangContext';
import { campsData } from '../data/camps';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';
import LeadForm from '../components/LeadForm';
import { routeFor, graphFor } from '../seo/pages';
import { localizedFaq } from '../seo/faq';

/*
 * Title, description, breadcrumb and the whole schema.org graph come from
 * src/seo/pages.js — the same module scripts/prerender-meta.mjs uses to bake
 * the static <head>. Computed once at module scope rather than per render:
 * <SeoHead> takes `jsonLd` as an effect dependency, and a fresh object literal
 * every render would re-run that effect on every state change.
 *
 * The page used to carry its own hand-copied `FAQ_RU` array. Nothing kept it
 * in step with the prerendered snapshot.
 */
const ROUTE = routeFor('/leto-lager-v-turcii');
// The FAQPage node is Russian (see pages.js, rule 2), so it goes into the DOM
// only while the Russian questions are the ones on screen. In Kazakh or
// English the graph keeps the WebPage, breadcrumb and Product nodes but drops
// the FAQ — markup that disagrees with the visible text is worse than none.
const JSON_LD = graphFor(ROUTE);
const JSON_LD_NO_FAQ = graphFor(ROUTE, { includeFaq: false });

const camp = campsData.find((c) => c.id === 11);

export default function LagerAntalya() {
  const { t, lang } = useLang();
  if (!camp) return null;

  // Russian straight from pages.js (what the JSON-LD says); kk/en from i18n.
  const FAQ = localizedFaq(ROUTE, 'seo.antalya.faq', lang, t);
  const isRu = lang === 'ru';

  return (
    <>
      <SeoHead
        title={isRu ? ROUTE.title : t('seo.antalya.meta.title')}
        description={isRu ? ROUTE.description : t('seo.antalya.meta.desc')}
        path="/leto-lager-v-turcii"
        jsonLd={isRu ? JSON_LD : JSON_LD_NO_FAQ}
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
