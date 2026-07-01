import { useState } from 'react';
import { useLang } from '../context/LangContext';

export default function Contacts() {
  const { lang, t } = useLang();
  const [form, setForm] = useState({ name: '', phone: '', email: '', topic: '', message: '' });
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, camp_name: form.topic || null, message: form.message || null, lang }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setForm({ name: '', phone: '', email: '', topic: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  const OPTS = ['form.opt.1','form.opt.2','form.opt.3','form.opt.4','form.opt.5','form.opt.6','form.opt.7','form.opt.8'];

  return (
    <section id="contacts">
      <div className="container">
        <div className="contacts-grid">
          <div className="contacts-info">
            <div className="section-label">{t('nav.contacts')}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t('contact.h2') }} />
            <p>{t('contact.desc')}</p>

            <div className="contact-items">
              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <div>
                  <div className="contact-label">{t('contact.phone.label')}</div>
                  <div className="contact-val"><a href="tel:+77003127912">+7 700 312 79 12</a></div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <div className="contact-label">Email</div>
                  <div className="contact-val"><a href="mailto:info@ascora.edu">info@ascora.edu</a></div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <div className="contact-label">{t('contact.office.label')}</div>
                  <div className="contact-val">{t('contact.office.val')}</div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <div className="contact-label">{t('contact.hours.label')}</div>
                  <div className="contact-val">{t('contact.hours.val')}</div>
                </div>
              </div>
            </div>

            <div className="social-row">
              <a href="https://www.instagram.com/ascora.education" target="_blank" rel="noopener" className="social-btn instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                @ascora.education
              </a>
              <a href="#" className="social-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                YouTube
              </a>
              <a href="#" className="social-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 5H3a1 1 0 00-1 1v12a1 1 0 001 1h18a1 1 0 001-1V6a1 1 0 00-1-1z"/><path d="M22 6l-10 7L2 6"/></svg>
                Telegram
              </a>
            </div>
          </div>

          <div className="contacts-form">
            <div className="form-card">
              <div className="form-title">{t('form.title')}</div>
              <div className="form-subtitle">{t('form.subtitle')}</div>
              {status === 'success' ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                  <div style={{ color: 'var(--gold)', fontFamily: "'Cormorant Garamond',serif", fontSize: 22 }}>{t('modal.title')}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 10 }} dangerouslySetInnerHTML={{ __html: t('modal.text') }} />
                  <button className="modal-btn" style={{ marginTop: 24 }} onClick={() => setStatus(null)}>{t('modal.btn')}</button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <div className="form-group">
                    <label>{t('form.name.label')}</label>
                    <input type="text" placeholder={t('form.name.ph')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>{t('form.phone.label')}</label>
                    <input type="tel" placeholder="+7 777 000 00 00" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="topic-select">{t('form.topic.label')}</label>
                    <select id="topic-select" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                      <option value="">{t('form.topic.choose')}</option>
                      {OPTS.map((k) => <option key={k} value={t(k)}>{t(k)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('form.comment.label')}</label>
                    <textarea placeholder={t('form.comment.ph')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary" disabled={status === 'loading'}>
                    {status === 'loading' ? '...' : t('form.submit')}
                  </button>
                  {status === 'error' && <div style={{ color: '#f87171', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{t('enroll.error')}</div>}
                </form>
              )}
              <div className="form-note">{t('form.note')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
