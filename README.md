# הקאמרטה הירושלמית — דף הרשמה לעונה

דף נחיתה בעברית לקמפיין הרשמת מנויים של הקאמרטה הירושלמית. הדף אוסף פרטים אישיים, סוג מנוי ובחירת קונצרטים, ושולח את הנתונים ישירות ל-Google Sheets.

## קבצים

| קובץ | תיאור |
|------|-------|
| `index.html` | דף הנחיתה המלא — עיצוב, RTL עברית, רספונסיבי |
| `script.js` | לוגיקת טופס, ולידציה ושליחה ל-Google Sheets |
| `google-apps-script.gs` | סקריפט צד שרת — אימות, בדיקת כפילויות, כתיבה לגיליון |
| `Invitation.txt` | טקסט ההזמנה המקורי |

## מה הדף אוסף
- שם מלא, טלפון, אימייל
- סוג מנוי (יחיד / זוגי)
- בחירת בדיוק 6 קונצרטים מתוך 8

## הגדרת Google Sheets

1. צור גיליון Google Sheets חדש עם טאב בשם `Sheet1`
2. פתח `Extensions > Apps Script`
3. הדבק את תוכן `google-apps-script.gs` והחלף:
   - `YOUR_SPREADSHEET_ID` — ה-ID של הגיליון שלך (מה-URL)
   - `SECRET_KEY` — המפתח הסודי שלך
4. פרסם: `Deploy > New deployment`
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. העתק את ה-Web App URL והדבק ב-`script.js` תחת `GOOGLE_SHEETS_ENDPOINT`

## אבטחה
הסקריפט מאמת `secretKey` בכל בקשה — בקשות ללא המפתח הנכון נדחות ולא נכתבות לגיליון.

## פריסה ל-Vercel
1. דחוף את הקוד ל-GitHub
2. ייבא את הריפוזיטורי ב-[vercel.com](https://vercel.com)
3. Vercel יפרסם את `index.html` אוטומטית
4. הוסף דומיין מותאם ב-`Domains` בהגדרות הפרויקט

## טכנולוגיות
- HTML + CSS (vanilla, ללא build step)
- Google Fonts: Frank Ruhl Libre, Cormorant Garamond, Assistant
- Google Apps Script + Google Sheets
