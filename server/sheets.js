const { google } = require('googleapis');

const SHEET_ID = '1hLsIK8NPMZ_Gh5eXnxjAVXpWpn8-Ysck1GDhl8FO4Y4';

const rawKey = process.env.GOOGLE_PRIVATE_KEY_B64
  ? Buffer.from(process.env.GOOGLE_PRIVATE_KEY_B64, 'base64').toString('utf8')
  : (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: rawKey,
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
      valueInputOption: 'RAW',
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

async function updateInquiryStatus(id, status) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A:A',
    });
    const rows = res.data.values || [];
    const rowIndex = rows.findIndex(r => String(r[0]) === String(id));
    if (rowIndex === -1) return;
    const statusLabels = { new: 'Новая', contacted: 'Связались', enrolled: 'Записан', cancelled: 'Отменена' };
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `J${rowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: { values: [[statusLabels[status] || status]] },
    });
  } catch (err) {
    console.error('Sheets updateStatus error:', err.message);
  }
}

module.exports = { appendInquiry, initSheet, updateInquiryStatus };
