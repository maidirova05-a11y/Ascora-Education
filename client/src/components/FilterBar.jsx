import { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LangContext';
import { campsData } from '../data/camps';

const COUNTRIES = [
  ['all',        { ru: 'Все страны',      kz: 'Барлық елдер',   en: 'All countries' }],
  ['bulgaria',   { ru: 'Болгария',        kz: 'Болгария',       en: 'Bulgaria' }],
  ['spain',      { ru: 'Испания',         kz: 'Испания',        en: 'Spain' }],
  ['france',     { ru: 'Франция',         kz: 'Франция',        en: 'France' }],
  ['england',    { ru: 'Англия',          kz: 'Англия',         en: 'England' }],
  ['malaysia',   { ru: 'Малайзия',        kz: 'Малайзия',       en: 'Malaysia' }],
  ['nordic',     { ru: 'Скандинавия',     kz: 'Скандинавия',    en: 'Scandinavia' }],
  ['turkey',     { ru: 'Турция',          kz: 'Түркия',         en: 'Turkey' }],
  ['azerbaijan', { ru: 'Азербайджан',     kz: 'Әзербайжан',     en: 'Azerbaijan' }],
  ['multi',      { ru: 'Несколько стран', kz: 'Бірнеше ел',     en: 'Multi-country' }],
];

const PROGRAMS = [
  ['all',        { ru: 'Все программы',   kz: 'Барлық бағдарлама', en: 'All programs' }],
  ['camp',       { ru: 'Языковой лагерь', kz: 'Тілдік лагерь',    en: 'Language Camp' }],
  ['university', { ru: 'Университет',     kz: 'Университет',       en: 'University' }],
];

const BUDGETS = [
  ['all',       { ru: 'Любой бюджет',  kz: 'Кез келген бюджет', en: 'Any budget' }],
  ['0-1500',    { ru: 'До $1 500',     kz: '$1 500 дейін',       en: 'Up to $1,500' }],
  ['1500-2500', { ru: '$1 500 – $2 500', kz: '$1 500 – $2 500',  en: '$1,500 – $2,500' }],
  ['2500-4000', { ru: '$2 500 – $4 000', kz: '$2 500 – $4 000',  en: '$2,500 – $4,000' }],
  ['4000+',     { ru: 'Свыше $4 000',  kz: '$4 000 жоғары',      en: 'Above $4,000' }],
];

const DAYS = [
  ['all',   { ru: 'Любая длительность', kz: 'Кез келген ұзақтығы', en: 'Any duration' }],
  ['7',     { ru: '7 дней',       kz: '7 күн',        en: '7 days' }],
  ['14',    { ru: '14 дней',      kz: '14 күн',       en: '14 days' }],
  ['21',    { ru: '21 день',      kz: '21 күн',       en: '21 days' }],
  ['28',    { ru: '28+ дней',     kz: '28+ күн',      en: '28+ days' }],
];

const campImgMap = {
  bulgaria:   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80&fit=crop&auto=format',
  spain:      'https://images.unsplash.com/photo-1579282240050-352db0a14c21?w=400&q=80&fit=crop&auto=format',
  england:    'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400&q=80&fit=crop&auto=format',
  multi:      'https://images.unsplash.com/photo-1676238753440-53f7a0fb4391?w=400&q=80&fit=crop&auto=format',
  malaysia:   'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80&fit=crop&auto=format',
  nordic:     'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&q=80&fit=crop&auto=format',
  turkey:     'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=80&fit=crop&auto=format',
  azerbaijan: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=400&q=80&fit=crop&auto=format',
  france:     'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=400&q=80&fit=crop&auto=format',
};

export default function FilterBar({ onFilter }) {
  const { lang } = useLang();
  const [country, setCountry] = useState('all');
  const [program, setProgram] = useState('all');
  const [budget,  setBudget]  = useState('all');
  const [days,    setDays]    = useState('all');
  const [open,    setOpen]    = useState(null);
  const [results, setResults] = useState(null);
  const barRef = useRef(null);

  useEffect(() => {
    function onOut(e) {
      if (barRef.current && !barRef.current.contains(e.target)) setOpen(null);
    }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, []);

  function toggle(name) { setOpen(p => p === name ? null : name); }

  function apply() {
    setOpen(null);
    const filtered = campsData.filter((c) => {
      if (country !== 'all' && c.country !== country) return false;
      if (program !== 'all' && c.type !== program) return false;
      if (budget !== 'all') {
        const [min, max] = budget === '4000+' ? [4000, 99999] : budget.split('-').map(Number);
        if (c.price < min || c.price > max) return false;
      }
      return true;
    });
    setResults(filtered);
    onFilter({ country, budget, age: 'all' });
    setTimeout(() => {
      document.getElementById('fb-results')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  function getDisplay(options, value) {
    const found = options.find(([v]) => v === value);
    return found ? found[1][lang] || found[1].ru : '';
  }

  function Field({ name, label, value, options, onChange }) {
    const isDefault = value === 'all';
    const display = isDefault ? label : getDisplay(options, value);
    return (
      <div className={`fb-field ${open === name ? 'fb-field--open' : ''}`}
        onClick={() => toggle(name)}>
        <div className="fb-field-label">{label}</div>
        <div className="fb-field-row">
          <span className={`fb-field-val${isDefault ? ' fb-field-val--ph' : ''}`}>{display}</span>
          <svg className="fb-chev" viewBox="0 0 12 8" fill="none">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="fb-dropdown" onClick={e => e.stopPropagation()}>
          {options.map(([v, lbls]) => (
            <div key={v} className={`fb-opt ${value === v ? 'fb-opt--active' : ''}`}
              onMouseDown={e => { e.preventDefault(); onChange(v); setOpen(null); }}>
              {lbls[lang] || lbls.ru}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const L = (obj) => obj[lang] || obj.ru;

  return (
    <div className="fb-wrap" ref={barRef}>
      <div className="fb-bar">
        <Field
          name="country" value={country} onChange={setCountry}
          label={L({ ru: 'Страна', kz: 'Ел', en: 'Country' })}
          options={COUNTRIES}
        />
        <div className="fb-divider" />
        <Field
          name="program" value={program} onChange={setProgram}
          label={L({ ru: 'Программа', kz: 'Бағдарлама', en: 'Program' })}
          options={PROGRAMS}
        />
        <div className="fb-divider" />
        <Field
          name="budget" value={budget} onChange={setBudget}
          label={L({ ru: 'Бюджет', kz: 'Бюджет', en: 'Budget' })}
          options={BUDGETS}
        />
        <div className="fb-divider" />
        <Field
          name="days" value={days} onChange={setDays}
          label={L({ ru: 'Длительность', kz: 'Ұзақтығы', en: 'Duration' })}
          options={DAYS}
        />
        <button className="fb-btn" onClick={apply}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3" strokeLinecap="round"/>
          </svg>
          <span>{L({ ru: 'Подобрать', kz: 'Іздеу', en: 'Search' })}</span>
        </button>
      </div>

      {results !== null && (
        <div id="fb-results" className="fb-results">
          <div className="fb-results-header">
            <div className="fb-results-title">
              {L({ ru: 'Подходящие программы', kz: 'Сәйкес бағдарламалар', en: 'Matching programs' })}
              <span className="fb-results-count">{results.length}</span>
            </div>
            <button className="fb-results-close" onClick={() => setResults(null)}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14">
                <path d="M2 2l12 12M14 2L2 14"/>
              </svg>
            </button>
          </div>

          {results.length === 0 ? (
            <div className="fb-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <div>{L({ ru: 'Ничего не найдено. Попробуйте изменить параметры.', kz: 'Ешнәрсе табылмады.', en: 'Nothing found.' })}</div>
            </div>
          ) : (
            <div className="fb-cards">
              {results.map(camp => (
                <div key={camp.id} className="fb-card"
                  onClick={() => {
                    setResults(null);
                    setTimeout(() => {
                      const el = document.getElementById(`camp-${camp.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.style.outline = '2px solid #C9A84C';
                        el.style.borderRadius = '20px';
                        setTimeout(() => { el.style.outline = ''; }, 1800);
                      } else {
                        document.getElementById('camps')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 80);
                  }}>
                  <div className="fb-card-img" style={{ backgroundImage: `url('${campImgMap[camp.country] || campImgMap.bulgaria}')` }} />
                  <div className="fb-card-body">
                    <div className="fb-card-country">{camp.countryLabel?.[lang] ?? camp.country}</div>
                    <div className="fb-card-org">{camp.org}</div>
                    <div className="fb-card-price">от ${camp.price.toLocaleString()}</div>
                    <div className="fb-card-age">{camp.ageMin}–{camp.ageMax} {L({ ru: 'лет', kz: 'жас', en: 'y.o.' })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="fb-results-footer">
            <button className="fb-show-all"
              onClick={() => { setResults(null); document.getElementById('camps')?.scrollIntoView({ behavior: 'smooth' }); }}>
              {L({ ru: 'Смотреть все лагеря', kz: 'Барлық лагерьлерді көру', en: 'View all camps' })}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
