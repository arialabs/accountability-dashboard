# Bill Summaries & Evidence Chain Spec

**Date:** 2026-03-13
**Status:** Approved
**Scope:** CRS bill summary pipeline, AI beneficiary analysis, evidence chain UI, weekly data automation

---

## 1. CRS Summary Pipeline

### Script: `scripts/fetch-bill-summaries.ts`

**Phase 1: Fetch CRS summaries from Congress.gov**

- Extract unique bill IDs from `src/data/key-votes.json` (~67 unique bills after excluding PN nominations)
- Parse bill type and number — note: the API path segments differ from `bill-urls.ts` URL slugs. This script needs its own prefix-to-API-path mapping (see table below). Do NOT reuse `BILL_PREFIX_MAP` from `bill-urls.ts`.
- Use the `congress` field from each vote record (don't hardcode 119)
- Call Congress.gov API: `GET /v3/bill/{congress}/{type}/{number}/summaries?api_key={key}&format=json`
- **Response structure:** Returns `{ summaries: [{ text, actionDate, updateDate, versionCode }] }`. Take the entry with the latest `updateDate`. The `text` field contains **HTML markup** that must be stripped to plain text (use a simple regex or `html-to-text` — do not store raw HTML).
- `versionCode` values: `00` = Introduced, `36` = Passed House, `49` = Public Law — prefer the most advanced version.
- Batch: 5 requests per batch, 2s delay between batches (Congress.gov rate limit: 5,000 req/hr — stay well under)
- Checkpoint: save to `src/data/bill-summaries.json` every 25 bills
- Resume: skip bills already present in the JSON file
- Bills without CRS summaries: store `crs_summary: null`

**Bill type mapping** (bill ID prefix → API path segment):
- `HR` → `hr`
- `S` → `s`
- `HJRES` → `hjres`
- `SJRES` → `sjres`
- `HCONRES` → `hconres`
- `SCONRES` → `sconres`
- `HRES` → `hres`
- `SRES` → `sres`
- `PN` → skip (nominations, no bill text)

**Phase 2: AI beneficiary analysis**

- Second pass over bills that have `crs_summary` but no `benefits`/`harms`
- Uses Anthropic SDK (already a project dependency: `@anthropic-ai/sdk ^0.75.0`)
- Model: `claude-sonnet-4-5-20250514` (cheap, fast, sufficient for structured extraction). Verify model ID at implementation time — fall back to `claude-3-5-sonnet-20241022` if needed (used by existing `generate-bill-summaries.ts`).
- Prompt: structured request for two arrays given the CRS summary text
- 1s delay between requests
- Same checkpoint/resume pattern as Phase 1
- Skips gracefully if `ANTHROPIC_API_KEY` is not set
- Bills without CRS summaries: `benefits: null, harms: null` (no guessing)

### Output: `src/data/bill-summaries.json`

```json
{
  "HR7148": {
    "bill": "HR7148",
    "congress": 119,
    "title": "One Big Beautiful Bill Act",
    "crs_summary": "This bill modifies provisions related to...",
    "summary_date": "2026-02-01",
    "url": "https://www.congress.gov/bill/119th-congress/house-bill/7148",
    "benefits": ["financial industry", "derivative traders"],
    "harms": ["consumer protections", "borrower safeguards"],
    "ai_analyzed": true
  },
  "HRES580": {
    "bill": "HRES580",
    "congress": 119,
    "title": "Providing for consideration of H.R. 580",
    "crs_summary": null,
    "summary_date": null,
    "url": "https://www.congress.gov/bill/119th-congress/house-resolution/580",
    "benefits": null,
    "harms": null,
    "ai_analyzed": false
  }
}
```

### Run Command

```bash
pnpm run pipeline:bill-summaries
```

Add to `package.json`:
```json
"pipeline:bill-summaries": "tsx scripts/fetch-bill-summaries.ts"
```

### Environment Variables

- `CONGRESS_API_KEY` — required (sign up: https://api.congress.gov/sign-up/)
- `ANTHROPIC_API_KEY` — optional (Phase 2 skipped if not set)

---

## 2. Evidence Chain in Conflict Cards

### Changes to `ConflictOfInterestSection.tsx`

**New prop:** `billSummaries?: Record<string, BillSummary>`

Each vote within an industry group currently shows: vote position, bill link, title, date. With summaries available, each vote expands to:

1. **Vote position badge** (Yea/Nay) — existing
2. **Bill number as Congress.gov link** — existing
3. **Bill title** — existing
4. **CRS summary** — new, inline below title in `text-xs text-slate-600`. If null: "No summary available — [view bill on Congress.gov →]"
5. **Benefits / Harms tags** — new, shown when present:
   - `Benefits: financial industry, banks` (green-tinted tag)
   - `Harms: consumer protections, borrower safeguards` (red-tinted tag)
   - Footer: "(AI analysis of CRS summary)" in small text

### Evidence Chain Reads Top-to-Bottom

> **Finance/Securities** — $2,180,000 in donations → 16 related votes
>
> **Yea** on [HR7148](congress.gov) — One Big Beautiful Bill Act
> *This bill modifies provisions related to derivative trading oversight...*
> Benefits: financial industry, banks
> Harms: consumer protections, borrower safeguards
> *(AI analysis of CRS summary)*
>
> **Yea** on [HRES1014](congress.gov) — Providing for consideration
> No summary available — [view bill on Congress.gov →]

### Changes to `MemberVotingRecord.tsx`

**New prop:** `billSummaries?: Record<string, BillSummary>`

Each key vote card adds (below existing description):
- CRS summary text (if available), truncated to 2 lines with expand
- Benefits/Harms tags (if available)
- If no summary: no change (card looks the same as today)

### Changes to `DonorCaptureScore.tsx`

**New prop:** `billSummaries?: Record<string, BillSummary>`

Top 1-2 conflict callouts add a one-line CRS excerpt after the bill link. Keeps the callout concise — full summary is in the Conflicts section below.

### Graceful Degradation

If `bill-summaries.json` doesn't exist (pipeline hasn't run):
- Import wrapped in try/catch, defaults to empty object `{}`
- All components render exactly as today — no summaries, no benefits/harms
- No crash, no empty states, no "loading" indicators

---

## 3. Data Loading

### In `src/app/rep/[id]/page.tsx`

Use a helper function pattern (consistent with existing `loadDonorPercentiles()`), not `require()`:

```typescript
// In src/lib/data.ts or inline
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export function loadBillSummaries(): Record<string, BillSummary> {
  try {
    const path = join(process.cwd(), "src/data/bill-summaries.json");
    if (!existsSync(path)) return {};
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return {};
  }
}
```

Pass `billSummaries` to:
- `<ConflictOfInterestSection conflicts={conflicts} memberName={...} billSummaries={billSummaries} />`
- `<MemberVotingRecord ... billSummaries={billSummaries} />`
- `<DonorCaptureScore ... billSummaries={billSummaries} />`

### BillSummary Type

```typescript
// src/lib/types.ts
export interface BillSummary {
  bill: string;
  congress: number;
  title: string;
  crs_summary: string | null;
  summary_date: string | null;
  url: string;
  benefits: string[] | null;
  harms: string[] | null;
  ai_analyzed: boolean;
}
```

---

## 4. Weekly Data Refresh Workflow

### File: `.github/workflows/weekly-data-refresh.yml`

**Schedule:** Sunday midnight UTC — `cron: '0 0 * * 0'`
**Also:** Manual trigger via `workflow_dispatch`

**Steps:**

```yaml
name: Weekly Data Refresh
on:
  schedule:
    - cron: '0 0 * * 0'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  refresh-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile

      # Data pipelines (sequential — respect API rate limits)
      - name: Sync votes
        run: npx tsx pipeline/sync-votes.ts
        env:
          CONGRESS_API_KEY: ${{ secrets.CONGRESS_API_KEY }}

      - name: Fetch campaign finance
        run: npx tsx scripts/fetch-finance.ts
        env:
          FEC_API_KEY: ${{ secrets.FEC_API_KEY }}

      - name: Fetch bill summaries + AI analysis
        run: npx tsx scripts/fetch-bill-summaries.ts
        env:
          CONGRESS_API_KEY: ${{ secrets.CONGRESS_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Compute derived data
        run: |
          node scripts/compute-party-loyalty.mjs
          node scripts/compute-party-breakdown.mjs
          npx tsx scripts/compute-donor-percentiles.ts

      # Commit and push if data changed
      - name: Commit data updates
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add src/data/ public/data/
          if git diff --cached --quiet; then
            echo "No data changes"
          else
            git commit -m "chore(data): weekly data refresh [skip ci]"
            git push
          fi
```

**GitHub Secrets Required:**
- `FEC_API_KEY`
- `CONGRESS_API_KEY`
- `ANTHROPIC_API_KEY`

**Design decisions:**
- Pipelines run sequentially to respect rate limits
- Each pipeline has checkpoint/resume, so partial failures preserve progress
- Commits directly to main — data updates don't need PR review
- `[skip ci]` in commit message prevents infinite workflow loops
- If zero files change, no commit is created

---

## 5. AI Prompt Design

### Beneficiary Analysis Prompt

```
Given this Congressional Research Service summary of a bill, identify:
1. Who benefits if this bill passes (industries, groups, or entities)
2. Who is harmed or disadvantaged if this bill passes

Be specific and concise. Return JSON only:
{"benefits": ["phrase1", "phrase2"], "harms": ["phrase1", "phrase2"]}

If the summary is too vague to determine beneficiaries, return:
{"benefits": null, "harms": null}

CRS Summary:
{summary_text}
```

**Model:** claude-sonnet-4-5-20250514
**Max tokens:** 200
**Temperature:** 0 (deterministic — we want consistency across runs)

---

## Files Modified

| File | Changes |
|------|---------|
| `scripts/fetch-bill-summaries.ts` | New: two-phase pipeline (CRS fetch + AI analysis) |
| `src/data/bill-summaries.json` | New: pipeline output |
| `src/lib/types.ts` | Add `BillSummary` interface |
| `src/app/rep/[id]/page.tsx` | Load bill-summaries.json, pass to components |
| `src/components/ConflictOfInterestSection.tsx` | Accept billSummaries prop, show CRS summary + benefits/harms |
| `src/components/MemberVotingRecord.tsx` | Accept billSummaries prop, show CRS summary on vote cards |
| `src/components/DonorCaptureScore.tsx` | Accept billSummaries prop, show summary excerpt in callouts |
| `.github/workflows/weekly-data-refresh.yml` | New: scheduled data automation |
| `package.json` | Add `pipeline:bill-summaries` script |

## Cleanup

### Remove old `scripts/generate-bill-summaries.ts`

The existing script generates AI summaries from key-votes descriptions (not CRS data) and caches to `data/bill-summaries/summaries.json`. The new pipeline supersedes it entirely. Delete the script and its cache directory.

### Remove unused `KeyVote` fields

`MemberVotingRecord.tsx` declares `summary?: string`, `beneficiaries?: Array<...>`, and `publicBenefit?: "positive" | "negative" | "mixed"` on the `KeyVote` interface. None are populated in the data. These are superseded by the `BillSummary` type. Remove the unused fields from the interface to avoid confusion.

### Note on multi-vote bills

Some bill IDs (e.g., HR7148) appear in multiple key votes (procedural + final passage, or House + Senate). The CRS summary is per-bill, not per-vote, so the same summary appears for all votes on that bill. This is correct behavior — the bill content doesn't change between roll calls.

---

## Out of Scope

- Fetching all bills in the 119th Congress (only key-votes bills for now — pipeline supports expansion)
- Parsing raw bill text (CRS summaries are sufficient)
- Phase 2 "who benefits" without CRS summary (no AI guessing from titles alone)
- Bill detail pages (`/bills/HR7148`) — future feature
