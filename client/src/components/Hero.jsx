import { useState, useRef } from 'react';
import { useLang } from '../context/LangContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

const SLIDES = [
  {
    id: 'edu',
    href: '#education',
    img: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1400&q=85&fit=crop&auto=format',
    accent: '#C9A84C',
  },
  {
    id: 'camps',
    href: '#camps',
    img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=85&fit=crop&auto=format',
    accent: '#C9A84C',
  },
];

export default function Hero() {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const swiperRef = useRef(null);

  const active = SLIDES[activeIdx];

  return (
    <section id="hero">
      {/* Full-screen Swiper background — no Swiper CSS imported, manual styles */}
      <Swiper
        className="hero-swiper"
        modules={[Autoplay]}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop
        speed={900}
        onSwiper={(sw) => { swiperRef.current = sw; }}
        onSlideChange={(sw) => setActiveIdx(sw.realIndex)}
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="hero-full-slide"
              style={{ backgroundImage: `url('${slide.img}')` }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Dark overlay */}
      <div className="hero-slide-overlay" />

      {/* Content layer */}
      <div className="hero-content">
        <div className="hero-main">
          <h1 dangerouslySetInnerHTML={{ __html: t('hero.h1') }} />

          {/* Current slide card info */}
          <div className="hero-card-info">
            <div className="hci-tag">{t(`card.${active.id}.sub`)}</div>
            <div className="hci-title">{t(`card.${active.id}.title`)}</div>
            <div className="hci-desc">{t(`card.${active.id}.desc`)}</div>
            <a
              href={active.href}
              className="hci-link"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(active.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {t('go')}
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </a>
          </div>

          {/* Slide navigation */}
          <div className="hero-slide-nav">
            <button
              className="hsn-arrow"
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Назад"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10 4l-4 4 4 4"/>
              </svg>
            </button>
            <div className="hsn-dots">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  className={`hsn-dot ${idx === activeIdx ? 'hsn-dot--active' : ''}`}
                  onClick={() => swiperRef.current?.slideToLoop(idx)}
                  aria-label={`Слайд ${idx + 1}`}
                />
              ))}
            </div>
            <button
              className="hsn-arrow"
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Вперёд"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </button>
          </div>

          <div className="faction-cta-bar">
            <a href="#contacts" className="btn-primary faction-big-cta">
              <span>{t('hero.cta')}</span>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="hero-stats-col">
          <div className="hero-stats">
            {[
              { num: '300+', key: 'stat.students' },
              { num: '20+', key: 'stat.countries' },
              { num: '95%', key: 'stat.success' },
              { num: '10', key: 'stat.programs' },
            ].map((s) => (
              <div key={s.key} className="hero-stat">
                <div className="hero-stat-num">{s.num}</div>
                <div className="hero-stat-label">{t(s.key)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
