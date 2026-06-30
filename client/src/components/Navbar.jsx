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
  }, [open]);

  return (
    <>
      <nav className={scrolled ? 'scrolled' : ''}>
        <a href="#hero" className="nav-logo">
          <img src="/logo-small.png" alt="ASCORA Education" className="nav-logo-img" width="168" height="70" />
        </a>
        <ul className="nav-links">
          <li><a href="#about">{t('nav.about')}</a></li>
          <li><a href="#education">{t('nav.edu')}</a></li>
          <li><a href="#camps">{t('nav.camps')}</a></li>
          <li><a href="#news">{t('nav.news')}</a></li>
          <li><a href="#contacts">{t('nav.contacts')}</a></li>
          <li><a href="#contacts" className="nav-cta">{t('nav.cta')}</a></li>
        </ul>
        <div className="lang-sw">
          {['ru', 'kz', 'en'].map((l) => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="burger" onClick={() => setOpen(true)} aria-label="Меню">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        <button className="mobile-close" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <a href="#about" onClick={() => setOpen(false)}>{t('nav.about')}</a>
        <a href="#education" onClick={() => setOpen(false)}>{t('nav.edu')}</a>
        <a href="#camps" onClick={() => setOpen(false)}>{t('nav.camps')}</a>
        <a href="#news" onClick={() => setOpen(false)}>{t('nav.news')}</a>
        <a href="#contacts" onClick={() => setOpen(false)}>{t('nav.contacts')}</a>
        <a href="#contacts" onClick={() => setOpen(false)} style={{ color: 'var(--gold)' }}>{t('nav.mob.cta')}</a>
      </div>
    </>
  );
}
