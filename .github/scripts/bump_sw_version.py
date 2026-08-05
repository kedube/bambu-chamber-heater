"""Determine the next release version and update esphome/settings.yaml.

Used by .github/workflows/release.yml. If the current sw_version has never
been tagged (i.e. it was set by hand to cut a minor/major release), it is
released as-is and the file is left untouched. Otherwise the patch segment
is bumped and the file updated in place. Prints the version to release.
With --print-current, prints the existing version and changes nothing.
"""

from __future__ import annotations

from pathlib import Path
import re
import subprocess
import sys

VERSION_RE = re.compile(r'(sw_version:\s*")([^"]+)(")')


def _bump_patch(version: str) -> str:
    parts = version.split(".")
    if len(parts) != 3 or not all(part.isdigit() for part in parts):
        raise ValueError(f"Expected numeric major.minor.patch version, got: {version}")
    major, minor, patch = (int(part) for part in parts)
    return f"{major}.{minor}.{patch + 1}"


def _tag_exists(version: str) -> bool:
    result = subprocess.run(
        ["git", "tag", "-l", version], check=True, capture_output=True, text=True
    )
    return bool(result.stdout.strip())


def main() -> int:
    args = [arg for arg in sys.argv[1:] if arg != "--print-current"]
    print_current = "--print-current" in sys.argv[1:]
    settings_path = Path(args[0]) if args else Path("esphome/settings.yaml")

    settings_text = settings_path.read_text(encoding="utf-8")
    match = VERSION_RE.search(settings_text)
    if match is None:
        raise ValueError(f"Could not locate sw_version in {settings_path}")

    current_version = match.group(2)
    if print_current:
        print(current_version)
        return 0

    if not _tag_exists(current_version):
        # Hand-set version that was never released: publish it unchanged.
        print(current_version)
        return 0

    next_version = _bump_patch(current_version)
    updated_text = VERSION_RE.sub(rf"\g<1>{next_version}\g<3>", settings_text, count=1)
    settings_path.write_text(updated_text, encoding="utf-8")
    print(next_version)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
