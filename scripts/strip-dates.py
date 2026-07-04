"""Produce date-less versions of the concert banners.

Each banner has a thin separator line followed by a 2-line dates block (4
city+date pairs) rendered as white text over solid black. This script detects
that dates block per image and fills it with the surrounding black, erasing the
dates (and the faint line above them) while leaving title / logos / artwork
untouched.

Signal: a per-pixel min-channel brightness m = min(R,G,B). White date text has a
very high min-channel; colored artwork highlights (orange/blue) have a low one,
so the photo is never mistaken for text. A date-text row therefore has hundreds
of m>180 pixels, while the black gap above it drops to ~zero. We take the LOWEST
cluster of such rows inside a region-of-interest that excludes the artwork, then
fill from a little above it (to swallow the faint separator line) to just below.

Usage:
    python scripts/strip-dates.py                 # process all banners
    python scripts/strip-dates.py <file.webp>...  # process only these
"""
import sys
from pathlib import Path
from PIL import Image

SRC_DIR = Path(__file__).resolve().parent.parent / "final-pictures-2026"
OUT_DIR = Path(__file__).resolve().parent.parent / "final-pictures-2026-nodate"

WHITE = 180        # min-channel threshold for a "white text" pixel
ROW_MIN = 40       # a row is "date text" if it has >= this many white pixels
GAP_MERGE = 34     # merge text rows separated by gaps up to this many px (line break)
# Horizontal black gap (fraction of W) that ends the dates block. It must exceed
# the inter-column spacing (so the walk crosses all four date columns) yet stay
# below the artwork gutter. The wide banners keep bright artwork in the date
# column, so they need the tighter value; the square has none, so it can use a
# large gutter to cross its widely-spaced columns.
GUTTER_FRAC_WIDE = 0.07
GUTTER_FRAC_SQUARE = 0.20
UP_MARGIN = 44     # extend the fill up from the text to cover the separator line
PAD_X_FRAC = 0.02  # horizontal padding (of W); the line runs a bit wider than the text
PAD_Y = 10         # bottom padding below the text

# Per-file overrides if auto-detection ever misfires: name -> (x0, y0, x1, y1).
OVERRIDES = {}


def roi(w, h):
    """Region where the dates live, excluding the artwork, per layout class."""
    if w == h:                       # 800x800 square: dates hug the bottom
        return int(w * 0.03), int(h * 0.80), w, h
    return int(w * 0.42), int(h * 0.30), w, h  # wide: dates in the right column


def white_count_per_row(px, x0, x1, y):
    return sum(1 for x in range(x0, x1)
               if min(px[x, y][0], px[x, y][1], px[x, y][2]) > WHITE)


def find_band(img):
    """Detect (x0, y0, x1, y1) of the dates block (text + faint line above)."""
    w, h = img.size
    px = img.load()
    rx0, ry0, rx1, ry1 = roi(w, h)

    text_rows = [y for y in range(ry0, ry1)
                 if white_count_per_row(px, rx0, rx1, y) >= ROW_MIN]
    if not text_rows:
        return None

    # Group into bands, merging small vertical gaps (the line break between the
    # city row and the date row). Keep the lowest band = the dates.
    bands, cur = [], [text_rows[0]]
    for y in text_rows[1:]:
        if y - cur[-1] <= GAP_MERGE:
            cur.append(y)
        else:
            bands.append(cur)
            cur = [y]
    bands.append(cur)
    band = bands[-1]
    top, bottom = band[0], band[-1]

    # White pixels per column across the band rows.
    col = [sum(1 for y in band
               if min(px[x, y][0], px[x, y][1], px[x, y][2]) > WHITE)
           for x in range(rx0, rx1)]

    # Rightmost date pixel, then walk left across the columns; the four date
    # columns are separated by narrow gaps, but a wide (>= gutter) black gap
    # marks the boundary with the artwork -- stop there so the fill never bites
    # into the sculpture/photo.
    gutter = int(w * (GUTTER_FRAC_SQUARE if w == h else GUTTER_FRAC_WIDE))
    content = [i for i, c in enumerate(col) if c > 0]
    if not content:
        return None
    right = content[-1]
    left = right
    zero = 0
    for i in range(right, -1, -1):
        if col[i] > 0:
            left = i
            zero = 0
        else:
            zero += 1
            if zero >= gutter:
                break
    lx0, lx1 = rx0 + left, rx0 + right

    # Fill top: normally a fixed margin above the text (covers the faint line on
    # the wide banners). But some layouts (the square) have a bold separator line
    # sitting farther above the dates -- detect the nearest continuous line above
    # the text and extend the fill to just above it so it is always covered.
    ty0 = top - UP_MARGIN
    span = lx1 - lx0
    for yy in range(top - 6, max(-1, top - 100), -1):
        run = best = 0
        for x in range(lx0, lx1):
            if min(px[x, yy][0], px[x, yy][1], px[x, yy][2]) > 90:
                run += 1
                best = max(best, run)
            else:
                run = 0
        if best >= 0.4 * span:      # a continuous line, not spaced-out glyphs
            ty0 = min(ty0, yy - 6)
            break
    return lx0, ty0, lx1, bottom


def fill_band(img, x0, y0, x1, y1):
    """Fill the rectangle per-column with each column's local background, sampled
    from the clean strip just above the band. This continues whatever the
    background is there -- pure black, an orange/blue tint, or a gray gradient --
    so the fill leaves no visible rectangle even over a non-uniform backdrop."""
    px = img.load()
    src = [sy for sy in range(max(0, y0 - 9), max(1, y0 - 1))]
    for x in range(x0, x1):
        samples = sorted((px[x, sy] for sy in src), key=lambda c: c[0] + c[1] + c[2])
        col = samples[len(samples) // 2]  # median -> robust to a stray bright pixel
        for y in range(y0, y1):
            px[x, y] = col


def strip(path, out_path):
    img = Image.open(path).convert("RGB")
    w, h = img.size

    if path.name in OVERRIDES:
        x0, y0, x1, y1 = OVERRIDES[path.name]
    else:
        band = find_band(img)
        if band is None:
            print(f"  !! no dates band detected in {path.name} -- SKIPPED")
            return False
        bx0, ty0, bx1, by1 = band   # ty0 is already the fill top (line-aware)
        pad_x = max(20, int(w * PAD_X_FRAC))
        x0 = max(0, bx0 - pad_x)
        y0 = max(0, ty0)
        x1 = min(w, bx1 + pad_x + 1)
        y1 = min(h, by1 + PAD_Y + 1)

    fill_band(img, x0, y0, x1, y1)
    img.save(out_path, "WEBP", quality=90, method=6)
    print(f"  ok {path.name}: fill x[{x0}-{x1}] y[{y0}-{y1}]")
    return True


def main():
    OUT_DIR.mkdir(exist_ok=True)
    if len(sys.argv) > 1:
        files = [Path(a) if Path(a).is_absolute() else SRC_DIR / a for a in sys.argv[1:]]
    else:
        files = sorted(SRC_DIR.glob("*.webp"))
    for f in files:
        strip(f, OUT_DIR / f.name)


if __name__ == "__main__":
    main()
