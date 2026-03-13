# Comprehensive Audit & Quality Improvement — Design Spec

**Date:** 2026-03-12
**Status:** Approved (v2 — refocused on trustworthiness)
**Goal:** Make the accountability dashboard production-ready by fixing what CAN work now, marking what can't as "in development," and reorienting the rep page around trustworthiness — not party loyalty.

---

## 1. Context

The accountability dashboard tracks what politicians say vs. what they do, covering Congress, the executive branch, and the judiciary. It has ~99 components, 37 JSON data files, 3 TypeScript data files, 35+ routes, and multiple data pipelines.

### Core Principles

**1. Trustworthiness over partisanship.**
Every data point on a rep page should answer: **"Can we trust this person?"**
- NOT "do they vote with their party"
- NOT "where are they on the liberal/conservative spectrum"

**2. Plain language first, details on demand (site-wide).**
Political and financial data is hard to understand. The app serves citizens, not policy wonks. Every data-heavy section must follow a three-layer progressive disclosure pattern:
- **Summary layer (always visible):** Plain-language explanation. "Voted YES on expanding Medicare coverage for veterans" — not "H.R. 4521 — Yea"
- **Detail layer (expandable):** Full bill info, vote breakdowns, itemized disclosures, raw data
- **Reference layer (collapsible/footnotes):** Citations, data sources, methodology — available but never cluttering main content

This applies everywhere: voting records, financial disclosures, campaign finance, conflicts of interest, executive orders, bill sponsorships. A list of someone's financial disclosures should not dominate their profile — summarize the portfolio, let users expand for details.

### Data Architecture (Dual-Source)
- **Static JSON files** (`src/data/*.json`) — 37 files, some pipeline-generated, some manually curated
- **TypeScript data files** (`src/data/*.ts`) — `doge.ts`, deep-dive content, executive types
- **External API** (`src/lib/api-client.ts`) — live API at `reps-api.arialabs.ai`, consumed via SWR hooks
- **SWR hooks** (`src/hooks/`) — `useApi.ts`, `useLeaderboard.ts`, `useLiveData.ts`, `useMembers.ts`, `useVotes.ts`
- **Data loaders** (`src/lib/data.ts`, `src/lib/congress.ts`) — static import layer
- **Turso database** (`database/schema.sql`) — SQLite at the edge, status TBD
- **Pipeline scripts** (`pipeline/`, `scripts/`) — 30+ scripts that generate/update JSON data files

### Build Constraint
The app uses `output: "export"` (fully static site deployed to Cloudflare Pages):
- No server-side rendering at runtime
- ISR `revalidate` calls are ignored (build-time only)
- `redirect()` calls produce HTML meta-refresh, not server redirects
- API keys are only available at build time unless exposed as `NEXT_PUBLIC_*`

### Current State — What's Actually Broken

**Rep page audit (12 sections analyzed):**

| Section | Status | Problem |
|---------|--------|---------|
| **Donor Capture Score** | Partial | Works for PAC %, but "conflicts" count depends on manually curated data (~15 members only) |
| **Campaign Finance** | Best section | finance.json has ~500 members. Missing: billionaire tracking, Super PAC vs PAC, dark money |
| **Conflict of Interest** | Broken | Uses runtime FEC API calls that fail in static builds. Empty for deployed users. |
| **Conflict Callouts (Say vs Do)** | Nearly empty | Manually curated in TypeScript for ~15 members. Not systematic. |
| **Alignment Scoring** | Disabled | Turned off entirely per issue #84. Commented out in page.tsx. |
| **Voting Record** | Wrong focus | Shows party loyalty % and ideology spectrum — not what the user wants |
| **Key Votes** | Partial | Manually curated subset. Shows votes but doesn't connect to stated positions. |
| **Recent Votes** | Partial | Depends on live-votes.json sync. Many members have no recent data. |
| **Vote History** | Works | Client-side Congress.gov fetch. Functional but not analyzed. |
| **Stock Trades** | Broken | 75MB file too large for deployment. Per-member files don't exist. |
| **Financial Disclosures** | Minimal | House only. Just PDF links — no extracted net worth data. |
| **Scandals** | Sparse | ~20 members have data. 515 members show nothing. |
| **Latest News** | Unreliable | Depends on Perplexity API + news-cache that may not be populated. |

## 2. Approach

**Option A: Make what CAN work actually work.** Fix existing data/features that have real data behind them, deprioritize party loyalty, mark features needing new data sources as "in development," and plan Phase 2 (future) for bigger features.

### What CAN Work Now (has data, needs fixing)
1. **Campaign finance** — finance.json has data for ~500 members. Make donor analysis the lead section.
2. **Voting records** — key-votes.json, live-votes.json, Congress.gov API all have real data. Reframe away from party loyalty toward "how they vote on issues that matter."
3. **Conflicts of interest** — the detection logic exists but breaks in static builds. Pre-compute at build time instead of runtime API calls.
4. **Stock trades** — data exists (75MB) but isn't deployable. Split into per-member files at build time.
5. **Scandals** — data exists for ~20 members. Show it where it exists, clean empty state elsewhere.
6. **Member basics** — images, bio, contact info. Fix missing images with fallbacks.

### What Gets "In Development" Labels
1. **Say vs Do / Alignment scoring** — disabled, needs fundamental redesign + new data pipeline
2. **Net worth tracking** — requires parsing financial disclosure PDFs, building historical data
3. **Billionaire / dark money donor tracking** — requires new data sources beyond OpenFEC
4. **Latest News** — unreliable without consistent news-cache population

### What Gets Deprioritized / Removed
1. **Party loyalty %** — remove from prominent position or reframe
2. **Ideology spectrum (DW-NOMINATE)** — move to an "advanced" or "wonk" section, not the main view

## 3. Phase 1 — Audit (Parallel, No Code Changes)

Seven parallel subagents, each producing a findings report. Audit is now focused through the lens of "does this help a citizen decide if they can trust this person?"

### 3.1 Data Integrity Audit
- **Scope:** `src/data/**/*.{json,ts}`, `src/types/`
- **Checks:**
  - Missing or null fields that should be required
  - ID mismatches between files (member ID in `members.json` vs `finance.json` vs `alignment-scores.json`)
  - Type definitions that don't match actual JSON shape
  - Data completeness per trustworthiness signal:
    - Finance data: how many of 535 members have full donor breakdown?
    - Scandals: which members have entries vs. empty?
    - Key votes: coverage across members?
    - Stock trades: is the 75MB file parseable and splittable?
  - TypeScript data files (`doge.ts`, deep-dives, executive types) — validate structure and imports

### 3.2 Data Flow & API Audit
- **Scope:** `src/lib/`, `src/hooks/`, component imports
- **Checks:**
  - Same entity loaded from different sources across pages
  - Mismatched field names between loader output and component expectations
  - Broken references between data files
  - **Critical: Conflict detection at build time** — can `detectConflicts()` be pre-computed during build instead of calling FEC API at runtime?
  - **API contract:** Do `ApiMember` fields match `Member` fields? Fallback behavior?
  - **SWR hooks:** Error handling and static data fallback
  - **LatestNews/Perplexity:** Is news-cache populated? Working in production?
  - **Turso database:** Active or vestigial?
  - Missing error handling for absent data

### 3.3 Pipeline Audit
- **Scope:** `pipeline/`, `scripts/`, `.github/workflows/`
- **Checks:**
  - Which data files are pipeline-generated vs. manually curated?
  - Do pipeline scripts produce valid output?
  - Are GitHub Actions workflows functional?
  - Does `npm run build` succeed locally (including prebuild)?
  - **Can stock trades be split into per-member files as a build step?**
  - **Can conflict detection be added as a pre-computation pipeline step?**

### 3.4 Page Rendering Audit
- **Scope:** Every route in `src/app/`
- **Checks:**
  - Pages that crash or show errors
  - Empty states (no data -> blank page)
  - Missing or broken data display
  - Layout issues, overflow, alignment
  - Navigation dead ends
  - Patterns incompatible with `output: "export"` (`revalidate`, `redirect()`)
  - **Rep page section ordering:** Does the current layout lead with trustworthiness signals or party loyalty?
  - **SEO:** Canonical URL consistency, sitemap vs. routes, structured data
  - **Admin routes:** `/admin/vote-sync` excluded from sitemap?

### 3.5 Asset Audit
- **Scope:** `/public/`, image references in components
- **Checks:**
  - Missing representative headshots (list which members lack images)
  - Broken image paths
  - Missing fallback/placeholder images
  - Icon and PWA asset integrity
  - Orphan files (`scotus.json.backup`, unused assets)

### 3.6 Test Health & Build Audit
- **Scope:** Test files, `vitest run` output, build pipeline
- **Checks:**
  - Currently failing tests (count, which ones, why)
  - Critical paths with no test coverage
  - Tests that pass but test wrong behavior
  - Does `npm run build` complete successfully?
  - Do prebuild scripts complete?

### 3.7 Code Quality Audit
- **Scope:** `src/components/`, `src/lib/`, `src/hooks/`
- **Checks:**
  - Dead/unreachable code (especially disabled alignment scoring)
  - Orphan files: files imported by nothing, backup files, dead exports
  - Inconsistent data loading patterns
  - Error handling gaps
  - Patterns incompatible with `output: "export"`
  - **Accessibility baseline:** ARIA attributes, alt text, keyboard handlers

### Audit Output
Each subagent writes findings to `docs/superpowers/specs/audit/<domain>-findings.md` with:
- Issue description
- Severity (critical / major / minor)
- Location (file:line)
- Suggested fix category
- **Fix target:** pipeline script / data file / loader / component / config
- **Trustworthiness relevance:** Does this fix serve the core mission?

## 4. Consolidation

### Consolidation Protocol
1. **Deduplicate:** Group findings by root cause, keep most specific description
2. **Root-cause attribution:** Assign each finding to exactly one fix phase (pipeline / data / loader / component / config)
3. **Severity resolution:** Use higher severity when agents disagree
4. **Organize by fix tier:** P1 (data/pipeline) -> P2 (components) -> P3 (UI/UX) -> P4 (QA)
5. **Trustworthiness filter:** Prioritize fixes that directly improve the "can we trust them?" experience

## 5. Phase 2 — Data Layer Fixes (Sequential, P1)

**Blocks all other fix work.**

### Target Data Architecture
- **Static JSON** is the primary data source for the static export build
- **API client + SWR hooks** provide live overlays; must fall back to static data when API is unreachable
- **Pipeline scripts** are the source of truth for generated data — fix the pipeline, not the JSON
- **Direct component imports** of data files eliminated in favor of `src/lib/data.ts`
- **Build-time pre-computation** for data that currently requires runtime API calls (conflicts, stock trade splits)

### Fix Items
- Fix pipeline scripts producing invalid/inconsistent output
- Fix manually-curated JSON/TS data: missing fields, null values, ID mismatches
- Consolidate data loaders: one canonical import path per entity type via `src/lib/data.ts`
- Align TypeScript types with actual data shapes
- **Pre-compute conflict detection at build time** (move FEC API calls from page render to build pipeline)
- **Split stock trades into per-member JSON files** as a build step
- Verify cross-file references (member IDs match across all data files)
- Determine Turso database status and either integrate or remove
- Fix `revalidate` and other static-export-incompatible patterns
- **Populate news-cache** if feasible, or mark LatestNews as "in development"

## 6. Phase 3 — Component Layer Fixes (Parallelizable, P2)

### Rep Page Reorientation
The rep page must lead with trustworthiness, not party stats:

**New section priority order:**
1. **Donor Capture Score** (who do they work for?) — already exists, needs to work with pre-computed conflict data
2. **Campaign Finance** (who funds them?) — best existing section, make it prominent
3. **Conflicts of Interest** (do they vote for their donors?) — fix to use pre-computed data
4. **Voting Record** (how do they vote on issues?) — reframe from party loyalty to issue-based voting
5. **Stock Trades** (are they insider trading?) — fix deployment, show data
6. **Scandals** (any controversies?) — show where data exists, clean empty state
7. **"In Development" section** — grouped placeholder for Say vs Do, Net Worth, etc.

**Deprioritized/moved:**
- Party loyalty % — remove from main view or move to a collapsible "Details" section
- Ideology spectrum — same treatment

### Progressive Disclosure Refactor (Site-Wide)
Every data-heavy component must be audited and refactored to follow the three-layer pattern:
- **Voting records:** Show plain-language vote summaries (what the bill does, how they voted, why it matters). Bill numbers, roll call details, party breakdowns in expandable section.
- **Financial disclosures:** Summarize portfolio (total assets, notable holdings, change since taking office if available). Individual filing PDFs in expandable section.
- **Campaign finance:** Lead with "who funds them" narrative (PAC-dependent? grassroots?). Itemized contributor lists in expandable section.
- **Conflicts of interest:** Lead with plain-language conflict description ("Received $500K from pharma industry, then voted against drug price caps"). Vote/donation details expandable.
- **Executive orders:** Summary of what the order does and who it affects. Full text/legal details expandable.
- **Citations/sources:** Never in main content flow. Use footnote markers, collapsible reference sections, or "Sources" accordion at bottom of each section.

### General Component Fixes
- Fix components consuming data incorrectly (wrong field names, missing null checks)
- Ensure consistent data paths within each section
- Add proper loading and error states
- Handle missing data gracefully (null-safe rendering)
- Fix `LatestNews` (news-cache mechanism or "in development")

## 7. Phase 4 — UI/UX Polish (Parallelizable, P3)

- **Missing images:** Add fallback avatars (professional silhouette placeholder), source images where possible
- **Empty states:** "No data available" with explanation, not blank sections
- **"In Development" labels:** Professional, consistent badge/banner for deferred features:
  - Say vs Do analysis
  - Net worth tracking
  - Billionaire / dark money tracking
  - LatestNews (if news-cache unfixable)
- **Navigation:** All links work, no dead ends
- **Responsiveness:** Key pages at mobile/tablet/desktop
- **Visual consistency:** Colors, spacing, typography
- **Accessibility:** Alt text on all images, keyboard-navigable interactive elements, WCAG AA contrast
- **SEO:** Fix domain mismatches, validate sitemap, exclude admin routes

## 8. Phase 5 — QA & Testing (Sequential, P4)

- Fix all failing tests
- Add tests for critical data paths: loader -> component -> render
- Run full test suite, confirm green
- Verify `npm run build` succeeds end-to-end
- Manual verification pass on every route
- Cross-check rendered data against source data for accuracy
- **Verify rep page section ordering matches trustworthiness priority**

## 9. Execution Guardrails

- **No git commits or pushes** without explicit user approval
- **Refactors preserve existing behavior** unless explicitly replacing a broken implementation
- **Every change is verifiable** via test or manual check
- **Verification after each tier:** test suite + rendering check before moving to next tier
- **Dev server** running locally for live review throughout
- **Pipeline-generated data:** Fix the pipeline script, not the output file
- **Trustworthiness lens:** Every fix should be evaluated against "does this help citizens evaluate trustworthiness?"

## 10. Definition of Done

1. **Zero test failures** — `npm run test:run` exits cleanly
2. **Build succeeds** — `npm run build` completes without errors
3. **All routes render** — every route produces a page without crashes (unless marked "in development")
4. **Type safety** — no mismatches between TypeScript types and actual data shapes
5. **Image coverage** — all member images load or show a professional fallback
6. **Data consistency** — member IDs match across all data files; no contradictory scores
7. **Accessibility baseline** — all images have alt text, interactive elements keyboard-navigable
8. **SEO correct** — canonical URLs consistent, sitemap matches routes, admin pages excluded
9. **Rep page leads with trustworthiness** — donor capture, finance, conflicts, voting record are the primary sections; party loyalty is deprioritized
10. **"In Development" sections are clearly labeled** — Say vs Do, Net Worth, dark money tracking show professional placeholders
11. **Progressive disclosure everywhere** — all data-heavy sections show plain-language summaries first, raw details in expandable sections, citations not in main content

## 11. Deliverables

1. Audit findings per domain (`docs/superpowers/specs/audit/`)
2. Consolidated prioritized backlog
3. All code changes in working tree (uncommitted) for user review
4. Green test suite
5. Successful build
6. Every route rendering correctly with accurate data
7. Rep page reoriented around trustworthiness

## 12. Future Phase 2 (Out of Scope for This Effort)

These require new data sources, pipelines, or significant R&D:

1. **Say vs Do / Alignment Scoring** — redesign the scoring methodology, connect campaign promises to voting record
2. **Net Worth Tracking** — parse financial disclosure PDFs, build historical net worth database
3. **Billionaire Donor Tracking** — identify individual wealthy donors beyond PAC aggregates
4. **Dark Money / 501c4 Tracking** — new data sources required (OpenSecrets, IRS data)
5. **Super PAC vs. Regular PAC** — FEC data distinguishes these but current pipeline doesn't
6. **Systematic Scandal Detection** — automate ethics violation tracking beyond manual curation
7. **Post-Office Revolving Door** — track where former reps go after leaving office
