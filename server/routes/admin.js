const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const requireAuth = require('../middleware/auth');
const { updateInquiryStatus } = require('../sheets');
const { STATUSES } = require('../inquiry');

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

// Everything under /inquiries needs a valid token, and the check runs before
// anything else there — before the :id validation below, so an anonymous
// request gets 401 rather than learning which ids are well-formed (400).
router.use('/inquiries', requireAuth);

const MAX_LIMIT = 200;
const MAX_OFFSET = 1000000;

/**
 * GET /api/admin/inquiries?status=&limit=&offset=   (or ?page= instead of offset)
 *
 * Newest first. `limit` is clamped to 1..200, `offset` to 0..1e6; `page`
 * (1-based) is kept for the existing admin UI and converted to an offset when
 * `offset` is not given. Returns the window plus the matching total, and echoes
 * the effective limit/offset so a client can page without recomputing them,
 * and `counts`: {new, contacted, enrolled, cancelled, spam} over all inquiries.
 */
router.get('/inquiries', async (req, res) => {
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  const limit = Math.max(1, Math.min(MAX_LIMIT, parseInt(req.query.limit, 10) || 50));
  let offset;
  if (req.query.offset !== undefined) {
    offset = Math.max(0, Math.min(MAX_OFFSET, parseInt(req.query.offset, 10) || 0));
  } else {
    const page = Math.max(1, Math.min(10000, parseInt(req.query.page, 10) || 1));
    offset = (page - 1) * limit;
  }
  try {
    const selectWhere = status ? 'WHERE status=$3' : '';
    const selectParams = status ? [limit, offset, status] : [limit, offset];

    const [{ rows }, { rows: grouped }] = await Promise.all([
      db.query(
        `SELECT * FROM inquiries ${selectWhere} ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2`,
        selectParams
      ),
      // Per-status totals over the whole table, whatever the filter: the admin
      // stat cards show these, not counts of the page that happens to be loaded.
      db.query('SELECT status, COUNT(*)::int AS n FROM inquiries GROUP BY status'),
    ]);
    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    let all = 0;
    for (const { status: s, n } of grouped) {
      all += n;
      if (s in counts) counts[s] = n;
    }
    const total = status ? counts[status] : all;
    res.json({ inquiries: rows, total, counts, limit, offset, status });
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

router.patch('/inquiries/:id', async (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const { rowCount } = await db.query('UPDATE inquiries SET status=$1 WHERE id=$2', [status, req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    updateInquiryStatus(req.params.id, status); // fire-and-forget, logs its own errors
    res.json({ ok: true, id: Number(req.params.id), status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/inquiries/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM inquiries WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
