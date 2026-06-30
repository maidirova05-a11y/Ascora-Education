const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const requireAuth = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const { rows } = await db.query('SELECT * FROM admin_users WHERE username=$1', [username]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/inquiries', requireAuth, async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
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

router.patch('/inquiries/:id', requireAuth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['new', 'contacted', 'enrolled', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await db.query('UPDATE inquiries SET status=$1 WHERE id=$2', [status, req.params.id]);
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
