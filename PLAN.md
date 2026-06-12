# Camerata Landing Page — Plan

## Goal
A Hebrew RTL landing page for the **Israel Camerata Jerusalem** that presents the
2026–2027 "כלים וקולות" subscription season (the orchestra's 43rd), lets visitors
choose concerts, and writes registrations to Google Sheets.

## Design language (redesigned June 2026, in the spirit of the official flyers)
Dark, cinematic, theatrical — modelled on the orchestra's official season flyers
(`Examples of flayers/`).
- **Palette:** near-black `#0c0b09` + warm gold `#c9a35c` / `#e6c684` + red-velvet accent `#8d1f1f` + cream text. Tokens live in `:root` in `index.html`.
- **Typography:** `Heebo` (900) for the display headline, `Frank Ruhl Libre` for titles, `Assistant` for body. RTL throughout.
- **Atmosphere:** full-bleed hero of the real orchestra (red curtain), spotlight radial glow, faint SVG film-grain overlay, gold hairline borders, staggered fade-up load animations.
- **Concerts:** numbered cards (01–09) with large gold numerals so they're easy to choose; themed photo, composer-gold / work-cream program lines, conductor/soloist, and per-city date chips (ת״א · רחובות · י-ם · זכרון). Selected cards get a gold glow + check badge.
- **Bonus concert "ממעמקים"** is a wide, red-accented, **info-only** card (no checkbox) — shown for information, not part of the choose-6 selection.
- **Imagery:** in `assets/`. Real Camerata photos under `assets/camerata/` (Wikimedia, CC). Per-concert/thematic photos sourced from Unsplash / Openverse (CC). The hero uses `assets/camerata/camerata-wiki.jpg`.

> Future design iterations should use the **frontend-design** skill (plugin) to keep
> quality high and the aesthetic intentional.

## Behaviour
- **8 selectable concerts**, two subscription tracks: **6 of 8** (standard) or **8 of 8** (full). Rule in `script.js` → `ALLOWED_SELECTIONS = [6, 8]` (selection caps at 8; submit requires exactly 6 or 8).
- A **9th "קונצרט בונוס מיוחד" ("ממעמקים")** is shown for information only — no checkbox, not part of the selection.
- **עיר מועדפת** (preferred city) dropdown in the form → sent as `city` and written to **column G** of the sheet (Apps Script already redeployed).
- Required fields: full name, phone, email, **preferred city**, subscription type (single / couple).
- Submits to the Google Apps Script endpoint (secret-key protected, duplicate-email detection, writes a row to Google Sheets).

## Status

### ✅ Completed
- Dark cinematic redesign of `index.html` (hero, intro/how-it-works + venues, 9 numbered concert cards, registration form, footer); fully responsive.
- Real season content for all 9 concerts (titles, programs, conductors/soloists, per-city dates) — Hebrew.
- Image set downloaded into `assets/` (incl. genuine orchestra photos).
- `script.js` selection + validation + Sheets submission intact.
- Pushed to GitHub (`Oizhack/Camerata`).

### 🔲 Remaining / open
- [ ] Replace any thematic/stock photos with official Camerata production photos where available.
- [ ] Real footer links (privacy / terms / contact / archive).
- [ ] Confirm Netlify auto-deploys the new design from GitHub.

## Files
| File | Purpose |
|------|---------|
| `index.html` | Landing page — full dark-theme UI, styles, RTL Hebrew, 9 concerts |
| `script.js` | Concert selection (choose 6), validation, Google Sheets submission |
| `google-apps-script.gs` | Server-side Apps Script — validates, deduplicates, writes to sheet |
| `assets/` | Photography (hero, per-concert, `assets/camerata/` real orchestra photos) |
| `Invitation.txt`, `real_info.txt` | Source material (Hebrew season details) — local only |
| `Examples of flayers/` | Official PDF flyers used as the design reference — local only |
