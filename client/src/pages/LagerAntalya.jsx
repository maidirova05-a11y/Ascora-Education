import { useLang } from '../context/LangContext';
import { campsData } from '../data/camps';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';
import LeadForm from '../components/LeadForm';

const camp = campsData.find((c) => c.id === 11);

const FAQ_RU = [
  { q: 'Что входит в стоимость путёвки?', a: 'Перелёт из Астаны (Turkish Airlines / Air Astana), проживание в отеле 5⭐ Ultra All Inclusive, трансфер и медицинская страховка, вся образовательная и развлекательная программа, круглосуточное сопровождение и безопасность детей.' },
  { q: 'Какие даты заездов доступны в 2026 году?', a: 'Три смены по 7 дней / 6 ночей: 20–26 июля, 28 июля – 3 августа и 2–8 августа 2026 года.' },
  { q: 'С какого возраста можно поехать в лагерь?', a: 'Лагерь принимает детей от 7 до 17 лет.' },
  { q: 'Есть ли рассрочка на оплату?', a: 'Да, доступна рассрочка на 6 месяцев.' },
  { q: 'Как забронировать место?', a: 'Оставьте заявку в форме на этой странице или позвоните по номеру +7 700 312 79 12 — консультант ASCORA свяжется с вами и поможет с бронированием.' },
];

export default function LagerAntalya() {
  const { t } = useLang();
  if (!camp) return null;

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
        priceValidUntil: '2026-07-05',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'ASCORA Education' },
      },
    },
  ];

  return (
    <>
      <SeoHead
        title="Детский летний лагерь в Турции (Анталья) 2026 из Астаны — отель 5⭐ Ultra All Inclusive | ASCORA Education"
        description="Детский лагерь в Турции для детей из Казахстана: Анталья, отель 5⭐ Ultra All Inclusive, английский язык, STEM и робототехника. Перелёт из Астаны, трансфер и страховка включены. От 890 000 ₸, рассрочка на 6 месяцев."
        path="/leto-lager-v-turcii"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main>
        <section className="seo-hero">
          <div className="seo-breadcrumb">
            <a href="/">Главная</a><span>／</span>
            <a href="/letnie-lagerya-za-rubezhom">Летние лагеря за рубежом</a><span>／</span>
            <span>Турция (Анталья)</span>
          </div>
          <h1>Летний лагерь в Турции — Анталья, отель 5⭐ Ultra All Inclusive</h1>
          <p className="seo-hero-desc">
            Горящее предложение ASCORA Education: 7 дней в Анталье с проживанием в отеле 5⭐ Ultra All Inclusive,
            английским языком, STEM и робототехникой на практике. Перелёт, трансфер и медстраховка уже включены в стоимость.
          </p>
          <a href="#zayavka" className="btn-primary seo-hero-cta">
            <span>Оставить заявку</span>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </a>
        </section>

        <section className="seo-section">
          <div className="container">
            <div className="section-label">Программа лагеря</div>
            <h2>Что входит в путёвку</h2>
            <div className="seo-key-facts">
              {camp.includes.ru.map((item, i) => (
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
                <div className="seo-price-band-label">Стоимость участия</div>
                <div className="seo-price-band-val">890 000 ₸</div>
                <div className="seo-price-band-note">Доступна рассрочка на 6 месяцев · 7 дней / 6 ночей · возраст 7–17 лет</div>
              </div>
              <a href="#zayavka" className="btn-primary">Забронировать место</a>
            </div>
          </div>
        </section>

        <section className="seo-section seo-section--alt">
          <div className="container">
            <div className="section-label">Даты заездов 2026</div>
            <h2>Три смены на выбор</h2>
            <div className="seo-key-facts">
              {camp.dates.ru.split('\n').map((d, i) => (
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
            <div className="section-label">О программе</div>
            <h2>Детский лагерь в Турции для детей из Казахстана</h2>
            <div className="seo-faq" style={{ maxWidth: 800 }}>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 18 }}>
                Лагерь в Анталье от ASCORA Education — это программа «всё включено» в прямом смысле:
                перелёт из Астаны рейсами Turkish Airlines или Air Astana, трансфер из аэропорта,
                медицинская страховка и проживание в отеле 5⭐ на системе Ultra All Inclusive уже входят
                в стоимость путёвки. Родителям не нужно ничего организовывать отдельно.
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 18 }}>
                Это не просто отдых на море: каждый день дети занимаются английским языком с практикой
                в реальных ситуациях, работают над STEM-проектами и робототехникой, развивают лидерство
                и soft skills в командных проектах. А после занятий — море, бассейны, спорт,
                мастер-классы и новые друзья со всего Казахстана.
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                Летний лагерь принимает детей и подростков от 7 до 17 лет. Смены по 7 дней летом 2026 года,
                круглосуточное сопровождение вожатыми и охрана. Количество мест в каждой смене ограничено —
                до 5 июля действует специальная цена 890 000 ₸ с рассрочкой на 6 месяцев.
              </p>
            </div>
          </div>
        </section>

        <section className="seo-section seo-section--alt">
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
            <div className="section-label">Бронирование</div>
            <h2>Оставьте заявку на лагерь в Анталье</h2>
            <LeadForm id="zayavka" topic="Летний лагерь в Турции (Анталья)" price={890000} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
