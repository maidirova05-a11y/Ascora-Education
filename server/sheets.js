const { google } = require('googleapis');
const { STATUS_LABELS, formatPrice } = require('./inquiry');

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

/**
 * Column layout. A..J is the original sheet and must not move: the admin's
 * status update writes column J by position, and existing rows have data
 * there. The attribution columns are appended after it (K..R), so a sheet
 * that already has the ten-column header simply gains values further right.
 */
const HEADER = [
  '#', 'Дата', 'Имя', 'Телефон', 'Email', 'Программа', 'Цена', 'Язык', 'Сообщение', 'Статус',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'Referrer', 'Страница входа', 'Страница формы',
];
const LAST_COL = 'R';
const STATUS_COL = 'J';

async function initSheet() {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'A1' });
    if (!res.data.values) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `A1:${LAST_COL}1`,
        valueInputOption: 'RAW',
        resource: { values: [HEADER] },
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
      range: `A:${LAST_COL}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[
          inq.id,
          new Date(inq.created_at).toLocaleString('ru-RU'),
          inq.name,
          inq.phone,
          inq.email || '',
          inq.camp_name || '',
          formatPrice(inq.camp_price, inq.camp_currency),
          (inq.lang || 'ru').toUpperCase(),
          inq.message || '',
          STATUS_LABELS.new,
          inq.utm_source || '',
          inq.utm_medium || '',
          inq.utm_campaign || '',
          inq.utm_content || '',
          inq.utm_term || '',
          inq.referrer || '',
          inq.landing_path || '',
          inq.page || '',
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
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${STATUS_COL}${rowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: { values: [[STATUS_LABELS[status] || status]] },
    });
  } catch (err) {
    console.error('Sheets updateStatus error:', err.message);
  }
}

module.exports = { appendInquiry, initSheet, updateInquiryStatus };
