const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

// Compared against when the username does not exist, so a wrong login and a
// wrong password take the same time and cannot enumerate users.
const DUMMY_HASH = '$2a$12$fvawvR9re/q6qV8PQ3ppQOFYzQ/ZYZa5t9qyvMhqR7g8..Mi7rJYO';
const ISSUER = 'ascora-admin';

/** @returns {Promise<string|null>} a signed token, or null on bad credentials */
async function login(username, password) {
  const { rows } = await db.query('SELECT id, username, password_hash FROM admin_users WHERE username=$1', [username]);
  const user = rows[0];
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) return null;
  return jwt.sign({ id: user.id, username: user.username }, config.jwtSecret, { expiresIn: '8h', algorithm: 'HS256', issuer: ISSUER });
}

function verify(token) {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'], issuer: ISSUER });
}

module.exports = { login, verify };
