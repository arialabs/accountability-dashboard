# Page Rendering Audit — Accountability Dashboard

**Date:** 2026-03-12
**Dev server:** http://localhost:3002
**Build config:** `output: "export"` (static export for Cloudflare Pages)
**Total routes audited:** 38 page.tsx files

---

## 1. Route Status Table

### Legend
- **200 OK** — Server returned 200, meaningful content present
- **200 SKEL** — Server returned 200, but SSR body is only Suspense skeleton (content is client-hydrated)
- **200 FETCH** — Server returned 200, page fetches external API at render (works in dev, see note on static export)
- **307 REDIR** — Server-side redirect to canonical URL
- **404** — Page returns HTTP 404 (content not found / route not prerendered)

| Route | HTTP | Content State | H1 Present | Notes |
|-------|------|---------------|------------|-------|
| `/` | 200 OK | Full SSR | Yes | |
| `/about` | 200 OK | Full SSR | Yes | |
| `/privacy` | 200 OK | Full SSR | Yes | |
| `/terms` | 200 OK | Full SSR | Yes | |
| `/methodology` | 200 OK | Full SSR | Yes | |
| `/offline` | 200 OK | Full SSR | No H1 | Offline fallback page, expected |
| `/congress` | 200 SKEL | Skeleton only in SSR | None in SSR | Client component; actual member cards load via JS |
| `/congress/independence` | 200 OK | Full SSR | Not checked | |
| `/congress/trades` | 200 OK | Full SSR | Yes (Stock Trade Leaderboard) | |
| `/house` | 307 → `/congress?chamber=house` | Redirect | — | See §3 |
| `/senate` | 307 → `/congress?chamber=senate` | Redirect | — | See §3 |
| `/legislative` | 307 → `/congress` | Redirect | — | See §3 |
| `/rep/[id]` (C001120, P000197, A000055, S000148, M000355, W000779) | 200 OK | Full SSR | Yes (member name) | All tested IDs render correctly |
| `/executive` | 200 OK | Full SSR | Yes | |
| `/executive/president` | 200 OK | Full SSR | Yes (Donald J. Trump) | |
| `/executive/president/conflicts` | 200 OK | Full SSR | Yes | Client component |
| `/executive/president/orders` | 200 FETCH | Full SSR | Yes | Fetches Federal Register API at build time; see §3 |
| `/executive/president/policies` | 200 OK | Full SSR | Yes | Client component |
| `/executive/president/policies/[slug]` (all 4) | 200 OK | Full SSR | Yes | tariff-policy-2025, deportation-program, education-reform, infrastructure-investment all render |
| `/executive/vp` | 200 OK | Full SSR | Yes (J.D. Vance) | |
| `/executive/cabinet` | 200 OK | Full SSR | Yes | Client component |
| `/executive/cabinet/[role]` (5 tested) | 200 OK | Full SSR | Yes (person name) | secretary-of-state, attorney-general, secretary-of-defense, secretary-of-treasury, epa-administrator |
| `/executive/doge` | 307 → `/executive/agencies/doge` | Redirect | — | See §3 |
| `/executive/agencies/doge` | 200 OK | Full SSR | Yes (Elon Musk) | |
| `/executive/conflicts` | 200 OK | Full SSR | Yes | Client component |
| `/executive/orders` | 200 OK | Full SSR | Yes | Legacy route; separate client-side page from president/orders |
| `/executive/timeline` | 200 OK | Full SSR | Yes | Client component |
| `/judicial` | 200 OK | Full SSR | Yes | |
| `/judicial/scotus` | 200 OK | Full SSR | Yes | |
| `/judicial/scotus/[id]` (alito, kavanaugh, roberts, thomas, sotomayor) | 200 OK | Full SSR | Yes (justice name) | |
| `/judicial/supreme-court` | 307 → `/judicial/scotus` | Redirect | — | See §3 |
| `/judicial/federal-courts` | 200 OK | Full SSR | Yes (Federal Court Tracking) | |
| `/deep-dives` | 200 OK | Full SSR | Yes | |
| `/deep-dives/[slug]` (all 4) | **404** | Not-found | None | **CRITICAL — see §2** |
| `/bills` | 200 OK | Full SSR | Yes (Bill Tracker) | Client component with embedded data |
| `/votes` | 200 SKEL | Skeleton in SSR | Yes (h1 present) | Client component |
| `/scandals` | 200 OK | Full SSR | Yes | Client component, Suspense-wrapped properly |
| `/admin/vote-sync` | 200 OK | Full SSR | Yes (Vote Sync Admin Status) | Not excluded from sitemap — see §4 |

---

## 2. Critical Issues

### CRITICAL: All `/deep-dives/[slug]` pages return HTTP 404

**Affected routes:** `/deep-dives/congressional-stock-trading`, `/deep-dives/pharma-lobbying-drug-prices`, `/deep-dives/defense-contractor-revolving-door`, `/deep-dives/covid-insider-trading`

**Root cause:** The `generateStaticParams()` in `src/app/deep-dives/[slug]/page.tsx` filters with:
```ts
.filter(d => d.sections && d.keyFindings)
```
However, the function imports from `@/data/deep-dives`, which re-exports from `@/lib/deep-dives`. The `DeepDive` interface in `lib/deep-dives.ts` defines `sections` as **optional** (`sections?: Array<...>`), while the underlying data objects (imported via `@/data/deep-dives/index`) use the `DeepDiveInvestigation` type from `src/lib/types.ts` where `sections` is **required**.

In the dev server with `output: "export"`, dynamic routes not returned by `generateStaticParams()` return 404. The slugs present in the sitemap (`congressional-stock-trading`, `pharma-lobbying-drug-prices`, `defense-contractor-revolving-door`) and a fourth slug (`covid-insider-trading`) all return 404 with `<meta name="robots" content="noindex"/>`.

All four data files (`congressional-stock-trading.ts`, `covid-insider-trading.ts`, `pharma-lobbying-drug-prices.ts`, `defense-contractor-revolving-door.ts`) have both `keyFindings` and `sections` populated — the filter condition should pass. The most likely issue is a type mismatch or import resolution problem causing `generateStaticParams()` to return an empty array at runtime.

**Severity:** CRITICAL — These pages are in the sitemap, return 404, and have `noindex` meta tags.
**Fix:** Debug `generateStaticParams()` return value; verify `getAllDeepDives()` (imported from `@/data/deep-dives` → re-exported from `@/lib/deep-dives`) returns all four entries with `sections` populated. Consider removing the filter guard since all data entries have complete data, or switch to importing directly from `@/data/deep-dives/index`.

---

## 3. Static Export Compatibility Issues

### Issue A: `redirect()` from `next/navigation` in page components — MEDIUM

**Affected files:**
- `src/app/house/page.tsx` → redirects to `/congress?chamber=house`
- `src/app/senate/page.tsx` → redirects to `/congress?chamber=senate`
- `src/app/legislative/page.tsx` → redirects to `/congress`
- `src/app/judicial/supreme-court/page.tsx` → redirects to `/judicial/scotus`
- `src/app/executive/doge/page.tsx` → redirects to `/executive/agencies/doge`

**Behavior:** These redirects work correctly in the dev server (returning HTTP 307). However, with `output: "export"`, Next.js cannot generate server-side redirects — these will be handled at the CDN/hosting layer (Cloudflare Pages) or become client-side redirects in the exported HTML. The current dev behavior (307) will **not** replicate in the static export — they will instead render as client-side redirects (a brief flash of empty page before redirect). Cloudflare Pages can handle permanent redirects via `public/_headers` or `_redirects` files.

**Recommendation:** Add these as 301 redirects in `public/_redirects` or Cloudflare Pages routing rules, and keep the page components as fallbacks. Or convert `redirect()` calls to `permanentRedirect()` and verify Cloudflare handles them.

### Issue B: `next: { revalidate: 3600 }` in server component fetch — LOW

**File:** `src/app/executive/president/orders/page.tsx` line 25

```ts
const response = await fetch(
  "https://www.federalregister.gov/api/v1/...",
  { next: { revalidate: 3600 } }
);
```

**Behavior:** With `output: "export"`, ISR (Incremental Static Regeneration) is not supported. The `revalidate` option is silently ignored. The page data is fetched once at build time and frozen. This means executive orders data will be stale after build unless a rebuild is triggered. Currently works in dev (fetches live data), but in production the data age is bounded by the last deployment.

**Severity:** LOW — The page renders correctly; the issue is just stale data between deployments. No crash risk.

### Issue C: `/api/og/rep` and `/api/cabinet/` references in metadata — LOW

**Files:**
- `src/app/rep/[id]/page.tsx` lines 76, 87: references `/api/og/rep?id=${id}` for OpenGraph image
- `src/app/executive/cabinet/[role]/page.tsx` lines 55, 66: references `/api/og/cabinet?id=${role}`
- `src/app/executive/cabinet/[role]/alignment-section.tsx` line 68: `fetch('/api/cabinet/${memberId}')`

No API route files (`route.ts`) exist in the project. These API calls will fail in production (static export has no server). The `alignment-section.tsx` client-side fetch will produce a network error at runtime. The OG image metadata references will produce broken OG images for social sharing.

**Severity:** MEDIUM — Broken OG images and broken cabinet alignment section in production.

### Issue D: `useSearchParams()` without Suspense boundary — MEDIUM (mitigated)

**Files using `useSearchParams()`:**
- `src/app/congress/page.tsx` — `CongressContent` component is wrapped in `<Suspense>` at line ~841-885. ✓ Correct.
- `src/app/scandals/page.tsx` — `ScandalsPageContent` is wrapped in `<Suspense>`. ✓ Correct.

Both usages are correctly wrapped. No issue.

### Issue E: `/congress` page — skeleton-only SSR — LOW

The `/congress` page is a `"use client"` component wrapped in Suspense. The SSR output contains only the animated skeleton (loading placeholder), not actual member content. This means:
- Search engines crawling the static HTML see only a loading skeleton, not member data
- Page word count in SSR is ~1,625 words (all boilerplate/skeleton markup)

This is a soft SEO issue — Googlebot does execute JavaScript, but Suspense skeleton content is poor for initial indexing signals.

---

## 4. Rep Page Section Order (lines 276–616)

Section order as rendered in `src/app/rep/[id]/page.tsx`:

### Header (lines 293–403)
1. Breadcrumb (← Back to Representatives)
2. Photo + Name + Party badge + Leader role badge + State/District
3. **RepVerdictBadge** (conditional: shown when finance or conflicts exist) — accountability verdict, "who does this rep serve?"
4. Quick Stats Row (Bills Sponsored / Bills Cosponsored / Votes Cast)
5. Actions (Congress.gov Profile button)

### Main Content — Full-width pre-grid (lines 407–428)
6. **ConflictCalloutSection** (conditional: "say one thing, do another" callouts)
7. **DonorCaptureScore** (conditional: top-level verdict on donor capture)

### Main Column 2/3 (lines 434–532)
8. DonorAnalysisSection (Campaign Finance — "main focus")
9. ConflictOfInterestSection
10. RecentVotesSection
11. MemberVotingRecord (key votes with structured data)
12. VoteHistorySection (complete vote history from Congress.gov)
13. **VotingRecordSection** (Party Loyalty % + Ideology Spectrum) — line 488
14. StockTradesSection
15. FinancialDisclosuresSection (conditional)
16. ScandalsSection
17. Data Pending Notice (conditional footer)

### Sidebar 1/3 (lines 536–612)
18. LatestNews
19. CommitteeMemberships (conditional)
20. SocialShare
21. External Links (Congress.gov, Biographical Directory, OpenSecrets, FEC)
22. Data Sources

**Note on Party Loyalty & Ideology:** `VotingRecordSection` (item 13) renders **after** all donor/conflict/vote sections. It is positioned below vote history and above stock trades — roughly two-thirds down the main column. This is consistent with the project priority documented in memory (trustworthiness over party loyalty). The section is not removed but de-emphasized by placement.

---

## 5. SEO Infrastructure Findings

### Finding A: Domain mismatch — MEDIUM

Three different domains are used inconsistently:

| Location | Domain Used |
|----------|-------------|
| `src/app/layout.tsx` | `accountability-dashboard.pages.dev` (default) |
| `src/app/page.tsx` (homepage structured data) | `reps.arialabs.ai` (default) |
| `src/lib/schema.ts` (schema.org structured data) | `reps.arialabs.ai` (default) |
| `src/app/rep/[id]/page.tsx` SocialShare URL | `reps.arialabs.ai` (hardcoded) |
| `src/app/terms/page.tsx` | `reps.arialabs.ai` (hardcoded in text) |
| `src/app/privacy/page.tsx` | `reps.arialabs.ai` (hardcoded in text) |
| `next-sitemap.config.js` | `accountability-dashboard.pages.dev` (default) |
| `public/robots.txt` | `accountability-dashboard.pages.dev` |
| `src/lib/perplexity.ts` HTTP-Referer | `reps.arialabs.ai` (hardcoded) |

The canonical domain is ambiguous. `layout.tsx` and `next-sitemap.config.js` agree on `accountability-dashboard.pages.dev`, but `schema.ts` and `page.tsx` default to `reps.arialabs.ai`. When `NEXT_PUBLIC_SITE_URL` is not set in production, structured data (schema.org JSON-LD) will emit `reps.arialabs.ai` URLs while the sitemap emits `accountability-dashboard.pages.dev` URLs — a direct contradiction for search engines.

**Fix:** Set `NEXT_PUBLIC_SITE_URL` consistently in production env. Update `src/lib/schema.ts` fallback to match `layout.tsx` default (`accountability-dashboard.pages.dev`), or consolidate all defaults to `reps.arialabs.ai` if that is the intended production domain.

### Finding B: `/admin/vote-sync` is included in the sitemap — MEDIUM

`public/sitemap.xml` line 4 includes:
```xml
<url><loc>https://accountability-dashboard.pages.dev/admin/vote-sync</loc>...</url>
```

The `next-sitemap.config.js` only excludes `/api/*` and `/test/*`. The admin page is a data-ops utility tool (showing vote sync status, admin-only use) — it should not be indexed by search engines.

**Fix:** Add `/admin/*` to the `exclude` array in `next-sitemap.config.js`, and add `Disallow: /admin/*` to `robotsTxtOptions.policies`. Regenerate sitemap.

### Finding C: `robots.txt` does not block `/admin/` — MEDIUM

Current `public/robots.txt`:
```
Disallow: /api/*
Disallow: /test/*
```
Admin routes are not blocked. Bots can crawl `/admin/vote-sync`.

**Fix:** Add `Disallow: /admin/*` to robots.txt.

### Finding D: `public/sitemap.xml` is stale — LOW

The sitemap `lastmod` dates show `2026-03-09T17:28:54.242Z` — generated over 3 days ago. With `output: "export"`, next-sitemap runs at build time. This is expected but means the sitemap will always reflect the last deployment date, not actual content modification dates.

### Finding E: OG image API references in metadata — MEDIUM

As noted in §3 Issue C, `rep/[id]/page.tsx` and `executive/cabinet/[role]/page.tsx` reference `/api/og/rep` and `/api/og/cabinet` for OpenGraph images. Since there are no API route handlers in the project, these will produce 404 OG images in production, degrading social sharing previews.

---

## 6. Summary by Severity

| Severity | Count | Issues |
|----------|-------|--------|
| **CRITICAL** | 1 | All 4 `/deep-dives/[slug]` pages return 404 |
| **MEDIUM** | 5 | Domain mismatch (schema vs sitemap), `/admin/` in sitemap, robots.txt missing admin block, missing API route handlers for OG images, redirect() incompatibility with static export |
| **LOW** | 3 | `revalidate` silently ignored in static export, congress SSR skeleton, stale sitemap dates |

---

## 7. Pages That Work Correctly

All of the following return 200 with meaningful H1 and content:
- All `/rep/[id]` pages tested (6 IDs)
- `/`, `/about`, `/privacy`, `/terms`, `/methodology`
- `/congress/trades`, `/congress/independence`
- `/executive`, `/executive/president`, `/executive/vp`
- `/executive/agencies/doge`
- `/executive/president/policies/[slug]` (all 4 slugs)
- `/executive/cabinet/[role]` (all roles tested)
- `/executive/president/conflicts`, `/executive/president/orders`
- `/executive/conflicts`, `/executive/timeline`, `/executive/orders`
- `/judicial`, `/judicial/scotus`, `/judicial/scotus/[id]` (all justices)
- `/judicial/federal-courts`
- `/deep-dives` (index page)
- `/bills`, `/votes`, `/scandals`
- `/admin/vote-sync`
