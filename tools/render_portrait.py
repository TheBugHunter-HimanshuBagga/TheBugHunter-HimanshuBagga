#!/usr/bin/env python3
"""Render a self-drawing ASCII portrait SVG from a cleaned photo.

Usage:
  python tools/render_portrait.py [input_image]
  writes portrait.svg (or assets/portrait.svg)
"""
import sys
import math
from pathlib import Path

import numpy as np
from PIL import Image

GLYPHS = " .',:;~+*xXO#"
CELL_W = 10
CELL_H = 14
COLS = 36
ACCENT = "#1c7ed6"


def brightness_to_glyph(val: int) -> str:
    idx = int((255 - val) / 256 * len(GLYPHS))
    idx = max(0, min(idx, len(GLYPHS) - 1))
    return GLYPHS[idx]


def image_to_grid(img: Image.Image) -> list[list[str]]:
    gray = img.convert("L")
    w, h = gray.size
    cell_w = w / COLS
    rows = int(h / cell_w * (CELL_H / CELL_W))
    cell_h = h / rows

    grid = []
    for r in range(rows):
        row = []
        for c in range(COLS):
            x1 = int(c * cell_w)
            y1 = int(r * cell_h)
            x2 = int((c + 1) * cell_w)
            y2 = int((r + 1) * cell_h)
            region = gray.crop((x1, y1, x2, y2))
            avg = np.mean(list(region.getdata()))
            row.append(brightness_to_glyph(int(avg)))
        grid.append(row)
    return grid


def render_svg(grid: list[list[str]], output: str) -> None:
    rows = len(grid)
    cols = len(grid[0]) if grid else 0
    svg_w = cols * CELL_W + 20
    svg_h = rows * CELL_H + 20
    total_delay = rows * 0.04 + 0.5

    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w} {svg_h}" '
        f'width="{svg_w}" height="{svg_h}">',
        f"  <rect width=\"{svg_w}\" height=\"{svg_h}\" fill=\"#0d1117\"/>",
        "  <style>",
        "    text { font-family: 'Courier New', monospace; }",
        "  </style>",
    ]

    for r, row in enumerate(grid):
        delay = r * 0.04
        clip_id = f"row-{r}"
        lines.append(f'  <defs><clipPath id="{clip_id}">')
        lines.append(
            f'    <rect x="10" y="{10 + r * CELL_H}" '
            f'width="0" height="{CELL_H}">'
        )
        lines.append(
            f'      <animate attributeName="width" from="0" to="{cols * CELL_W}" '
            f'dur="0.6s" begin="{delay:.2f}s" fill="freeze"/>'
        )
        lines.append(f"    </rect>")
        lines.append(f"  </clipPath></defs>")
        lines.append(f'  <g clip-path="url(#{clip_id})">')
        for c, ch in enumerate(row):
            if ch.strip():
                x = 10 + c * CELL_W
                y = 10 + r * CELL_H + CELL_H - 2
                lines.append(
                    f'    <text x="{x}" y="{y}" '
                    f'font-size="12" fill="{ACCENT}" opacity="0.9">{ch}</text>'
                )
        lines.append("  </g>")

    # Hold after animation completes, then fade slightly
    lines.append(
        f'  <animate attributeName="opacity" from="1" to="0.85" '
        f'dur="0.01s" begin="{total_delay:.2f}s" fill="freeze"/>'
    )
    lines.append("</svg>")

    Path(output).parent.mkdir(parents=True, exist_ok=True)
    Path(output).write_text("\n".join(lines), encoding="utf-8")
    print(f"Portrait written: {output}")


def main():
    input_path = sys.argv[1] if len(sys.argv) > 1 else "assets/photo-ready.png"
    output = sys.argv[2] if len(sys.argv) > 2 else "portrait.svg"

    if not Path(input_path).exists():
        print(f"Error: {input_path} not found. Run clean_photo.py first.")
        sys.exit(1)

    img = Image.open(input_path)
    grid = image_to_grid(img)
    render_svg(grid, output)


if __name__ == "__main__":
    main()
