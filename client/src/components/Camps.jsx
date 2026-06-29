import { useMemo } from 'react';
import { useLang } from '../context/LangContext';
import CampCard from './CampCard';
import campsData from '../data/camps';

const WHY = [
  { key: 'cw.1', icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { key: 'cw.2', icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> },
  { key: 'cw.3', icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
  { key: 'cw.4', icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><circle cx="19" cy="8" r="3"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg> },
];

export default function Camps({ filter, onEnroll }) {
  const { t } = useLang();

  const visible = useMemo(() => {
    return campsData.filter((camp) => {
      if (filter.country !== 'all' && camp.country !== filter.country) return false;
      if (filter.budget !== 'all') {
        const [min, max] = filter.budget.split('-').map(Number);
        if (camp.price < min || camp.price > max) return false;
      }
      if (filter.age !== 'all') {
        const [amin, amax] = filter.age.split('-').map(Number);
        if (camp.ageMax < amin || camp.ageMin > amax) return false;
      }
      return true;
    });
  }, [filter]);

  return (
    <section id="camps">
      <div className="container">
        <div className="section-label">{t('nav.camps')}</div>
        <h2 dangerouslySetInnerHTML={{ __html: t('camps.h2') }} />

        <div className="camps-hero">
          <div>
            <p className="section-desc">{t('camps.desc')}</p>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 16 }}>{t('camps.desc2')}</p>
            <a href="#contacts" className="btn-primary" style={{ marginTop: 32, display: 'inline-flex' }}>
              <span>{t('camps.cta')}</span>
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </a>
            <div className="camps-stats">
              {[
                { num: '10', sup: '+', key: 'cs.1' },
                { num: '7', sup: '+', key: 'cs.2' },
                { num: '7–18', sup: '', key: 'cs.3' },
              ].map((s) => (
                <div key={s.key} className="camp-stat">
                  <div className="camp-stat-num">{s.num}<em>{s.sup}</em></div>
                  <div className="camp-stat-label">{t(s.key)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="camps-why">
            {WHY.map((w) => (
              <div key={w.key} className="camp-why-card">
                <div className="camp-why-icon">{w.icon}</div>
                <div className="camp-why-title">{t(`${w.key}.h`)}</div>
                <div className="camp-why-text">{t(`${w.key}.p`)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="camps-grid">
          {visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              {t('fr.empty')}
            </div>
          ) : (
            visible.map((camp) => (
              <CampCard key={camp.id} camp={camp} onEnroll={onEnroll} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
