# Pipeline & Build Audit — Findings

**Audited:** 2026-03-12
**Branch:** main
**Auditor:** automated (Claude Sonnet 4.6)

---

## 1. Data File Catalog

37 JSON files live in `src/data/`. Classified by origin below.

### 1a. Pipeline-generated (script output)

These files are written by scripts in `scripts/` or `pipeline/`. They must be re-run to refresh data.

| File | Size | Origin Script | Last Git Update |
|---|---|---|---|
| `members.json` | 224K | `scripts/fetch-members.ts` or `pipeline/index.ts` | 2026-03-09 |
| `key-votes.json` | 1.3M | `scripts/fetch-voteview.ts` (also `scripts/build-icpsr-map.ts`) | 2026-02-21 |
| `finance.json` | — | `scripts/fetch-finance.ts` or `pipeline/index.ts` | 2026-03-05 |
| `committees.json` | 856K | `scripts/fetch-committees.ts` or `pipeline/index.ts` | 2026-03-10 |
| `bioguide-to-icpsr.json` | — | `scripts/build-icpsr-map.ts` | 2026-02-06 |
| `icpsr-to-bioguide.json` | — | `scripts/build-icpsr-map.ts` | 2026-02-06 |
| `trades-by-member.json` | **72M** | `scripts/fetch-trades.ts` (Quiver Quant API) | 2026-02-06 |
| `trading-summaries.json` | 124K | `scripts/analyze-trades.js` | 2026-02-06 |
| `alignment-scores.json` | 472K | `scripts/compute-scores.ts` | 2026-02-15 |
| `alignment-summary.json` | 32K | `scripts/compute-scores.ts` | 2026-02-15 |
| `positions.json` | 2.0M | `scripts/scrape-positions.ts` | 2026-02-07 |
| `live-votes.json` | 524K | `pipeline/sync-votes.ts` (GitHub Actions: vote-sync.yml) | 2026-03-09 |
| `vote-sync-status.json` | — | `pipeline/sync-votes.ts` | 2026-03-09 |
| `usaspending.json` | — | `pipeline/sync-usaspending.ts` (GitHub Actions: usaspending-sync.yml) | 2026-03-10 |
| `usaspending-sync-status.json` | — | `pipeline/sync-usaspending.ts` | 2026-02-25 |
| `executive-orders.json` | 120K | GitHub Actions: eo-sync.yml (inline Python) | 2026-03-10 |
| `house-disclosures.json` | 712K | `scripts/parse-house-disclosures.ts` | 2026-02-06 |
| `leadership-donors.json` | — | `scripts/fetch-leadership-donors.ts` | 2026-02-21 |
| `leadership-finance.json` | — | `scripts/fetch-leadership-finance.ts` | 2026-02-21 |
| `cabinet.json` | 32K | `scripts/enrich-cabinet.ts` | 2026-02-19 |

### 1b. Build-computed (prebuild step, every `npm run build`)

These are derived at build time from other data files and are always fresh.

| File | Size | Origin Script | Prebuild Command |
|---|---|---|---|
| `members.json` (party_loyalty_pct field) | 224K | `scripts/compute-party-loyalty.mjs` | `npm run build` → prebuild |
| `donor-percentiles.json` | — | `scripts/compute-donor-percentiles.ts` | `npm run build` → `npm run donor-percentiles` |

> **Note:** `donor-percentiles.json` reports only 9 members processed because `finance.json` currently contains only 9 records (not the full 538). This is a data gap, not a script bug. The script correctly joins `finance.json` × `members.json`.

### 1c. Manually curated (no generating script; created or edited by hand/AI)

These files have no corresponding script that writes them. They are committed directly.

| File | Size | Last Git Update | Commit / Notes |
|---|---|---|---|
| `committee-conflicts.json` | 52K | 2026-03-10 | Introduced in #144 (commit `42196f7`) |
| `budget-impacts.json` | — | 2026-03-11 | Introduced in #49/#50 (commit `27c4824`) |
| `affected-programs.json` | — | 2026-03-11 | Introduced in #49/#50 (commit `27c4824`) |
| `cabinet-spending.json` | 32K | 2026-03-10 | Introduced in #46 (commit `236e295`) |
| `top-captured.json` | — | 2026-03-07 | Introduced in #120 (commit `4229000`) |
| `leadership-scrutiny.json` | 20K | 2026-02-21 | Manual curation |
| `scandals.json` | 96K | 2026-02-12 | Manual curation |
| `trump-conflicts.json` | 24K | 2026-02-06 | Manual curation |
| `trump-promises.json` | 64K | 2026-02-13 | `scripts/add-impact-analysis.ts` enriches, but core data is manual |
| `presidential-promises.json` | — | 2026-02-11 | Manual curation |
| `policy-impacts.json` | — | 2026-02-11 | Manual curation |
| `deep-dives.json` | 48K | 2026-03-10 | Manual curation |
| `scotus.json` | 32K | 2026-03-10 | Manual curation (updated by untracked script, see `final-photo-update.js`) |
| `vp.json` | — | 2026-02-05 | Manual curation |
| `trump-approval.json` | — | 2026-02-06 | Manual curation |
| `executive-actions.json` | — | 2026-02-15 | Manual curation |

---

## 2. Build Pipeline Verification

### 2a. Prebuild: `node scripts/compute-party-loyalty.mjs`

**Result: PASS**

```
✅ Updated party_loyalty_pct for 529/538 members
```

Runs in < 1 second. Reads `key-votes.json`, `members.json`, `bioguide-to-icpsr.json`. Writes back to `members.json`. The 9 members without scores have fewer than 5 key votes — expected.

### 2b. Full build: `npm run build`

**Result: PASS with one non-fatal postbuild error**

The build completed successfully, generating 606 static pages across all routes including 538 `/rep/[id]` pages.

```
✓ Generating static pages using 19 workers (606/606) in 11.1s
```

**Postbuild failure (non-blocking):** `next-sitemap` printed:

```
❌ [next-sitemap] Unable to find build-manifest.
```

This error is spurious — `sitemap.xml` (106KB) is present and correct in `out/sitemap.xml`. The error occurs because `next-sitemap` looks for `build-manifest.json` in a non-standard location under `output: "export"` mode. The deployed site is unaffected.

**Build warnings (non-blocking):**

- `[WARN] FEC_API_KEY is not set in server environment variables` — fires on every rep page that accesses `finance.json`. Expected in local dev. CI should set this secret.
- `Module type of file ... is not specified` — three icon scripts lack `"type": "module"` in `package.json`. Performance warning only; scripts still run correctly.

**Build output size:**

| Directory | Size | Notes |
|---|---|---|
| `out/` total | 2.1G | Dominated by `out/data/trades/` |
| `out/data/trades/` | ~48M | 336 per-member JSON files copied from `public/data/trades/` |
| `out/_next/` | 3.4M | Actual JS/HTML bundles |
| All non-trades assets | ~213MB | Still large; driven by rep HTML pages |

---

## 3. GitHub Actions Workflow Audit

Seven workflow files audited.

| Workflow | Trigger | Status | Issues |
|---|---|---|---|
| `deploy.yml` | push to main, workflow_dispatch | **Functional** | Uses `pnpm`, but local dev uses `npm`. Two lockfiles exist (`package-lock.json` + `pnpm-lock.yaml`). Secrets required: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CONGRESS_API_KEY`, `FEC_API_KEY`. |
| `vote-sync.yml` | daily cron 10:17 UTC + manual | **Functional** | Requires `CONGRESS_API_KEY`. No `FEC_API_KEY` needed. Correct commands. |
| `usaspending-sync.yml` | weekly cron Monday 10:23 UTC + manual | **Functional** | No API keys needed (USASpending.gov is public). Correct commands. |
| `eo-sync.yml` | daily cron 7:00 UTC + manual | **Functional** | Pure Python inline script; no secrets needed. Self-contained. |
| `news-refresh.yml` | daily cron 6:00 UTC + manual | **Broken** | Requires `OPENROUTER_API_KEY` secret. Output file `src/data/news-cache.json` **does not exist** in the repo — the workflow will fail silently or on commit if the file has never been created. Uses `pnpm/action-setup@v3` while all other workflows use `@v2` (version inconsistency, minor). |
| `changelog.yml` | push to main | **Functional with risk** | Hardcodes org name `arialabs/accountability-dashboard` in the Cloudflare Pages dispatch URL. If repo is renamed or forked, this will break. Requires `GITHUB_TOKEN` (auto-provided). |
| `sync-tasks.yml` | issue opened/labeled, PR merged | **Functional** | Requires `GH_TOKEN` (personal access token, not auto-provided GITHUB_TOKEN). Syncs to `arialabs/tasks` repo — hardcoded cross-repo dependency. |

**Missing secrets likely not yet configured:**

- `CLOUDFLARE_API_TOKEN` — required for deploy
- `CLOUDFLARE_ACCOUNT_ID` — required for deploy
- `OPENROUTER_API_KEY` — required for news refresh
- `GH_TOKEN` — required for task sync (must be a PAT with cross-repo write access)

**Package manager inconsistency:** Local development uses `npm` (only `package-lock.json` is tracked), but CI workflows use `pnpm install --frozen-lockfile`. A `pnpm-lock.yaml` exists locally, suggesting both have been used. CI will use the pnpm lockfile correctly, but local devs may get divergent dependency trees.

---

## 4. Stock Trade Splitting — Feasibility Assessment

**Status: Already implemented.** The split was executed in commit `b83945c` (2026-03-08).

### Current architecture

- `src/data/trades-by-member.json` (72MB) — exists in repo but is **excluded from the build** (comment in `src/lib/data.ts` line 8). It is the source of truth but not served.
- `public/data/trades/{bioguideId}.json` — 336 per-member files, total 48MB. Copied into `out/data/trades/` at build time and served as static assets.
- `StockTradesSection.tsx` — fetches `/data/trades/{bioguideId}.json` client-side on component mount via `useEffect + fetch`.

### Outstanding size concerns

Two members still have oversized trade files:

| Member | File | Size |
|---|---|---|
| M001157 | `public/data/trades/M001157.json` | 13MB |
| K000389 | `public/data/trades/K000389.json` | 11MB |

Cloudflare Pages' per-file limit is 25MB, so these are within spec. However, a 13MB JSON payload will cause severe UX degradation on mobile (slow load, parsing jank). These members (Michael McCaul and Michael Burgess) have 24,000–26,000 trades each. Recommendation: add pagination or limit to the most recent N trades per member in the split script.

### Missing split script

The per-member files in `public/data/trades/` were committed directly in one batch; there is **no script in `scripts/`** that regenerates them from `trades-by-member.json`. When `fetch-trades.ts` is re-run to refresh trade data, the per-member files in `public/data/` will not be automatically updated. A `scripts/split-trades.ts` (or add a step to `fetch-trades.ts`) is needed to maintain this pipeline.

---

## 5. Conflict Pre-computation Feasibility

### 5a. `detectConflicts()` — `src/lib/conflict-detector.ts`

```typescript
export function detectConflicts(
  industries: IndustryTotal[],         // Top donor industries, classified from FEC Schedule A
  votes: Array<{
    bill: string;
    title: string;
    category: string;
    date: string;
    vote: "Yea" | "Nay" | "Present" | "Not Voting";
    description?: string;
  }>
): ConflictOfInterest[]
```

**Current call site:** `src/app/rep/[id]/page.tsx` lines 128–163. It is **guarded by `!isBuildTime`** — it explicitly skips execution during `next build`. At SSG time, `conflicts` is always an empty array. The function makes a live FEC API call (`getScheduleAContributions`) to fetch Schedule A data, which is why it is disabled at build time.

**Pre-computation feasibility:** Medium complexity.
- The FEC Schedule A fetch is the blocker. This data is not in `finance.json` (which stores `top_contributors` and `top_industries` already — the latter from FEC bulk data, not per-contributor Schedule A).
- To pre-compute: run `detectConflicts` per member using `finance.top_industries` (already in `finance.json`) instead of live Schedule A data. `IndustryTotal[]` in `conflict-detector` is compatible with `finance.top_industries` shape. A build script could iterate all 538 members, call `detectConflicts(financeRecord.top_industries, memberKeyVotes)`, and write `public/data/conflicts/{bioguideId}.json`.
- Caveat: `finance.json` currently has only 9 entries. Full finance data requires a `FEC_API_KEY` refresh.

### 5b. `getConflictCallouts()` — `src/lib/conflict-callouts.ts`

```typescript
export function getConflictCallouts(
  bioguideId: string,
  finance: CampaignFinance | null,     // From finance.json — top_contributors array
  keyVotes: Array<{
    id?: string;
    bill: string;
    title: string;
    description?: string;
    category: string;
    date: string;
    votes: Record<string, string>;     // ICPSR ID → "Yea" | "Nay" | ...
  }>,
  icpsrId?: string                     // Looked up from bioguide-to-icpsr.json
): ConflictCallout[]
```

**Current call site:** `src/app/rep/[id]/page.tsx` line 166. This **runs at SSG build time** — no `isBuildTime` guard. It uses `finance.top_contributors` from `finance.json` (static file) and `key-votes.json` (static file). This is already pre-computed at build time in the sense that it runs during `next build`.

**Pre-computation feasibility: High — already effectively pre-computed.**
The only improvement would be to extract this into an explicit prebuild step that writes `src/data/conflict-callouts/{bioguideId}.json`, allowing the rep page to simply `import` pre-computed results instead of computing at SSG time. This would modestly reduce SSG build time for the 538 rep pages.

**Data dependencies for both functions:**

| Data Needed | Available In | Current Status |
|---|---|---|
| `top_contributors` (for `getConflictCallouts`) | `finance.json` → `top_contributors` | Sparse (9 records) |
| `top_industries` (for `detectConflicts`) | `finance.json` → `top_industries` | Sparse (9 records) |
| Key votes with member positions | `key-votes.json` → `votes[icpsrId]` | Full (258 votes, 538 members) |
| ICPSR→bioguide mapping | `bioguide-to-icpsr.json` | Full (538 members) |

---

## 6. Prioritized Findings

### P0 — Blocking or data-loss risk

| # | Finding | Impact | Fix |
|---|---|---|---|
| P0-1 | **No split-trades script exists.** When `fetch-trades.ts` is re-run, `public/data/trades/*.json` goes stale. | Silent data regression — rep pages show outdated trades with no error | Add `scripts/split-trades.ts` that reads `src/data/trades-by-member.json` and writes `public/data/trades/{id}.json`. Add to `refresh-all-data.sh`. |
| P0-2 | **`finance.json` has only 9 entries** (should be 538). `donor-percentiles.json` is almost empty. `getConflictCallouts` silently returns empty for 529 members. | Core "donor capture" feature broken for 98% of members | Run `tsx scripts/fetch-finance.ts` with a valid `FEC_API_KEY`. This is a data gap, not a code bug. |

### P1 — Significant degradation

| # | Finding | Impact | Fix |
|---|---|---|---|
| P1-1 | **`news-cache.json` does not exist.** `news-refresh.yml` workflow commits it but the file was never seeded. | Workflow will fail on first run; any code reading `news-cache.json` will throw | Run `pnpm research:fetch` once locally with `OPENROUTER_API_KEY` to seed the file, then commit. |
| P1-2 | **Two members have 11–13MB trade files** (`M001157`, `K000389`). | 13MB JSON payload on rep page = broken mobile UX | Add `--limit=N` to split script; serve only the most recent 500 trades per member. |
| P1-3 | **`detectConflicts` is skipped at build time** (explicitly guarded). Conflicts section is always empty for SSG pages. | "Conflicts of Interest" section on rep pages is permanently empty | Option A: replace live FEC fetch with `finance.top_industries` data (already available); remove the `!isBuildTime` guard. Option B: extract to a prebuild step. |

### P2 — Operational / maintenance

| # | Finding | Impact | Fix |
|---|---|---|---|
| P2-1 | **Dual lockfiles** (`package-lock.json` + `pnpm-lock.yaml`). CI uses pnpm, local uses npm. | Dependency drift between local and CI | Pick one. If staying on pnpm: delete `package-lock.json`, add `"packageManager": "pnpm@9"` to `package.json`. |
| P2-2 | **`next-sitemap` postbuild error** (`Unable to find build-manifest`). | Spurious error in CI logs; `sitemap.xml` is actually generated | Investigate `next-sitemap` version compatibility with Next.js 16 `output: "export"` mode. May need `nextConfigPath` option. |
| P2-3 | **`prebuild` `donor-percentiles` step takes `tsx` (slow)** and runs even when `finance.json` has not changed. | Adds ~5–10s to every build for little value when data is sparse | Gate the script: skip if `finance.json` has fewer than 100 entries, or move it out of prebuild into the data refresh pipeline. |
| P2-4 | **`news-refresh.yml` uses `pnpm/action-setup@v3`** while all other workflows use `@v2`. | Minor version inconsistency; functionally fine | Normalize to `@v3` across all workflows (v3 is the current stable). |
| P2-5 | **`changelog.yml` hardcodes `arialabs/accountability-dashboard`** in the dispatch URL. | Breaks if repo is renamed or runs in a fork | Replace with `${{ github.repository }}` dynamic variable. |
| P2-6 | **`refresh-all-data.sh` does not include trades or conflict data steps.** | Running the full data refresh misses 72MB of trade data and leadership/cabinet files | Add `tsx scripts/fetch-trades.ts` and `node scripts/split-trades.ts` (once written) to the script. |

### P3 — Low priority / warnings

| # | Finding | Impact | Fix |
|---|---|---|---|
| P3-1 | **`package.json` lacks `"type": "module"`**. Three scripts generate `MODULE_TYPELESS_PACKAGE_JSON` warnings at every prebuild. | Warning noise only | Add `"type": "module"` to `package.json`. Requires auditing any CJS-style `require()` calls in scripts. |
| P3-2 | **`icons:generate` prebuild step runs on every build** (generates PWA icons and screenshots). These rarely change. | Unnecessary ~5s build overhead | Move icon generation to a separate one-time script; only run in prebuild if source SVGs have changed. |

---

## 7. Summary

The build pipeline is **functionally sound** — `npm run build` succeeds and generates a deployable static export. The main risks are:

1. A missing data refresh step for trade file splitting (no `split-trades.ts` script).
2. Severely depleted `finance.json` (9 records vs 538 expected) which silently breaks donor conflict features.
3. One dead workflow (`news-refresh.yml`) because its output file was never seeded.

The conflict detection infrastructure (`getConflictCallouts`) is well-designed and already runs at SSG build time against static data. `detectConflicts` is reachable pre-computation but currently gated away; it could be enabled with a small data-path change substituting `finance.top_industries` for the live FEC call.
