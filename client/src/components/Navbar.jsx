import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <nav className={scrolled ? 'scrolled' : ''}>
        <a href="/#hero" className="nav-logo">
          <img src="/logo-small.png" alt="ASCORA Education" className="nav-logo-img" width="168" height="70" />
        </a>
        <ul className="nav-links">
          <li><a href="/#about">{t('nav.about')}</a></li>
          <li><a href="/#education">{t('nav.edu')}</a></li>
          <li><a href="/#camps">{t('nav.camps')}</a></li>
          <li><a href="/#news">{t('nav.news')}</a></li>
          <li><a href="/#contacts">{t('nav.contacts')}</a></li>
          <li><a href="/#contacts" className="nav-cta">{t('nav.cta')}</a></li>
        </ul>
        <div className="lang-sw">
          {['ru', 'kz', 'en'].map((l) => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Burger — toggles open/close */}
        <button
          className={`burger ${open ? 'burger--open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label="Меню"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Backdrop — click outside to close */}
      {open && <div className="mobile-backdrop" onClick={close} aria-hidden="true" />}

      <div className={`mobile-menu ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Меню навигации">
        {/* Header row */}
        <div className="mm-header">
          <a href="/#hero" className="mm-logo" onClick={close}>
            <img src="/logo-small.png" alt="ASCORA" height="36" />
          </a>
          <button className="mm-close" onClick={close} aria-label="Закрыть">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className="mm-nav" role="navigation">
          <a href="/#about"     className="mm-link" onClick={close}>{t('nav.about')}</a>
          <a href="/#education" className="mm-link" onClick={close}>{t('nav.edu')}</a>
          <a href="/#camps"     className="mm-link" onClick={close}>{t('nav.camps')}</a>
          <a href="/#news"      className="mm-link" onClick={close}>{t('nav.news')}</a>
          <a href="/#contacts"  className="mm-link" onClick={close}>{t('nav.contacts')}</a>
        </div>

        {/* Footer row */}
        <div className="mm-footer">
          <a href="/#contacts" className="mm-cta" onClick={close}>
            {t('nav.mob.cta')}
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </a>
          <div className="mm-langs">
            {['ru', 'kz', 'en'].map((l) => (
              <button
                key={l}
                className={`mm-lang-btn ${lang === l ? 'active' : ''}`}
                onClick={() => { setLang(l); }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
