#!/usr/bin/env python3
"""Render an animated GitHub contribution graph SVG.

Reads assets/contributions.json (from pull_contributions.py).
Writes graph.svg.

Usage:
  python tools/render_graph.py
"""
import json
from pathlib import Path

INPUT = "assets/contributions.json"
OUTPUT = "graph.svg"

LEVELS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
ACCENT = "#1c7ed6"
CELL = 12
GAP = 3
RADIUS = 2

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
DAYS = ["Mon", "", "Wed", "", "Fri", "", ""]


def render_graph(data: dict, output: str) -> None:
    days = data["days"]
    total = data["total"]
    streak = data["current_streak"]
    longest = data["longest_streak"]

    # Organize into weeks (columns)
    weeks = []
    current_week = []
    for d in days:
        from datetime import datetime
        dt = datetime.strptime(d["date"], "%Y-%m-%d")
        dow = dt.weekday()
        if dow == 0 and current_week:
            weeks.append(current_week)
            current_week = []
        current_week.append(d)
    if current_week:
        weeks.append(current_week)

    num_weeks = len(weeks)
    day_label_w = 36
    month_label_h = 20
    grid_w = num_weeks * (CELL + GAP)
    grid_h = 7 * (CELL + GAP)
    stats_h = 50
    legend_w = 180
    svg_w = day_label_w + grid_w + 40
    svg_h = month_label_h + grid_h + stats_h + 30

    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w} {svg_h}" '
        f'width="{svg_w}" height="{svg_h}">',
        f'  <rect width="{svg_w}" height="{svg_h}" fill="#0d1117" rx="8"/>',
        "  <style>",
        "    text { font-family: 'Courier New', monospace; }",
        "  </style>",
    ]

    # Day labels
    for i, label in enumerate(DAYS):
        if label:
            y = month_label_h + i * (CELL + GAP) + CELL - 1
            lines.append(
                f'  <text x="4" y="{y}" font-size="9" fill="#8b949e">{label}</text>'
            )

    # Month labels
    prev_month = -1
    for wi, week in enumerate(weeks):
        from datetime import datetime
        dt = datetime.strptime(week[0]["date"], "%Y-%m-%d")
        m = dt.month - 1
        if m != prev_month:
            x = day_label_w + wi * (CELL + GAP)
            lines.append(
                f'  <text x="{x}" y="14" font-size="9" fill="#8b949e">{MONTHS[m]}</text>'
            )
            prev_month = m

    # Contribution squares with wave animation
    total_squares = 0
    for wi, week in enumerate(weeks):
        for di, day in enumerate(week):
            level = day["level"]
            color = LEVELS[min(level, len(LEVELS) - 1)]
            x = day_label_w + wi * (CELL + GAP)
            y = month_label_h + di * (CELL + GAP)
            delay = wi * 0.02 + di * 0.01
            total_squares += 1

            lines.append(
                f'  <rect x="{x}" y="{y}" width="{CELL}" height="{CELL}" '
                f'rx="{RADIUS}" fill="{color}" opacity="0">'
                f'    <animate attributeName="opacity" from="0" to="1" '
                f'dur="0.3s" begin="{delay:.2f}s" fill="freeze"/>'
                f"  </rect>"
            )

    # Stats footer
    stats_y = month_label_h + grid_h + 24
    stats_delay = total_squares * 0.02 + 0.5

    lines.append(
        f'  <g opacity="0">'
        f'    <animate attributeName="opacity" from="0" to="1" '
        f'dur="0.5s" begin="{stats_delay:.2f}s" fill="freeze"/>'
    )
    lines.append(
        f'    <text x="{day_label_w}" y="{stats_y}" font-size="12" fill="{ACCENT}" '
        f'font-weight="bold">{total} contributions</text>'
    )
    lines.append(
        f'    <text x="{day_label_w + 180}" y="{stats_y}" font-size="11" fill="#8b949e">'
        f"Current streak: {streak}d  |  Longest: {longest}d</text>"
    )
    lines.append("  </g>")

    # Legend
    legend_x = svg_w - legend_w - 10
    legend_y = stats_y - 12
    lines.append(
        f'  <g opacity="0">'
        f'    <animate attributeName="opacity" from="0" to="1" '
        f'dur="0.5s" begin="{stats_delay + 0.2:.2f}s" fill="freeze"/>'
    )
    lines.append(
        f'    <text x="{legend_x}" y="{legend_y}" font-size="9" fill="#8b949e">Less</text>'
    )
    for i, c in enumerate(LEVELS):
        lx = legend_x + 30 + i * (CELL + 2)
        lines.append(
            f'    <rect x="{lx}" y="{legend_y - 9}" width="{CELL}" height="{CELL}" '
            f'rx="2" fill="{c}"/>'
        )
    lines.append(
        f'    <text x="{legend_x + 30 + len(LEVELS) * (CELL + 2) + 4}" y="{legend_y}" '
        f'font-size="9" fill="#8b949e">More</text>'
    )
    lines.append("  </g>")

    lines.append("</svg>")

    Path(output).parent.mkdir(parents=True, exist_ok=True)
    Path(output).write_text("\n".join(lines), encoding="utf-8")
    print(f"Graph written: {output}")


def main():
    if not Path(INPUT).exists():
        print(f"Error: {INPUT} not found. Run pull_contributions.py first.")
        print("Generating placeholder graph...")
        data = {
            "total": 0, "current_streak": 0, "longest_streak": 0,
            "days": [{"date": "2025-01-01", "level": 0, "count": 0}],
        }
    else:
        data = json.loads(Path(INPUT).read_text(encoding="utf-8"))

    render_graph(data, OUTPUT)


if __name__ == "__main__":
    main()
