#!/usr/bin/env python3
"""Render a terminal-style system info panel SVG.

Usage:
  python tools/render_panel.py
  writes sysinfo.svg
"""
import os
from pathlib import Path

ACCENT = "#1c7ed6"
BG = "#0d1117"
FG = "#c9d1d9"
DIM = "#8b949e"
BORDER = "#30363d"

ROWS = [
    ("role", "Java Backend Developer"),
    ("name", "Himanshu Bagga"),
    ("focus", "Scalable Systems · Distributed Architecture"),
    ("stack", "Java · Spring Boot · PostgreSQL · Redis · Docker"),
    ("now", "Building Disaster Damage Assessment Portal"),
    ("exp", "Java Dev Intern @ Judge India Solutions"),
    ("exp2", "Backend Dev Intern @ Sentinel Layer"),
    ("edu", "B.Tech · Microsoft · SAP · Oracle · AWS Certified"),
    ("pub", "ICICACS 2026 — Peer-Reviewed Publication"),
    ("hack", "Smart India Hackathon Participant"),
]


def render_panel(output: str = "sysinfo.svg") -> None:
    line_h = 28
    pad_x = 24
    pad_y = 20
    label_w = 100
    val_w = 380
    svg_w = label_w + val_w + pad_x * 2
    title_h = 36
    rows_h = len(ROWS) * line_h
    svg_h = pad_y + title_h + 12 + rows_h + pad_y

    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w} {svg_h}" '
        f'width="{svg_w}" height="{svg_h}">',
        f'  <rect width="{svg_w}" height="{svg_h}" rx="8" fill="{BG}" '
        f'stroke="{BORDER}" stroke-width="1"/>',
        # Title bar
        f'  <rect width="{svg_w}" height="{title_h}" rx="8" fill="#161b22"/>',
        f'  <rect y="{title_h - 8}" width="{svg_w}" height="8" fill="#161b22"/>',
        # Window dots
        f'  <circle cx="18" cy="18" r="5" fill="#ff5f57"/>',
        f'  <circle cx="36" cy="18" r="5" fill="#febc2e"/>',
        f'  <circle cx="54" cy="18" r="5" fill="#28c840"/>',
        # Title text
        f'  <text x="{svg_w // 2}" y="23" font-family="monospace" font-size="13" '
        f'fill="{FG}" text-anchor="middle">himanshu@terminal ~ $</text>',
        # Cursor blink
        f'  <rect x="{svg_w // 2 + 128}" y="10" width="8" height="16" fill="{ACCENT}">',
        f'    <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>',
        f"  </rect>",
    ]

    for i, (label, value) in enumerate(ROWS):
        delay = i * 0.12
        y = pad_y + title_h + 12 + (i + 1) * line_h

        # Row background on hover effect (subtle)
        lines.append(
            f'  <g opacity="0">'
            f'    <animate attributeName="opacity" from="0" to="1" '
            f'dur="0.4s" begin="{delay:.2f}s" fill="freeze"/>'
        )
        # Prompt symbol
        lines.append(
            f'    <text x="{pad_x}" y="{y}" font-family="monospace" '
            f'font-size="13" fill="{ACCENT}">&gt;</text>'
        )
        # Label
        lines.append(
            f'    <text x="{pad_x + 16}" y="{y}" font-family="monospace" '
            f'font-size="13" font-weight="bold" fill="{ACCENT}">{label}</text>'
        )
        # Separator
        sep_x = pad_x + label_w - 12
        lines.append(
            f'    <text x="{sep_x}" y="{y}" font-family="monospace" '
            f'font-size="13" fill="{DIM}">:</text>'
        )
        # Value with typing animation (reveal via clip)
        val_x = sep_x + 12
        clip_id = f"val-{i}"
        lines.append(
            f'    <defs><clipPath id="{clip_id}">'
            f'      <rect x="{val_x}" y="{y - 14}" width="0" height="{line_h}">'
            f'        <animate attributeName="width" from="0" to="{val_w}" '
            f'dur="0.5s" begin="{delay + 0.1:.2f}s" fill="freeze"/>'
            f"      </rect>"
            f"    </clipPath></defs>"
        )
        lines.append(
            f'    <text x="{val_x}" y="{y}" font-family="monospace" '
            f'font-size="13" fill="{FG}" clip-path="url(#{clip_id})">{value}</text>'
        )
        lines.append("  </g>")

    # Final prompt line
    final_y = pad_y + title_h + 12 + (len(ROWS) + 1) * line_h
    final_delay = len(ROWS) * 0.12 + 0.3
    lines.append(
        f'  <g opacity="0">'
        f'    <animate attributeName="opacity" from="0" to="1" '
        f'dur="0.3s" begin="{final_delay:.2f}s" fill="freeze"/>'
        f'    <text x="{pad_x}" y="{final_y}" font-family="monospace" '
        f'font-size="13" fill="{ACCENT}">&gt; _</text>'
        f"  </g>"
    )

    lines.append("</svg>")

    Path(output).parent.mkdir(parents=True, exist_ok=True)
    Path(output).write_text("\n".join(lines), encoding="utf-8")
    print(f"Panel written: {output}")


if __name__ == "__main__":
    out = "sysinfo.svg"
    if os.environ.get("PREVIEW"):
        out = "sysinfo-preview.svg"
    render_panel(out)
