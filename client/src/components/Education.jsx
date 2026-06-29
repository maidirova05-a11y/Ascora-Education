import { useLang } from '../context/LangContext';

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--gold)" strokeWidth="1.5">
    <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
    <circle cx="12" cy="11" r="3"/>
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="var(--gold)">
    <polygon points="10,1 12.9,7 20,7.6 14.5,12.5 16.5,19.5 10,15.5 3.5,19.5 5.5,12.5 0,7.6 7.1,7"/>
  </svg>
);

const DEST_BIG = [
  { name: 'Великобритания', unis: 'Oxford · Cambridge · UCL · LSE · Imperial · King\'s', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80&fit=crop&auto=format', large: true },
  { name: 'США', unis: 'MIT · NYU · Columbia · UCLA', img: 'https://images.unsplash.com/photo-1543716091-a840c05249ec?w=800&q=80&fit=crop&auto=format' },
  { name: 'Германия', unis: 'TU Munich · LMU · Heidelberg', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80&fit=crop&auto=format' },
  { name: 'Канада', unis: 'UofT · UBC · McGill · Waterloo', img: 'https://images.unsplash.com/photo-1559734840-f9509ee5677f?w=800&q=80&fit=crop&auto=format' },
  { name: 'ОАЭ', unis: 'AUS · Sorbonne AD · NYUAD', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80&fit=crop&auto=format' },
];
const DEST_SM = [
  { name: 'Нидерланды', count: '12+ вузов' },
  { name: 'Австралия', count: '8+ вузов' },
  { name: 'Франция', count: 'Sciences Po · ESSEC' },
  { name: 'Сингапур', count: 'NUS · NTU' },
];

const SERVICES = [
  { num: '01', titleKey: 'svc.1', descKey: 'svc.1.p', img: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=700&q=80&fit=crop&auto=format', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg> },
  { num: '02', titleKey: 'svc.2', descKey: 'svc.2.p', img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=700&q=80&fit=crop&auto=format', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
  { num: '03', titleKey: 'svc.3', descKey: 'svc.3.p', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=700&q=80&fit=crop&auto=format', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { num: '04', titleKey: 'svc.4', descKey: 'svc.4.p', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=80&fit=crop&auto=format', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
  { num: '05', titleKey: 'svc.5', descKey: 'svc.5.p', img: 'https://images.unsplash.com/photo-1623461487986-9400110de28e?w=700&q=80&fit=crop&auto=format', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg> },
  { num: '06', titleKey: 'svc.6', descKey: 'svc.6.p', img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&q=80&fit=crop&auto=format', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
];

const STEPS = ['proc.1','proc.2','proc.3','proc.4'];

const PARTNERS = [
  { name: 'University of London', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80&fit=crop&auto=format' },
  { name: 'TU Munich', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80&fit=crop&auto=format' },
  { name: 'University of Toronto', img: 'https://images.unsplash.com/photo-1559734840-f9509ee5677f?w=600&q=80&fit=crop&auto=format' },
  { name: 'AUS Dubai', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80&fit=crop&auto=format' },
  { name: 'Sciences Po Paris', img: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=600&q=80&fit=crop&auto=format' },
  { name: 'Erasmus University', img: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80&fit=crop&auto=format' },
  { name: "King's College London", img: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=600&q=80&fit=crop&auto=format' },
  { name: 'UBC Vancouver', img: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600&q=80&fit=crop&auto=format' },
  { name: 'University of Amsterdam', img: 'https://images.unsplash.com/photo-1459679749680-18eb1eb37418?w=600&q=80&fit=crop&auto=format' },
  { name: 'University of Edinburgh', img: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=600&q=80&fit=crop&auto=format' },
  { name: 'NYU New York', img: 'https://images.unsplash.com/photo-1543716091-a840c05249ec?w=600&q=80&fit=crop&auto=format' },
  { name: 'Waseda University', img: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=600&q=80&fit=crop&auto=format' },
];

const REVIEWS = [
  { textKey: 'rev.1', av: 'АС', avStyle: { background: '#E8D08A', color: '#5C3D00' }, name: 'Айдана Сарсенова', meta: 'Алматы → Лондон', uni: 'UCL · MSc Finance', feat: false },
  { textKey: 'rev.2', av: 'БТ', avStyle: { background: 'rgba(201,168,76,0.2)', color: 'var(--gold)' }, name: 'Бауыржан Токтаров', meta: 'Астана → Эдинбург', uni: 'University of Edinburgh · Chevening Scholar', feat: true },
  { textKey: 'rev.3', av: 'МА', avStyle: { background: '#F5EDD4', color: '#5C3D00' }, name: 'Малика Асанова', meta: 'Шымкент → Амстердам', uni: 'University of Amsterdam · BSc Business', feat: false },
];

export default function Education() {
  const { t } = useLang();

  return (
    <section id="education">
      <div className="container">
        <div className="section-label">{t('nav.edu')}</div>
        <h2 dangerouslySetInnerHTML={{ __html: t('edu.h2') }} />
        <p className="section-desc">{t('edu.desc')}</p>

        {/* Destinations */}
        <div className="dest-header" style={{ marginTop: 52 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 300 }}>{t('edu.dest.h')}</h3>
          <a href="#contacts" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <span>{t('edu.more')}</span>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </a>
        </div>
        <div className="dest-grid">
          {DEST_BIG.map((d) => (
            <div key={d.name} className={`dest-card ${d.large ? 'large' : ''}`}>
              <div className="dest-img" style={{ backgroundImage: `url('${d.img}')` }} />
              <div className="dest-overlay" />
              <div className="dest-info">
                <span className="dest-flag"><GlobeIcon /></span>
                <div className="dest-name">{d.name}</div>
                <div className="dest-count">{d.unis}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="dest-small-grid" style={{ marginTop: 16 }}>
          {DEST_SM.map((d) => (
            <div key={d.name} className="dest-sm fade-up">
              <div className="dest-sm-flag"><PinIcon /></div>
              <div>
                <div className="dest-sm-name">{d.name}</div>
                <div className="dest-sm-count">{d.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Services dark block */}
        <div style={{ background: 'var(--navy)', borderRadius: 20, padding: '60px 48px', marginTop: 72 }}>
          <div className="section-label">{t('edu.svc.label')}</div>
          <h2 style={{ color: 'var(--white)', marginBottom: 44 }}>{t('edu.svc.h2')}</h2>
          <div className="services-grid">
            {SERVICES.map((s) => (
              <div key={s.num} className="service-card">
                <div className="svc-img" style={{ backgroundImage: `url('${s.img}')` }}>
                  <span className="svc-num-badge">{s.num}</span>
                  <div className="svc-icon">{s.icon}</div>
                </div>
                <div className="svc-body">
                  <h3>{t(s.titleKey)}</h3>
                  <p>{t(s.descKey)}</p>
                  <a href="#contacts" className="svc-link">{t('svc.start')}</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>{t('process.label')}</div>
          <h2 dangerouslySetInnerHTML={{ __html: t('process.h2') }} />
        </div>
        <div className="process-steps">
          {STEPS.map((key, i) => (
            <div key={key} className="proc-step fade-up">
              <div className="step-circle"><div className="step-num">0{i + 1}</div></div>
              <h3>{t(`${key}.h`)}</h3>
              <p>{t(`${key}.p`)}</p>
            </div>
          ))}
        </div>

        {/* Results */}
        <div style={{ marginTop: 80 }}>
          <div className="section-label">{t('results.label')}</div>
          <div className="results-grid">
            <div>
              <h2 dangerouslySetInnerHTML={{ __html: t('results.h2') }} />
              <p className="section-desc">{t('results.desc')}</p>
              <a href="#contacts" className="btn-primary" style={{ marginTop: 28, display: 'inline-flex' }}>
                <span>{t('results.cta')}</span>
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </a>
            </div>
            <div className="stats-4">
              {[
                { num: '300', sup: '+', key: 'rs.1' },
                { num: '95', sup: '%', key: 'rs.2' },
                { num: '$2', sup: 'M+', key: 'rs.3' },
                { num: '40', sup: '+', key: 'rs.4' },
              ].map((s) => (
                <div key={s.key} className="stat-card fade-up">
                  <div className="stat-num">{s.num}<span>{s.sup}</span></div>
                  <div className="stat-label">{t(s.key)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="reviews-grid">
            {REVIEWS.map((r) => (
              <div key={r.name} className={`review-card fade-up ${r.feat ? 'feat' : ''}`}>
                <div className="stars">{[1,2,3,4,5].map((i) => <StarIcon key={i} />)}</div>
                <div className="review-text">{t(r.textKey)}</div>
                <div className="reviewer">
                  <div className="rev-av" style={r.avStyle}>{r.av}</div>
                  <div>
                    <div className="rev-name">{r.name}</div>
                    <div className="rev-meta">{r.meta}</div>
                    <div className="rev-uni">{r.uni}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>{t('partners.label')}</div>
          <h2 dangerouslySetInnerHTML={{ __html: t('partners.h2') }} />
        </div>
        <div className="partners-logos">
          {PARTNERS.map((p) => (
            <div key={p.name} className="partner-logo">
              <div className="partner-logo-bg" style={{ backgroundImage: `url('${p.img}')` }} />
              <div className="partner-logo-overlay" />
              <div className="partner-logo-content">
                <div className="partner-logo-icon" />
                <div className="partner-logo-name">{p.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
