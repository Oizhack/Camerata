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
