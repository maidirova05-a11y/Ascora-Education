// Minimal structured logger: one JSON object per line on stdout/stderr, which
// Render, Docker and any log shipper can parse. Never pass secrets or whole
// request bodies; log ids and error messages only.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[process.env.LOG_LEVEL] || LEVELS.info;

function write(level, msg, fields) {
  if (LEVELS[level] < threshold) return;
  const line = JSON.stringify({ time: new Date().toISOString(), level, msg, ...fields });
  (level === 'error' || level === 'warn' ? process.stderr : process.stdout).write(line + '\n');
}

/** Error -> loggable fields (stack only outside production output noise). */
const errFields = (err) => ({ err: err && err.message ? err.message : String(err), stack: err && err.stack });

module.exports = {
  debug: (msg, f) => write('debug', msg, f),
  info: (msg, f) => write('info', msg, f),
  warn: (msg, f) => write('warn', msg, f),
  error: (msg, f) => write('error', msg, f),
  errFields,
};
