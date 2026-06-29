// Запусти этот файл чтобы сменить пароль администратора:
// node change-password.js ВАШ_НОВЫЙ_ПАРОЛЬ

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const newPassword = process.argv[2];
if (!newPassword || newPassword.length < 8) {
  console.error('❌ Укажи пароль минимум 8 символов: node change-password.js МойПароль123');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const hash = await bcrypt.hash(newPassword, 12);

  // Создаём admin если не существует, или обновляем пароль
  await pool.query(`
    INSERT INTO admin_users (username, password_hash)
    VALUES ('admin', $1)
    ON CONFLICT (username) DO UPDATE SET password_hash = $1
  `, [hash]);

  console.log('✅ Пароль администратора успешно изменён!');
  console.log('🔐 Логин: admin');
  console.log('🔐 Пароль: ' + newPassword);
  await pool.end();
})().catch(e => { console.error('❌ Ошибка:', e.message); pool.end(); });
