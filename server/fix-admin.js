const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({ database: 'ascora_education', host: 'localhost', user: 'postgres', password: 'postgres123' });

async function run() {
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query('UPDATE admin_users SET password_hash=$1 WHERE username=$2', [hash, 'admin']);
  console.log('Password updated. Login: admin / admin123');
  await pool.end();
}
run().catch(e => { console.error(e.message); pool.end(); });
