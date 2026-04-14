# Camerata Landing Page — Plan

## Goal
Build and deploy a Hebrew RTL landing page for the Israel Camerata Jerusalem that collects season registrations and writes them to Google Sheets.

## Status

### ✅ Completed
- Full Hebrew RTL landing page (`index.html`) with luxury editorial design
  - Midnight navy + antique gold color scheme
  - Frank Ruhl Libre + Cormorant Garamond typography
  - Fully responsive — desktop, tablet, mobile (iPhone 390px)
  - Animated hero section, concert grid, elegant form
- 8 concert cards with image, description, conductor and soloist per concert
- Client-side form validation (`script.js`):
  - Exactly 6 concerts must be selected
  - Required fields: name, phone, email, subscription type
- Google Sheets integration (`google-apps-script.gs`):
  - Secret key protection (`CaMeRaTa@JeRuSaLeM#2026`)
  - Duplicate email detection
  - Date formatted as `dd/MM/yyyy HH:mm` (Asia/Jerusalem)
  - Subscription type in Hebrew (יחיד / זוגי)
  - Concert numbers only (e.g. `1, 3, 5`)
  - Phone stored as text (leading zero preserved)
- Google Apps Script deployed at `Anyone` access with public URL

### 🔲 Remaining
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Custom domain (`jcamerata.com` or subdomain)

## Files
| File | Purpose |
|------|---------|
| `index.html` | Landing page — full UI, styles, RTL Hebrew |
| `script.js` | Form validation + Google Sheets submission |
| `google-apps-script.gs` | Server-side Apps Script — validates, deduplicates, writes to sheet |
| `Invitation.txt` | Original invitation text (source material) |
