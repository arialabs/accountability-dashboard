# Asset Audit Findings

**Audit Date:** 2026-03-12
**Scope:** Image coverage, orphan files, fallback behavior, PWA assets

---

## Summary

| Check | Status | Details |
|---|---|---|
| Congressional member image coverage | Near-complete | 537/538 valid URLs; 1 malformed |
| Cabinet image coverage | Complete | All 16 cabinet members have local images confirmed on disk |
| Executive extras (Trump, Vance, Musk, Vivek, Farritor) | All referenced | Used in doge.ts / executive page |
| Orphan images in officials/ | 1 confirmed orphan | vance-placeholder.svg unused |
| Orphan data files | 1 confirmed | scotus.json.backup |
| PWA icons | Complete | All manifest-referenced PNGs present and valid |
| favicon.ico | Missing | Only favicon.svg present; no .ico fallback |

---

## 1. Representative Image Coverage

**Source:** `src/data/members.json`
**Component:** `src/components/RepresentativeImage.tsx`

### Coverage statistics

- **Total members:** 538
- **With photo_url set:** 538 (100%)
- **With photo_url null/missing:** 0
- **Valid http/https format:** 537
- **Malformed URL:** 1 (see below)

### URL domain breakdown

All 538 `photo_url` values use the `www.congress.gov/img/member/` format:

```
https://www.congress.gov/img/member/<hash>_200.jpg
```

### Malformed URL — Ashley Moody (M001244)

**Bug:** The `photo_url` for bioguide ID `M001244` has a double-prefixed URL — a bioguide URL was concatenated onto the congress.gov image prefix:

```
https://www.congress.gov/img/member/https://bioguide.congress.gov/photo/695d82c8550dfb80c3063bee.jpg
```

This is clearly a pipeline concatenation error. The URL will fail to load at runtime, so the component will fall through to the bioguide.congress.gov fallback (which uses a different path format anyway) and then to theunitedstates.io, then finally to the "AM" initials avatar.

**Fix:** Set `photo_url` for M001244 to the correct congress.gov URL or leave it null and let the bioguide fallback handle it.

### Fallback chain (RepresentativeImage.tsx)

The component implements a 3-step fallback chain, then initials:

1. `photoUrl` prop (from members.json `photo_url`)
2. `https://bioguide.congress.gov/bioguide/photo/{id[0]}/{id}.jpg`
3. `https://theunitedstates.io/images/congress/225x275/{id}.jpg`
4. Initials avatar (colored by party: blue D, red R, purple I)

Note: The primary `photo_url` values use `www.congress.gov/img/member/<hash>` format, which is distinct from the step-2 bioguide fallback format. Both are external URLs and use `unoptimized` in the Next.js Image component, bypassing Next.js image optimization.

---

## 2. Cabinet / Executive Image Coverage

**Source:** `src/data/cabinet.json` (`members` array, 16 entries)
**Images:** `public/images/officials/`

### Files on disk (22 files)

```
bessent.jpg, bondi.jpg, burgum.jpg, chavez-deremer.jpg, collins.jpg,
duffy.jpg, farritor.jpg, hegseth.jpg, kennedy.jpg, lutnick.jpg,
mcmahon.jpg, musk.jpg, noem.jpg, rollins.jpg, rubio.jpg, trump.jpg,
turner.jpg, vance-placeholder.svg, vance.jpg, vivek.jpg, wright.jpg,
zeldin.jpg
```

### Cabinet.json cross-reference (16 members)

All 16 cabinet members have `photo_url` set to `/images/officials/<name>.jpg`, and all 16 files are confirmed present on disk:

| Member | photo_url | On Disk |
|---|---|---|
| Marco Rubio | /images/officials/rubio.jpg | Yes |
| Pete Hegseth | /images/officials/hegseth.jpg | Yes |
| Pam Bondi | /images/officials/bondi.jpg | Yes |
| Scott Bessent | /images/officials/bessent.jpg | Yes |
| Robert F. Kennedy Jr. | /images/officials/kennedy.jpg | Yes |
| Kristi Noem | /images/officials/noem.jpg | Yes |
| Lee Zeldin | /images/officials/zeldin.jpg | Yes |
| Doug Burgum | /images/officials/burgum.jpg | Yes |
| Brooke Rollins | /images/officials/rollins.jpg | Yes |
| Howard Lutnick | /images/officials/lutnick.jpg | Yes |
| Lori Chavez-DeRemer | /images/officials/chavez-deremer.jpg | Yes |
| Sean Duffy | /images/officials/duffy.jpg | Yes |
| Chris Wright | /images/officials/wright.jpg | Yes |
| Linda McMahon | /images/officials/mcmahon.jpg | Yes |
| Doug Collins | /images/officials/collins.jpg | Yes |
| Scott Turner | /images/officials/turner.jpg | Yes |

### Extra images (not in cabinet.json)

6 files in `public/images/officials/` are not referenced by `cabinet.json`. All 6 are accounted for by other source files:

| File | Referenced By |
|---|---|
| trump.jpg | `src/app/executive/page.tsx` (hardcoded `<Image src=...>`) |
| vance.jpg | `src/app/executive/page.tsx` (hardcoded `<Image src=...>`) |
| musk.jpg | `src/data/doge.ts` (`photoUrl` field) + `src/app/executive/page.tsx` |
| vivek.jpg | `src/data/doge.ts` (DOGE staff member `photoUrl`) |
| farritor.jpg | `src/data/doge.ts` (DOGE staff member `photoUrl`) |
| vance-placeholder.svg | **No references found — orphan file** |

### VP image

`src/data/vp.json` uses an external congress.gov URL for J.D. Vance:
```
https://www.congress.gov/img/member/v000137_200.jpg
```
No local file required. `vance.jpg` in officials/ is used by the executive page directly (not via vp.json).

---

## 3. Orphan Files

### Confirmed orphans

#### `src/data/scotus.json.backup`

- Both the active `scotus.json` and the backup contain identical 9-justice lists (Roberts, Thomas, Alito, Sotomayor, Kagan, Gorsuch, Kavanaugh, Barrett, Jackson).
- The backup has no code references and serves no runtime purpose.
- **Recommendation:** Delete. If version history is needed, git provides it.

#### `public/images/officials/vance-placeholder.svg`

- 287-byte SVG file.
- No references found in any `.tsx` or `.ts` source file.
- `vance.jpg` (35KB) is the active image used in `src/app/executive/page.tsx`.
- **Recommendation:** Delete.

### Data files with no runtime imports (pipeline/script output only)

These files are written by build scripts/pipelines and not imported by application code. They are not orphans in a harmful sense but are worth documenting:

| File | Written By | Status |
|---|---|---|
| `src/data/alignment-summary.json` | `scripts/compute-scores.ts`, `scripts/calculate-alignment.ts` | Pipeline output; consumed indirectly via computed state in `CampaignPositions.tsx` (uses `alignmentSummary` computed from `alignment-scores.json`, not this file directly) |
| `src/data/icpsr-to-bioguide.json` | `scripts/build-icpsr-map.ts` | Lookup table; the inverse map `bioguide-to-icpsr.json` is imported by app code |
| `src/data/usaspending-sync-status.json` | `pipeline/sync-usaspending.ts` | Sync metadata file; not consumed by UI |
| `src/data/executive-types.ts` | Hand-authored | Type definitions file; no imports found in source — types may be duplicated inline elsewhere |

**Recommendation for `executive-types.ts`:** Verify whether any component is actually using these TypeScript interfaces. If not, either wire them in as the canonical type source or delete to avoid type definition drift.

---

## 4. PWA and Icon Assets

**Manifest:** `public/site.webmanifest`

### Icon coverage

All 10 PNG icons declared in `site.webmanifest` are present on disk and verified as valid PNG files:

| File | Size | Format |
|---|---|---|
| icon-72x72.png | 671 B | PNG 72×72 RGBA |
| icon-96x96.png | 844 B | PNG 96×96 |
| icon-128x128.png | 1.1 KB | PNG 128×128 |
| icon-144x144.png | 1.2 KB | PNG 144×144 |
| icon-152x152.png | 1.5 KB | PNG 152×152 |
| icon-192x192.png | 1.6 KB | PNG 192×192 |
| icon-384x384.png | 3.6 KB | PNG 384×384 |
| icon-512x512.png | 5.1 KB | PNG 512×512 |
| icon-maskable-192x192.png | 1.4 KB | PNG 512×512 RGBA |
| icon-maskable-512x512.png | 4.4 KB | PNG 512×512 RGBA |
| favicon.svg | 117 B | SVG |

SVG variants of all icon sizes also exist (`icon-72x72.svg` etc.) but are not declared in the manifest — they appear to be source files used to generate the PNGs.

### Screenshot assets

Both manifest-referenced screenshots are present:
- `screenshot-mobile.png` (12 KB, 540×720)
- `screenshot-desktop.png` (26 KB, 1280×720)

### OG and logo assets

Both referenced by layout.tsx and schema.ts:
- `og-image.png` (160 KB) — present
- `logo.png` (70 KB) — present

### Missing: favicon.ico

`public/` contains `favicon.svg` only. There is no `favicon.ico`. Most modern browsers support SVG favicons, but Internet Explorer and some older Chromium-based tools fall back to `.ico`. The layout.tsx icon metadata only declares the SVG:

```tsx
icons: {
  icon: [
    { url: "/favicon.svg", type: "image/svg+xml" },
    ...
  ]
}
```

**Recommendation (low priority):** Generate a `favicon.ico` (typically 32×32 or multi-size) for maximum compatibility. Not urgent for a modern dashboard.

### Missing: apple-touch-icon

`src/app/layout.tsx` references `/icon-192x192.png` as `apple-touch-icon` via an inline `<link>` tag. The file exists. However, the conventional name is `apple-touch-icon.png` at the root, which Apple devices may look for automatically. The explicit `<link rel="apple-touch-icon">` tag overrides this, so the current setup is functionally correct.

---

## Prioritized Findings

### P1 — Bug (fix immediately)

1. **Malformed `photo_url` for Ashley Moody (M001244)** — `src/data/members.json`
   - URL is broken due to pipeline concatenation error
   - Correct URL: extract the bioguide hash and construct proper congress.gov URL, or set to null
   - Current behavior: falls through to bioguide → theunitedstates.io → "AM" initials

### P2 — Cleanup (next housekeeping pass)

2. **Delete `src/data/scotus.json.backup`** — identical content to active file, no code references
3. **Delete `public/images/officials/vance-placeholder.svg`** — no code references, superseded by vance.jpg

### P3 — Investigate (low urgency)

4. **`src/data/executive-types.ts` has no import references** — either wire it in as the canonical type source or delete to prevent type drift
5. **`src/data/icpsr-to-bioguide.json`** — the inverse mapping file (`bioguide-to-icpsr.json`) is used by app code; this direction is only used by the build script. Document or move to `scripts/` if it has no runtime use.
6. **`favicon.ico` absent** — low compatibility risk for a modern web app, but worth generating

### P4 — Monitor (no action required now)

7. **PNG icon file sizes are small** (672 B – 5.1 KB for 512×512 icons) — confirmed valid PNGs via `file` command; sizes are small because the icons appear to be simple single-color logo marks, not photographs. No issue.
8. **All 538 congress member photo_urls are external** — no local copies. If congress.gov changes URL patterns (as has happened historically), the fallback chain to theunitedstates.io provides one safety net, but both could eventually break. Consider a periodic health check or local caching strategy for production.
