import { useState } from 'react';
import { useLang } from '../context/LangContext';
import { sendLeadToBitrix } from '../utils/bitrix';

export default function EnrollModal({ camp, onClose }) {
  const { lang, t } = useLang();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  if (!camp) return null;

  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          camp_name: camp.countryLabel[lang] + ' — ' + camp.org,
          camp_price: camp.price,
          lang,
        }),
      });
      if (!res.ok) throw new Error();
      sendLeadToBitrix({ name: form.name, phone: form.phone, email: form.email, topic: camp.countryLabel[lang] + ' — ' + camp.org, message: form.message });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 className="modal-title">{t('enroll.title')}</h3>
        {camp && (
          <div className="modal-camp-info">
            <strong>{camp.countryLabel[lang]}</strong> — {camp.org}
            <span className="modal-camp-price"> · от ${camp.price.toLocaleString()}</span>
          </div>
        )}

        {status === 'success' ? (
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <p>{t('enroll.success')}</p>
            <button className="btn-primary" onClick={onClose}>Закрыть</button>
          </div>
        ) : (
          <form onSubmit={submit} className="enroll-form">
            <div className="form-group">
              <label>{t('enroll.name')} *</label>
              <input name="name" value={form.name} onChange={change} required
                placeholder={t('enroll.name')} />
            </div>
            <div className="form-group">
              <label>{t('enroll.phone')} *</label>
              <input name="phone" type="tel" value={form.phone} onChange={change} required
                placeholder="+7 777 000 00 00" />
            </div>
            <div className="form-group">
              <label>{t('enroll.email')}</label>
              <input name="email" type="email" value={form.email} onChange={change}
                placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>{t('enroll.msg')}</label>
              <textarea name="message" value={form.message} onChange={change} rows={3}
                placeholder="..." />
            </div>
            {status === 'error' && <p className="form-error">{t('enroll.error')}</p>}
            <button type="submit" className="btn-primary btn-full" disabled={status === 'loading'}>
              {status === 'loading' ? '...' : t('enroll.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
