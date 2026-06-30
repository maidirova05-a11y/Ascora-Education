import { useState } from 'react';
import { useLang } from '../context/LangContext';

export default function Hero() {
  const { t } = useLang();
  const [activeCard, setActiveCard] = useState(null);

  const cards = [
    {
      id: 'edu', href: '#education', colorClass: 'fbc-navy',
      topClass: 'faction-top-navy',
      img: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=500&q=72&fit=crop&auto=format',
      icon: <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    },
    {
      id: 'camps', href: '#camps', colorClass: 'fbc-gold',
      topClass: 'faction-top-gold',
      img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=72&fit=crop&auto=format',
      icon: <svg viewBox="0 0 24 24"><path d="M3 17l4-8 4 5 3-3 4 6H3z"/><path d="M12 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" stroke="none"/></svg>
    },
  ];

  return (
    <section id="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <div className="hero-main">
          <h1 dangerouslySetInnerHTML={{ __html: t('hero.h1') }} />

          <div className="hero-factions">
            <div className="faction-big-grid">
              {cards.map((card) => (
                <a
                  key={card.id}
                  href={card.href}
                  className={`faction-big-card ${card.colorClass} ${activeCard === card.id ? 'is-active' : ''}`}
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
                  />
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
              ))}
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
