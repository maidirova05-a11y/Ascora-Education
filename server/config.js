// Single place that reads and validates process.env. Everything else imports
// from here, so a bad deploy fails at boot with one clear message instead of
// at the first request that happens to touch the variable.
require('dotenv').config();

const env = process.env;
const errors = [];

function required(name) {
  const v = env[name];
  if (!v) errors.push(`${name} is not set`);
  return v || '';
}

function int(name, def, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (env[name] === undefined || env[name] === '') return def;
  const n = Number(env[name]);
  if (!Number.isInteger(n) || n < min || n > max) {
    errors.push(`${name} must be an integer between ${min} and ${max}`);
    return def;
  }
  return n;
}

const config = {
  nodeEnv: env.NODE_ENV || 'development',
  isProd: env.NODE_ENV === 'production',
  port: int('PORT', 4000, { min: 1, max: 65535 }),
  databaseUrl: required('DATABASE_URL'),
  dbSslVerify: env.DB_SSL_VERIFY === '1',
  dbPoolMax: int('DB_POOL_MAX', 10, { min: 1, max: 100 }),
  jwtSecret: required('JWT_SECRET'),
  // Requests arrive via Vercel then Forge's nginx (2 hops) by default.
  trustProxy: int('TRUST_PROXY', 2, { min: 0, max: 10 }),
  clientUrl: env.CLIENT_URL || '',
  // Google Sheets / Bitrix24 are optional integrations: unset = skipped.
  sheetId: env.GOOGLE_SHEET_ID || '1hLsIK8NPMZ_Gh5eXnxjAVXpWpn8-Ysck1GDhl8FO4Y4',
  logLevel: env.LOG_LEVEL || 'info',
};

config.errors = errors;
config.assertValid = () => {
  if (errors.length) {
    // Logger is not used here on purpose: it depends on this module.
    console.error(JSON.stringify({ level: 'fatal', msg: 'invalid configuration', errors }));
    process.exit(1);
  }
};

module.exports = config;
