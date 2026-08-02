#!/usr/bin/env python3
"""Render a self-drawing ASCII portrait SVG from a source photo.

Produces a compact, GitHub-compatible SVG with top-to-bottom animation.

Usage:
  python tools/render_portrait.py [input_image] [output.svg]
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageOps

# ─── Config ──────────────────────────────────────────────────────────────────

COLS = 80
FONT_SIZE = 7.0
CELL_W = 7.0
CELL_H = 9.5
ACCENT = "#1c7ed6"
BG = "#0d1117"

# 30-level glyph ramp: light → dense
GLYPHS = " .,:;+*?%S#@"

# ─── Preprocessing ───────────────────────────────────────────────────────────

def preprocess(path: str) -> Image.Image:
    img = Image.open(path).convert("L")

    try:
        from rembg import remove
        rgba = Image.open(path).convert("RGBA")
        result = remove(rgba)
        alpha = np.array(result.split()[-1])
        gray = result.convert("L")
        white = Image.new("L", gray.size, 255)
        gray = Image.composite(gray, white, Image.fromarray(alpha))
    except Exception:
        gray = ImageOps.autocontrast(img, cutoff=2)

    try:
        import cv2
        arr = np.array(gray)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        gray = Image.fromarray(clahe.apply(arr))
    except Exception:
        pass

    gray = gray.filter(ImageFilter.SHARPEN)
    gray = ImageEnhance.Contrast(gray).enhance(1.5)
    gray = ImageEnhance.Brightness(gray).enhance(1.1)

    arr = np.array(gray)
    rows_mask = np.any(arr < 240, axis=1)
    cols_mask = np.any(arr < 240, axis=0)
    if rows_mask.any() and cols_mask.any():
        r0, r1 = np.where(rows_mask)[0][[0, -1]]
        c0, c1 = np.where(cols_mask)[0][[0, -1]]
        pad = 20
        gray = gray.crop((
            max(0, c0 - pad), max(0, r0 - pad),
            min(gray.size[0], c1 + pad), min(gray.size[1], r1 + pad)
        ))

    return gray

# ─── Dithering ───────────────────────────────────────────────────────────────

def dither(img: Image.Image, levels: int) -> np.ndarray:
    arr = np.array(img, dtype=np.float64)
    h, w = arr.shape
    step = 255.0 / (levels - 1)
    for y in range(h):
        for x in range(w):
            old = arr[y, x]
            new = round(old / step) * step
            new = max(0, min(255, new))
            arr[y, x] = new
            err = old - new
            if x + 1 < w: arr[y, x+1] += err * 7/16
            if y + 1 < h:
                if x > 0: arr[y+1, x-1] += err * 3/16
                arr[y+1, x] += err * 5/16
                if x + 1 < w: arr[y+1, x+1] += err * 1/16
    return np.clip(arr, 0, 255).astype(np.uint8)

# ─── Grid ────────────────────────────────────────────────────────────────────

def to_grid(img: Image.Image) -> list[str]:
    gray = img.convert("L")
    w, h = gray.size
    rows = int(COLS * (h / w) * (CELL_H / CELL_W))
    small = gray.resize((COLS, rows), Image.LANCZOS)
    dithered = dither(small, len(GLYPHS))

    grid = []
    for r in range(rows):
        row = ""
        for c in range(COLS):
            val = int(dithered[r, c])
            idx = min(int((255 - val) / 256 * len(GLYPHS)), len(GLYPHS) - 1)
            ch = GLYPHS[idx]
            row += ch if ch.strip() else " "
        grid.append(row)
    return grid

# ─── SVG ─────────────────────────────────────────────────────────────────────

def render_svg(grid: list[str], output: str):
    rows = len(grid)
    svg_w = COLS * CELL_W + 20
    svg_h = rows * CELL_H + 20

    # Use single <text> per row with tspan for positioning
    # This is MUCH more compact than individual <text> elements
    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w:.0f} {svg_h:.0f}" width="{svg_w:.0f}" height="{svg_h:.0f}">',
        f'<rect width="{svg_w:.0f}" height="{svg_h:.0f}" fill="{BG}" rx="10"/>',
        '<style>t{font-family:"Courier New",monospace;white-space:pre}</style>',
    ]

    # Build clip-path definitions in one block
    lines.append('<defs>')
    for r in range(rows):
        y = 10 + r * CELL_H
        delay = r * 0.025
        lines.append(
            f'<clipPath id="c{r}"><rect x="10" y="{y:.1f}" width="0" '
            f'height="{CELL_H:.1f}"><animate attributeName="width" from="0" '
            f'to="{COLS * CELL_W:.1f}" dur="0.4s" begin="{delay:.2f}s" '
            f'fill="freeze"/></rect></clipPath>'
        )
    lines.append('</defs>')

    # Each row is one <text> element with a clip-path
    for r, row in enumerate(grid):
        y = 10 + r * CELL_H + CELL_H - 1
        # Escape XML special chars
        safe = row.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        lines.append(
            f'<text x="10" y="{y:.1f}" font-size="{FONT_SIZE}" '
            f'fill="{ACCENT}" clip-path="url(#c{r})">{safe}</text>'
        )

    lines.append('</svg>')

    Path(output).parent.mkdir(parents=True, exist_ok=True)
    Path(output).write_text("\n".join(lines), encoding="utf-8")
    print(f"Written: {output} ({Path(output).stat().st_size / 1024:.0f} KB)")

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    inp = sys.argv[1] if len(sys.argv) > 1 else "assets/image.png"
    out = sys.argv[2] if len(sys.argv) > 2 else "portrait.svg"

    if not Path(inp).exists():
        print(f"Error: {inp} not found"); sys.exit(1)

    print("Preprocessing...")
    cleaned = preprocess(inp)
    cleaned.save("assets/photo-ready.png")
    print("Generating grid...")
    grid = to_grid(cleaned)
    print("Rendering SVG...")
    render_svg(grid, out)
    print("Done!")

if __name__ == "__main__":
    main()
