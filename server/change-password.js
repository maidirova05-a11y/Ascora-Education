// Запусти этот файл чтобы сменить пароль администратора:
// node change-password.js ВАШ_НОВЫЙ_ПАРОЛЬ

const bcrypt = require('bcryptjs');
const config = require('./config');

const newPassword = process.argv[2];
if (!newPassword || newPassword.length < 12) {
  console.error('❌ Укажи пароль минимум 12 символов: node change-password.js МойПароль123');
  process.exit(1);
}

if (!config.databaseUrl) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}
const pool = require('./db');

(async () => {
  await pool.ensureSchema();
  const hash = await bcrypt.hash(newPassword, 12);

  // Создаём admin если не существует, или обновляем пароль
  await pool.query(`
    INSERT INTO admin_users (username, password_hash)
    VALUES ('admin', $1)
    ON CONFLICT (username) DO UPDATE SET password_hash = $1
  `, [hash]);

  console.log('✅ Пароль администратора успешно изменён!');
  console.log('🔐 Логин: admin');
  await pool.end();
})().catch(async (e) => {
  console.error('❌ Ошибка:', e.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
