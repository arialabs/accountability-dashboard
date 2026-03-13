# Data Flow & API Audit — Accountability Dashboard

**Audited:** 2026-03-12
**Scope:** `src/lib/data.ts`, `src/lib/api-client.ts`, `src/lib/conflict-detector.ts`, `src/lib/conflict-callouts.ts`, `src/hooks/*.ts`, `src/app/rep/[id]/page.tsx`, and all component JSON imports.

---

## 1. Entity–Loader–Consumer Table

| Entity | Source File(s) | Loader Function(s) | Consumer(s) | Build-time or Runtime |
|---|---|---|---|---|
| **Members** | `src/data/members.json` | `getMembers()`, `getMember()` in `data.ts` | `rep/[id]/page.tsx`, `og-utils.ts`, `leaderboard.ts` (static); `useLiveMembers()` (live) | **Both**: static JSON imported at build; `useLiveMembers` fetches from `/api/members` at runtime |
| **Finance** | `src/data/finance.json` (static) + OpenFEC API (live) | `getMemberFinanceStatic()` (static), `getMemberFinance()` (async, live-first) | `rep/[id]/page.tsx`, `congress/page.tsx` (via `getMemberFinanceStatic`), `og-utils.ts`, `RepSearch.tsx` (direct JSON import) | **Both**: static JSON bundled; live FEC calls skipped at build (`NEXT_PHASE` guard) |
| **Votes / Key Votes** | `src/data/key-votes.json` | Direct `import keyVotesData from "@/data/key-votes.json"` | `rep/[id]/page.tsx`, `votes/page.tsx`, `leaderboard.ts`, `CampaignPositions.tsx` | **Build-time** (static JSON) |
| **Recent / Live Votes** | `src/data/live-votes.json`, `src/data/vote-sync-status.json` | `getRecentVotesForMember()`, `getVoteSyncStatus()` in `live-votes.ts` | `rep/[id]/page.tsx` → `RecentVotesSection` | **Build-time** (static JSON, refreshed by pipeline) |
| **Trades** | `public/data/trades/[bioguideId].json` (per-member split files) | Client-side `fetch("/data/trades/${id}.json")` in `StockTradesSection.tsx` | `StockTradesSection` | **Runtime** (client-side fetch from static assets) |
| **Scandals** | `src/data/scandals.json` | `getMemberScandals()`, `getAllScandals()` in `data.ts` | `ScandalsSection` (via `data.ts`), `page.tsx` (direct import) | **Build-time** (static JSON) |
| **Disclosures** | `src/data/house-disclosures.json` | `getMemberDisclosures()` in `data.ts` | `rep/[id]/page.tsx` → `FinancialDisclosuresSection` | **Build-time** (static JSON) |
| **Conflicts of Interest** | OpenFEC API (Schedule A contributions) + `key-votes.json` | `detectConflicts()` in `conflict-detector.ts`, called from `rep/[id]/page.tsx` lines 127–162 | `ConflictOfInterestSection`, `DonorCaptureScore`, `RepVerdictBadge` | **Runtime-only** (skipped at build via `isBuildTime` guard — always empty on deployed static site) |
| **Conflict Callouts** | `finance.top_contributors` (from static JSON) + `key-votes.json` + `bioguide-to-icpsr.json` | `getConflictCallouts()` in `conflict-callouts.ts` | `rep/[id]/page.tsx` → `ConflictCalloutSection` | **Build-time** (uses static finance data, no live calls) |
| **Alignment Scores** | `src/data/alignment-scores.json` | `getMemberAlignment()`, `getAllAlignmentScores()` in `data.ts`; `getMemberAlignmentEnhanced()` in `data-enhanced.ts` | `rep/[id]/page.tsx` (for schema), `leaderboard.ts` | **Build-time** (static JSON) |
| **Donor Percentiles** | `src/data/donor-percentiles.json` | `loadDonorPercentiles()` in `donor-percentiles.ts` (dynamic `require()`, returns null on miss) | `rep/[id]/page.tsx` → `DonorAnalysisSection` | **Build-time** (static JSON, safe-loaded) |
| **Supreme Court** | `src/data/scotus.json` | `getSupremeCourtJustices()`, `getSupremeCourtJustice()` in `data.ts` | SCOTUS pages | **Build-time** (static JSON) |
| **USASpending** | `src/data/usaspending.json` | `getUSASpendingStore()`, `getAgencySpendingByDepartment()` in `data.ts` | Executive agency pages, `AgencyBudget.tsx` (also imports `cabinet-spending.json` directly) | **Build-time** (static JSON) |
| **News** | `src/data/news-cache.json` (optional) + `/api/research` (Perplexity) | `require("@/data/news-cache.json")` with try/catch in `rep/[id]/page.tsx`; client-side `fetch("/api/research")` in `LatestNews.tsx` | `LatestNews` component | **Both**: static cache at build (optional), live Perplexity fetch at runtime |
| **API Members (live)** | `https://reps-api.arialabs.ai/api/members` | `fetchMembers()` in `api-client.ts`, consumed by `useLiveMembers()` hook | `congress/page.tsx`, `CongressContentLive.tsx` | **Runtime** (client-side SWR-like hook) |
| **Leaderboard** | `https://reps-api.arialabs.ai/api/leaderboard` | `fetchLeaderboard()` in `api-client.ts`, consumed by `useLeaderboard()` hook | `AlignmentLeaderboardLive.tsx` | **Runtime** (client-side hook) |

---

## 2. Conflict Detection — Build-Time Compatibility

### What `detectConflicts()` needs

`detectConflicts()` in `src/lib/conflict-detector.ts` takes two arguments:
1. `industries: IndustryTotal[]` — an array of donor industries with totals and display names, produced by `aggregateByIndustry()` applied to raw Schedule A FEC contribution records.
2. `votes: Array<{bill, title, category, date, vote, description?}>` — member vote records from `key-votes.json`.

The vote data (argument 2) is already static — it comes directly from `key-votes.json` at build time. The blocker is argument 1: the calling code in `rep/[id]/page.tsx` (lines 127–162) always fetches industry data from the live FEC API (via `searchCandidateByName` + `getScheduleAContributions`), and this entire block is guarded by `!isBuildTime`, meaning it is **always skipped at build time**, producing an empty `conflicts` array on the deployed site.

### What static `finance.json` provides

`finance.json` stores `top_industries: IndustryDonation[]` per member, with fields `industry`, `total`, `pac_amount`, `individual_amount`. The `IndustryTotal` type expected by `detectConflicts()` has fields `industry`, `displayName`, `icon`, `total`. The static data is **close but not identical** — it is missing `displayName` and `icon`.

### What `conflict-callouts.ts` does differently (and correctly)

`getConflictCallouts()` uses `finance.top_contributors` (names + totals) from the static JSON, then classifies them into industry buckets using keyword matching via `INDUSTRIES` in `industry-classifier.ts`. This approach needs **no live API calls** and runs fully at build time. It is the correct pattern.

### What changes are needed to fix `detectConflicts()` for static builds

The call site in `rep/[id]/page.tsx` lines 127–162 must be refactored. Instead of making live FEC calls, it should:
1. Use `finance.top_industries` from the static `finance.json` already loaded into the `finance` variable.
2. Map each `IndustryDonation` entry to `IndustryTotal` by looking up `displayName` and `icon` from `INDUSTRIES` in `industry-classifier.ts` using the `industry` key.
3. Remove the `!isBuildTime` guard entirely so conflict detection runs at build time.

The `getConflictCallouts()` approach already demonstrates this is viable — it uses the same `INDUSTRIES` lookup and static finance data without any live calls.

---

## 3. API Client and SWR Hooks

### Hook design

All hooks use `useApi<T>()` from `src/hooks/useApi.ts`, which is a hand-rolled `useEffect`-based fetcher (not SWR). It:
- Sets `loading: true` on mount.
- Sets `error: string | null` on failure with no automatic retry.
- Does **not** fall back to static data when the API is down — callers receive `data: null`.

**Graceful degradation assessment:** The hooks themselves surface an error message (`error` field) but leave it to the consuming component to decide what to render. `CongressContentLive.tsx` and `congress/page.tsx` both consume `useLiveMembers()` and must handle `loading` and `error` states. If `reps-api.arialabs.ai` is down, the Congress listing page shows no members. There is **no static fallback** wired into the hooks.

### ApiMember vs Member field mismatch

| Field in `ApiMember` | Field in `Member` | Mismatch? |
|---|---|---|
| `party_loyalty_pct` | `party_alignment_pct` | **Yes** — different names. `transformApiMember()` in `useLiveData.ts` handles the rename correctly. |
| `votes_against_party` | (absent) | `ApiMember` has this field; `Member` does not. It is silently dropped. |
| `senate_class`, `next_election` | present in `Member` | `ApiMember` does not return these; they will be `undefined` after transform. |

The transform function in `useLiveData.ts` correctly maps `party_loyalty_pct → party_alignment_pct`. The dropped fields (`votes_against_party`, `senate_class`, `next_election`) are not currently rendered, so this is low-risk but represents a silent data loss.

### Which pages use hooks vs. static data

| Page / Component | Members source |
|---|---|
| `src/app/congress/page.tsx` | `useLiveMembers()` hook (live API) |
| `src/components/CongressContentLive.tsx` | `useLiveMembers()` hook (live API) |
| `src/components/AlignmentLeaderboardLive.tsx` | `useLeaderboard()` hook (live API) |
| `src/app/rep/[id]/page.tsx` | `getMember()` / `getMemberFinance()` from `data.ts` (static + conditional live FEC) |
| `src/app/page.tsx` (home) | Direct JSON imports (`leadership-finance.json`, `scandals.json`, `key-votes.json`, etc.) |
| `src/app/votes/page.tsx` | Direct JSON import (`key-votes.json`) |
| `src/components/RepSearch.tsx` | Direct JSON import (`finance.json`) |

**Note:** `useMembers()` in `src/hooks/useMembers.ts` and `useVotes()` in `src/hooks/useVotes.ts` are defined but **not imported anywhere in the codebase** — they appear to be dead code.

---

## 4. LatestNews Data Flow

**`src/data/news-cache.json` does not exist.** The file is loaded at the top of `rep/[id]/page.tsx` via a `try/catch require()`, so missing cache is handled safely: `newsCache` remains `undefined`, and `staticCache` prop passed to `LatestNews` is `undefined`.

When `staticCache` is undefined and the user has not clicked "Load Latest News":
- The component renders a collapsed state with a "Load Latest News" button.
- No network requests are made.

When the user clicks the button:
- `fetch("/api/research?id=${bioguideId}")` is called — this is a **Next.js API route** (`/api/research`).
- Since the app uses `output: "export"` for static deployment, **Next.js API routes are not available on Cloudflare Pages**.
- The fetch will return a 404, triggering the error state: "Could not load news: API error: 404".

**Deployed behavior:** The "Load Latest News" button always fails on the deployed static site because `/api/research` is a server-side route that cannot exist in a static export. The static cache fallback was designed for this scenario but the cache file has never been generated (`pnpm run research:fetch` has not been run).

---

## 5. Turso Database Usage

Turso (`@libsql/client`) is present in `node_modules` and referenced only in:
- `pipeline/lib/db.ts` — creates a Turso client from `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` env vars.
- `pipeline/sync-usaspending.ts` — imports from `pipeline/sources/usaspending.ts` (not from `db.ts` directly).

**No file in `src/` imports from `pipeline/lib/db.ts` or `@libsql/client`.** Turso is used exclusively by data pipeline scripts that run offline to produce the static JSON files committed to `src/data/`. It is **never queried at page render time**.

**Recommendation:** Keep Turso as-is. It belongs entirely in the pipeline layer and is correctly isolated from the Next.js app. No changes needed.

---

## 6. Inconsistent Data Loading Patterns

### Components importing JSON directly (bypassing `src/lib/data.ts`)

These are all direct `import X from "@/data/..."` in non-library files, which bypass the canonical loader functions in `data.ts`:

| File | Direct JSON imports | Should use |
|---|---|---|
| `src/app/page.tsx` | `leadership-finance.json`, `scandals.json`, `key-votes.json`, `bioguide-to-icpsr.json`, `cabinet.json` | Some of these are leadership-specific slices not in `data.ts`; `scandals.json` should use `getAllScandals()` |
| `src/app/votes/page.tsx` | `key-votes.json` | Could be a `getKeyVotes()` function in `data.ts` |
| `src/app/congress/trades/page.tsx` | `trading-summaries.json`, `members.json`, `committee-conflicts.json` | `members.json` should use `getMembers()` |
| `src/components/ConflictDataViz.tsx` | `committee-conflicts.json`, `trading-summaries.json`, `members.json` | `members.json` should use `getMembers()` |
| `src/components/RepSearch.tsx` | `finance.json` | Should use `getMemberFinanceStatic()` |
| `src/components/VoteModal.tsx` | `members.json` | Should use `getMember()` / `getMembers()` |
| `src/components/AgencyBudget.tsx` | `cabinet-spending.json` | Distinct from `usaspending.json`; no loader exists |
| `src/components/TopCapturedPanel.tsx` | `top-captured.json` | Pre-computed slice; acceptable |
| `src/components/LeadershipSpotlight.tsx` | `leadership-scrutiny.json`, `leadership-donors.json` | Leadership-specific; no loaders exist |
| `src/components/CampaignPositions.tsx` | `positions.json`, `key-votes.json` (via `require()`) | Should use static imports |
| `src/lib/og-utils.ts` | `members.json`, `finance.json`, `cabinet.json` | Should use `getMembers()` / `getMemberFinanceStatic()` |
| `src/lib/leaderboard.ts` | `positions.json`, `key-votes.json`, `members.json` | `members.json` should use `getMembers()` |
| `src/app/rep/[id]/page.tsx` | `key-votes.json`, `bioguide-to-icpsr.json` | Acceptable for page-level data; no loader needed |

**`members.json` is imported directly in 4 non-data-layer files** (`congress/trades/page.tsx`, `ConflictDataViz.tsx`, `VoteModal.tsx`, `og-utils.ts`, `leaderboard.ts`). This is the highest-priority inconsistency because `getMembers()` in `data.ts` applies the `transformMember()` function (state abbreviation normalization, field renames). Direct JSON imports skip this transform and receive raw `party_loyalty_pct` instead of `party_alignment_pct`, and full state names instead of abbreviations.

**`finance.json` is imported directly in `RepSearch.tsx` and `og-utils.ts`**, bypassing `getMemberFinanceStatic()`.

---

## Findings Summary

| # | Finding | Severity | Fix Target |
|---|---|---|---|
| F-1 | **Conflict detection always empty on deployed site** — `detectConflicts()` block guarded by `!isBuildTime` and requires live FEC calls that fail in static export. `ConflictOfInterestSection`, `DonorCaptureScore`, and `RepVerdictBadge` always receive empty data on Cloudflare Pages. | **Critical** | Refactor `rep/[id]/page.tsx` lines 127–162: map `finance.top_industries` to `IndustryTotal[]` using `INDUSTRIES` lookup (same pattern as `conflict-callouts.ts`), remove `isBuildTime` guard. |
| F-2 | **`/api/research` route unavailable on static deploy** — `LatestNews` "Load Latest News" button always 404s on Cloudflare Pages. The news-cache fallback is never populated (`news-cache.json` missing). | **High** | Either run `pnpm run research:fetch` in CI before build, or move news fetching to the reps-api.arialabs.ai worker (served via `apiFetch`) so it works in a static context. |
| F-3 | **`members.json` imported directly in multiple components**, bypassing `transformMember()`. Raw JSON has `party_loyalty_pct` (not `party_alignment_pct`) and full state names (not abbreviations). | **High** | Replace direct imports with `getMembers()` / `getMember()` in: `og-utils.ts`, `leaderboard.ts`, `ConflictDataViz.tsx`, `VoteModal.tsx`, `congress/trades/page.tsx`. |
| F-4 | **Congress listing page has no static fallback** — `useLiveMembers()` fetches from `reps-api.arialabs.ai`. If the API is down, the page renders no members with no recovery path. | **High** | Add a static seed to `useLiveMembers()`: if `data` is null and loading is false, fall back to `getMembers()` from `data.ts` (already available as a static JSON import). |
| F-5 | **`finance.json` bypassed in `RepSearch.tsx` and `og-utils.ts`** — direct imports skip the canonical `getMemberFinanceStatic()` accessor and skip any future transform logic. | **Medium** | Replace with `getMemberFinanceStatic()` calls. |
| F-6 | **`useMembers()` and `useVotes()` hooks are dead code** — defined in `src/hooks/useMembers.ts` and `src/hooks/useVotes.ts` but never imported. `fetchVotes()` in `api-client.ts` also always returns `[]`. | **Low** | Remove dead hooks and the stub `fetchVotes()` to reduce maintenance surface. |
| F-7 | **`ApiMember.votes_against_party` silently dropped** — the API returns this field but `Member` interface and `transformApiMember()` discard it. | **Low** | Either add `votes_against_party` to the `Member` interface or document its exclusion. |
| F-8 | **`conflict-callouts.ts` correctly uses static data; `conflict-detector.ts` does not** — two conflict analysis systems exist with divergent data sourcing. The callouts pattern (static `top_contributors` → keyword classify) should be the canonical approach. | **Medium** | Once F-1 is fixed using the static approach, the live-FEC path in `getMemberFinance()` (for `top_industries`) is still useful for freshness on the rep page but the conflict detection itself should not depend on it. |
| F-9 | **`CampaignPositions.tsx` uses `require()` for JSON at render time** — dynamic `require('@/data/positions.json')` and `require('@/data/key-votes.json')` inside component logic bypasses webpack static analysis. | **Low** | Replace with static `import` at the top of the file. |

---

## Architecture Diagram (Data Paths)

```
BUILD TIME                          RUNTIME (CLIENT)
─────────────────────────────────   ──────────────────────────────────
src/data/*.json                     reps-api.arialabs.ai
  └─ data.ts loaders                  └─ useLiveMembers()  → congress/page
       ├─ getMembers()                └─ useLeaderboard()  → AlignmentLeaderboardLive
       ├─ getMemberFinanceStatic()
       ├─ getMemberDisclosures()    public/data/trades/[id].json
       ├─ getMemberScandals()         └─ fetch() in StockTradesSection
       ├─ getMemberAlignment()
       └─ getRecentVotesForMember()  /api/research (BROKEN on static deploy)
                                       └─ LatestNews component
src/lib/conflict-callouts.ts
  └─ uses finance + key-votes      FEC API (at build in getMemberFinance)
  └─ WORKS at build time ✓           └─ skipped when NEXT_PHASE=build
                                       └─ detectConflicts() ALSO skipped = empty ✗
```
