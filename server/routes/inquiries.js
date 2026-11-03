const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { asyncHandler, rateLimited } = require('../errors');
const { parseInquiry, createInquiry } = require('../services/inquiries');

// Strict limit on lead creation: enough for a real parent, cuts bot spam into the CRM.
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: rateLimited('Слишком много заявок с этого адреса. Попробуйте позже или позвоните нам.'),
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', inquiryLimiter, asyncHandler(async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  // Honeypot: a hidden field only bots fill. Answer "success", store nothing.
  if (body.website) return res.status(201).json({ ok: true, id: 0 });
  const saved = await createInquiry(parseInquiry(body));
  res.status(201).json({ ok: true, id: saved.id });
}));

module.exports = router;
