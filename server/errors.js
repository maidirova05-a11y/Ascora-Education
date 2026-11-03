// Uniform error contract: every non-2xx API response is
//   { "error": "<human message>", "code": "<MACHINE_CODE>" }
// `error` is what the existing admin UI already reads; `code` is stable.
const log = require('./logger');

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const badRequest = (message, code = 'BAD_REQUEST') => new ApiError(400, code, message);
const unauthorized = (message = 'Unauthorized') => new ApiError(401, 'UNAUTHORIZED', message);
const notFound = (message = 'Not found') => new ApiError(404, 'NOT_FOUND', message);

/** Wraps an async route so a rejected promise reaches the error handler. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Body for rate limiters (express-rate-limit `message`). */
const rateLimited = (message) => ({ error: message, code: 'RATE_LIMITED' });

/** The database (not the request) is the problem: refused/dropped connection, shutdown, timeout. */
function isDbUnavailable(err) {
  const code = String(err.code || '');
  return ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', '57P01', '57P02', '57P03', '57014'].includes(code)
    || code.startsWith('08') || /Connection terminated|timeout exceeded when trying to connect/i.test(err.message || '');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (res.headersSent) return;
  if (err instanceof ApiError) return res.status(err.status).json({ error: err.message, code: err.code });
  // body-parser errors: malformed / oversized JSON is the client's fault.
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON', code: 'INVALID_JSON' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' });
  if (isDbUnavailable(err)) {
    // 503 (not 500) so clients and monitors treat it as "retry later".
    log.error('database unavailable', { method: req.method, path: req.path, err: err.message });
    return res.status(503).json({ error: 'Сервис временно недоступен. Попробуйте позже.', code: 'DB_DOWN' });
  }
  log.error('unhandled request error', { method: req.method, path: req.path, ...log.errFields(err) });
  res.status(500).json({ error: 'Внутренняя ошибка сервера', code: 'INTERNAL' });
}

module.exports = { ApiError, badRequest, unauthorized, notFound, asyncHandler, rateLimited, errorHandler };
