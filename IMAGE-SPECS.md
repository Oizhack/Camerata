# Image specs (for replacing photos)

The landing page crops every image to fill a fixed box (`object-fit: cover`,
centered), so the **pixel dimensions / aspect ratio** matter most, and the key
subject must sit in the **center** — edges and especially the bottom get cropped.

## What to deliver

| Image | Where it appears | Display box | **Deliver at (2× for sharp screens)** | Shape |
|---|---|---|---|---|
| **8 concert thumbnails** — `orchestra, cello, soprano, choir, camerata/camerata-recanati-2021, seats-red, violin, guitar` | 2-column concert grid | ~571 × 190 px | **1200 × 400 px** | Wide landscape (~3:1) |
| **Bonus concert** — `sacred.jpg` ("ממעמקים") | Wide "special" row | ~320 wide × 250–400 tall | **800 × 800 px** | Square-ish |
| **Hero / top banner** — `camerata/camerata-wiki.jpg` | Full-width band at top | full width × 300–460 px tall | **2400 × 1000 px** | Cinematic landscape (~2.4:1) |

Files live in `assets/` (and `assets/camerata/`). Keep the same filenames to
swap with zero code changes, or send new names and the HTML `src` values get
updated.

## Universal requirements (all images)
- **Format:** JPEG (or WebP — smaller, same quality).
- **Color profile:** **sRGB** (not Adobe RGB / CMYK — those look washed-out on web).
- **DPI is irrelevant for web** — only the pixel dimensions above matter; no
  300-DPI print files needed.
- **File size:** thumbnails **under ~200 KB** each, hero **under ~500 KB**.
  Export "for web."

## How the app styles images (tell the designer)
1. **Center-crop:** anything near the edges — especially the **bottom ~30%** —
   can be cut off or covered. Keep the main subject centered.
2. **The app darkens & desaturates** images (dark gradient fades the bottom into
   the page; a grayscale/dim filter sits on top until hover/selected). So
   **bright, high-contrast, simple compositions read best**; busy or already-dark
   photos turn to mud. Don't place faces or text in the bottom third.

## One-line brief to paste to the designer
> 8 images at **1200×400 px** (wide landscape), 1 image at **800×800 px**, and 1
> banner at **2400×1000 px**. JPEG or WebP, sRGB color, exported for web
> (thumbnails under 200 KB, banner under 500 KB). Keep the main subject
> centered — images are auto-cropped and darkened, and the bottom third is
> covered by an overlay.

---

# Simple summary for the graphic artist

**Overall look:** dark, cinematic, elegant — warm gold/red theme. Photos are
shown dimmed and slightly desaturated over a black page, so use **dramatic,
stage-lit, warm-toned images** with the **main subject centered**. Concert halls,
musicians, and instruments in performance lighting work best.

**What to deliver:** 10 photos total — see the size table above
(8 concert thumbnails 1200×400, 1 bonus 800×800, 1 top banner 2400×1000).

**What each picture should show:**

| # | File | Concert | Suggested subject |
|---|---|---|---|
| — | `camerata-wiki.jpg` (banner) | Top of page | The full Camerata orchestra performing on stage — wide, dramatic, stage lighting. The signature image. |
| 1 | `orchestra.jpg` | בטהובן ובני דורו | A classical orchestra / conductor leading the ensemble — grand, symphonic feel. |
| 2 | `cello.jpg` | ערב צ׳לו | A cellist playing, or a striking close-up of a cello. |
| 3 | `soprano.jpg` | מעיין ליכט, סופרן | A female opera singer (soprano) performing — ideally a portrait of the soloist. |
| 4 | `choir.jpg` | האנסמבל הקולי הישראלי | A choir / vocal ensemble singing together. |
| 5 | `camerata-recanati-2021.jpg` | אוצרות איטלקיים חבויים | A small string ensemble / soloists playing (no conductor) — intimate, baroque feel. |
| 6 | `seats-red.jpg` | קולות לילה | Night / evening mood — a dim, atmospheric concert hall, warm or red lighting. |
| 7 | `violin.jpg` | נטשה שר, כינור | A violinist playing, or a close-up of a violin. |
| 8 | `guitar.jpg` | ערב גיטרה | A classical (Spanish) guitar / guitarist — warm, intimate. |
| ★ | `sacred.jpg` (bonus) | ממעמקים | Sacred / spiritual mood — cathedral, candlelight, or a choir in a sacred space. Square-ish crop. |

**Reminders:** keep the subject centered (edges get cropped), avoid putting faces
or text in the bottom third (covered by an overlay), and prefer bright,
high-contrast shots — already-dark photos turn to mud once dimmed.
