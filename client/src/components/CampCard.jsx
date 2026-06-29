import { useLang } from '../context/LangContext';

export default function CampCard({ camp, onEnroll }) {
  const { lang, t } = useLang();

  return (
    <div className="camp-card" id={`camp-${camp.id}`}>
      <div className="camp-card-inner">
        <div
          className="camp-flag-block"
          style={{
            background: `linear-gradient(rgba(11,25,41,0.82),rgba(11,25,41,0.88)),url('${camp.img}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div>
            <div className="camp-country">{camp.countryLabel[lang]}</div>
            <div className="camp-city">{camp.city[lang]}</div>
          </div>
          <div className="camp-org">{camp.org}</div>
        </div>

        <div className="camp-details">
          <div className="camp-tags">
            {camp.tags[lang].map((tag) => (
              <span key={tag} className="camp-tag tag-type">{tag}</span>
            ))}
            <span className="camp-tag tag-age">
              {camp.ageTag} {lang === 'kz' ? 'жас' : lang === 'en' ? 'y.o.' : 'лет'}
            </span>
            <span className="camp-tag tag-dur">{camp.durTag[lang]}</span>
          </div>

          <div className="camp-includes">
            {camp.includes[lang].map((item, i) => (
              <div key={i} className="camp-include">{item}</div>
            ))}
          </div>
        </div>

        <div className="camp-price-block">
          <div>
            <div className="camp-price-from">{t('camp.price.from')}</div>
            <div className="camp-price-val">{camp.price.toLocaleString()} $</div>
            <div className="camp-dates">
              <div className="camp-dates-title">{t('camp.dates')}</div>
              {camp.dates[lang].split('\n').map((d, i) => (
                <div key={i} className="camp-date">{d}</div>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={() => onEnroll(camp)}>
            {t('camp.enroll')}
          </button>
        </div>
      </div>
    </div>
  );
}
