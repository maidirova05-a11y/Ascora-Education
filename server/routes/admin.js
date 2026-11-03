const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const log = require('../logger');
const { badRequest, unauthorized, notFound, asyncHandler } = require('../errors');
const { STATUSES } = require('../inquiry');
const auth = require('../services/auth');
const inquiries = require('../services/inquiries');

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password
      || username.length > 100 || password.length > 200) {
    throw badRequest('Missing credentials', 'VALIDATION');
  }
  const token = await auth.login(username, password);
  if (!token) {
    log.warn('admin login failed', { username: username.slice(0, 50), ip: req.ip });
    throw unauthorized('Invalid credentials');
  }
  res.json({ token });
}));

// Everything under /inquiries needs a valid token, checked before :id
// validation so an anonymous request gets 401, not a hint about id shapes.
router.use('/inquiries', requireAuth);

/**
 * GET /api/admin/inquiries?status=&limit=&offset=   (or ?page= instead of offset)
 * Newest first. limit clamps to 1..200, offset to 0..1e6; `page` (1-based) is
 * converted to an offset when `offset` is absent. Returns the window, the
 * matching total, per-status `counts`, and the effective limit/offset.
 */
router.get('/inquiries', asyncHandler(async (req, res) => {
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  const limit = Math.max(1, Math.min(inquiries.MAX_LIMIT, parseInt(req.query.limit, 10) || 50));
  let offset;
  if (req.query.offset !== undefined) {
    offset = Math.max(0, Math.min(inquiries.MAX_OFFSET, parseInt(req.query.offset, 10) || 0));
  } else {
    const page = Math.max(1, Math.min(10000, parseInt(req.query.page, 10) || 1));
    offset = (page - 1) * limit;
  }
  const result = await inquiries.listInquiries({ status, limit, offset });
  res.json({ ...result, limit, offset, status });
}));

// Only positive integer ids reach the database.
router.param('id', (req, _res, next, id) => {
  if (!/^[1-9]\d{0,9}$/.test(id)) return next(badRequest('Invalid id', 'VALIDATION'));
  // Well-formed but beyond INTEGER: cannot exist, and must not reach Postgres (22003 -> 500).
  if (Number(id) > 2147483647) return next(notFound());
  next();
});

router.patch('/inquiries/:id', asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) throw badRequest('Invalid status', 'VALIDATION');
  if (!(await inquiries.setStatus(req.params.id, status))) throw notFound();
  res.json({ ok: true, id: Number(req.params.id), status });
}));

router.delete('/inquiries/:id', asyncHandler(async (req, res) => {
  if (!(await inquiries.deleteInquiry(req.params.id))) throw notFound();
  log.info('inquiry deleted', { id: Number(req.params.id), by: req.admin.username });
  res.json({ ok: true });
}));

module.exports = router;
