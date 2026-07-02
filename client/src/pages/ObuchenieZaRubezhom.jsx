import { useLang } from '../context/LangContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';
import LeadForm from '../components/LeadForm';

// FAQPage structured data stays in Russian to match the statically
// prerendered <head> crawlers see (scripts/prerender-meta.mjs).
const FAQ_RU = [
  { q: 'В какие страны можно поступить с помощью ASCORA?', a: 'Мы сопровождаем поступление в университеты Великобритании, США, Канады и стран Европы — более чем в 20 странах-партнёрах.' },
  { q: 'На каком этапе назначается консультант?', a: 'Сразу после первой заявки. Консультант — выпускник ведущего зарубежного университета, который сам прошёл этот путь.' },
  { q: 'Что входит в сопровождение?', a: 'Выбор университета, подготовка документов, помощь с эссе, подача заявки, получение визы и поддержка при поселении — от начала до конца.' },
  { q: 'Есть ли гарантия поступления?', a: '97% наших клиентов поступают в университет из своего топ-3 списка. Если поступление не состоялось — мы возвращаем деньги.' },
  { q: 'Как начать процесс поступления?', a: 'Оставьте заявку в форме ниже — консультант свяжется с вами, оценит профиль и предложит план поступления.' },
];

export default function ObuchenieZaRubezhom() {
  const { t } = useLang();

  const FAQ = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`seo.edu.faq.q${i}`),
    a: t(`seo.edu.faq.a${i}`),
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_RU.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <SeoHead
        title={t('seo.edu.meta.title')}
        description={t('seo.edu.meta.desc')}
        path="/obuchenie-za-rubezhom"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main>
        <section className="seo-hero">
          <div className="seo-breadcrumb">
            <a href="/">{t('seo.breadcrumb.home')}</a><span>／</span>
            <span>{t('seo.edu.breadcrumb')}</span>
          </div>
          <h1>{t('seo.edu.h1')}</h1>
          <p className="seo-hero-desc">{t('edu.desc')}</p>
          <a href="#zayavka" className="btn-primary seo-hero-cta">
            <span>{t('seo.edu.cta')}</span>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </a>
        </section>

        <section className="seo-section">
          <div className="container">
            <div className="section-label">{t('seo.edu.results.label')}</div>
            <h2>{t('seo.edu.results.h2')}</h2>
            <div className="seo-key-facts">
              <div className="about-feature">
                <div><h3 style={{ fontSize: 28, fontFamily: "'Fraunces',serif", color: 'var(--navy)' }}>300+</h3><p>{t('stat.students')}</p></div>
              </div>
              <div className="about-feature">
                <div><h3 style={{ fontSize: 28, fontFamily: "'Fraunces',serif", color: 'var(--navy)' }}>20+</h3><p>{t('stat.countries')}</p></div>
              </div>
              <div className="about-feature">
                <div><h3 style={{ fontSize: 28, fontFamily: "'Fraunces',serif", color: 'var(--navy)' }}>95%</h3><p>{t('stat.success')}</p></div>
              </div>
              <div className="about-feature">
                <div><h3 style={{ fontSize: 28, fontFamily: "'Fraunces',serif", color: 'var(--navy)' }}>97%</h3><p>{t('seo.edu.results.top3')}</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="seo-section seo-section--alt">
          <div className="container">
            <div className="section-label">{t('seo.edu.how.label')}</div>
            <h2>{t('seo.edu.how.h2')}</h2>
            <div className="seo-key-facts">
              <div className="about-feature">
                <div className="feat-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A84C" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
                <div><h3>{t('about.f1.h')}</h3><p>{t('about.f1.p')}</p></div>
              </div>
              <div className="about-feature">
                <div className="feat-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A84C" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
                <div><h3>{t('about.f2.h')}</h3><p>{t('about.f2.p')}</p></div>
              </div>
              <div className="about-feature">
                <div className="feat-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A84C" strokeWidth="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                <div><h3>{t('about.f3.h')}</h3><p>{t('about.f3.p')}</p></div>
              </div>
              <div className="about-feature">
                <div className="feat-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A84C" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div><h3>{t('about.f4.h')}</h3><p>{t('about.f4.p')}</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="seo-section">
          <div className="container">
            <div className="section-label">{t('seo.edu.faq.label')}</div>
            <h2>{t('seo.edu.faq.h2')}</h2>
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
            <div className="section-label">{t('seo.edu.lead.label')}</div>
            <h2>{t('seo.edu.lead.h2')}</h2>
            <LeadForm id="zayavka" topic="Обучение за рубежом — общая заявка" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
