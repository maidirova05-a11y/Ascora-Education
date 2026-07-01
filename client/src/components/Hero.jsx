import { useState, useEffect, useRef, useCallback } from 'react';
import { useLang } from '../context/LangContext';

const HERO_BG = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&q=80&fit=crop&auto=format';

/* ── Card slider ─────────────────────────────────────────────────────── */
const CARDS = [
  {
    id: 'edu', href: '#education', colorClass: 'fbc-navy', topClass: 'faction-top-navy',
    img: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=900&q=80&fit=crop&auto=format',
  },
  {
    id: 'camps', href: '#camps', colorClass: 'fbc-gold', topClass: 'faction-top-gold',
    img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80&fit=crop&auto=format',
  },
];

function FactionCardSlider({ t }) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const [active, setActive] = useState(null);
  const timerRef = useRef(null);

  const goTo = useCallback((idx, direction = 1) => {
    setDir(direction);
    setCurrent(idx);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(i => { setDir(1); return (i + 1) % CARDS.length; });
    }, 4000);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(i => { setDir(1); return (i + 1) % CARDS.length; });
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  const touchX = useRef(null);
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goTo((current + 1) % CARDS.length, 1);
      else goTo((current - 1 + CARDS.length) % CARDS.length, -1);
    }
    touchX.current = null;
  };

  return (
    <div className="fcs-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="fcs-track">
        {CARDS.map((card, idx) => (
          <div key={card.id} className={`fcs-slide ${idx === current ? 'fcs-slide--active' : ''}`}
            style={{ '--dir': dir }}>
            <a
              href={card.href}
              className={`faction-big-card ${card.colorClass} ${active === card.id ? 'is-active' : ''}`}
              onMouseDown={() => setActive(card.id)}
              onMouseLeave={() => setTimeout(() => setActive(null), 400)}
              onClick={(e) => {
                e.preventDefault();
                setActive(card.id);
                setTimeout(() => {
                  setActive(null);
                  document.querySelector(card.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 340);
              }}
            >
              <div className={`faction-card-top ${card.topClass}`}
                style={{ backgroundImage: `url('${card.img}')` }} />
              <div className="faction-card-body">
                <div className="faction-big-title">{t(`card.${card.id}.title`)}</div>
                <div className="faction-big-sub">{t(`card.${card.id}.sub`)}</div>
                <div className="faction-big-desc">{t(`card.${card.id}.desc`)}</div>
                <div className="faction-go">
                  <span>{t('go')}</span>
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      <div className="fcs-nav">
        <button className="fcs-arrow" onClick={() => goTo((current - 1 + CARDS.length) % CARDS.length, -1)} aria-label="Назад">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 4l-4 4 4 4"/></svg>
        </button>
        <div className="fcs-dots">
          {CARDS.map((_, idx) => (
            <button key={idx} className={`fcs-dot ${idx === current ? 'fcs-dot--active' : ''}`}
              onClick={() => goTo(idx, idx > current ? 1 : -1)} aria-label={`Карточка ${idx + 1}`} />
          ))}
        </div>
        <button className="fcs-arrow" onClick={() => goTo((current + 1) % CARDS.length, 1)} aria-label="Вперёд">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4l4 4-4 4"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────── */
export default function Hero() {
  const { t } = useLang();

  return (
    <section id="hero">
      <div className="hero-bg" style={{ backgroundImage: `url('${HERO_BG}')`, backgroundPosition: 'center 30%' }}>
        <div className="hero-slide-overlay" />
      </div>
      <div className="hero-content">
        <div className="hero-main">
          <h1 dangerouslySetInnerHTML={{ __html: t('hero.h1') }} />

          <div className="hero-factions">
            <FactionCardSlider t={t} />
            <div className="faction-cta-bar">
              <a href="#contacts" className="btn-primary faction-big-cta">
                <span>{t('hero.cta')}</span>
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </a>
            </div>
          </div>

          <p className="hero-desc">{t('hero.desc')}</p>
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
