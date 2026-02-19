#!/usr/bin/env python3
"""
Replace repeated Tailwind container pattern with <Container> component.

Pattern: <div className="max-w-5xl mx-auto px-6 lg:px-8[optional extra classes]">
Replace:  <Container [className="extra classes"]>

Also adds the import at the top of each file if not already present.
"""

import re
import sys
from pathlib import Path


CONTAINER_RE = re.compile(
    r'<div\s+className="max-w-5xl mx-auto px-6 lg:px-8([^"]*)">'
)

IMPORT_STMT = 'import { Container } from "@/components/ui";'
IMPORT_RE = re.compile(r'import\s+\{[^}]*Container[^}]*\}')


def find_matching_close(text: str, start: int) -> int:
    """
    Find position of </div> that closes the tag whose content starts at `start`.
    `start` should be the character index immediately after the opening tag's >.
    """
    depth = 0
    i = start
    while i < len(text):
        # Scan for the next open or close div tag
        rest = text[i:]
        open_m = re.search(r'<div[\s>]', rest)
        close_m = re.search(r'</div>', rest)

        has_open = open_m is not None
        has_close = close_m is not None

        if not has_close:
            return -1

        if has_open and open_m.start() < close_m.start():
            depth += 1
            i += open_m.start() + 1
        else:
            if depth == 0:
                return i + close_m.start()
            depth -= 1
            i += close_m.start() + 1

    return -1


def process_file(path: Path) -> tuple[str, int]:
    """Process a file; return (new_content, replacements_count)."""
    original = path.read_text()
    # Work on a mutable list of segments
    # Strategy: find all matches in original, then apply replacements right-to-left
    # so that character positions don't shift for earlier matches.

    matches = list(CONTAINER_RE.finditer(original))
    if not matches:
        return original, 0

    # Collect (open_start, open_end, close_start, close_end, extra_classes)
    patches = []
    for m in matches:
        extra = m.group(1)
        close_start = find_matching_close(original, m.end())
        if close_start == -1:
            print(f"  WARNING: unmatched div at offset {m.start()} in {path}", file=sys.stderr)
            continue
        patches.append((m.start(), m.end(), close_start, close_start + len("</div>"), extra))

    if not patches:
        return original, 0

    # Apply patches right-to-left to keep positions stable
    result = original
    for open_start, open_end, close_start, close_end, extra in reversed(patches):
        extra = extra.strip()
        open_replacement = f'<Container className="{extra}">' if extra else "<Container>"
        close_replacement = "</Container>"
        # Replace close tag first (higher index)
        result = result[:close_start] + close_replacement + result[close_end:]
        result = result[:open_start] + open_replacement + result[open_end:]

    # Add import if not already present
    if not IMPORT_RE.search(result):
        lines = result.split("\n")
        last_import = -1
        for i, line in enumerate(lines):
            if line.startswith("import "):
                last_import = i
        if last_import >= 0:
            lines.insert(last_import + 1, IMPORT_STMT)
            result = "\n".join(lines)

    return result, len(patches)


def main():
    base = Path(__file__).parent.parent / "src"
    target_files = sorted(base.rglob("*.tsx"))

    total = 0
    for f in target_files:
        new_content, count = process_file(f)
        if count > 0:
            f.write_text(new_content)
            print(f"  ✓ {f.relative_to(base.parent)} ({count} replacement{'s' if count != 1 else ''})")
            total += count

    print(f"\nTotal container replacements: {total}")


if __name__ == "__main__":
    main()
