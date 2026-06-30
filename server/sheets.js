const { google } = require('googleapis');

const SHEET_ID = '1hLsIK8NPMZ_Gh5eXnxjAVXpWpn8-Ysck1GDhl8FO4Y4';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function initSheet() {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'A1' });
    if (!res.data.values) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'A1:J1',
        valueInputOption: 'RAW',
        resource: { values: [['#', 'Дата', 'Имя', 'Телефон', 'Email', 'Программа', 'Цена', 'Язык', 'Сообщение', 'Статус']] },
      });
    }
  } catch (err) {
    console.error('Sheets init error:', err.message);
  }
}

async function appendInquiry(inq) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'A:J',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          inq.id,
          new Date(inq.created_at).toLocaleString('ru-RU'),
          inq.name,
          inq.phone,
          inq.email || '',
          inq.camp_name || '',
          inq.camp_price ? `$${inq.camp_price}` : '',
          (inq.lang || 'ru').toUpperCase(),
          inq.message || '',
          'Новая',
        ]],
      },
    });
  } catch (err) {
    console.error('Sheets append error:', err.message);
  }
}

module.exports = { appendInquiry, initSheet };
