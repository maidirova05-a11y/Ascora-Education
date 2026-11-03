import { useState } from 'react';
import { useLang } from '../context/LangContext';
import { attributionFields } from '../utils/attribution';
import { postInquiry } from '../utils/api';

const EMPTY_FORM = { name: '', phone: '', email: '', message: '', website: '' };

// `currency` names what `price` is in (the Antalya camp is priced in tenge).
export default function LeadForm({ topic, price, currency = 'KZT', id }) {
  const { lang, t } = useLang();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');
  const [errKey, setErrKey] = useState('enroll.error');

  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      await postInquiry({
        ...form,
        camp_name: topic,
        camp_price: price || null,
        camp_currency: price ? currency : null,
        lang,
        ...attributionFields(),
      });
      setStatus('success');
    } catch (err) {
      setErrKey(err.key || 'enroll.error');
      setStatus('error');
    }
  }

  return (
    <div id={id} className="form-card">
      <div className="form-title">{t('form.title')}</div>
      <div className="form-subtitle">{t('form.subtitle')}</div>
      {status === 'success' ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div className="success-mark"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
          <div style={{ color: 'var(--gold)', fontFamily: "'Cormorant Garamond',serif", fontSize: 22 }}>{t('modal.title')}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 10 }} dangerouslySetInnerHTML={{ __html: t('modal.text') }} />
          <button className="modal-btn" style={{ marginTop: 24 }} onClick={() => { setForm(EMPTY_FORM); setStatus('idle'); }}>
            {t('modal.btn')}
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          {/* Honeypot: невидимое поле-ловушка для ботов */}
          <input type="text" name="website" value={form.website} onChange={change}
            style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, opacity: 0 }}
            tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="form-group">
            <label>{t('form.name.label')}</label>
            <input type="text" placeholder={t('form.name.ph')} value={form.name} onChange={change} name="name" required />
          </div>
          <div className="form-group">
            <label>{t('form.phone.label')}</label>
            <input type="tel" placeholder="+7 777 000 00 00" value={form.phone} onChange={change} name="phone" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="your@email.com" value={form.email} onChange={change} name="email" />
          </div>
          <div className="form-group">
            <label>{t('form.comment.label')}</label>
            <textarea placeholder={t('form.comment.ph')} value={form.message} onChange={change} name="message" />
          </div>
          <button type="submit" className="btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? '...' : t('form.submit')}
          </button>
          {status === 'error' && <div style={{ color: '#f87171', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{t(errKey)}</div>}
        </form>
      )}
      <div className="form-note" dangerouslySetInnerHTML={{ __html: t('form.note') }} />
    </div>
  );
}
