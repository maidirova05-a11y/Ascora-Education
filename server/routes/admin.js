const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const requireAuth = require('../middleware/auth');
const { updateInquiryStatus } = require('../sheets');

// Compared against when the username does not exist, so a wrong login and a
// wrong password take the same time and the response cannot enumerate users.
const DUMMY_HASH = '$2a$12$fvawvR9re/q6qV8PQ3ppQOFYzQ/ZYZa5t9qyvMhqR7g8..Mi7rJYO';

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password
      || username.length > 100 || password.length > 200) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  try {
    const { rows } = await db.query('SELECT id, username, password_hash FROM admin_users WHERE username=$1', [username]);
    const user = rows[0];
    const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !ok) {
      console.warn(`Admin login failed for "${username.slice(0, 50)}" from ${req.ip}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '8h', algorithm: 'HS256', issuer: 'ascora-admin' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/inquiries', requireAuth, async (req, res) => {
  const STATUSES = ['new', 'contacted', 'enrolled', 'cancelled'];
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  const page = Math.max(1, Math.min(10000, parseInt(req.query.page, 10) || 1));
  const limit = Math.max(1, Math.min(200, parseInt(req.query.limit, 10) || 50));
  const offset = (page - 1) * limit;
  try {
    const selectWhere = status ? 'WHERE status=$3' : '';
    const selectParams = status ? [limit, offset, status] : [limit, offset];
    const countWhere = status ? 'WHERE status=$1' : '';
    const countParams = status ? [status] : [];

    const { rows } = await db.query(
      `SELECT * FROM inquiries ${selectWhere} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      selectParams
    );
    const { rows: count } = await db.query(
      `SELECT COUNT(*) FROM inquiries ${countWhere}`,
      countParams
    );
    res.json({ inquiries: rows, total: parseInt(count[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Only positive integer ids reach the database.
router.param('id', (req, res, next, id) => {
  if (!/^[1-9]\d{0,9}$/.test(id)) return res.status(400).json({ error: 'Invalid id' });
  next();
});

router.patch('/inquiries/:id', requireAuth, async (req, res) => {
  const { status } = req.body || {};
  const allowed = ['new', 'contacted', 'enrolled', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await db.query('UPDATE inquiries SET status=$1 WHERE id=$2', [status, req.params.id]);
    updateInquiryStatus(req.params.id, status);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/inquiries/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM inquiries WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
