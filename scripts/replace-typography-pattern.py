#!/usr/bin/env python3
"""
Replace repeated Tailwind text patterns with Typography components.

Replacements:
  <span className="text-xs text-slate-500">  →  <Caption>
  <p className="text-xs text-slate-500">     →  <Caption as="p">
  <p className="text-sm text-slate-600">     →  <BodyText>
  <span className="text-sm text-slate-600">  →  <BodyText as="span">

Imports Caption/BodyText from @/components/ui if not already present.
"""

import re
import sys
from pathlib import Path


IMPORT_RE = re.compile(r'import\s+\{([^}]*)\}\s+from\s+"@/components/ui"')
IMPORT_STMT_BASE = 'import {{ {names} }} from "@/components/ui";'

# Patterns: (open_re, close_re, open_replacement, close_replacement, needs_import)
PATTERNS = [
    (
        re.compile(r'<span className="text-xs text-slate-500"( [^>]*)?>'),
        re.compile(r'</span>'),
        lambda m: '<Caption>',
        '</Caption>',
        'Caption',
    ),
    (
        re.compile(r'<p className="text-xs text-slate-500"( [^>]*)?>'),
        re.compile(r'</p>'),
        lambda m: '<Caption as="p">',
        '</Caption>',
        'Caption',
    ),
    (
        re.compile(r'<p className="text-sm text-slate-600"( [^>]*)?>'),
        re.compile(r'</p>'),
        lambda m: '<BodyText>',
        '</BodyText>',
        'BodyText',
    ),
    (
        re.compile(r'<span className="text-sm text-slate-600"( [^>]*)?>'),
        re.compile(r'</span>'),
        lambda m: '<BodyText as="span">',
        '</BodyText>',
        'BodyText',
    ),
]


def find_matching_close(text: str, start: int, tag: str, close_re: re.Pattern) -> int:
    """Find position of closing tag that matches the open tag at start."""
    open_re = re.compile(f'<{tag}[\\s>]')
    depth = 0
    i = start
    while i < len(text):
        rest = text[i:]
        open_m = open_re.search(rest)
        close_m = close_re.search(rest)

        if not close_m:
            return -1

        has_open = open_m is not None and open_m.start() < close_m.start()

        if has_open:
            depth += 1
            i += open_m.start() + 1
        else:
            if depth == 0:
                return i + close_m.start()
            depth -= 1
            i += close_m.start() + 1
    return -1


def update_imports(content: str, needed: set) -> str:
    """Add needed imports to existing @/components/ui import or create new one."""
    existing = IMPORT_RE.search(content)
    if existing:
        current = {s.strip() for s in existing.group(1).split(',') if s.strip()}
        combined = sorted(current | needed)
        new_import = f'import {{ {", ".join(combined)} }} from "@/components/ui";'
        return content[:existing.start()] + new_import + content[existing.end():]
    else:
        # Add after last import
        lines = content.split('\n')
        last_import = -1
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import = i
        if last_import >= 0:
            lines.insert(last_import + 1, f'import {{ {", ".join(sorted(needed))} }} from "@/components/ui";')
        return '\n'.join(lines)


def process_file(path: Path) -> tuple[str, int]:
    content = path.read_text()
    patches = []
    needed_imports = set()

    for open_re, close_re, open_repl_fn, close_repl, import_name in PATTERNS:
        tag = open_re.pattern.split('<')[1].split('[')[0].split('"')[0].strip()
        for m in open_re.finditer(content):
            open_start = m.start()
            open_end = m.end()
            close_start = find_matching_close(content, open_end, tag, close_re)
            if close_start == -1:
                print(f"  WARN: unmatched <{tag}> at offset {open_start} in {path.name}", file=sys.stderr)
                continue
            close_end = close_start + len(close_re.pattern.replace('/', '').replace('<', '').replace('>', ''))
            # Compute actual close tag length
            close_m = close_re.search(content[close_start:])
            if close_m:
                close_end = close_start + close_m.end()
            patches.append((open_start, open_end, close_start, close_end,
                            open_repl_fn(m), close_repl, import_name))

    if not patches:
        return content, 0

    # Sort by open_start descending (right-to-left)
    patches.sort(key=lambda p: p[0], reverse=True)

    result = content
    for open_start, open_end, close_start, close_end, open_repl, close_repl, import_name in patches:
        needed_imports.add(import_name)
        # Replace close tag first (higher index)
        result = result[:close_start] + close_repl + result[close_end:]
        result = result[:open_start] + open_repl + result[open_end:]

    result = update_imports(result, needed_imports)
    return result, len(patches)


def main():
    base = Path(__file__).parent.parent / 'src'
    files = sorted(base.rglob('*.tsx'))

    total = 0
    for f in files:
        # Skip the ui components themselves
        if 'components/ui' in str(f):
            continue
        new_content, count = process_file(f)
        if count > 0:
            f.write_text(new_content)
            print(f"  ✓ {f.relative_to(base.parent)} ({count} replacement{'s' if count != 1 else ''})")
            total += count

    print(f"\nTotal typography replacements: {total}")


if __name__ == '__main__':
    main()
