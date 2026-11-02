const { verify } = require('../services/auth');
const { unauthorized } = require('../errors');

function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next(unauthorized());
  try {
    req.admin = verify(header.slice(7));
    next();
  } catch {
    next(unauthorized('Invalid token'));
  }
}

module.exports = requireAuth;
