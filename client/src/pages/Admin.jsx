import { useState, useEffect, useCallback } from 'react';

const STATUS = {
  new:       { label: 'Новая',    color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  contacted: { label: 'Связались', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  enrolled:  { label: 'Записан',  color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  cancelled: { label: 'Отменена', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

function StatCard({ label, value, color }) {
  return (
    <div className="adm-stat">
      <div className="adm-stat-val" style={{ color }}>{value}</div>
      <div className="adm-stat-label">{label}</div>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('ascora_admin_token') || '');
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchInquiries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = '/api/admin/inquiries' + (statusFilter ? `?status=${statusFilter}` : '');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { setToken(''); localStorage.removeItem('ascora_admin_token'); return; }
      const data = await res.json();
      setInquiries(Array.isArray(data.inquiries) ? data.inquiries : []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  async function login(e) {
    e.preventDefault();
    setLoginErr('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      if (!res.ok) { setLoginErr('Неверный логин или пароль'); return; }
      const { token: t } = await res.json();
      localStorage.setItem('ascora_admin_token', t);
      setToken(t);
    } finally {
      setLoginLoading(false);
    }
  }

  async function updateStatus(id, status) {
    await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    fetchInquiries();
  }

  function logout() { setToken(''); localStorage.removeItem('ascora_admin_token'); }

  const counts = Object.fromEntries(Object.keys(STATUS).map(s => [s, inquiries.filter(i => i.status === s).length]));

  /* ── LOGIN ─────────────────────────────────────────────── */
  if (!token) return (
    <div className="adm-login-bg">
      <div className="adm-login-card">
        <div className="adm-login-logo">
          <img src="/logo-small.png" alt="ASCORA" style={{ height: 44 }} />
        </div>
        <div className="adm-login-title">Панель управления</div>
        <div className="adm-login-sub">Войдите в систему</div>
        <form onSubmit={login} className="adm-login-form">
          <div className="adm-field">
            <label>Логин</label>
            <input
              placeholder="admin"
              value={creds.username}
              onChange={e => setCreds({ ...creds, username: e.target.value })}
              autoComplete="username"
            />
          </div>
          <div className="adm-field">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={creds.password}
              onChange={e => setCreds({ ...creds, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          {loginErr && <div className="adm-login-err">{loginErr}</div>}
          <button type="submit" className="adm-login-btn" disabled={loginLoading}>
            {loginLoading ? 'Вход...' : 'Войти →'}
          </button>
        </form>
      </div>
    </div>
  );

  /* ── DASHBOARD ──────────────────────────────────────────── */
  return (
    <div className="adm-layout">

      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <img src="/logo-small.png" alt="ASCORA" style={{ height: 36 }} />
        </div>
        <nav className="adm-nav">
          <div className="adm-nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Заявки
          </div>
        </nav>
        <div className="adm-sidebar-footer">
          <button className="adm-logout" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">

        {/* Top bar */}
        <div className="adm-topbar">
          <div>
            <div className="adm-page-title">Заявки</div>
            <div className="adm-page-sub">Управление входящими обращениями</div>
          </div>
          <button className="adm-refresh" onClick={fetchInquiries}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>
            Обновить
          </button>
        </div>

        {/* Stats */}
        <div className="adm-stats">
          <StatCard label="Всего заявок"  value={total}              color="#C9A84C" />
          <StatCard label="Новые"         value={counts.new}         color="#3b82f6" />
          <StatCard label="Связались"     value={counts.contacted}   color="#f59e0b" />
          <StatCard label="Записаны"      value={counts.enrolled}    color="#10b981" />
          <StatCard label="Отменены"      value={counts.cancelled}   color="#ef4444" />
        </div>

        {/* Filter */}
        <div className="adm-filter-row">
          <div className="adm-filter-label">Фильтр по статусу:</div>
          <div className="adm-filter-pills">
            {[['', 'Все'], ...Object.entries(STATUS).map(([v, { label }]) => [v, label])].map(([val, lbl]) => (
              <button
                key={val}
                className={`adm-pill ${statusFilter === val ? 'active' : ''}`}
                onClick={() => setStatusFilter(val)}
              >{lbl}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="adm-loading">
            <div className="adm-spinner" />
            Загрузка...
          </div>
        ) : (
          <div className="adm-table-wrap">
            {inquiries.length === 0 ? (
              <div className="adm-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <div>Заявок нет</div>
              </div>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Дата</th>
                    <th>Клиент</th>
                    <th>Контакты</th>
                    <th>Программа</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <>
                      <tr key={inq.id} className="adm-row" onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}>
                        <td className="adm-td-id">#{inq.id}</td>
                        <td className="adm-td-date">
                          {new Date(inq.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          <span>{new Date(inq.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="adm-td-name">
                          <div className="adm-avatar">{inq.name?.[0]?.toUpperCase()}</div>
                          <div>
                            <div className="adm-name">{inq.name}</div>
                            <div className="adm-lang">{inq.lang?.toUpperCase()}</div>
                          </div>
                        </td>
                        <td className="adm-td-contacts">
                          <a href={`tel:${inq.phone}`} onClick={e => e.stopPropagation()}>{inq.phone}</a>
                          {inq.email && <span>{inq.email}</span>}
                        </td>
                        <td className="adm-td-camp">{inq.camp_name || '—'}{inq.camp_price ? <span>${inq.camp_price.toLocaleString()}</span> : null}</td>
                        <td className="adm-td-status" onClick={e => e.stopPropagation()}>
                          <select
                            className="adm-status-select"
                            value={inq.status}
                            style={{ color: STATUS[inq.status]?.color, background: STATUS[inq.status]?.bg }}
                            onChange={e => updateStatus(inq.id, e.target.value)}
                          >
                            {Object.entries(STATUS).map(([v, { label }]) => (
                              <option key={v} value={v}>{label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                      {expanded === inq.id && inq.message && (
                        <tr className="adm-expand-row" key={`${inq.id}-expand`}>
                          <td colSpan={6}>
                            <div className="adm-expand">
                              <strong>Сообщение:</strong> {inq.message}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
