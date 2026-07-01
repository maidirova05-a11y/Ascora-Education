import { useState, useEffect, useRef, useCallback } from 'react';
import { useLang } from '../context/LangContext';

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80&fit=crop&auto=format',
    pos: 'center 30%',
  },
  {
    img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80&fit=crop&auto=format',
    pos: 'center center',
  },
  {
    img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&q=80&fit=crop&auto=format',
    pos: 'center 40%',
  },
  {
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80&fit=crop&auto=format',
    pos: 'center center',
  },
];

const INTERVAL = 5000;

function HeroBgSlider() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const timerRef = useRef(null);

  const next = useCallback(() => setCurrent(i => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent(i => (i - 1 + SLIDES.length) % SLIDES.length), []);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, INTERVAL);
  }, [next]);

  useEffect(() => {
    timerRef.current = setInterval(next, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const goTo = (idx) => { setCurrent(idx); resetTimer(); };

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetTimer(); }
    touchStartX.current = null;
  };

  return (
    <div
      className="hero-slider"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`hero-slide ${idx === current ? 'hero-slide--active' : ''}`}
          style={{ backgroundImage: `url('${slide.img}')`, backgroundPosition: slide.pos }}
        />
      ))}
      <div className="hero-slide-overlay" />
      <div className="hero-slide-dots">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`hero-dot ${idx === current ? 'hero-dot--active' : ''}`}
            onClick={() => goTo(idx)}
            aria-label={`Слайд ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function FactionCardSlider({ t }) {
  const cards = [
    {
      id: 'edu', href: '#education', colorClass: 'fbc-navy',
      topClass: 'faction-top-navy',
      img: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=900&q=80&fit=crop&auto=format',
      icon: <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    },
    {
      id: 'camps', href: '#camps', colorClass: 'fbc-gold',
      topClass: 'faction-top-gold',
      img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80&fit=crop&auto=format',
      icon: <svg viewBox="0 0 24 24"><path d="M3 17l4-8 4 5 3-3 4 6H3z"/><path d="M12 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" stroke="none"/></svg>
    },
  ];

  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [activeCard, setActiveCard] = useState(null);
  const touchStartX = useRef(null);
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    setCurrent(idx);
    setAnimKey(k => k + 1);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(i => (i + 1) % cards.length);
      setAnimKey(k => k + 1);
    }, 4500);
  }, [cards.length]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(i => (i + 1) % cards.length);
      setAnimKey(k => k + 1);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [cards.length]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      goTo(dx < 0
        ? (current + 1) % cards.length
        : (current - 1 + cards.length) % cards.length);
    }
    touchStartX.current = null;
  };

  const card = cards[current];

  return (
    <div
      className="faction-card-slider"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <a
        key={animKey}
        href={card.href}
        className={`faction-big-card ${card.colorClass} faction-slide-anim ${activeCard === card.id ? 'is-active' : ''}`}
        onMouseDown={() => setActiveCard(card.id)}
        onMouseLeave={() => setTimeout(() => setActiveCard(null), 400)}
        onTouchStart={() => setActiveCard(card.id)}
        onTouchEnd={() => setTimeout(() => setActiveCard(null), 400)}
        onClick={(e) => {
          e.preventDefault();
          setActiveCard(card.id);
          setTimeout(() => {
            setActiveCard(null);
            document.querySelector(card.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 340);
        }}
      >
        <div
          className={`faction-card-top ${card.topClass}`}
          style={{ backgroundImage: `url('${card.img}')` }}
        >
          <div className="faction-icon">{card.icon}</div>
        </div>
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

      <div className="faction-slider-nav">
        <button
          className="faction-slider-arrow"
          onClick={() => goTo((current - 1 + cards.length) % cards.length)}
          aria-label="Предыдущий"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10 4l-4 4 4 4"/>
          </svg>
        </button>
        <div className="faction-slider-dots">
          {cards.map((_, idx) => (
            <button
              key={idx}
              className={`faction-slider-dot ${idx === current ? 'faction-slider-dot--active' : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`Карточка ${idx + 1}`}
            />
          ))}
        </div>
        <button
          className="faction-slider-arrow"
          onClick={() => goTo((current + 1) % cards.length)}
          aria-label="Следующий"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 4l4 4-4 4"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useLang();

  return (
    <section id="hero">
      <HeroBgSlider />
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
