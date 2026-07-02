import { useLang } from '../context/LangContext';
import { campsData } from '../data/camps';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';
import LeadForm from '../components/LeadForm';

const FAQ_RU = [
  { q: 'С какого возраста можно поехать в летний лагерь за рубежом?', a: 'В зависимости от программы — от 6 до 18 лет. Мы подбираем лагерь под конкретный возраст и интересы ребёнка.' },
  { q: 'Что обычно входит в стоимость путёвки?', a: 'Как правило — проживание, питание, образовательная программа, трансфер и медицинская страховка. Точный состав зависит от конкретного лагеря и указан в описании каждой программы.' },
  { q: 'Кто сопровождает детей в поездке?', a: 'Все программы предполагают круглосуточное сопровождение и охрану на месте, а в отдельных лагерях — сопровождающего от ASCORA от вылета до прилёта.' },
  { q: 'Как выбрать подходящий лагерь?', a: 'Оставьте заявку — консультант ASCORA подберёт программу по возрасту ребёнка, бюджету и интересам (языковой, спортивный, STEM-лагерь).' },
];

export default function LagerZaRubezhom() {
  const { t, lang } = useLang();

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
        title="Летние лагеря за рубежом для детей 2026 — ASCORA Education"
        description="Летние языковые и спортивные лагеря за рубежом: Турция, Болгария, Испания, Англия, Малайзия и другие страны. Полное сопровождение, английский язык, от 7 до 18 лет."
        path="/letnie-lagerya-za-rubezhom"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main>
        <section className="seo-hero">
          <div className="seo-breadcrumb">
            <a href="/">Главная</a><span>／</span>
            <span>Летние лагеря за рубежом</span>
          </div>
          <h1>Летние лагеря за рубежом для детей и подростков</h1>
          <p className="seo-hero-desc">{t('camps.desc')} {t('camps.desc2')}</p>
          <a href="#zayavka" className="btn-primary seo-hero-cta">
            <span>Подобрать лагерь</span>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </a>
        </section>

        <section className="seo-section">
          <div className="container">
            <div className="section-label">Программы 2026</div>
            <h2>Все направления летних лагерей</h2>
            <div className="seo-camp-list">
              {campsData.map((camp) => (
                <a
                  key={camp.id}
                  href={camp.hot ? '/leto-lager-v-turcii' : `/#camp-${camp.id}`}
                  className="seo-camp-row"
                >
                  <div className="seo-camp-row-main">
                    <div className="seo-camp-row-country">
                      {camp.hot && '🔥 '}{camp.countryLabel[lang] || camp.countryLabel.ru} — {camp.org}
                    </div>
                    <div className="seo-camp-row-meta">
                      {(camp.city[lang] || camp.city.ru)} · {camp.ageTag} лет · {camp.durTag[lang] || camp.durTag.ru}
                    </div>
                  </div>
                  <div className="seo-camp-row-price">
                    от {camp.price.toLocaleString()} {camp.currency === 'kzt' ? '₸' : '$'}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="seo-section seo-section--alt">
          <div className="container">
            <div className="section-label">Почему ASCORA</div>
            <h2>Что мы гарантируем в каждой программе</h2>
            <div className="seo-key-facts">
              <div className="about-feature">
                <div className="feat-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A84C" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div><h3>{t('cw.1.h')}</h3><p>{t('cw.1.p')}</p></div>
              </div>
              <div className="about-feature">
                <div className="feat-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A84C" strokeWidth="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></div>
                <div><h3>{t('cw.2.h')}</h3><p>{t('cw.2.p')}</p></div>
              </div>
              <div className="about-feature">
                <div className="feat-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A84C" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
                <div><h3>{t('cw.3.h')}</h3><p>{t('cw.3.p')}</p></div>
              </div>
              <div className="about-feature">
                <div className="feat-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A84C" strokeWidth="1.5"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><circle cx="19" cy="8" r="3"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg></div>
                <div><h3>{t('cw.4.h')}</h3><p>{t('cw.4.p')}</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="seo-section">
          <div className="container">
            <div className="section-label">Вопросы и ответы</div>
            <h2>Часто спрашивают</h2>
            <div className="seo-faq">
              {FAQ_RU.map((f, i) => (
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
            <div className="section-label">Подбор программы</div>
            <h2>Оставьте заявку — подберём лагерь под ребёнка</h2>
            <LeadForm id="zayavka" topic="Летние лагеря за рубежом — общая заявка" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
