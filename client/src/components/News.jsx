import { useLang } from '../context/LangContext';

const NEWS = [
  {
    key: '1', tagKey: 'news.tag.camp',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80&fit=crop&auto=format',
    date: 'Июнь 2025', main: true,
  },
  {
    key: '2', tagKey: 'news.tag.achievement',
    img: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=600&q=80&fit=crop&auto=format',
    date: 'Январь 2025',
  },
  {
    key: '3', tagKey: 'news.tag.edu',
    img: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=600&q=80&fit=crop&auto=format',
    date: 'Март 2025',
  },
  {
    key: '4', tagKey: 'news.tag.event',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80&fit=crop&auto=format',
    date: 'Май 2025',
  },
];

export default function News() {
  const { t } = useLang();
  const main = NEWS[0];
  const side = NEWS.slice(1);

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
              <div className="news-card-img" style={{ backgroundImage: `url('${item.img}')` }} />
              <div style={{ padding: '20px 22px' }}>
                <span className="news-tag">{t(item.tagKey)}</span>
                <h3>{t(`news.${item.key}.h`)}</h3>
                <p>{t(`news.${item.key}.p`)}</p>
                <div className="news-date">{item.date}</div>
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
