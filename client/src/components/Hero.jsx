import { useState, useRef } from 'react';
import { useLang } from '../context/LangContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

const SLIDES = [
  {
    id: 'edu',
    href: '#education',
    img: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1400&q=85&fit=crop&auto=format',
    bullets: ['b1', 'b2', 'b3'],
  },
  {
    id: 'camps',
    href: '#camps',
    img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=85&fit=crop&auto=format',
    bullets: ['b1', 'b2', 'b3'],
  },
];

export default function Hero() {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const swiperRef = useRef(null);

  return (
    <section id="hero">
      <Swiper
        className="hero-swiper-full"
        modules={[Autoplay]}
        autoplay={{ delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop
        speed={900}
        onSwiper={(sw) => { swiperRef.current = sw; }}
        onSlideChange={(sw) => setActiveIdx(sw.realIndex)}
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            {/* Background */}
            <div className="hero-slide-bg" style={{ backgroundImage: `url('${slide.img}')` }} />
            <div className="hero-slide-overlay" />

            {/* Content */}
            <div className="hero-slide-body">
              <h1 dangerouslySetInnerHTML={{ __html: t('hero.h1') }} />

              <div className="hsc-card">
                <div className="hsc-tag">{t(`card.${slide.id}.sub`)}</div>
                <h2 className="hsc-title">{t(`card.${slide.id}.title`)}</h2>
                <p className="hsc-desc">{t(`card.${slide.id}.desc`)}</p>
                <ul className="hsc-bullets">
                  {slide.bullets.map((b) => (
                    <li key={b}>{t(`card.${slide.id}.${b}`)}</li>
                  ))}
                </ul>
                <div className="hsc-btn-wrap">
                  <a
                    href={slide.href}
                    className="hsc-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(slide.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {t('go')}
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Navigation */}
              <div className="hero-slide-nav">
                <button className="hsn-arrow" onClick={() => swiperRef.current?.slidePrev()} aria-label="Назад">
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
                <button className="hsn-arrow" onClick={() => swiperRef.current?.slideNext()} aria-label="Вперёд">
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

            {/* Stats */}
            <div className="hero-stats-row">
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
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
