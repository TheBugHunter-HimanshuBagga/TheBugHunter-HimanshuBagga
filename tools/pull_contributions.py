#!/usr/bin/env python3
"""Pull contribution data from GitHub's public HTML fragment.

No authentication required. Fetches:
  https://github.com/users/<username>/contributions

Saves:
  assets/contributions.json

Usage:
  python tools/pull_contributions.py
"""
import json
import re
from datetime import datetime, timedelta
from pathlib import Path

import httpx
from lxml import html

USERNAME = "TheBugHunter-HimanshuBagga"
URL = f"https://github.com/users/{USERNAME}/contributions"
OUTPUT = "assets/contributions.json"


def parse_contributions(html_content: str) -> dict:
    tree = html.fromstring(html_content)
    days = tree.cssselect("td.ContributionCalendar-day")

    contributions = []
    for day in days:
        date_str = day.get("data-date")
        level = day.get("data-level", "0")
        count_text = day.text_content().strip()
        count = 0
        if "contribution" in count_text:
            m = re.search(r"(\d+)", count_text)
            if m:
                count = int(m.group(1))
        contributions.append({
            "date": date_str,
            "level": int(level),
            "count": count,
        })

    # Compute stats
    counts = [c["count"] for c in contributions]
    non_zero = [c for c in counts if c > 0]

    # Current streak
    today = datetime.now().date()
    current_streak = 0
    d = today
    for c in reversed(contributions):
        if c["date"] == d.isoformat() and c["count"] > 0:
            current_streak += 1
            d -= timedelta(days=1)
        elif c["date"] == d.isoformat():
            break

    # Longest streak
    longest = 0
    streak = 0
    for c in contributions:
        if c["count"] > 0:
            streak += 1
            longest = max(longest, streak)
        else:
            streak = 0

    # Day of week breakdown
    dow_counts = [0] * 7
    for c in contributions:
        d = datetime.strptime(c["date"], "%Y-%m-%d").date()
        dow_counts[d.weekday()] += c["count"]

    return {
        "username": USERNAME,
        "total": sum(counts),
        "current_streak": current_streak,
        "longest_streak": longest,
        "days_active": len(non_zero),
        "max_day": max(counts) if counts else 0,
        "avg_per_day": round(sum(counts) / max(len(counts), 1), 1),
        "day_of_week": {
            "Mon": dow_counts[0], "Tue": dow_counts[1], "Wed": dow_counts[2],
            "Thu": dow_counts[3], "Fri": dow_counts[4], "Sat": dow_counts[5],
            "Sun": dow_counts[6],
        },
        "days": contributions,
    }


def main():
    print(f"Fetching contributions for {USERNAME}...")
    resp = httpx.get(URL, follow_redirects=True, timeout=30)
    resp.raise_for_status()

    data = parse_contributions(resp.text)

    Path(OUTPUT).parent.mkdir(parents=True, exist_ok=True)
    Path(OUTPUT).write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Saved: {OUTPUT}")
    print(f"  Total: {data['total']}")
    print(f"  Current streak: {data['current_streak']}")
    print(f"  Longest streak: {data['longest_streak']}")


if __name__ == "__main__":
    main()
