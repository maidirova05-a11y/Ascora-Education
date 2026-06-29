import { useLang } from '../context/LangContext';

const FEATURES = [
  { key: 'f1', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
  { key: 'f2', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
  { key: 'f3', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { key: 'f4', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
];

export default function About() {
  const { t } = useLang();

  return (
    <section id="about">
      <div className="container">
        <div className="section-label">{t('nav.about')}</div>
        <h2 dangerouslySetInnerHTML={{ __html: t('about.h2') }} />
        <div className="about-grid">
          <div className="about-features">
            {FEATURES.map((f) => (
              <div key={f.key} className="about-feature fade-up">
                <div className="feat-icon">{f.icon}</div>
                <div>
                  <h3>{t(`about.${f.key}.h`)}</h3>
                  <p>{t(`about.${f.key}.p`)}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: 'relative', paddingBottom: 40 }}>
            <div className="about-card" style={{
              background: `linear-gradient(rgba(11,25,41,0.91),rgba(11,25,41,0.91)),url('https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=900&q=80&fit=crop&auto=format')`,
              backgroundSize: 'cover', backgroundPosition: 'center top'
            }}>
              <div className="about-quote">{t('about.quote')}</div>
              <div className="about-author">
                <div className="author-av">АС</div>
                <div>
                  <div className="author-name">Айгерим Сейтқали</div>
                  <div className="author-meta">UCL, MSc Finance · London, 2024</div>
                </div>
              </div>
            </div>
            <div className="about-badge">
              <span>95%</span>
              <span>{t('about.badge')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
