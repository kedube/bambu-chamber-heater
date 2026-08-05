"""Generate GitHub release notes markdown for a version.

Used by .github/workflows/release.yml. Builds the release body from:
  1. The CHANGELOG.md section for the version (rotated there from
     "Unreleased" by update_changelog.py), shown as Highlights.
  2. The commit subjects since the previous release tag (release
     bookkeeping commits are excluded).
  3. A GitHub compare link between the previous tag and the new one.

Usage: generate_release_notes.py <version> [output_path]
The repository slug is taken from $GITHUB_REPOSITORY when set.
"""

from __future__ import annotations

import os
from pathlib import Path
import re
import subprocess
import sys

RELEASE_TAG_RE = re.compile(r"^\d+\.\d+(\.\d+)?$")


def _git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], check=True, capture_output=True, text=True
    ).stdout.strip()


def _previous_tag(version: str) -> str | None:
    """Latest release-style tag other than the version being published."""
    tags = _git("tag", "--sort=-v:refname").splitlines()
    for tag in tags:
        if RELEASE_TAG_RE.match(tag) and tag != version:
            return tag
    return None


def _changelog_section(version: str) -> str:
    changelog_path = Path("CHANGELOG.md")
    if not changelog_path.exists():
        return ""
    text = changelog_path.read_text(encoding="utf-8")
    match = re.search(
        rf"^## {re.escape(version)}\b[^\n]*\n(.*?)(?=^## |\Z)",
        text,
        re.MULTILINE | re.DOTALL,
    )
    return match.group(1).strip() if match else ""


def _commit_lines(previous_tag: str | None) -> list[str]:
    log_range = f"{previous_tag}..HEAD" if previous_tag else "HEAD"
    subjects = _git("log", "--no-merges", "--format=%s (%h)", log_range).splitlines()
    return [
        f"- {subject}"
        for subject in subjects
        if subject and not subject.startswith("chore(release):")
    ]


def main() -> int:
    if len(sys.argv) < 2:
        raise SystemExit("usage: generate_release_notes.py <version> [output_path]")
    version = sys.argv[1]
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("release_notes.md")
    repo = os.environ.get("GITHUB_REPOSITORY", "kedube/bambu-chamber-heater")

    previous_tag = _previous_tag(version)
    sections: list[str] = []

    highlights = _changelog_section(version)
    if highlights:
        sections.append(f"## Highlights\n\n{highlights}")

    commits = _commit_lines(previous_tag)
    if commits:
        sections.append("## Commits\n\n" + "\n".join(commits))

    if previous_tag:
        sections.append(
            f"**Full Changelog**: https://github.com/{repo}/compare/{previous_tag}...{version}"
        )

    body = "\n\n".join(sections) if sections else f"Release {version}."
    output_path.write_text(body + "\n", encoding="utf-8")
    print(body)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
