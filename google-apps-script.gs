/**
 * Camerata season-2026 registration backend (Google Apps Script web app).
 *
 * IMPORTANT: the live endpoint runs whatever is DEPLOYED in the Apps Script
 * editor — not this repo file. After editing here you must:
 *   1. Paste this code into the script bound to the sheet.
 *   2. Deploy → Manage deployments → edit the active deployment → redeploy
 *      (keeps the same /exec URL used in script.js).
 *   3. Add a header for column H (e.g. "מסלול") in the sheet.
 *
 * Sheet columns written per submission (row order):
 *   A date/time | B full name | C phone (text) | D email | E type (יחיד/זוגי)
 *   F concerts ("1, 2, 3…", bonus = "בונוס") | G city | H track (5/6/8)
 * Duplicate registrations are blocked by email (column D).
 */
const SECRET_KEY = 'CaMeRaTa@JeRuSaLeM#2026';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (payload.secretKey !== SECRET_KEY) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const spreadsheetId = '1gOzBaAb72XFHHlod2ckRWo8YII33Q9dOMwtiTa6U7tY';
    const sheetName = 'Sheet1';
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

    // Format date simply
    const submittedDate = payload.submittedAt ? new Date(payload.submittedAt) : new Date();
    const formattedDate = Utilities.formatDate(submittedDate, 'Asia/Jerusalem', 'dd/MM/yyyy HH:mm');

    // Map subscription type to Hebrew
    const subscriptionMap = { single: 'יחיד', couple: 'זוגי' };
    const subscriptionLabel = subscriptionMap[payload.subscriptionType] || payload.subscriptionType;

    // Extract concert numbers: "1, 2, 3"; the bonus concert records as "בונוס"
    const concertList = Array.isArray(payload.selectedConcerts) ? payload.selectedConcerts : [];
    const concerts = concertList
      .map(c => {
        if (c.indexOf('בונוס') !== -1) return 'בונוס';
        const m = c.match(/\d+/); return m ? m[0] : c;
      })
      .join(', ');

    // Check if email already submitted — read column D directly
    const incomingEmail = payload.email.toLowerCase().trim();
    const lastRow = sheet.getLastRow();
    if (lastRow > 0) {
      const existingEmails = sheet.getRange(1, 4, lastRow, 1).getValues().flat();
      const emailAlreadyExists = existingEmails.some(e => e && e.toString().toLowerCase().trim() === incomingEmail);
      if (emailAlreadyExists) {
        return ContentService
          .createTextOutput(JSON.stringify({ status: 'duplicate', message: 'כתובת האימייל כבר קיימת במערכת. לא ניתן להירשם פעמיים.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Subscription track: 5 / 6 / 8 tickets (column H)
    const trackMap = { '5': '5 · ת״א בלבד', '6': '6', '8': '8' };
    const trackLabel = trackMap[payload.subscriptionTrack] || payload.subscriptionTrack || '';

    const nextRow = sheet.getLastRow() + 1;

    // Write all fields except phone (column C is filled separately below)
    sheet.getRange(nextRow, 1, 1, 8).setValues([[
      formattedDate,
      payload.fullName || '',
      '',
      payload.email || '',
      subscriptionLabel,
      concerts,
      payload.city || '',
      trackLabel,
    ]]);

    // Write phone separately as text to preserve leading zero
    const phoneCell = sheet.getRange(nextRow, 3);
    phoneCell.setNumberFormat('@');
    phoneCell.setValue(payload.phone || '');

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
