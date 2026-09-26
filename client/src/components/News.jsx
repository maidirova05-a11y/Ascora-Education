import { useLang } from '../context/LangContext';
import { unsplash } from '../utils/img';

// Dated announcements (2025 camp enrolment, the May 2025 open day) were
// removed once they expired; only lasting news stays here, without a date.
const NEWS = [
  {
    key: '2', tagKey: 'news.tag.achievement',
    img: 'photo-1606761568499-6d2451b23c66',
  },
  {
    key: '3', tagKey: 'news.tag.edu',
    img: 'photo-1580537659466-0a9bfa916a54',
  },
];

export default function News() {
  const { t } = useLang();

  return (
    <section id="news">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 0 }}>
          <div>
            <div className="section-label">{t('news.label')}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t('news.h2') }} />
          </div>
          <a href="https://www.instagram.com/ascora.education" target="_blank" rel="noopener" className="btn-primary">
            {t('news.instagram')}
          </a>
        </div>

        <div className="news-grid">
          {NEWS.map((item) => (
            <div key={item.key} className="news-card" style={{ overflow: 'hidden', padding: 0 }}>
              <img className="news-card-img" src={unsplash(item.img, 800)} srcSet={unsplash.srcSet(item.img, [480, 800, 1200])}
                sizes="(max-width: 700px) 100vw, 560px" alt="" loading="lazy" decoding="async" style={{ width: '100%', objectFit: 'cover' }} />
              <div style={{ padding: '20px 22px' }}>
                <span className="news-tag">{t(item.tagKey)}</span>
                <h3>{t(`news.${item.key}.h`)}</h3>
                <p>{t(`news.${item.key}.p`)}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <a href="https://www.instagram.com/ascora.education" target="_blank" rel="noopener"
            className="btn-outline" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
            <span>{t('news.more')}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
