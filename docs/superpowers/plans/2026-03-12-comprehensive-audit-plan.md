# Comprehensive Audit & Quality Improvement — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the accountability dashboard production-ready — fix broken data, reorient rep pages around trustworthiness, add progressive disclosure for complex data, and ensure every route renders correctly.

**Architecture:** Layered data-out approach. Phase 1 audits the entire codebase (7 parallel subagents). Phase 2 fixes the data layer (sequential — shared dependencies). Phase 3 fixes components and reorients the rep page. Phase 4 polishes UI/UX. Phase 5 runs QA. Nothing is committed until the user reviews locally at the dev server.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS, Vitest, Cloudflare Pages

**Spec:** `docs/superpowers/specs/2026-03-12-comprehensive-audit-design.md`

**Note on commits:** All `git commit` steps in this plan are proposals pending user approval per spec guardrails. Do not commit without explicit user authorization.

---

## Chunk 1: Phase 1 — Audit

Phase 1 dispatches 7 parallel subagents. Each produces a findings report in `docs/superpowers/specs/audit/`. No code changes in this phase.

### Task 1: Data Integrity Audit

**Files:**
- Read: `src/data/*.json`, `src/data/*.ts`, `src/types/`, `src/lib/types.ts`
- Create: `docs/superpowers/specs/audit/data-integrity-findings.md`

- [ ] **Step 1: Audit member data completeness**

Check `src/data/members.json` (535 members). For each member, verify:
- `bioguide_id` is non-null and unique
- `full_name`, `party`, `state`, `chamber` are populated
- `photo_url` is a valid URL or null (not empty string)
- `bills_sponsored`, `bills_cosponsored`, `votes_cast` are numbers (not null)
- `party_loyalty_pct` — note how many are null (this field is being deprioritized anyway)

Report: count of members with complete data vs. partial, list specific missing fields.

- [ ] **Step 2: Audit cross-file ID consistency**

Verify that member IDs match across all data files:
- `src/data/members.json` → `bioguide_id`
- `src/data/finance.json` → keys are `bioguide_id`
- `src/data/alignment-scores.json` → `bioguide_id`
- `src/data/scandals.json` → `bioguide_id`
- `src/data/key-votes.json` → votes keyed by ICPSR ID (requires `src/data/bioguide-to-icpsr.json` mapping)
- `src/data/committee-conflicts.json` → keys are `bioguide_id`
- `src/data/house-disclosures.json` → keyed by `bioguide_id`
- `src/data/trading-summaries.json` → keyed by `bioguide_id`

Report: members present in `members.json` but missing from each other file (and vice versa).

- [ ] **Step 3: Audit type definition accuracy**

Compare interfaces in `src/lib/types.ts`, `src/types/executive.ts`, and `src/types/index.ts` against actual JSON data shapes. Flag:
- Fields in types that don't exist in data
- Fields in data that aren't in types
- Type mismatches (e.g., field typed as `number` but data has `null` or `string`)

- [ ] **Step 4: Audit finance data quality**

Check `src/data/finance.json`:
- How many of the 535 members have finance entries?
- Are `pac_percentage`, `small_donor_percentage`, `large_donor_percentage` consistent (sum to ~100)?
- Do `top_contributors` have `name`, `total`, `type` fields?
- Are there members with `total_raised: 0` that should have data?

- [ ] **Step 5: Audit scandals data quality**

Check `src/data/scandals.json`:
- How many unique `bioguide_id` entries exist?
- Do all entries have required fields (`severity`, `category`, `sources`, `status`)?
- Are `sources` arrays populated with valid URLs?
- List members WITH scandal data (for coverage awareness)

- [ ] **Step 6: Audit stock trades data**

Check `src/data/trades-by-member.json` (72MB):
- Is the file valid JSON and parseable?
- How many unique bioguide_ids have trade data?
- Sample 10 members — do trades have `ticker`, `tradedDate`, `transaction`, `tradeSizeUsd`?
- Can this file be split into per-member files programmatically?
- Check for `suspicious_flags` and `risk_score` population

- [ ] **Step 7: Audit key-votes data**

Check `src/data/key-votes.json`:
- How many votes total?
- Do all votes have `category`, `title`, `description`?
- How many have actual `description` text vs. empty strings?
- Are vote positions keyed by ICPSR ID? Verify with mapping file.
- What categories exist? (Healthcare, Climate, Defense, etc.)

- [ ] **Step 8: Write findings report**

Write `docs/superpowers/specs/audit/data-integrity-findings.md` with:
- Issue description, severity (critical/major/minor), location (file:line), fix target
- Summary statistics table (data coverage per file)
- Prioritized issue list

---

### Task 2: Data Flow & API Audit

**Files:**
- Read: `src/lib/data.ts`, `src/lib/api-client.ts`, `src/lib/conflict-detector.ts`, `src/lib/conflict-callouts.ts`, `src/lib/congress.ts`, `src/hooks/*.ts`, `src/app/rep/[id]/page.tsx`
- Create: `docs/superpowers/specs/audit/data-flow-findings.md`

- [ ] **Step 1: Map all data loading paths**

For each data entity (members, finance, votes, trades, scandals, disclosures, conflicts), document:
- Which file(s) load it
- Which function(s) are the entry points
- Which components consume it
- Whether it's loaded at build time, server-side, or client-side

Create a table: Entity → Loader → Consumer → Load Time

- [ ] **Step 2: Audit conflict detection build-time compatibility**

Read `src/app/rep/[id]/page.tsx` lines 107-162. The conflict detection:
- Checks `process.env.NEXT_PHASE !== 'phase-production-build'`
- Calls `detectConflicts()` which needs live FEC data
- This means conflicts are EMPTY in static builds

Determine: Can `detectConflicts()` be refactored to use static `finance.json` data instead of live FEC calls? Document what changes are needed.

- [ ] **Step 3: Audit API client and SWR hooks**

Read `src/lib/api-client.ts` and all files in `src/hooks/`:
- Does the API at `reps-api.arialabs.ai` respond? (Try a curl)
- Do SWR hooks fall back gracefully when API is down?
- Do `ApiMember` fields match `Member` fields?
- Which pages use hooks vs. static data?

- [ ] **Step 4: Audit LatestNews data flow**

Trace the LatestNews component:
- Does `src/data/news-cache.json` exist and have data?
- If not, does the component handle the missing cache gracefully?
- What happens on deployed static site without API keys?

- [ ] **Step 5: Audit Turso database usage**

Search codebase for `@libsql/client`, `TURSO_`, database imports:
- Is the Turso database actively queried at page render time?
- Or is it only used by pipeline scripts?
- Determine: keep, integrate, or remove?

- [ ] **Step 6: Check for inconsistent data loading patterns**

Identify cases where the same entity is loaded differently:
- Direct `import` of JSON file in component vs. function from `data.ts`
- `getMemberFinance()` (live FEC) vs. `getMemberFinanceStatic()` (static JSON)
- Components importing data files directly vs. receiving data as props

Flag every instance where a component imports a data file directly instead of going through `src/lib/data.ts`.

- [ ] **Step 7: Write findings report**

Write `docs/superpowers/specs/audit/data-flow-findings.md` with entity-loader-consumer table, compatibility issues, and recommended fixes.

---

### Task 3: Pipeline Audit

**Files:**
- Read: `pipeline/*.ts`, `scripts/*.ts`, `scripts/*.js`, `scripts/*.mjs`, `.github/workflows/*.yml`
- Create: `docs/superpowers/specs/audit/pipeline-findings.md`

- [ ] **Step 1: Catalog data files by origin**

For each JSON file in `src/data/`, determine if it's:
- **Pipeline-generated:** output of a script in `pipeline/` or `scripts/`
- **Manually curated:** hand-edited data
- **Build-computed:** generated during `npm run prebuild`

Create a table: File → Origin → Script → Last Updated

- [ ] **Step 2: Verify build pipeline**

Run: `npm run build` (or just the prebuild: `node scripts/compute-party-loyalty.mjs && npm run donor-percentiles`)
- Does prebuild complete without errors?
- Does `npm run build` succeed end-to-end?
- Document any failures with error messages.

- [ ] **Step 3: Audit GitHub Actions workflows**

Read all `.github/workflows/*.yml`:
- `deploy.yml` — does it reference correct build commands?
- `vote-sync.yml`, `usaspending-sync.yml`, `eo-sync.yml` — are they functional?
- Do any reference secrets or env vars that may be missing?

- [ ] **Step 4: Assess stock trade splitting feasibility**

Read `src/data/trades-by-member.json` structure. Determine:
- Can a script split this into `public/data/trades/{bioguideId}.json` files?
- What's the expected output size per member?
- Draft the approach for a build-time split script.

- [ ] **Step 5: Assess conflict pre-computation feasibility**

Read `src/lib/conflict-detector.ts` and `src/lib/conflict-callouts.ts`. Determine:
- Can conflict detection run against static `finance.json` data?
- What data does `detectConflicts()` actually need? (industries + key votes — both available statically)
- Draft approach for a prebuild script that generates `src/data/precomputed-conflicts.json`

- [ ] **Step 6: Write findings report**

Write `docs/superpowers/specs/audit/pipeline-findings.md`.

---

### Task 4: Page Rendering Audit

**Files:**
- Read: All `src/app/**/page.tsx` files (38 routes)
- Create: `docs/superpowers/specs/audit/page-rendering-findings.md`

- [ ] **Step 1: Test every route for crashes**

Start dev server (`npm run dev -- --port 3002`). For each of the 38 routes, attempt to load the page. Document:
- Routes that crash with errors
- Routes that render but show empty/broken content
- Routes that work correctly

Use `curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/<route>` for quick status checks, then inspect HTML for routes that return 200 but may be empty.

- [ ] **Step 2: Audit rep page section ordering**

Read `src/app/rep/[id]/page.tsx` lines 276-616. Document the current section order and map against the new trustworthiness priority:
1. Donor Capture Score
2. Campaign Finance
3. Conflicts of Interest
4. Voting Record (issue-based, not party loyalty)
5. Stock Trades
6. Scandals
7. "In Development" placeholder

Note where party loyalty % and ideology spectrum currently appear.

- [ ] **Step 3: Check static export compatibility**

Search all page files for:
- `revalidate` — ISR that's ignored in static export
- `redirect()` from `next/navigation` — produces meta-refresh in static export
- `headers()`, `cookies()` — server-only APIs incompatible with static export
- Dynamic route segments without `generateStaticParams()`

- [ ] **Step 4: Audit SEO infrastructure**

- Read `next-sitemap.config.js` — site URL is `accountability-dashboard.pages.dev`
- Read `src/lib/schema.ts` — check if URLs reference a different domain
- Check `public/robots.txt` and `public/sitemap.xml` for consistency
- Verify `/admin/vote-sync` is NOT in sitemap or IS excluded

- [ ] **Step 5: Write findings report**

Write `docs/superpowers/specs/audit/page-rendering-findings.md`.

---

### Task 5: Asset Audit

**Files:**
- Read: `public/images/`, `src/components/RepresentativeImage.tsx`, image references in components
- Create: `docs/superpowers/specs/audit/asset-findings.md`

- [ ] **Step 1: Audit representative image coverage**

The `RepresentativeImage` component uses a fallback chain:
1. Provided `photoUrl`
2. Congress.gov bioguide photo
3. TheUnitedStates.io mirror
4. Initials avatar

Check `src/data/members.json` — how many members have `photo_url` set?
For those without, verify the Congress.gov URL pattern works (sample 10 members).
Document the fallback behavior and whether initials avatar renders correctly.

- [ ] **Step 2: Audit cabinet/executive images**

Check `public/images/officials/` (23 files). Cross-reference against `src/data/cabinet.json` member list.
- Which cabinet members are missing images?
- Are image filenames consistent (lowercase last name)?

- [ ] **Step 3: Check for orphan files**

Look for:
- `src/data/scotus.json.backup` — should be deleted
- Any other `.backup`, `.old`, `.bak` files
- Files in `src/data/` not imported by any code
- Files in `public/` not referenced by any component

- [ ] **Step 4: Write findings report**

Write `docs/superpowers/specs/audit/asset-findings.md`.

---

### Task 6: Test Health & Build Audit

**Files:**
- Read: All `**/*.test.{ts,tsx}` files (53 files), `vitest.config.ts`
- Create: `docs/superpowers/specs/audit/test-build-findings.md`

- [ ] **Step 1: Run full test suite**

Run: `npm run test:run`
Document:
- Total tests, passing, failing, skipped
- List every failing test with error message
- Note any tests that timeout

- [ ] **Step 2: Run full build**

Run: `npm run build`
Document:
- Does prebuild (`compute-party-loyalty.mjs`, `icons:generate`, `donor-percentiles`) succeed?
- Does `next build` succeed?
- Any warnings or errors?
- Build time and output size?

- [ ] **Step 3: Identify coverage gaps**

Review the 53 test files against critical data paths:
- Is `src/lib/data.ts` (core data loader) tested?
- Are conflict detection functions tested?
- Are key components (DonorAnalysisSection, ConflictOfInterestSection) tested?
- Is the rep page tested?

Flag critical paths with no test coverage.

- [ ] **Step 4: Write findings report**

Write `docs/superpowers/specs/audit/test-build-findings.md`.

---

### Task 7: Code Quality Audit

**Files:**
- Read: `src/components/*.tsx`, `src/lib/*.ts`, `src/hooks/*.ts`
- Create: `docs/superpowers/specs/audit/code-quality-findings.md`

- [ ] **Step 1: Find dead code**

Search for:
- Disabled alignment scoring components (`AlignmentScoreCard`, `AlignmentScoreCardEnhanced`, `VoteBasedPositions`) — are they still imported anywhere?
- Exports in `src/lib/` that are never imported
- Components in `src/components/` that are never used in any page
- `src/data/executive-types.ts` — is it imported by anything, or are types redefined in `src/types/executive.ts`?

- [ ] **Step 2: Audit data loading patterns**

Categorize all components by how they get data:
- Props from parent (correct pattern)
- Direct JSON import (should go through `src/lib/data.ts`)
- Client-side fetch via hooks
- Direct API call

Flag every direct JSON import in a component.

- [ ] **Step 3: Audit accessibility baseline**

Search components for:
- `aria-` attributes — count how many components have them
- `alt=` on images — are all images accessible?
- `role=` attributes
- Keyboard event handlers (`onKeyDown`, `onKeyPress`)
- `tabIndex`

Report: X of 94 components have accessibility attributes. List the critical components that lack them.

- [ ] **Step 4: Check for static export incompatibilities**

Grep for patterns that don't work with `output: "export"`:
- `revalidate` in any page/layout
- `redirect()` usage
- `headers()`, `cookies()` usage
- Server actions (`"use server"`)

- [ ] **Step 5: Write findings report**

Write `docs/superpowers/specs/audit/code-quality-findings.md`.

---

### Task 8: Consolidation

**Files:**
- Read: All 7 findings reports in `docs/superpowers/specs/audit/`
- Create: `docs/superpowers/specs/audit/consolidated-backlog.md`

- [ ] **Step 1: Read all findings reports**

Read all 7 files in `docs/superpowers/specs/audit/`.

- [ ] **Step 2: Deduplicate findings**

Group findings that share a root cause. Example: "conflict detection empty on deployed site" might appear in data-flow, page-rendering, and code-quality audits — consolidate into one finding.

- [ ] **Step 3: Assign fix tiers**

For each unique finding, assign:
- **P1 (Data/Pipeline):** Fix in Phase 2
- **P2 (Components):** Fix in Phase 3
- **P3 (UI/UX):** Fix in Phase 4
- **P4 (QA):** Fix in Phase 5

- [ ] **Step 4: Prioritize within tiers**

Within each tier, sort by:
1. Severity (critical > major > minor)
2. Trustworthiness relevance (directly impacts "can we trust them?" experience)
3. User-facing impact (visible to users > internal only)

- [ ] **Step 5: Write consolidated backlog**

Write `docs/superpowers/specs/audit/consolidated-backlog.md` with:
- Summary statistics (total findings, by severity, by tier)
- P1 backlog (numbered, with fix instructions)
- P2 backlog
- P3 backlog
- P4 backlog

---

## Chunk 2: Phase 2 — Data Layer Fixes

These are the known data-layer fixes from the spec. Additional items will come from the audit findings (Task 8). All changes are sequential — they modify shared data files and loaders.

### Task 9: Pre-compute Conflict Detection at Build Time

**Files:**
- Create: `scripts/precompute-conflicts.ts`
- Create: `src/data/precomputed-conflicts.json` (generated output)
- Modify: `src/app/rep/[id]/page.tsx` (remove runtime conflict detection)
- Modify: `src/lib/data.ts` (add loader for precomputed conflicts)
- Modify: `package.json` (add to prebuild)
- Test: `scripts/precompute-conflicts.test.ts`

- [ ] **Step 1: Write failing test for precompute script**

```typescript
// scripts/precompute-conflicts.test.ts
import { describe, it, expect } from 'vitest'
import { precomputeConflicts } from './precompute-conflicts'

describe('precomputeConflicts', () => {
  it('generates conflict data for members with finance data', () => {
    const result = precomputeConflicts()
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
    // Should have entries keyed by bioguideId
    const keys = Object.keys(result)
    expect(keys.length).toBeGreaterThan(0)
    // Each entry should have conflicts and callouts arrays
    const first = result[keys[0]]
    expect(first).toHaveProperty('conflicts')
    expect(first).toHaveProperty('callouts')
    expect(Array.isArray(first.conflicts)).toBe(true)
    expect(Array.isArray(first.callouts)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/precompute-conflicts.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement precompute script**

**IMPORTANT:** `detectConflicts()` expects `IndustryTotal[]` (from `industry-classifier.ts`), NOT `CampaignFinance.top_industries` which is `IndustryDonation[]` — different type. The live rep page calls `aggregateByIndustry(scheduleAData)` to produce the right shape, but we don't have raw Schedule A data at build time.

**Approach:** Use `getConflictCallouts()` from `conflict-callouts.ts` which already handles static finance data correctly (it calls `classifyContributorsIntoIndustries()` internally). For `detectConflicts()`, either skip it or convert `top_contributors` to `IndustryTotal[]` via the industry classifier.

Create `scripts/precompute-conflicts.ts`:
```typescript
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { getConflictCallouts } from '../src/lib/conflict-callouts'

interface PrecomputedConflictData {
  [bioguideId: string]: {
    callouts: any[]
  }
}

export function precomputeConflicts(): PrecomputedConflictData {
  const dataDir = resolve(__dirname, '../src/data')

  const members = JSON.parse(readFileSync(resolve(dataDir, 'members.json'), 'utf-8'))
  const financeData = JSON.parse(readFileSync(resolve(dataDir, 'finance.json'), 'utf-8'))
  const keyVotes = JSON.parse(readFileSync(resolve(dataDir, 'key-votes.json'), 'utf-8'))
  const bioguideToIcpsr = JSON.parse(readFileSync(resolve(dataDir, 'bioguide-to-icpsr.json'), 'utf-8'))

  const result: PrecomputedConflictData = {}

  for (const member of members) {
    const finance = financeData[member.bioguide_id]
    if (!finance || !finance.top_contributors) continue

    const icpsrId = bioguideToIcpsr[member.bioguide_id]

    try {
      // getConflictCallouts handles static finance data correctly —
      // it calls classifyContributorsIntoIndustries() internally
      const callouts = getConflictCallouts(
        member.bioguide_id, finance, keyVotes, icpsrId
      )

      if (callouts.length > 0) {
        result[member.bioguide_id] = { callouts }
      }
    } catch (e) {
      console.warn(`Skipping ${member.bioguide_id}: ${e}`)
    }
  }

  return result
}

// CLI entry point
if (require.main === module) {
  console.log('Pre-computing conflict data...')
  const data = precomputeConflicts()
  const outPath = resolve(__dirname, '../src/data/precomputed-conflicts.json')
  writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log(`Wrote ${Object.keys(data).length} member conflict records to ${outPath}`)
}
```

**Note:** Read the actual `getConflictCallouts()` signature in `src/lib/conflict-callouts.ts` before implementing — verify it accepts static `finance` data and `keyVotes` array directly. Adjust parameter passing if the function expects different shapes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/precompute-conflicts.test.ts`
Expected: PASS

- [ ] **Step 5: Add loader to data.ts**

Add to `src/lib/data.ts`:
```typescript
import precomputedConflictsData from '@/data/precomputed-conflicts.json'

export function getMemberConflicts(bioguideId: string) {
  const entry = (precomputedConflictsData as any)[bioguideId]
  return entry || { conflicts: [], callouts: [] }
}
```

- [ ] **Step 6: Update rep page to use precomputed data**

In `src/app/rep/[id]/page.tsx`, replace the runtime conflict detection block (lines ~107-162) with:
```typescript
import { getMemberConflicts } from '@/lib/data'
// ...
const { conflicts, callouts } = getMemberConflicts(id)
```

Remove the `NEXT_PHASE` build-time check and runtime FEC calls.

- [ ] **Step 7: Add to package.json prebuild**

Update `package.json`:
```json
"prebuild": "node scripts/compute-party-loyalty.mjs && npm run icons:generate && npm run donor-percentiles && tsx scripts/precompute-conflicts.ts"
```

- [ ] **Step 8: Run build to verify**

Run: `npm run build`
Expected: Build succeeds with precomputed conflict data available.

- [ ] **Step 9: Commit**

```bash
git add scripts/precompute-conflicts.ts scripts/precompute-conflicts.test.ts src/data/precomputed-conflicts.json src/lib/data.ts src/app/rep/\\[id\\]/page.tsx package.json
git commit -m "feat: pre-compute conflict detection at build time — fixes empty conflicts on deployed site"
```

---

### Task 10: Split Stock Trades into Per-Member Files

**Files:**
- Create: `scripts/split-stock-trades.ts`
- Modify: `package.json` (add to prebuild)
- Modify: `src/components/StockTradesSection.tsx` (update path if needed)
- Test: `scripts/split-stock-trades.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// scripts/split-stock-trades.test.ts
import { describe, it, expect } from 'vitest'
import { splitStockTrades } from './split-stock-trades'
import { existsSync } from 'fs'

describe('splitStockTrades', () => {
  it('creates per-member JSON files', () => {
    const result = splitStockTrades({ dryRun: true })
    expect(result.memberCount).toBeGreaterThan(0)
    expect(result.totalTrades).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/split-stock-trades.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement split script**

Create `scripts/split-stock-trades.ts` that:
1. Reads `src/data/trades-by-member.json`
2. For each bioguideId key, writes `public/data/trades/{bioguideId}.json`
3. Creates the `public/data/trades/` directory if it doesn't exist
4. Reports: member count, total trades, output directory

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/split-stock-trades.test.ts`
Expected: PASS

- [ ] **Step 5: Add to prebuild and run**

Add to `package.json` prebuild. Run `npm run prebuild`.
Verify per-member files exist in `public/data/trades/`.

- [ ] **Step 6: Verify StockTradesSection loads correctly**

Check `src/components/StockTradesSection.tsx` — does it fetch from `/data/trades/{bioguideId}.json`?
If the path matches the output location, trades should now load.
Test by visiting a rep page with known trades on the dev server.

- [ ] **Step 7: Commit**

```bash
git add scripts/split-stock-trades.ts scripts/split-stock-trades.test.ts public/data/trades/ package.json
git commit -m "feat: split stock trades into per-member files for static deployment"
```

---

### Task 11: Consolidate Data Loaders

**Files:**
- Modify: `src/lib/data.ts` (central data loader)
- Modify: Components that directly import JSON files
- Test: `src/lib/data.test.ts`

- [ ] **Step 1: Identify all direct JSON imports in components**

Search for `import ... from '@/data/` or `from '../data/` in `src/components/` and `src/app/`.
List every instance. These should all go through `src/lib/data.ts`.

- [ ] **Step 2: Add missing loaders to data.ts**

For each data file imported directly by components, add a canonical loader function to `src/lib/data.ts`:
- `getKeyVotes()` — loads key-votes.json
- `getScandals()` / `getMemberScandals(bioguideId)` — loads scandals.json
- `getCommitteeConflicts(bioguideId)` — loads committee-conflicts.json
- `getTradingSummary(bioguideId)` — loads trading-summaries.json
- `getLeadershipScrutiny()` — loads leadership-scrutiny.json
- `getLeadershipDonors()` — loads leadership-donors.json
- `getCabinetSpending()` — loads cabinet-spending.json
- `getTopCaptured()` — loads top-captured.json
- `getVoteSyncStatus()` — loads vote-sync-status.json
- Note: `RepSearch.tsx` also imports `finance.json` directly — add `getAllFinance()` loader
- Any others found in Step 1

- [ ] **Step 3: Update components to use canonical loaders**

Replace every direct JSON import in components with the corresponding function from `src/lib/data.ts`.

- [ ] **Step 4: Write tests for new loaders**

Add tests to `src/lib/data.test.ts` for each new loader function.

- [ ] **Step 5: Run tests**

Run: `npm run test:run`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/data.ts src/lib/data.test.ts src/components/ src/app/
git commit -m "refactor: consolidate data loaders — all data access via src/lib/data.ts"
```

---

### Task 12: Fix Static Export Incompatibilities

**Files:**
- Modify: Pages with `revalidate`, `redirect()`, or server-only patterns
- Modify: `next-sitemap.config.js` (exclude admin routes)

- [ ] **Step 1: Find and remove revalidate**

Search for both patterns:
- **Export-level:** `export const revalidate = ...` in page files (silently ignored in static export)
- **Fetch-level:** `{ next: { revalidate: ... } }` inside `fetch()` calls (e.g., `src/app/executive/president/orders/page.tsx` line 25) — may cause errors or unexpected behavior in static export

Remove or replace with static data loading patterns.

- [ ] **Step 2: Audit redirect() calls**

Find all `redirect()` usage in pages. These produce meta-refresh in static export.
Replace with client-side navigation or `<meta>` redirects where needed.

- [ ] **Step 3: Exclude admin routes from sitemap**

In `next-sitemap.config.js`, add `/admin/*` to the exclude list.

- [ ] **Step 4: Run build to verify**

Run: `npm run build`
Expected: Clean build, no warnings about incompatible patterns.

- [ ] **Step 5: Commit (pending user approval)**

```bash
git add src/app/ src/lib/congress.ts next-sitemap.config.js
git commit -m "fix: remove static export incompatibilities and exclude admin from sitemap"
```

---

### Task 12.5: Resolve Turso Database and LatestNews (Conditional on Audit)

**Files:**
- Modify: Various (depends on audit findings)

- [ ] **Step 1: Resolve Turso database**

Based on Task 2 Step 5 audit findings:
- **If vestigial:** Remove `@libsql/client` from dependencies, remove database config references, delete `database/` directory contents (keep directory for reference)
- **If active:** Document which features use it and ensure it works in static export

- [ ] **Step 2: Resolve LatestNews**

Based on Task 2 Step 4 audit findings:
- **If news-cache can be populated:** Add `npm run research:fetch` to a periodic pipeline or prebuild
- **If not feasible:** Add LatestNews to the "Coming Soon" section on the rep page and either hide the component or show an "in development" label

- [ ] **Step 3: Commit (pending user approval)**

```bash
git add -A
git commit -m "fix: resolve Turso database status and LatestNews availability"
```

---

## Chunk 3: Phase 3 — Component Layer Fixes

### Task 13: Reorient Rep Page Section Order

**Files:**
- Modify: `src/app/rep/[id]/page.tsx`

- [ ] **Step 1: Read current page layout (lines 276-616)**

Understand the current section ordering in the JSX. Note: the current order is already close to the target:
1. ConflictCallout (line ~408)
2. DonorCaptureScore (line ~420)
3. DonorAnalysisSection (line ~435)
4. ConflictOfInterestSection (line ~446)
5. RecentVotesSection (line ~451)
6. MemberVotingRecord (line ~454)
7. VoteHistorySection (line ~478)
8. VotingRecordSection/party loyalty (line ~487) ← needs deprioritizing
9. StockTradesSection (line ~496)
10. FinancialDisclosuresSection (line ~504)
11. ScandalsSection (line ~514)

The main work is: (a) wrap VotingRecordSection in an ExpandableSection, (b) move RecentVotesSection into "Additional Details", (c) add "Coming Soon" section.

- [ ] **Step 2: Reorder sections for trustworthiness**

Target order in main content area:
1. `ConflictCallout` cards (narrative alerts — "say vs do" at top)
2. `DonorCaptureScore` (who do they work for?)
3. `DonorAnalysisSection` (campaign finance breakdown)
4. `ConflictOfInterestSection` (detected conflicts)
5. `MemberVotingRecord` (key votes — issue-based)
6. `VoteHistorySection` (full voting history from Congress.gov)
7. `StockTradesSection` (trading activity)
8. `ScandalsSection` (controversies)
9. `FinancialDisclosuresSection` (disclosure filings)
10. "In Development" placeholder section

Move to a collapsible "Additional Details" section:
- `VotingRecordSection` (party loyalty %, ideology spectrum)
- `RecentVotesSection` (raw recent roll calls)

- [ ] **Step 3: Add "In Development" placeholder section**

Create a clean, professional placeholder at the bottom of the main content:
```tsx
<section className="bg-slate-50 rounded-xl border border-slate-200 p-6">
  <h3 className="text-lg font-semibold text-slate-800 mb-2">Coming Soon</h3>
  <p className="text-sm text-slate-600 mb-4">
    We&apos;re building deeper accountability tools. These features are in active development:
  </p>
  <ul className="space-y-2 text-sm text-slate-600">
    <li className="flex items-center gap-2">
      <span className="text-amber-500">◆</span>
      <span><strong>Say vs. Do Analysis</strong> — comparing stated positions to actual votes</span>
    </li>
    <li className="flex items-center gap-2">
      <span className="text-amber-500">◆</span>
      <span><strong>Net Worth Tracker</strong> — wealth changes since taking office</span>
    </li>
    <li className="flex items-center gap-2">
      <span className="text-amber-500">◆</span>
      <span><strong>Dark Money Tracking</strong> — tracing undisclosed funding sources</span>
    </li>
    {/* Add conditionally if LatestNews is not working: */}
    <li className="flex items-center gap-2">
      <span className="text-amber-500">◆</span>
      <span><strong>AI News Summaries</strong> — automated news monitoring per representative</span>
    </li>
  </ul>
</section>
```

- [ ] **Step 4: Verify on dev server**

Load several rep pages on `http://localhost:3002/rep/[id]` and verify:
- Sections appear in new order
- Party loyalty is no longer prominent
- "Coming Soon" section renders correctly

- [ ] **Step 5: Commit**

```bash
git add src/app/rep/\\[id\\]/page.tsx
git commit -m "feat: reorient rep page around trustworthiness — deprioritize party loyalty"
```

---

### Task 14: Create Expandable/Collapsible Section Component

**Files:**
- Create: `src/components/ui/ExpandableSection.tsx`
- Test: `src/components/ui/ExpandableSection.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/ui/ExpandableSection.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpandableSection } from './ExpandableSection'

describe('ExpandableSection', () => {
  it('renders title and hides content by default', () => {
    render(
      <ExpandableSection title="Details">
        <p>Hidden content</p>
      </ExpandableSection>
    )
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.queryByText('Hidden content')).not.toBeVisible()
  })

  it('shows content when clicked', () => {
    render(
      <ExpandableSection title="Details">
        <p>Hidden content</p>
      </ExpandableSection>
    )
    fireEvent.click(screen.getByText('Details'))
    expect(screen.getByText('Hidden content')).toBeVisible()
  })

  it('starts expanded when defaultOpen is true', () => {
    render(
      <ExpandableSection title="Details" defaultOpen>
        <p>Visible content</p>
      </ExpandableSection>
    )
    expect(screen.getByText('Visible content')).toBeVisible()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/ExpandableSection.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement ExpandableSection**

Create `src/components/ui/ExpandableSection.tsx`:
```tsx
'use client'
import { useState } from 'react'

interface ExpandableSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  badge?: string // e.g., "3 items", "12 sources"
}

export function ExpandableSection({
  title, children, defaultOpen = false, className = '', badge
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left text-sm font-medium text-slate-700 hover:text-slate-900"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {title}
          {badge && (
            <span className="text-xs text-slate-400 font-normal">{badge}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
        aria-hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/ExpandableSection.test.tsx`
Expected: PASS

- [ ] **Step 5: Export from ui/index.ts**

Add `export { ExpandableSection } from './ExpandableSection'` to `src/components/ui/index.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ExpandableSection.tsx src/components/ui/ExpandableSection.test.tsx src/components/ui/index.ts
git commit -m "feat: add ExpandableSection component for progressive disclosure"
```

---

### Task 15: Add Progressive Disclosure to Voting Records

**Files:**
- Modify: `src/components/MemberVotingRecord.tsx`
- Modify: `src/components/VoteHistorySection.tsx`

- [ ] **Step 1: Read current MemberVotingRecord implementation**

Understand what it currently renders and how votes are displayed.

- [ ] **Step 2: Refactor to show plain-language summaries**

For each vote, show:
- **Summary (always visible):** `"Voted {YES/NO} on {plain-language description of what the bill does}"` — use `title` and `description` from key-votes.json
- **Category badge** (Healthcare, Climate, etc.)
- **Date**

Move to expandable section:
- Bill number (e.g., "H.R. 4521")
- Roll call number
- Full vote breakdown (yea/nay counts, party splits)
- Link to Congress.gov for the specific vote

Use `ExpandableSection` from Task 14.

- [ ] **Step 3: Add sources as collapsible reference**

At the bottom of the voting record section, add:
```tsx
<ExpandableSection title="Sources & Methodology" badge={`${voteCount} votes`}>
  <p className="text-xs text-slate-500">
    Voting data from Congress.gov via the official API. Key votes curated based on policy significance.
  </p>
</ExpandableSection>
```

- [ ] **Step 4: Verify on dev server**

Check rep pages — votes should now show plain language first, with bill details expandable.

- [ ] **Step 5: Commit**

```bash
git add src/components/MemberVotingRecord.tsx src/components/VoteHistorySection.tsx
git commit -m "feat: progressive disclosure for voting records — plain language first, details expandable"
```

---

### Task 16: Add Progressive Disclosure to Campaign Finance

**Files:**
- Modify: `src/components/DonorAnalysisSection.tsx`

- [ ] **Step 1: Read current implementation**

Read `src/components/DonorAnalysisSection.tsx` (389 lines).

- [ ] **Step 2: Restructure with summary layer**

**Always visible (summary):**
- Narrative verdict: "68% of funding comes from PACs and large donors" or "Primarily funded by small donors (< $200)"
- Total raised / total spent (one line)
- Visual: simple bar showing PAC vs. small donor split

**Expandable (details):**
- Top 10 contributors list
- Top 5 industries with percentile rankings
- Full pie/bar chart breakdown
- Individual vs. PAC vs. party contribution details

**Collapsible (sources):**
- "Data from Federal Election Commission (FEC), 2026 cycle. Updated weekly."
- Link to FEC filings

- [ ] **Step 3: Implement using ExpandableSection**

Wrap the detailed contributor and industry lists in `ExpandableSection` components.

- [ ] **Step 4: Verify on dev server**

Check several rep pages — finance section should show narrative summary first.

- [ ] **Step 5: Commit**

```bash
git add src/components/DonorAnalysisSection.tsx
git commit -m "feat: progressive disclosure for campaign finance — narrative summary first"
```

---

### Task 17: Add Progressive Disclosure to Conflicts, Disclosures, Scandals

**Files:**
- Modify: `src/components/ConflictOfInterestSection.tsx`
- Modify: `src/components/FinancialDisclosuresSection.tsx`
- Modify: `src/components/ScandalsSection.tsx`
- Modify: `src/components/StockTradesSection.tsx`

- [ ] **Step 1: Refactor ConflictOfInterestSection**

**Summary:** "X conflicts detected between top donors and voting record"
- Lead with the plain-language conflict description
- Severity badges visible

**Expandable:** Individual conflict cards with donation amounts, vote details, bill numbers

**Sources:** Methodology note about industry-vote mapping

- [ ] **Step 2: Refactor FinancialDisclosuresSection**

**Summary:** "X financial disclosure filings on record" or "No financial disclosures available" (for Senate)
- If House: brief summary of filing types and years

**Expandable:** Individual filing links with dates, types
- Keep PDF links but don't list them all upfront

**Sources:** "Data from House Clerk of Financial Disclosures"

- [ ] **Step 3: Refactor ScandalsSection**

**Summary:** "X documented controversies" with severity indicator
- Show the most severe scandal headline

**Expandable:** Full list of scandal cards with descriptions, outcomes

**Sources:** Collapsible source links per scandal entry

- [ ] **Step 4: Refactor StockTradesSection**

**Summary:** "X stock trades on record. Y flagged as potentially suspicious."
- Show risk score if available

**Expandable:** Individual trade cards with tickers, amounts, flags

**Sources:** "Trade data from congressional financial disclosures under the STOCK Act"

- [ ] **Step 5: Refactor executive order components**

Find the executive order display components in `src/app/executive/president/orders/` and related components.

**Summary:** What the order does, who it affects, estimated cost/savings
**Expandable:** Full order text, signing date, affected agencies, legal details
**Sources:** Federal Register links, budget analysis methodology

- [ ] **Step 6: Verify all sections on dev server**

Check several rep pages and the executive orders page — all sections should follow the summary → details → sources pattern.

- [ ] **Step 7: Commit (pending user approval)**

```bash
git add src/components/ConflictOfInterestSection.tsx src/components/FinancialDisclosuresSection.tsx src/components/ScandalsSection.tsx src/components/StockTradesSection.tsx src/app/executive/
git commit -m "feat: progressive disclosure for conflicts, disclosures, scandals, trades, executive orders"
```

---

### Task 18: Fix Component Data Consumption Issues

**Files:**
- Modify: Various components based on audit findings (Task 2 report)

- [ ] **Step 1: Review data-flow audit findings**

Read `docs/superpowers/specs/audit/data-flow-findings.md` for specific broken component-data connections.

- [ ] **Step 2: Fix null/undefined handling**

For each component flagged:
- Add null checks for optional data props
- Show appropriate empty states instead of crashing
- Handle missing finance data, missing scandal data, etc.

- [ ] **Step 3: Fix mismatched field names**

If any components reference fields that don't exist in the data (flagged in audit), fix the field references.

- [ ] **Step 4: Run tests**

Run: `npm run test:run`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ src/lib/
git commit -m "fix: component data consumption — null handling, field name corrections"
```

---

## Chunk 4: Phase 4 & 5 — UI/UX Polish + QA

### Task 19: Add Fallback Images and Fix Missing Assets

**Files:**
- Modify: `src/components/RepresentativeImage.tsx` (if needed)
- Delete: `src/data/scotus.json.backup` (orphan file)
- Clean up other orphan files from audit

- [ ] **Step 1: Verify RepresentativeImage fallback chain**

The component already has a 4-step fallback (photoUrl → Congress.gov → TheUnitedStates.io → initials).
Verify this works by loading a rep page for a member with no photo_url.

- [ ] **Step 2: Fix cabinet member images**

Cross-reference `src/data/cabinet.json` against `public/images/officials/`.
For any missing images, check if the component falls back correctly.

- [ ] **Step 3: Clean up orphan files**

Based on asset audit findings:
- Delete `src/data/scotus.json.backup`
- Delete any other orphan files identified

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: clean up orphan files, verify image fallback chain"
```

---

### Task 20: Improve Empty States Site-Wide

**Files:**
- Modify: Components that render empty when data is missing

- [ ] **Step 1: Identify all empty-state scenarios**

From the page rendering audit, list every component that renders blank/nothing when data is absent.

- [ ] **Step 2: Add meaningful empty states**

For each component, when data is null/empty, render a helpful message:
- `ConflictOfInterestSection`: "No donor-vote conflicts detected" (positive framing)
- `ScandalsSection`: "No documented controversies"
- `StockTradesSection`: "No congressional stock trade data available"
- `FinancialDisclosuresSection`: "Financial disclosures not yet available for this member"
- `MemberVotingRecord`: "Key vote data being compiled"

Each empty state should be styled consistently (light background, slate text, centered).

- [ ] **Step 3: Verify on dev server**

Load rep pages for members with sparse data. All sections should show clean empty states.

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "fix: add meaningful empty states for all data sections"
```

---

### Task 21: Fix Navigation, SEO, and Accessibility Basics

**Files:**
- Modify: `next-sitemap.config.js` (already done in Task 12 — verify)
- Modify: Components missing alt text
- Modify: Interactive elements missing keyboard support

- [ ] **Step 1: Fix SEO domain mismatch**

Ensure `next-sitemap.config.js` site URL matches the production domain.
Check `src/lib/schema.ts` for consistent canonical URLs.

- [ ] **Step 2: Add alt text to all images**

From the code quality audit, find images missing `alt` attributes. Add descriptive alt text.

- [ ] **Step 3: Add keyboard navigation to interactive elements**

Ensure all clickable elements are either `<button>` or `<a>` tags (not `<div onClick>`).
Add `tabIndex` and `onKeyDown` handlers where needed.

- [ ] **Step 4: Commit**

```bash
git add src/components/ next-sitemap.config.js src/lib/schema.ts
git commit -m "fix: SEO consistency, image alt text, keyboard navigation"
```

---

### Task 22: Fix Failing Tests

**Files:**
- Modify: Test files and their source files based on test-build audit

- [ ] **Step 1: Run full test suite**

Run: `npm run test:run`
Document all failures.

- [ ] **Step 2: Fix each failing test**

For each failure, determine if:
- The test is wrong (update the test)
- The code is wrong (fix the code)
- The test references removed/changed functionality (update or remove test)

- [ ] **Step 3: Run full test suite again**

Run: `npm run test:run`
Expected: All tests pass (zero failures).

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "fix: resolve all failing tests"
```

---

### Task 23: Add Tests for Critical Paths

**Files:**
- Create/Modify: Test files for untested critical paths

- [ ] **Step 1: Write test for precomputed conflict loading**

Test that `getMemberConflicts()` returns data for members with finance entries.

- [ ] **Step 2: Write test for progressive disclosure components**

Test that `ExpandableSection` toggles correctly (already done in Task 14).
Test that `DonorAnalysisSection` renders summary without expanding.

- [ ] **Step 3: Write test for stock trade per-member loading**

Test that `StockTradesSection` loads from per-member file path.

- [ ] **Step 4: Run full test suite**

Run: `npm run test:run`
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/ scripts/
git commit -m "test: add coverage for critical data paths"
```

---

### Task 24: Final Build Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `npm run test:run`
Expected: Zero failures.

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: Clean build with no errors.

- [ ] **Step 3: Verify rep page on dev server**

Load 5 different rep pages on `http://localhost:3002/rep/[id]`:
- Pick one with rich data (lots of finance, scandals)
- Pick one with sparse data (verify empty states)
- Pick one from each party (D, R, I if available)

For each, verify:
1. Page loads without errors
2. Section order matches trustworthiness priority
3. Progressive disclosure works (summaries visible, details expandable)
4. No party loyalty prominent
5. "Coming Soon" section appears
6. Sources/citations are collapsible

- [ ] **Step 4: Verify other routes**

Spot-check:
- Landing page (`/`)
- Congress page (`/congress`)
- Executive pages (`/executive`, `/executive/cabinet`)
- Scandals page (`/scandals`)

- [ ] **Step 5: Verify Definition of Done checklist**

Run through all 11 criteria from the spec:
1. Zero test failures ✓
2. Build succeeds ✓
3. All routes render ✓
4. Type safety ✓
5. Image coverage ✓
6. Data consistency ✓
7. Accessibility baseline ✓
8. SEO correct ✓
9. Rep page leads with trustworthiness ✓
10. "In Development" sections labeled ✓
11. Progressive disclosure everywhere ✓

- [ ] **Step 6: Report to user for review**

Inform the user that all work is complete and ready for their review at `http://localhost:3002`. Nothing has been pushed. They can review the changes and approve deployment.

---

## Execution Notes

- **Phase 1 (Tasks 1-8):** All 7 audit tasks (Tasks 1-7) run in parallel as subagents. Task 8 (consolidation) runs after all 7 complete.
- **Phase 2 (Tasks 9-12.5):** Sequential. Task 9 (conflicts) and Task 10 (trades) can run in parallel. Tasks 11-12.5 are sequential. Task 12.5 is conditional on audit findings.
- **Phase 3 (Tasks 13-18):** Task 14 (ExpandableSection) must complete before Tasks 15-17. Task 13 (page reorder) is independent. Task 18 depends on audit findings.
- **Phase 4-5 (Tasks 19-24):** Mostly sequential. Task 22 (fix tests) before Task 23 (add tests) before Task 24 (verification).

**Dependency graph:**
```
Tasks 1-7 (parallel) → Task 8 (consolidation)
                          ↓
                    Tasks 9-10 (parallel) → Tasks 11-12-12.5 (sequential)
                          ↓
              Task 13 + Task 14 (parallel) → Tasks 15-17 (parallel, need 14)
                          ↓
                        Task 18
                          ↓
                    Tasks 19-21 (parallel)
                          ↓
                    Tasks 22-24 (sequential)
```
