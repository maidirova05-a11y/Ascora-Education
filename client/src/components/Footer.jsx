import { useLang } from '../context/LangContext';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#hero" className="nav-logo">
              <img src="/logo-small.png" alt="ASCORA Education" className="nav-logo-img" width="168" height="70" />
            </a>
            <p>{t('footer.desc')}</p>
            <div className="footer-socials">
              <a href="https://www.instagram.com/ascora.education" target="_blank" rel="noopener" className="footer-social" title="Instagram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="footer-social" title="Telegram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </a>
              <a href="#" className="footer-social" title="WhatsApp">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
              </a>
              <a href="#" className="footer-social" title="YouTube">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t('footer.nav')}</h4>
            <ul>
              <li><a href="#about">{t('nav.about')}</a></li>
              <li><a href="#education">{t('nav.edu')}</a></li>
              <li><a href="#camps">{t('nav.camps')}</a></li>
              <li><a href="#news">{t('nav.news')}</a></li>
              <li><a href="#contacts">{t('nav.contacts')}</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('footer.camps')}</h4>
            <ul>
              <li><a href="#camps">{t('footer.camp.1')}</a></li>
              <li><a href="#camps">{t('footer.camp.2')}</a></li>
              <li><a href="#camps">{t('footer.camp.3')}</a></li>
              <li><a href="#camps">{t('footer.camp.4')}</a></li>
              <li><a href="#camps">{t('footer.camp.5')}</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('nav.contacts')}</h4>
            <ul>
              <li><a href="tel:+77001234567">+7 700 123 45 67</a></li>
              <li><a href="mailto:info@ascora.edu">info@ascora.edu</a></li>
              <li><a href="https://www.instagram.com/ascora.education" target="_blank" rel="noopener">@ascora.education</a></li>
              <li><a href="#contacts">{t('footer.address')}</a></li>
              <li><a href="#contacts">{t('footer.hours')}</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>{t('footer.copy')}</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#">{t('footer.privacy')}</a>
            <a href="#">{t('footer.offer')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
