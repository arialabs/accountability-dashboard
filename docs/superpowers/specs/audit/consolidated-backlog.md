# Consolidated Audit Backlog

**Date:** 2026-03-12
**Sources:** 7 audit reports (data integrity, data flow, pipeline, page rendering, assets, test health, code quality)
**Consolidation protocol:** Deduplicated by root cause, assigned to fix phase, higher severity on disagreement, trustworthiness-filtered

---

## Tier 1: Data & Pipeline Fixes (Sequential — Blocks All Other Work)

These must be resolved first. Component and UI fixes are meaningless without correct data.

### T1-1. Populate finance data for all 538 members [CRITICAL]
- **Root cause:** `scripts/fetch-finance.ts` has only been run for 9 congressional leaders
- **Impact:** Donor capture score, conflict callouts, campaign finance section ALL empty for 98% of members. This is the single biggest blocker to the "can we trust them?" experience.
- **Fix:** Run `tsx scripts/fetch-finance.ts` with valid `FEC_API_KEY` for all members
- **Sources:** Data Integrity §2.1, Pipeline §P0-2, Data Flow §F-1
- **Trustworthiness:** DIRECT — "who funds them?" is the #2 priority signal

### T1-2. Fix StockTrade TypeScript interface (6 wrong field names) [CRITICAL]
- **Root cause:** Interface written to a spec that doesn't match actual Quiver Quant data
- **Impact:** Any component using typed trade data gets `undefined` for every field
- **Mismatches:** `disclosure_date`→`filedDate`, `transaction_date`→`tradedDate`, `company_name`→`company`, `transaction_type`→`transaction`, `amount_range`→absent, `amount_min/max`→`tradeSizeUsd`
- **Missing from type:** `excessReturn`, `suspicious_flags`, `risk_score`
- **Fix:** Rewrite `StockTrade` in `src/lib/types.ts` to match actual data shape
- **File:** `src/lib/types.ts`

### T1-3. Fix TradingProfile TypeScript interface [CRITICAL]
- **Root cause:** Same as T1-2 — type doesn't match `trading-summaries.json`
- **Actual fields:** `total_risk_score`, `avg_risk_per_trade`, `avg_excess_return`, `suspicious_patterns`, `overall_suspicion_level`
- **Fix:** Rewrite `TradingProfile` in `src/lib/types.ts`
- **File:** `src/lib/types.ts`

### T1-4. Fix Member type: `party_alignment_pct` → `party_loyalty_pct` [CRITICAL]
- **Root cause:** Type field name doesn't match JSON field name
- **Impact:** Any code using `member.party_alignment_pct` gets `undefined`
- **Fix:** Rename in `src/lib/types.ts` and update all references
- **File:** `src/lib/types.ts`, consumers

### T1-5. Create split-trades script [CRITICAL]
- **Root cause:** Per-member trade files in `public/data/trades/` were committed manually; no script regenerates them
- **Impact:** When `fetch-trades.ts` is re-run, per-member files go stale silently
- **Fix:** Create `scripts/split-trades.ts` that reads `src/data/trades-by-member.json` → writes `public/data/trades/{id}.json`
- **Also:** Add `--limit=500` to cap oversized files (M001157=13MB, K000389=11MB)
- **Sources:** Pipeline §P0-1, §P1-2

### T1-6. Fix `detectConflicts()` to work at build time [CRITICAL]
- **Root cause:** `rep/[id]/page.tsx` lines 127-162 guarded by `!isBuildTime`, requires live FEC API
- **Impact:** Conflict of Interest section permanently empty on deployed site
- **Fix:** Map `finance.top_industries` (from static JSON) to `IndustryTotal[]` using `INDUSTRIES` lookup from `industry-classifier.ts`. Remove `!isBuildTime` guard.
- **Pattern:** Follow `getConflictCallouts()` approach which already works with static data
- **Files:** `src/app/rep/[id]/page.tsx`, `src/lib/conflict-detector.ts`
- **Sources:** Data Flow §F-1, Pipeline §P1-3

### T1-7. Fix `flag_rate` type in trading-summaries.json [MAJOR]
- **Root cause:** Stored as string `"75.4"` not number `75.4`
- **Impact:** Arithmetic on `flag_rate` produces NaN
- **Fix:** Parse to number in data or fix source script
- **File:** `src/data/trading-summaries.json`

### T1-8. Compute key-vote `result` from yea/nay counts [MAJOR]
- **Root cause:** 176/258 votes (68%) have `result = "Unknown"` despite populated counts
- **Fix:** Add post-processing step: if `yea_count > nay_count` → "Passed", else → "Failed" (with supermajority threshold awareness)
- **File:** Pipeline script or prebuild step

### T1-9. Prune 127 stale member IDs from trading data [MAJOR]
- **Root cause:** Former members still in `trading-summaries.json` and `trades-by-member.json`
- **Fix:** Filter to current `members.json` IDs only
- **Files:** `src/data/trading-summaries.json`, `src/data/trades-by-member.json`

### T1-10. Fix Contributor type union [MINOR]
- **Root cause:** Type allows `'individual' | 'pac' | 'party' | 'committee'`; data has `"Super PAC"`, `"Business PAC"`, etc.
- **Fix:** Broaden `Contributor.type` to `string`, make `count` optional
- **File:** `src/lib/types.ts`

### T1-11. Add `bill` field to BillVote type [MINOR]
- **Root cause:** Field present in data, missing from type
- **Fix:** Add `bill?: string` to `BillVote`
- **File:** `src/lib/types.ts`

### T1-12. Unify `Source` interface [MINOR]
- **Root cause:** Defined in both `src/lib/types.ts` ("high"|"medium") and `src/types/executive.ts` ("high"|"medium"|"low")
- **Fix:** Single definition with `"high" | "medium" | "low"`

### T1-13. Fix malformed photo_url for Ashley Moody (M001244) [BUG]
- **Root cause:** Pipeline concatenated bioguide URL onto congress.gov prefix
- **Fix:** Set to correct congress.gov URL or null
- **File:** `src/data/members.json`

### T1-14. Normalize `house-disclosures.json` key to `bioguide_id` [MINOR]
- **Root cause:** Uses `bioguideId` (camelCase) while everything else uses `bioguide_id` (snake_case)
- **Fix:** Normalize in data or add normalizer in loader

### T1-15. Resolve LatestNews / news-cache [HIGH]
- **Root cause:** `news-cache.json` never generated; `/api/research` doesn't exist in static export
- **Impact:** "Load Latest News" button always 404s
- **Options:** (A) Mark LatestNews as "in development", (B) seed news-cache via pipeline
- **Sources:** Data Flow §F-2, Pipeline §P1-1, Code Quality §4.1

### T1-16. Remove dead `revalidate` options [LOW]
- **Root cause:** `next: { revalidate: N }` is no-op in static export
- **Files:** `src/lib/congress.ts` (3 occurrences), `src/app/executive/president/orders/page.tsx`

---

## Tier 2: Component Layer Fixes (Parallelizable After Tier 1)

### T2-1. Fix all `/deep-dives/[slug]` pages returning 404 [CRITICAL]
- **Root cause:** `generateStaticParams()` filter or import resolution issue
- **Impact:** 4 pages in sitemap return 404 with noindex
- **Fix:** Debug `generateStaticParams()` return value; possibly remove filter guard since all data entries have complete data
- **File:** `src/app/deep-dives/[slug]/page.tsx`

### T2-2. Remove KeyVotes and LatestNews non-existent API calls [CRITICAL]
- **Root cause:** `KeyVotes.tsx` calls `/api/bills/summary`, `LatestNews.tsx` calls `/api/research` — neither exists
- **Fix:** Remove API calls, use static data or fallback UI
- **Files:** `src/components/KeyVotes.tsx`, `src/components/LatestNews.tsx`
- **Sources:** Code Quality §4.1, Page Rendering §3C

### T2-3. Replace direct `members.json` imports with `getMembers()` [HIGH]
- **Root cause:** 5 files import raw JSON, bypassing `transformMember()` normalization
- **Impact:** Missing field renames (`party_loyalty_pct` vs `party_alignment_pct`), full state names vs abbreviations
- **Files:** `ConflictDataViz.tsx`, `VoteModal.tsx`, `congress/trades/page.tsx`, `og-utils.ts`, `leaderboard.ts`
- **Source:** Data Flow §F-3

### T2-4. Replace direct `finance.json` imports [MEDIUM]
- **Files:** `RepSearch.tsx`, `og-utils.ts`
- **Fix:** Use `getMemberFinanceStatic()` from `data.ts`
- **Source:** Data Flow §F-5

### T2-5. Add static fallback to Congress listing [HIGH]
- **Root cause:** `useLiveMembers()` has no fallback when API is down
- **Impact:** Congress page renders empty if `reps-api.arialabs.ai` is unreachable
- **Fix:** Fall back to `getMembers()` from `data.ts` when API returns null
- **Source:** Data Flow §F-4

### T2-6. Reorient rep page section ordering [HIGH — TRUSTWORTHINESS]
- **Current order:** Already close to target (conflict callouts → donor capture → finance → conflicts → votes → party loyalty → trades → disclosures → scandals)
- **Changes needed:**
  - Move `VotingRecordSection` (party loyalty %) down or into collapsible "Details"
  - Add "In Development" section for Say vs Do, Net Worth, dark money
- **File:** `src/app/rep/[id]/page.tsx`

### T2-7. Create ExpandableSection component [HIGH — PROGRESSIVE DISCLOSURE]
- **Purpose:** Reusable summary/detail/reference three-layer component
- **Used by:** Voting records, financial disclosures, campaign finance, conflicts, executive orders, scandals

### T2-8. Progressive disclosure: Voting records [HIGH]
- **Fix:** Show plain-language vote summaries ("Voted YES on expanding Medicare for veterans"), bill numbers in expandable section
- **Files:** `MemberVotingRecord.tsx`, `RecentVotesSection.tsx`, `KeyVotes.tsx`

### T2-9. Progressive disclosure: Campaign finance [HIGH]
- **Fix:** Lead with "who funds them" narrative, itemized contributors in expandable section
- **File:** `DonorAnalysisSection.tsx`

### T2-10. Progressive disclosure: Conflicts, disclosures, scandals, EOs [MEDIUM]
- **Fix:** Plain-language conflict description up front, vote/donation details expandable
- **Files:** `ConflictOfInterestSection.tsx`, `FinancialDisclosuresSection.tsx`, `ScandalsSection.tsx`, executive order pages

### T2-11. Delete dead components (10 orphans) [HIGH]
- **Components:** AlignmentLeaderboard, AlignmentLeaderboardLive, CongressContentLive, FinancialSection, HamburgerMenu, IndustryBreakdownChart, LoadingSkeleton, VotingCharts, WealthTracker, CampaignPositions
- **Also delete:** Associated test files (HamburgerMenu.test.tsx, etc.)
- **Source:** Code Quality §1.2

### T2-12. Handle alignment scoring components (issue #84) [HIGH]
- **Components:** AlignmentScoreCard, AlignmentScoreCardEnhanced, VoteBasedPositions
- **Decision:** Delete (disabled per #84) or mark as "in development"
- **Also:** ScoreBreakdownModal, vote-based-scoring.ts, alignment.ts, alignment-enhanced.ts become dead if deleted
- **Source:** Code Quality §1.1

### T2-13. Delete orphan lib modules [MEDIUM]
- **Files:** `src/lib/og-utils.ts`, `src/lib/sector-mapping.ts`, `src/lib/beneficiary-analysis.ts`
- **Note:** `src/lib/say-vs-do.ts` has significant unshipped work — plan for future integration
- **Source:** Code Quality §1.3

### T2-14. Delete duplicate `src/data/executive-types.ts` [MEDIUM]
- **Root cause:** Never imported; all active code uses `src/types/executive.ts`
- **Source:** Code Quality §1.5, Assets §3

### T2-15. Remove dead hooks [LOW]
- **Files:** `src/hooks/useMembers.ts`, `src/hooks/useVotes.ts`
- **Also:** `fetchVotes()` in `api-client.ts` always returns `[]`
- **Source:** Data Flow §F-6

### T2-16. Fix cabinet alignment section API call [MEDIUM]
- **Root cause:** `alignment-section.tsx` fetches `/api/cabinet/${memberId}` — doesn't exist in static export
- **Fix:** Use static data or remove
- **Source:** Page Rendering §3C

---

## Tier 3: UI/UX Polish (Parallelizable After Tier 2)

### T3-1. Add accessibility attributes to interactive components [HIGH]
- **Components needing ARIA:**
  - VoteHistorySection — sort/filter buttons need `aria-label`, `aria-pressed`
  - KeyVotes — sort buttons, expandable rows need `aria-expanded`
  - BudgetImpactCard — toggle needs `aria-expanded`
  - CommitteeMemberships — expandable sections need `aria-expanded`
  - MemberVotingRecord — sort buttons need `aria-pressed`
  - VoteModal — needs `role="dialog"`, `aria-modal`, `aria-labelledby`, focus management
  - SocialShare — copy button needs `aria-label`
- **Source:** Code Quality §3.1

### T3-2. Fix SEO domain inconsistency [MEDIUM]
- **Root cause:** `layout.tsx` uses `accountability-dashboard.pages.dev`, `schema.ts` defaults to `reps.arialabs.ai`
- **Fix:** Set `NEXT_PUBLIC_SITE_URL` consistently; update all fallback defaults to match
- **Source:** Page Rendering §5A

### T3-3. Exclude admin routes from sitemap and robots.txt [MEDIUM]
- **Fix:** Add `/admin/*` to `next-sitemap.config.js` exclude + `robots.txt` Disallow
- **Source:** Page Rendering §5B, §5C

### T3-4. Fix or remove OG image metadata [MEDIUM]
- **Root cause:** `/api/og/rep` and `/api/og/cabinet` don't exist
- **Fix:** Either remove OG image references or create static OG images
- **Source:** Page Rendering §3C, §5E

### T3-5. Add `_redirects` for Cloudflare Pages [MEDIUM]
- **Routes:** `/house` → `/congress?chamber=house`, `/senate` → `/congress?chamber=senate`, etc.
- **Fix:** Create `public/_redirects` file for Cloudflare Pages 301s
- **Source:** Page Rendering §3A

### T3-6. Delete orphan files [LOW]
- `src/data/scotus.json.backup` — identical to active file
- `public/images/officials/vance-placeholder.svg` — superseded by vance.jpg
- **Source:** Assets §3

### T3-7. Empty states and "In Development" labels [HIGH — TRUSTWORTHINESS]
- **Sections needing "In Development":** Say vs Do, Net Worth tracking, dark money tracking, LatestNews (if unfixable)
- **Empty states:** "No data available" with explanation instead of blank sections
- **Apply to:** All data sections when member has no data (e.g., 529 members without finance data until T1-1 is resolved)

### T3-8. Generate favicon.ico [LOW]
- **Source:** Assets §4

---

## Tier 4: QA & Testing (Sequential After Tiers 2-3)

### T4-1. Fix `act()` warnings in 4 test files [P0]
- **Files:** `rep/[id]/page.test.tsx`, `cabinet/[role]/page.test.tsx`, `TopCapturedPanel.test.tsx`, `AlignmentTooltip.test.tsx`
- **Fix:** Wrap async state updates in `waitFor` or `act`
- **Source:** Test Health §P0

### T4-2. Add tests for recently-added features [P1]
- `AffectedProgramsList` + `BudgetImpactCard` (issues #49/#50)
- `eo-donor-benefits.ts` + `DonorAlertBadge` (issue #148/#149)
- **Source:** Test Health §P1

### T4-3. Add tests for critical business logic [P2]
- `src/lib/executive-conflicts.ts` — executive conflict detection
- `src/lib/data-enhanced.ts` — enhanced alignment data wrapper
- `src/lib/beneficiary-analysis.ts` — legislation impact analysis
- **Source:** Test Health §P2

### T4-4. Add tests for untested high-impact components [P3]
- ConflictOfInterestSection, ScandalsSection, RecentVotesSection, VoteHistorySection, LatestNews, RepSearch
- **Source:** Test Health §3.3

### T4-5. Add tests for untested routes [P3]
- `/congress` (main legislative index) — HIGH priority
- `/congress/trades`, `/bills`
- **Source:** Test Health §3.4

### T4-6. Final verification pass [P4]
- `npm run test:run` — zero failures
- `npm run build` — completes without errors
- Every route renders without crashes
- Rep page section ordering matches trustworthiness priority
- Progressive disclosure applied site-wide
- Cross-check rendered data against source data

---

## Deferred (Out of Scope — Future Phase 2)

These require new data sources, pipelines, or significant R&D:

1. **Say vs Do / Alignment Scoring** — redesign scoring methodology
2. **Net Worth Tracking** — parse financial disclosure PDFs
3. **Billionaire Donor Tracking** — new data sources beyond OpenFEC
4. **Dark Money / 501c4 Tracking** — OpenSecrets, IRS data
5. **Super PAC vs. Regular PAC** — FEC data pipeline enhancement
6. **Systematic Scandal Detection** — automate ethics violation tracking
7. **Post-Office Revolving Door** — track where former reps go

---

## Statistics

| Tier | Items | Critical | High | Medium | Low/Minor |
|------|-------|----------|------|--------|-----------|
| T1 (Data/Pipeline) | 16 | 6 | 2 | 1 | 7 |
| T2 (Components) | 16 | 2 | 8 | 4 | 2 |
| T3 (UI/UX) | 8 | 1 | 1 | 4 | 2 |
| T4 (QA/Testing) | 6 | 0 | 0 | 0 | 6 |
| **Total** | **46** | **9** | **11** | **9** | **17** |

## Execution Order

```
T1-1 (finance data) ──────────────────────────┐
T1-2..T1-4 (type fixes) ─────────────────────┤
T1-5 (split-trades script) ──────────────────┤
T1-6 (conflict detection) ───────────────────┤
T1-7..T1-16 (remaining data fixes) ──────────┤
                                              ├─→ T2 (components, parallel) ─→ T3 (UI/UX, parallel) ─→ T4 (QA)
T2-1 (deep-dives 404) ── can start early ────┘
T2-2 (remove dead API calls) ── can start early
```

**Critical path:** T1-1 (finance data) blocks T1-6 (conflict detection) blocks T2-6 (rep page reorientation). Everything else in T1 can run in parallel.
