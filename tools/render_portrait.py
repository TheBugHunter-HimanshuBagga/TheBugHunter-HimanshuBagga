#!/usr/bin/env python3
"""Render a self-drawing ASCII portrait SVG from a source photo.

Two-stage pipeline:
  1. Preprocess: background removal, CLAHE, sharpening, contrast boost
  2. Render: high-res ASCII grid with Floyd-Steinberg dithering

Falls back to vector SVG line-art if the result isn't recognizable.

Usage:
  python tools/render_portrait.py [input_image] [output.svg]
  writes portrait.svg

Requirements:
  pip install Pillow numpy
  Optional: opencv-python, rembg (for best results)
"""
import sys
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageOps

# ─── Configuration ───────────────────────────────────────────────────────────

COLS = 120                  # High resolution column count
FONT_SIZE = 7               # Font size in SVG units
CELL_W = 6.2                # Horizontal cell width (monospace)
CELL_H = 8.5                # Vertical cell height (monospace)
ACCENT = "#1c7ed6"          # Monochrome accent color
BG_COLOR = "#0d1117"        # Background color

# Extended glyph ramp: light → dense (50+ chars for smooth gradients)
# Designed for monospace rendering in SVG
GLYPHS = (
    " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbU"
    "AXHgNmw#%&@$BWM08BWM@"
)

# ─── Preprocessing Pipeline ──────────────────────────────────────────────────

def remove_background(img: Image.Image) -> Image.Image:
    """Remove background using rembg if available, else simple threshold."""
    try:
        from rembg import remove as rembg_remove
        print("  [preprocess] Removing background with rembg...")
        result = rembg_remove(img)
        return result.convert("RGBA")
    except ImportError:
        print("  [preprocess] rembg not available, using threshold fallback...")
        gray = img.convert("L")
        # Simple threshold to separate subject from background
        arr = np.array(gray)
        # Use Otsu-like threshold
        threshold = np.mean(arr)
        mask = (arr < threshold).astype(np.uint8) * 255
        mask_img = Image.fromarray(mask).filter(ImageFilter.GaussianBlur(3))
        result = img.convert("RGBA")
        result.putalpha(mask_img)
        return result


def apply_clahe(img: Image.Image) -> Image.Image:
    """Apply CLAHE (adaptive histogram equalization) for even lighting."""
    try:
        import cv2
        print("  [preprocess] Applying CLAHE with OpenCV...")
        arr = np.array(img.convert("L"))
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(arr)
        return Image.fromarray(enhanced)
    except ImportError:
        print("  [preprocess] OpenCV not available, using PIL autocontrast...")
        return ImageOps.autocontrast(img.convert("L"), cutoff=1)


def preprocess_photo(input_path: str) -> Image.Image:
    """Full preprocessing pipeline."""
    print(f"Loading {input_path}...")
    img = Image.open(input_path).convert("RGBA")

    # 1. Background removal
    rgba = remove_background(img)
    alpha = np.array(rgba.split()[-1])

    # 2. Convert to grayscale
    gray = rgba.convert("L")

    # 3. CLAHE for even lighting
    gray = apply_clahe(gray)

    # 4. Sharpen
    print("  [preprocess] Sharpening...")
    gray = gray.filter(ImageFilter.SHARPEN)
    gray = gray.filter(ImageFilter.DETAIL)

    # 5. Boost contrast
    print("  [preprocess] Enhancing contrast...")
    enhancer = ImageEnhance.Contrast(gray)
    gray = enhancer.enhance(1.4)

    # 6. Boost brightness slightly
    enhancer = ImageEnhance.Brightness(gray)
    gray = enhancer.enhance(1.1)

    # 7. Composite onto white background using alpha mask
    white_bg = Image.new("L", gray.size, 255)
    mask = Image.fromarray(alpha)
    mask = mask.resize(gray.size, Image.LANCZOS)
    composite = Image.composite(gray, white_bg, mask)

    # 8. Crop to subject bounding box with padding
    arr = np.array(composite)
    rows = np.any(arr < 240, axis=1)
    cols = np.any(arr < 240, axis=0)
    if rows.any() and cols.any():
        rmin, rmax = np.where(rows)[0][[0, -1]]
        cmin, cmax = np.where(cols)[0][[0, -1]]
        pad = 30
        rmin = max(0, rmin - pad)
        rmax = min(arr.shape[0], rmax + pad)
        cmin = max(0, cmin - pad)
        cmax = min(arr.shape[1], cmax + pad)
        composite = composite.crop((cmin, rmin, cmax, rmax))

    print(f"  [preprocess] Final size: {composite.size}")
    return composite


# ─── Floyd-Steinberg Dithering ───────────────────────────────────────────────

def floyd_steinberg_dither(gray: Image.Image, num_levels: int) -> np.ndarray:
    """Apply Floyd-Steinberg dithering for smooth tonal gradients."""
    arr = np.array(gray, dtype=np.float64)
    h, w = arr.shape
    step = 255.0 / (num_levels - 1)

    for y in range(h):
        for x in range(w):
            old_val = arr[y, x]
            new_val = round(old_val / step) * step
            new_val = max(0, min(255, new_val))
            arr[y, x] = new_val
            error = old_val - new_val

            if x + 1 < w:
                arr[y, x + 1] += error * 7 / 16
            if y + 1 < h:
                if x - 1 >= 0:
                    arr[y + 1, x - 1] += error * 3 / 16
                arr[y + 1, x] += error * 5 / 16
                if x + 1 < w:
                    arr[y + 1, x + 1] += error * 1 / 16

    return np.clip(arr, 0, 255).astype(np.uint8)


# ─── ASCII Grid Generation ──────────────────────────────────────────────────

def brightness_to_glyph(val: int) -> str:
    """Map brightness value (0=black, 255=white) to a glyph."""
    # Invert: dark pixels → dense glyphs, light pixels → sparse glyphs
    idx = int((255 - val) / 256 * (len(GLYPHS) - 1))
    idx = max(0, min(idx, len(GLYPHS) - 1))
    return GLYPHS[idx]


def image_to_grid(img: Image.Image, use_dithering: bool = True) -> list[list[str]]:
    """Convert image to character grid with optional Floyd-Steinberg dithering."""
    gray = img.convert("L")
    w, h = gray.size

    # Calculate grid dimensions
    aspect_ratio = h / w
    rows = int(COLS * aspect_ratio * (CELL_H / CELL_W))

    # Resize to grid dimensions
    grid_img = gray.resize((COLS, rows), Image.LANCZOS)

    if use_dithering:
        print(f"  [render] Applying Floyd-Steinberg dithering ({COLS}x{rows})...")
        dithered = floyd_steinberg_dither(grid_img, len(GLYPHS))
        grid_arr = dithered
    else:
        grid_arr = np.array(grid_img)

    print(f"  [render] Generating {COLS}x{rows} character grid...")
    grid = []
    for r in range(rows):
        row = []
        for c in range(COLS):
            val = int(grid_arr[r, c])
            row.append(brightness_to_glyph(val))
        grid.append(row)

    return grid


# ─── SVG Rendering ──────────────────────────────────────────────────────────

def render_svg(grid: list[list[str]], output: str) -> None:
    """Render the ASCII grid as an SVG with top-to-bottom reveal animation."""
    rows = len(grid)
    cols = len(grid[0]) if grid else 0
    svg_w = cols * CELL_W + 20
    svg_h = rows * CELL_H + 20
    total_delay = rows * 0.03 + 0.5

    print(f"  [svg] Rendering {svg_w:.0f}x{svg_h:.0f} SVG...")

    # Build SVG
    parts = []
    parts.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {svg_w:.0f} {svg_h:.0f}" '
        f'width="{svg_w:.0f}" height="{svg_h:.0f}">'
    )
    parts.append(f'  <rect width="{svg_w:.0f}" height="{svg_h:.0f}" fill="{BG_COLOR}" rx="12"/>')
    parts.append("  <style>")
    parts.append("    text { font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Source Code Pro', 'Courier New', monospace; }")
    parts.append("  </style>")

    # Generate clip-path animations for each row
    # Batch rows into groups to reduce SVG size
    BATCH = 1
    for r in range(rows):
        delay = r * 0.03
        clip_id = f"r{r}"
        y_pos = 10 + r * CELL_H

        parts.append(f'  <defs><clipPath id="{clip_id}">')
        parts.append(
            f'    <rect x="10" y="{y_pos:.1f}" width="0" height="{CELL_H:.1f}">'
        )
        parts.append(
            f'      <animate attributeName="width" from="0" to="{cols * CELL_W:.1f}" '
            f'dur="0.5s" begin="{delay:.2f}s" fill="freeze"/>'
        )
        parts.append(f"    </rect>")
        parts.append(f"  </clipPath></defs>")

        parts.append(f'  <g clip-path="url(#{clip_id})">')
        for c, ch in enumerate(grid[r]):
            if ch.strip():
                x = 10 + c * CELL_W
                y = y_pos + CELL_H - 1.5
                # Vary opacity slightly for depth
                opacity = 0.75 + 0.25 * (ord(ch) / 127)
                parts.append(
                    f'    <text x="{x:.1f}" y="{y:.1f}" '
                    f'font-size="{FONT_SIZE}" fill="{ACCENT}" '
                    f'opacity="{opacity:.2f}">{ch}</text>'
                )
        parts.append("  </g>")

    parts.append("</svg>")

    Path(output).parent.mkdir(parents=True, exist_ok=True)
    Path(output).write_text("\n".join(parts), encoding="utf-8")
    print(f"  [svg] Portrait written: {output}")


# ─── Vector Line-Art Fallback ────────────────────────────────────────────────

def render_lineart_fallback(input_path: str, output: str) -> None:
    """Generate a vector SVG line-art portrait as fallback."""
    print("  [fallback] Generating vector line-art portrait...")
    img = Image.open(input_path).convert("RGBA")

    # Remove background
    rgba = remove_background(img)
    alpha = np.array(rgba.split()[-1])

    # Get edge map
    gray = rgba.convert("L")
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edges = edges.filter(ImageFilter.MaxFilter(3))
    edges = ImageOps.invert(edges)

    # Get contours via threshold
    arr = np.array(edges)
    threshold = 180
    mask = arr < threshold

    # Extract contour points
    from PIL import ImageDraw
    w, h = gray.size

    # Scale down for manageable SVG
    scale = 400 / max(w, h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    small = gray.resize((new_w, new_h), Image.LANCZOS)
    small_alpha = Image.fromarray(alpha).resize((new_w, new_h), Image.LANCZOS)

    # Edge detection on resized
    edges = small.filter(ImageFilter.FIND_EDGES)
    edges = edges.filter(ImageFilter.SMOOTH_MORE)
    edge_arr = np.array(edges)

    # Create SVG paths from edges
    svg_w = new_w * 1.5
    svg_h = new_h * 1.5

    parts = []
    parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w:.0f} {svg_h:.0f}" width="{svg_w:.0f}" height="{svg_h:.0f}">')
    parts.append(f'  <rect width="{svg_w:.0f}" height="{svg_h:.0f}" fill="{BG_COLOR}" rx="12"/>')

    # Animation clip
    parts.append(f'  <defs><clipPath id="lineart-clip">')
    parts.append(f'    <rect x="0" y="0" width="{svg_w:.0f}" height="0">')
    parts.append(f'      <animate attributeName="height" from="0" to="{svg_h:.0f}" dur="2s" fill="freeze"/>')
    parts.append(f"    </rect>")
    parts.append(f"  </clipPath></defs>")

    parts.append(f'  <g clip-path="url(#lineart-clip)">')

    # Draw edge pixels as small lines
    step = 2
    for y in range(0, new_h, step):
        for x in range(0, new_w, step):
            if edge_arr[y, x] < 100:  # Edge pixel
                # Check alpha
                a = small_alpha.getpixel((x, y))
                if isinstance(a, tuple):
                    a = a[3] if len(a) > 3 else 255
                if a > 50:
                    sx = x * 1.5 + 30
                    sy = y * 1.5 + 30
                    parts.append(f'    <rect x="{sx:.1f}" y="{sy:.1f}" width="2" height="2" fill="{ACCENT}" opacity="0.6"/>')

    parts.append("  </g>")
    parts.append("</svg>")

    Path(output).parent.mkdir(parents=True, exist_ok=True)
    Path(output).write_text("\n".join(parts), encoding="utf-8")
    print(f"  [fallback] Line-art portrait written: {output}")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    input_path = sys.argv[1] if len(sys.argv) > 1 else "assets/image.png"
    output = sys.argv[2] if len(sys.argv) > 2 else "portrait.svg"

    if not Path(input_path).exists():
        print(f"Error: {input_path} not found.")
        sys.exit(1)

    print("=" * 60)
    print("Portrait Generation Pipeline")
    print("=" * 60)

    # Stage 1: Preprocess
    print("\n[1/3] Preprocessing photo...")
    cleaned = preprocess_photo(input_path)

    # Save intermediate for debugging
    debug_path = Path("assets/photo-ready.png")
    debug_path.parent.mkdir(parents=True, exist_ok=True)
    cleaned.save(debug_path)
    print(f"  Saved preprocessed photo: {debug_path}")

    # Stage 2: Generate ASCII grid
    print("\n[2/3] Generating ASCII grid...")
    grid = image_to_grid(cleaned, use_dithering=True)

    # Stage 3: Render SVG
    print("\n[3/3] Rendering SVG...")
    render_svg(grid, output)

    # Quality check: if grid is too sparse or too uniform, use fallback
    flat = [ch for row in grid for ch in row if ch.strip()]
    unique_chars = len(set(flat))
    density = len(flat) / (len(grid) * len(grid[0]) if grid else 1)

    print(f"\n[quality] Unique chars: {unique_chars}, Density: {density:.2%}")

    if unique_chars < 10 or density < 0.05 or density > 0.95:
        print("[quality] Low quality detected, generating line-art fallback...")
        render_lineart_fallback(input_path, output)
    else:
        print("[quality] Portrait looks good!")

    print("\n" + "=" * 60)
    print("Done!")


if __name__ == "__main__":
    main()
