#!/usr/bin/env python3
"""Bump static 'Latest update' month labels to the current calendar month.

Used by GitHub Actions on the 1st of each month so HTML/SEO stays in sync
with the live KF.freshMonth() display.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
MONTH_RE = "|".join(MONTHS)


def current_labels(now: datetime | None = None) -> tuple[str, str, str]:
    d = now or datetime.now(timezone.utc)
    month = f"{MONTHS[d.month - 1]} {d.year}"
    full = f"{MONTHS[d.month - 1]} {d.day}, {d.year}"
    iso = d.strftime("%Y-%m-%d")
    return month, full, iso


def bump_file(path: Path, month: str, full: str, iso: str) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    text = re.sub(
        rf"(data-fresh-month>)(?:{MONTH_RE}) \d{{4}}",
        rf"\g<1>{month}",
        text,
    )
    text = re.sub(
        rf'(updated:\s*")(?:{MONTH_RE}) \d{{1,2}}, \d{{4}}(")',
        rf"\g<1>{full}\2",
        text,
    )
    text = re.sub(
        r'(<meta name="date" content=")(\d{4}-\d{2}-\d{2})(")',
        rf"\g<1>{iso}\3",
        text,
    )
    text = re.sub(
        r'("dateModified":\s*")(\d{4}-\d{2}-\d{2})(")',
        rf"\g<1>{iso}\3",
        text,
    )

    if text == original:
        return False
    path.write_text(text, encoding="utf-8")
    return True


def main() -> int:
    month, full, iso = current_labels()
    targets = [
        ROOT / "index.html",
        ROOT / "js" / "data.js",
    ]
    changed = []
    for path in targets:
        if not path.exists():
            continue
        if bump_file(path, month, full, iso):
            changed.append(path.relative_to(ROOT).as_posix())

    if changed:
        print(f"Bumped to {month} ({full})")
        for c in changed:
            print(f"  updated {c}")
    else:
        print(f"Already current: {month}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
