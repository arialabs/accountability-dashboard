# Code Quality Audit Findings

**Audit date:** 2026-03-12
**Codebase size:** 240 source files, 74 non-test component TSX files
**Output mode:** `output: "export"` (static export)

---

## 1. Dead Code

### 1.1 Commented-out alignment scoring components (HIGH severity)

Three components exist and are defined but their imports in `src/app/rep/[id]/page.tsx` are commented out — they are rendered nowhere in the live application (lines 16–18 of that file):

| Component | File | Status |
|---|---|---|
| `AlignmentScoreCard` | `src/components/AlignmentScoreCard.tsx` | Commented-out import, never rendered |
| `AlignmentScoreCardEnhanced` | `src/components/AlignmentScoreCardEnhanced.tsx` | Commented-out import, never rendered |
| `VoteBasedPositions` | `src/components/VoteBasedPositions.tsx` | Commented-out import, never rendered |

`AlignmentScoreCardEnhanced` imports `ScoreBreakdownModal`, which is therefore only used by a dead component.
`VoteBasedPositions` is the only consumer of `src/lib/vote-based-scoring.ts`.

**Fix target:** Either re-enable these components (pending issue #84 resolution) or delete them and their associated lib files. Keeping them creates a maintenance burden and confuses future contributors.

---

### 1.2 Orphan components — never imported by any page or component (HIGH severity)

These components have zero non-test import references:

| Component | File | Notes |
|---|---|---|
| `AlignmentLeaderboard` | `src/components/AlignmentLeaderboard.tsx` | Only referenced in its own `AlignmentLeaderboard.test.tsx` |
| `AlignmentLeaderboardLive` | `src/components/AlignmentLeaderboardLive.tsx` | Zero references outside itself |
| `CongressContentLive` | `src/components/CongressContentLive.tsx` | Uses `useLiveMembers` hook; was likely the planned live congress page |
| `FinancialSection` | `src/components/FinancialSection.tsx` | No references anywhere |
| `HamburgerMenu` | `src/components/HamburgerMenu.tsx` | `Navigation.tsx` implements its own mobile hamburger inline; this file is a duplicate |
| `IndustryBreakdownChart` | `src/components/IndustryBreakdownChart.tsx` | No references anywhere |
| `LoadingSkeleton` | `src/components/LoadingSkeleton.tsx` | No references anywhere |
| `VotingCharts` | `src/components/VotingCharts.tsx` | No references anywhere |
| `WealthTracker` | `src/components/WealthTracker.tsx` | No references anywhere |
| `CampaignPositions` | `src/components/CampaignPositions.tsx` | Only mentioned in `alignment.ts` and `alignment-enhanced.ts` comments (not imports) |

**Fix target:** Delete or archive all of the above. `HamburgerMenu` has a large test file (`HamburgerMenu.test.tsx` with 25+ test cases) that should also be removed if the component is deleted.

---

### 1.3 Orphan lib modules — no non-test consumers (MEDIUM severity)

| Module | File | Notes |
|---|---|---|
| `say-vs-do` | `src/lib/say-vs-do.ts` | Large, complex module (~500 lines). Has its own test file but is imported nowhere in production code. |
| `og-utils` | `src/lib/og-utils.ts` | Exports `getRepOgData`, `getCabinetOgData`, `formatDollars`. Only imported by `og-utils.test.ts`. No OpenGraph image routes (`opengraph-image.tsx`) exist to consume it. |
| `sector-mapping` | `src/lib/sector-mapping.ts` | Exports sector/committee conflict detection. Zero production imports. |
| `beneficiary-analysis` | `src/lib/beneficiary-analysis.ts` | Exports legislation impact analysis functions. Zero production imports. |

**Fix target:** Delete or add `// TODO: wire up` comments with an issue reference. `say-vs-do` in particular represents significant unshipped work.

---

### 1.4 Partially-dead lib exports (LOW severity)

Within modules that ARE imported, some individual exports are never consumed:

**`src/lib/alignment.ts`** (imported by `CampaignPositions` which is itself orphaned):
- `isVoteAligned` — 0 usages outside the module
- `getRelevantCategories` — 0 usages outside the module
- `VoteWithWeight` (type) — 0 usages outside the module

**`src/lib/alignment-enhanced.ts`** (imported by `AlignmentScoreCardEnhanced` which is dead):
- `ScoreFactor` (type) — 0 usages outside the module
- `getScoreExplanation` — 0 usages outside the module

These become fully dead if the parent components are deleted (see 1.1).

---

### 1.5 Duplicate executive type files (MEDIUM severity)

Two files define overlapping executive data types:

- `src/data/executive-types.ts` — defines `PresidentialPromise`, `CabinetMember`, `AlignmentScore`, `CabinetMemberStats`, `ExecutiveOrder`, etc.
- `src/types/executive.ts` — defines `ExecutiveOfficial`, `ConflictSeverity`, `ConflictCategory`, `ExecutiveAction`, `BudgetImpact`, `AffectedProgram`, etc.

`src/data/executive-types.ts` is **never imported anywhere** in the codebase. All active code uses `src/types/executive.ts`. Both files define a `CabinetMember` interface (with different shapes) and an `ExecutiveOrder` interface.

**Fix target:** Delete `src/data/executive-types.ts` entirely. If any types in it are needed, migrate them to `src/types/executive.ts`.

---

## 2. Data Loading Patterns

### Summary by category

| Category | Count | Files |
|---|---|---|
| Props from parent (correct) | Most components | Standard pattern |
| Central loader via `src/lib/data.ts` | Used by pages | Correct pattern |
| Direct JSON import in component | 11 imports across 8 components | Inconsistent — see below |
| Client-side fetch via `useEffect` | 4 components | Mixed — some correct, some broken |
| Direct API call in component | 2 components | Broken in static export — see section 4 |

### 2.1 Direct JSON imports in components (MEDIUM severity)

These components bypass `src/lib/data.ts` and import raw JSON directly. This prevents centralized transformation, type validation, and future database migration:

| Component | Direct import(s) |
|---|---|
| `src/components/AgencyBudget.tsx` | `@/data/cabinet-spending.json` |
| `src/components/ConflictDataViz.tsx` | `@/data/committee-conflicts.json`, `@/data/trading-summaries.json`, `@/data/members.json` |
| `src/components/DevelopmentBanner.tsx` | `@/data/vote-sync-status.json` |
| `src/components/TopCapturedPanel.tsx` | `@/data/top-captured.json` |
| `src/components/VoteModal.tsx` | `@/data/members.json` |
| `src/components/RepSearch.tsx` | `@/data/finance.json` |
| `src/components/LeadershipSpotlight.tsx` | `@/data/leadership-scrutiny.json`, `@/data/leadership-donors.json` |
| `src/components/ExpandableStaffRoster.tsx` | Type import only from `@/data/doge` (acceptable) |

`members.json` is the most frequently duplicated — imported directly in `ConflictDataViz`, `VoteModal`, and (via `data.ts`) indirectly everywhere else.

**Fix target:** Move data access for `members.json`, `finance.json`, `committee-conflicts.json`, `trading-summaries.json` into `src/lib/data.ts` as typed accessor functions; update the components to call those functions instead.

### 2.2 App-level direct JSON imports (LOWER priority)

Pages in `src/app/` also import JSON directly (28 imports across 16 page files). This is a less urgent concern since pages are the entry point and transformation is less likely to be needed. However, the pattern is inconsistent with pages that use `data.ts` helpers.

Notable: `src/app/page.tsx` (home) imports `leadership-finance.json`, `scandals.json`, `key-votes.json`, `bioguide-to-icpsr.json`, and `cabinet.json` directly — while `data.ts` exports helpers for several of these (e.g., `getAllScandals()`).

---

## 3. Accessibility Baseline

### Summary

- **Total non-test components:** 74
- **Components with at least one accessibility attribute** (`aria-*`, `role=`, `onKeyDown`, `onKeyPress`, `tabIndex`, or `alt=`): **38 of 74 (51%)**
- **Components with zero accessibility attributes:** **36 of 74 (49%)**

### 3.1 Critical gaps — interactive components with no ARIA (HIGH severity)

These components render interactive elements (buttons, sort controls, expand/collapse) with no ARIA attributes:

| Component | Interactive elements present | A11y attributes |
|---|---|---|
| `VoteHistorySection` | 3 sort/filter buttons, load-more button | None |
| `KeyVotes` | Sort buttons, expandable rows | None |
| `BudgetImpactCard` | Expand/collapse toggle button | None |
| `CommitteeMemberships` | Expandable sections with buttons | None |
| `MemberVotingRecord` | Sort/filter buttons | None |
| `VoteModal` | Modal dialog with close/action buttons | None |
| `SocialShare` | Copy-to-clipboard button | None |
| `TopCapturedPanel` | Rendered inside interactive list items | None |
| `AlignmentScoreCardEnhanced` | Score breakdown modal trigger | None (also dead code) |
| `VoteBasedPositions` | Expandable vote cards | None (also dead code) |

**Minimum required fixes for active components:**
- All `<button>` elements need `aria-label` when they lack visible text, or a descriptive accessible name.
- Sort-toggle buttons need `aria-pressed` to communicate state.
- `VoteModal` needs `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and focus management.
- Expand/collapse buttons need `aria-expanded`.

### 3.2 Components with no accessibility attributes (non-interactive, lower risk)

These components are display-only (no buttons/inputs) and carry lower a11y risk, but should still have semantic markup reviewed:

`IdeologySpectrumChart`, `ConflictOfInterestSection`, `AnimatedCounter`, `LayoutErrorBoundary`, `ScoreLegend`, `DonorAlertBadge`, `FinancialDisclosuresSection`, `DonorBreakdownBarChart`, `VerdictBanner`, `AffectedProgramsList`, `ConflictBadge`, `PWARegister`, `ScrollFadeIn`, `AlignmentLegend`, `PartyLoyaltyChart`, `AlignmentScoreCard`, `RecentVotesSection`, `VotingRecordSection`, `ErrorBoundary`, `LatestNews` (plus orphaned components).

### 3.3 Images with potentially missing meaningful alt text (MEDIUM severity)

- `src/app/congress/page.tsx` line 538: `<img alt="">` on a rep photo inside a `<Link>`. The link text following the image provides context, so `alt=""` is technically correct for decorative use — but the image carries identity information (photo of a representative). Consider `alt={rep.name}`.
- `RepSearch.tsx` renders two `<img>` tags. Both are inside link/card contexts — confirm they have appropriate alt text.

---

## 4. Static Export Incompatibilities

### 4.1 CRITICAL: Active components call non-existent API routes

The project uses `output: "export"` which means **no server-side API routes are built**. Two active, rendered components make runtime `fetch` calls to `/api/` paths that do not exist:

| Component | API call | Used in |
|---|---|---|
| `src/components/KeyVotes.tsx` | `fetch('/api/bills/summary?billId=...')` and `fetch('/api/bills/summary', {method:'POST'})` | `src/app/votes/page.tsx` |
| `src/components/LatestNews.tsx` | `fetch('/api/research?id=...')` | `src/app/rep/[id]/page.tsx` |

No `src/app/api/` directory exists. These fetches will silently fail (404) in the deployed static build. `KeyVotes` appears to have a fallback, but `LatestNews` likely renders empty.

**Fix target (URGENT):** Either remove these API calls and replace with static data, or document that these features are intentionally non-functional and add visible fallback UI.

### 4.2 HIGH: `revalidate` option in fetch calls is a no-op in static export

`next: { revalidate: N }` is a Next.js cache hint only meaningful in App Router server-rendered or edge environments. In `output: "export"` mode, all fetches run at build time and this option is silently ignored:

| File | Revalidate calls |
|---|---|
| `src/lib/congress.ts` | Lines 84, 136, 194 (3600s, 86400s, 3600s) |
| `src/app/executive/president/orders/page.tsx` | Line 25 (3600s) |

More critically, `src/app/executive/president/orders/page.tsx` is an `async` server component that fetches from the Federal Register API at build time with `{ next: { revalidate: 3600 } }`. In static export mode, this data is baked in at build time — it will never update after deployment until the next build.

**Fix target:** Remove `next: { revalidate }` options throughout as they are dead configuration. For `orders/page.tsx`, consider either documenting the build-time limitation or moving to a client-side fetch with a loading state.

### 4.3 MEDIUM: `VoteHistorySection` calls Congress.gov API client-side

`src/components/VoteHistorySection.tsx` uses `getMemberVotesClient` from `src/lib/congress.ts`, which makes a live client-side fetch to `https://api.congress.gov/v3/...` using `NEXT_PUBLIC_CONGRESS_API_KEY`. This works in a static export context (it runs in the browser), but:
- It exposes the public API key in the client bundle (by design per the comment in `congress.ts`, but should be documented).
- Rate limits and API availability are not handled beyond a `console.warn`.

---

## 5. Orphan Exports Summary

### Most significant orphan lib files (never imported in production)

| File | Size | What it does |
|---|---|---|
| `src/lib/say-vs-do.ts` | ~520 lines | Full "say vs. do" scoring algorithm. Has comprehensive tests. Completely unwired from UI. |
| `src/lib/og-utils.ts` | ~150 lines | OpenGraph metadata generators for rep and cabinet pages. No OG image routes exist to use it. |
| `src/lib/sector-mapping.ts` | ~140 lines | Sector/committee conflict detection. |
| `src/lib/beneficiary-analysis.ts` | ~290 lines | Legislation beneficiary impact analysis. |
| `src/data/executive-types.ts` | ~100 lines | Duplicate type definitions never imported. |

Total orphaned production code: approximately **1,300 lines** that are maintained but never executed.

---

## Prioritized Fix Plan

| Priority | Finding | Effort |
|---|---|---|
| P0 | `KeyVotes` and `LatestNews` call non-existent `/api/` routes — silent failures in production | Low (remove/stub) |
| P1 | Delete `src/data/executive-types.ts` (never imported, contains duplicate types) | Low |
| P1 | Delete 9 orphan components (AlignmentLeaderboard, AlignmentLeaderboardLive, CongressContentLive, FinancialSection, HamburgerMenu, IndustryBreakdownChart, LoadingSkeleton, VotingCharts, WealthTracker) | Low |
| P1 | Decision on alignment scoring trio (AlignmentScoreCard, AlignmentScoreCardEnhanced, VoteBasedPositions): re-enable or delete | Medium (depends on #84) |
| P2 | Remove `next: { revalidate }` options — dead config in static export | Low |
| P2 | Add `aria-label` / `aria-expanded` / `aria-pressed` to buttons in VoteHistorySection, KeyVotes, BudgetImpactCard, CommitteeMemberships, MemberVotingRecord, SocialShare | Medium |
| P2 | Add `role="dialog"` and focus management to `VoteModal` | Medium |
| P3 | Move `members.json` and `finance.json` accesses in ConflictDataViz, VoteModal, RepSearch through `data.ts` | Medium |
| P3 | Document or wire up `say-vs-do.ts`, `og-utils.ts`, `sector-mapping.ts`, `beneficiary-analysis.ts` | Varies |
| P4 | Align home page (`src/app/page.tsx`) to use `data.ts` helpers instead of direct JSON imports | Low |
