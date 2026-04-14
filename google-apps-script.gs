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

    // Extract only concert numbers: "1, 2, 3"
    const concertList = Array.isArray(payload.selectedConcerts) ? payload.selectedConcerts : [];
    const concerts = concertList
      .map(c => { const m = c.match(/\d+/); return m ? m[0] : c; })
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

    const nextRow = sheet.getLastRow() + 1;

    // Write all fields except phone
    sheet.getRange(nextRow, 1, 1, 6).setValues([[
      formattedDate,
      payload.fullName || '',
      '',
      payload.email || '',
      subscriptionLabel,
      concerts,
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
