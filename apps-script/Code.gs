/**
 * Google Apps Script backend for the thesis-defence RSVP page.
 *
 * 1. Create a blank Google Sheet.
 * 2. Replace SPREADSHEET_ID with the ID in its URL.
 * 3. Paste this entire file into Extensions > Apps Script.
 * 4. Deploy as Web app: Execute as "Me"; access "Anyone".
 * 5. Copy the /exec URL into config.js in the GitHub Pages project.
 */

const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Attendees';
const TIMEZONE = 'Europe/Madrid';

function doGet() {
  return jsonOutput({ ok: true, service: 'Thesis defence RSVP endpoint is active.' });
}

function doPost(e) {
  try {
    const data = (e && e.parameter) ? e.parameter : {};
    const name = cleanText_(data.name, 120);
    const email = cleanText_(data.email, 180).toLowerCase();
    const guests = cleanText_(data.guests, 10) || '1';
    const language = cleanText_(data.language, 5) || 'es';
    const source = cleanText_(data.source, 500);
    const userAgent = cleanText_(data.userAgent, 500);
    const honeypot = cleanText_(data.website, 200);

    // Do not reveal bot detection. Return success without writing anything.
    if (honeypot) return jsonOutput({ ok: true });

    if (!name) return jsonOutput({ ok: false, error: 'A name is required.' });
    if (email && !isValidEmail_(email)) return jsonOutput({ ok: false, error: 'Invalid email.' });
    if (SPREADSHEET_ID === 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE') {
      throw new Error('Set SPREADSHEET_ID before deploying the web app.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
      ensureHeader_(sheet);

      sheet.appendRow([
        new Date(),
        name,
        email,
        guests,
        language,
        source,
        userAgent
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonOutput({ ok: true });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return jsonOutput({ ok: false, error: 'Server error.' });
  }
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;

  const headers = [[
    'Registered at',
    'Name',
    'Email (optional)',
    'Number of attendees',
    'Page language',
    'Source URL',
    'User agent'
  ]];
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  sheet.getRange(1, 1, 1, headers[0].length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
  sheet.autoResizeColumns(1, headers[0].length);
}

function cleanText_(value, maxLength) {
  return String(value || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
