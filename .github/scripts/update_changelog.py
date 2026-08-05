"""Rotate the CHANGELOG.md "Unreleased" section into a released version section.

Used by .github/workflows/release.yml. If CHANGELOG.md has a non-empty
"## Unreleased" section, its heading is renamed to "## <version> — <date>".
If there is no Unreleased content, the changelog is left untouched (the
release notes fall back to the commit list). Prints "rotated" or "skipped".
"""

from __future__ import annotations

import datetime
from pathlib import Path
import re
import sys


def main() -> int:
    if len(sys.argv) < 2:
        raise SystemExit("usage: update_changelog.py <version> [changelog_path]")
    version = sys.argv[1]
    changelog_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("CHANGELOG.md")

    text = changelog_path.read_text(encoding="utf-8")
    match = re.search(r"^## Unreleased\s*\n(.*?)(?=^## |\Z)", text, re.MULTILINE | re.DOTALL)
    if match is None or not match.group(1).strip():
        print("skipped")
        return 0

    today = datetime.date.today().isoformat()
    updated = text.replace("## Unreleased", f"## {version} — {today}", 1)
    changelog_path.write_text(updated, encoding="utf-8")
    print("rotated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
