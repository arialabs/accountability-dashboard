# Test Health & Build Audit

**Date:** 2026-03-12
**Auditor:** Claude (automated)
**Project:** accountability-dashboard @ `/home/jeremy/workspace/accountability-dashboard`

---

## 1. Test Suite Results

**Command:** `npx vitest run --reporter=verbose`
**Duration:** 13.24s (transform 16.83s, setup 10.96s, import 31.73s, tests 38.55s, environment 85.49s)

### Summary

| Metric | Count |
|---|---|
| Test files | 70 passed, 0 failed |
| Total tests | **794 passed, 0 failed, 0 skipped** |
| Failing tests | **None** |

The entire test suite is green. All 70 test files run successfully.

### Failing Tests

**None.** Every test passes.

### Test Files Inventory (70 files, excluding node_modules)

**Pipeline (2 files)**
- `pipeline/sources/congress-votes.test.ts`
- `pipeline/sources/usaspending.test.ts`

**Scripts (1 file)**
- `scripts/scrape-positions.test.ts`

**App pages (18 files)**
- `src/app/page.test.tsx` (Home page)
- `src/app/leadership-preview.test.ts`
- `src/app/votes/page.test.tsx`
- `src/app/scandals/page.test.tsx`
- `src/app/deep-dives/page.test.tsx`
- `src/app/deep-dives/[slug]/page.test.tsx`
- `src/app/rep/[id]/page.test.tsx`
- `src/app/executive/president/page.test.tsx`
- `src/app/executive/president/orders/orders.test.tsx`
- `src/app/executive/president/conflicts/page.test.tsx`
- `src/app/executive/president/policies/[slug]/page.test.tsx`
- `src/app/executive/cabinet/page.test.tsx`
- `src/app/executive/cabinet/[role]/page.test.tsx`
- `src/app/executive/vp/page.test.tsx`
- `src/app/executive/doge/page.test.tsx`
- `src/app/executive/agencies/doge/page.test.tsx`
- `src/app/judicial/scotus/page.test.tsx`
- `src/app/judicial/scotus/[id]/page.test.tsx`

**Components (25 files)**
- `AccountabilityDataCard`, `AlignmentLeaderboard`, `AlignmentLegend`, `AlignmentTooltip`
- `CampaignPositions`, `CommitteeMemberships`
- `DonorAnalysisSection`, `DonorCaptureScore`
- `EpsteinFilesCard`
- `FinancialDisclosuresSection`, `FinancialSection`
- `HamburgerMenu`, `KeyVotes`
- `MemberCard`, `MemberVotingRecord`
- `Navigation`
- `RepVerdictBadge`, `RepresentativeImage`
- `SocialShare`, `StockTradesSection`
- `TopCapturedPanel`
- `VerdictBanner`, `VotingCharts`, `VotingRecordSection`
- `WealthTracker`

**Library (24 files)**
- `alignment`, `alignment-enhanced`
- `cabinet`, `committees`, `confidence`
- `conflict-callouts`, `conflict-detector`
- `data`
- `donor-percentiles`, `donor-verdict-filter`
- `fec`, `fec-fallback`, `find-reps`
- `grading`
- `industry-classifier`
- `og-utils`
- `perplexity`
- `revolving-door`
- `say-vs-do`
- `trump-approval`, `trump-conflicts`, `trump-promises`
- `vote-based-scoring`
- `zip-lookup`

### Warnings in Test Output (non-fatal)

**React `act()` warnings** — 66 occurrences across 3 test files. These are noisy but do not fail tests:

| Test File | Affected Tests |
|---|---|
| `src/app/rep/[id]/page.test.tsx` | All "Financial Disclosures" describe block (5 test cases, 3 render cycles each) |
| `src/app/executive/cabinet/[role]/page.test.tsx` | All CabinetMemberPage tests (9 tests) |
| `src/components/TopCapturedPanel.test.tsx` | 4 tests |
| `src/components/AlignmentTooltip.test.tsx` | 1 test ("shows tooltip content when clicked") |

**Root cause:** Async state updates in components (`AlignmentSection`, data-fetching hooks) fire after the test assertion, but the tests still pass. These should be wrapped in `waitFor` or `act` to silence the warnings and make the tests more robust.

---

## 2. Build Results

**Command:** `npm run build`
**Outcome:** BUILD SUCCEEDED

### Prebuild Steps

| Step | Result |
|---|---|
| `compute-party-loyalty.mjs` | Passed — updated 529/538 members (9 members missing data, expected) |
| `icons:generate` (3 scripts) | Passed — all 10 SVG + 10 PNG icons generated, 2 screenshots generated |
| `compute-donor-percentiles.ts` | Passed — `donor-percentiles.json` written for 9 members |

**Prebuild warnings (non-fatal):**
- Three Node.js `[MODULE_TYPELESS_PACKAGE_JSON]` warnings on `generate-pwa-icons.js`, `convert-icons-to-png.js`, and `generate-screenshots.js`. These scripts are CommonJS but lack a `type` field in `package.json`. Fix: add `"type": "module"` to `package.json` or rename scripts to `.mjs`.

### Next.js Build

| Phase | Result |
|---|---|
| Turbopack compile | Passed in 7.2s |
| TypeScript check | Passed |
| Static page generation | Passed — 606 pages generated |
| Sitemap generation (postbuild) | Passed |

**Build warnings (non-fatal):**

1. **Missing `@/data/news-cache.json`** — Turbopack warns that `src/app/rep/[id]/page.tsx` line 40 tries to `require('@/data/news-cache.json')` but the file does not exist. The code wraps this in a `try/catch`, so the build succeeds and falls back to live fetch. The warning is expected; the file is generated at runtime by `npm run research:fetch`.

2. **`FEC_API_KEY` not set** — Runtime WARN from `src/lib/fec.ts` during static generation (19+ occurrences). Expected in a build environment without environment variables. FEC data falls back to static JSON.

3. **`CONGRESS_API_KEY` not set** — Runtime WARN during static generation (17 occurrences). Same pattern, falls back to static data.

### Static Route Coverage

| Symbol | Count |
|---|---|
| `/rep/[id]` | 538 rep pages |
| `/executive/cabinet/[role]` | 16 cabinet member pages |
| `/judicial/scotus/[id]` | 9 SCOTUS justice pages |
| `/executive/president/policies/[slug]` | 4 policy pages |
| `/deep-dives/[slug]` | 4 deep dive pages |
| Static routes (`○`) | 26 routes |
| **Total** | **606 pages** |

---

## 3. Coverage Gap Analysis

### 3.1 Key Lib Files — Coverage Status

| File | Has Test? | Notes |
|---|---|---|
| `src/lib/data.ts` | YES | `data.test.ts` covers `getMembers`, `getMember`, `getMembersByState/Chamber/Party`, `getPartyBreakdown`, `getOfficialAgencySpending` |
| `src/lib/conflict-detector.ts` | YES | `conflict-detector.test.ts` covers `detectConflicts`, `INDUSTRY_VOTE_MAPPING` |
| `src/lib/conflict-callouts.ts` | YES | Covered |
| `src/lib/alignment.ts` | YES | Covered |
| `src/lib/alignment-enhanced.ts` | YES | Covered |
| `src/lib/grading.ts` | YES | Covered |
| `src/lib/say-vs-do.ts` | YES | Covered |
| `src/lib/fec.ts` | YES | Covered |
| `src/lib/industry-classifier.ts` | YES | Covered |
| `src/lib/vote-based-scoring.ts` | YES | Covered |

### 3.2 Untested Lib Files (19 files)

These library files have **no test file at all**:

| File | Risk Level | What It Does |
|---|---|---|
| `src/lib/beneficiary-analysis.ts` | HIGH | Analyzes who benefits from legislation — core analytical module |
| `src/lib/eo-donor-benefits.ts` | HIGH | Maps EOs to donor industries (issue #148 feature) — no tests |
| `src/lib/executive-conflicts.ts` | HIGH | Executive branch conflict detection — untested |
| `src/lib/data-enhanced.ts` | HIGH | Wraps `data.ts` with enhanced alignment; used on rep pages |
| `src/lib/leaderboard.ts` | MEDIUM | `getLeaderboard()` aggregates all alignment scores; cached |
| `src/lib/live-votes.ts` | MEDIUM | Live vote fetching from external API |
| `src/lib/congress.ts` | MEDIUM | Congress.gov API integration |
| `src/lib/api-client.ts` | MEDIUM | Generic HTTP client used across the app |
| `src/lib/executive-data.ts` | MEDIUM | Executive branch data loading |
| `src/lib/policy-data.ts` | MEDIUM | Policy data for presidential policy pages |
| `src/lib/leadership.ts` | LOW | Leadership spotlight data |
| `src/lib/bills.ts` | LOW | Bills data utilities |
| `src/lib/formatting.ts` | LOW | Display formatting helpers |
| `src/lib/cn.ts` | LOW | Tailwind class merging utility |
| `src/lib/deep-dives.ts` | LOW | Deep dives data loader |
| `src/lib/schema.ts` | LOW | Zod/validation schemas |
| `src/lib/sector-mapping.ts` | LOW | Maps sectors to industries |
| `src/lib/types.ts` | LOW | Type definitions only (no logic) |
| `src/lib/logger.ts` | LOW | Logging wrapper |

### 3.3 Untested Components (44 components)

These components exist but have **no test file**:

**High-impact (visible on rep pages or major feature areas):**
- `AffectedProgramsList.tsx` — new financial impact tracker (issue #49/#50)
- `BudgetImpactCard.tsx` — new financial impact calculator (issue #49/#50)
- `ConflictOfInterestSection.tsx` — conflict of interest display
- `ConflictBadge.tsx`, `ConflictCallout.tsx`, `ConflictDataViz.tsx`
- `DonorAlertBadge.tsx` — donor alert system (issue #149)
- `ScandalsSection.tsx`, `ScandalCard.tsx`, `ScandalFilters.tsx`
- `ScoreBreakdownModal.tsx` — score explanation modal
- `VoteBasedPositions.tsx` — vote-based positions display
- `AlignmentScoreCard.tsx`, `AlignmentScoreCardEnhanced.tsx`
- `RecentVotesSection.tsx`, `VoteHistorySection.tsx`, `VoteModal.tsx`
- `LatestNews.tsx` — news cache integration
- `RepSearch.tsx` — ZIP-based rep search

**Navigation/Layout (infrastructure):**
- `Breadcrumbs.tsx`, `Pagination.tsx`
- `ErrorBoundary.tsx`, `LayoutErrorBoundary.tsx`
- `LoadingSkeleton.tsx`, `ScrollFadeIn.tsx`
- `DevelopmentBanner.tsx`

**Charts/Visualization:**
- `HeroSparkline.tsx`, `VotingSparkline.tsx`
- `IdeologySpectrumChart.tsx`
- `PartyLoyaltyChart.tsx`
- `DonorBreakdownBarChart.tsx`, `IndustryBreakdownChart.tsx`

**Other:**
- `AnimatedCounter.tsx`, `CareerTimeline.tsx`
- `AgencyBudget.tsx`, `ExpandableStaffRoster.tsx`
- `ImpactBadge.tsx`, `SeverityBadge.tsx`
- `SourceList.tsx`, `LeadershipSpotlight.tsx`
- `CongressContentLive.tsx`, `AlignmentLeaderboardLive.tsx`
- `PWARegister.tsx`
- `credibility/DataSourceBadge.tsx`, `credibility/ScoreExplainer.tsx`, `credibility/VoteComparisonCard.tsx`
- `ui/Container.tsx`, `ui/Typography.tsx`

### 3.4 Untested App Routes (15 routes)

| Route | Risk |
|---|---|
| `/congress` | HIGH — main legislative index |
| `/congress/independence` | MEDIUM |
| `/congress/trades` | MEDIUM — stock trades explorer |
| `/house` | MEDIUM |
| `/senate` | MEDIUM |
| `/executive` (index) | MEDIUM |
| `/executive/orders` | MEDIUM |
| `/executive/conflicts` | MEDIUM |
| `/executive/timeline` | LOW |
| `/executive/president/policies` (list) | LOW |
| `/judicial` (index) | LOW |
| `/judicial/federal-courts` | LOW |
| `/judicial/supreme-court` | LOW |
| `/bills` | LOW |
| `/about`, `/methodology`, `/privacy`, `/terms`, `/offline`, `/admin/vote-sync` | LOW (static/informational) |

### 3.5 Untested Hooks (5 hooks, 0 tests)

All custom hooks are completely untested:
- `src/hooks/useApi.ts`
- `src/hooks/useLeaderboard.ts`
- `src/hooks/useLiveData.ts`
- `src/hooks/useMembers.ts`
- `src/hooks/useVotes.ts`

### 3.6 Untested Data Modules (4 files, 0 tests)

- `src/data/deep-dives.ts` and `src/data/deep-dives/*.ts` (4 deep dive modules)
- `src/data/doge.ts`
- `src/data/executive-types.ts`

---

## 4. Priority Recommendations

### P0 — Fix (warnings that could mask regressions)

1. **Suppress or fix `act()` warnings** in `rep/[id]/page.test.tsx`, `cabinet/[role]/page.test.tsx`, `TopCapturedPanel.test.tsx`, and `AlignmentTooltip.test.tsx`. Wrap async state updates in `waitFor` or `act`. These are not currently failing but indicate tests that may produce false positives.

### P1 — Add Tests for Recently-Added Features

2. **`AffectedProgramsList` + `BudgetImpactCard`** (issues #49/#50, added in last commit) — zero test coverage on brand-new components.
3. **`eo-donor-benefits.ts` + `DonorAlertBadge`** (issue #148/#149) — the EO donor accountability feature has no lib-level unit tests.
4. **`BudgetImpactCard` financial math** — similar to the BUG #41 regression tests on `StockTradesSection`, financial calculation logic should have regression coverage.

### P2 — Add Tests for Critical Business Logic

5. **`src/lib/executive-conflicts.ts`** — conflict detection for the executive branch is untested.
6. **`src/lib/beneficiary-analysis.ts`** — the "who benefits" system is a core analytical module with no tests.
7. **`src/lib/data-enhanced.ts`** — wraps `data.ts` with enhanced alignment; used on every rep page.
8. **`/congress` and `/house`/`/senate` pages** — the main legislative indexes have no tests.

### P3 — Infrastructure / Noise

9. **Fix `MODULE_TYPELESS_PACKAGE_JSON` warnings** on the 3 icon/screenshot generation scripts by adding `"type": "module"` to `package.json` or renaming the files to `.mjs`.
10. **Add `src/data/news-cache.json` to `.gitignore` documentation** — the missing file warning in Turbopack is expected behavior but should be documented so CI doesn't alarm.
11. **Add tests for all 5 custom hooks** (`useApi`, `useLeaderboard`, `useLiveData`, `useMembers`, `useVotes`).

---

## 5. Appendix: Test Count by Category

| Category | Test Files | Tests |
|---|---|---|
| Library (`src/lib/`) | 24 | ~450 (est.) |
| Components (`src/components/`) | 25 | ~200 (est.) |
| App pages (`src/app/`) | 18 | ~120 (est.) |
| Pipeline | 2 | ~15 (est.) |
| Scripts | 1 | 19 |
| **Total** | **70** | **794** |

Note: per-file test counts were not captured in this run; the totals above are estimated from file-level proportions. All 794 tests passed.
