# Voting & Disclosure Redesign Spec

**Date:** 2026-03-13
**Status:** Approved
**Scope:** Rep page — voting data, conflict evidence, disclosure presentation, party loyalty reframe

---

## 1. Fix ICPSR Vote Lookup (Critical Bug)

### Problem

`key-votes.json` stores vote positions keyed by ICPSR IDs (from Voteview). Two code paths look up votes using bioguide IDs and find nothing:

- `MemberVotingRecord.tsx` line 74: `v.votes[bioguideId]` → empty key votes for all members
- `page.tsx` line 142: `vote.votes[id]` → zero conflicts detected for all members

`constituent-alignment.ts` correctly resolves bioguide → ICPSR via `bioguide-to-icpsr.json` (lines 89, 116). The other two paths do not.

### Fix

**`src/app/rep/[id]/page.tsx`:**
- Resolve ICPSR ID from `bioguideToIcpsrData` (already imported, used on line 162)
- Use ICPSR ID for conflict detection vote lookup (line 142)
- Pass ICPSR ID as new prop to `MemberVotingRecord`

**`src/components/MemberVotingRecord.tsx`:**
- Add `icpsrId?: string` prop
- Change vote lookup from `v.votes[bioguideId]` to `v.votes[icpsrId]` (fall back to bioguideId if no ICPSR mapping)

### Also Fix: `result` Type Union

The `KeyVote` interface in `MemberVotingRecord.tsx` declares `result: "Passed" | "Failed" | "Unknown"`, but the actual data contains `"Rejected"`, `"Agreed to"`, `"Cloture Motion Rejected"`, and `"Cloture Motion Agreed to"`. The page.tsx cast silently coerces these. Fix by broadening the type to `string` and displaying as-is (the values are already human-readable).

### Impact

Every member's key vote record, conflict detection, and DonorCaptureScore evidence will populate.

---

## 2. DonorCaptureScore Inline Evidence

### Current State

Shows verdict ("MIXED ALLEGIANCE") with pills ("0 conflicts", "31% PAC", "6% small donors"). No explanation of why.

### Changes to `src/components/DonorCaptureScore.tsx`

- Accept conflicts array as prop (already does)
- After the verdict pills, render **top 1-2 conflicts** as brief callout cards:
  - Format: "Received $X from [Industry], then voted [Yea/Nay] on [Bill] ([description])"
  - Bill name links to Congress.gov bill page
  - Styled as small alert cards (amber border for medium severity, red for high)
- If >2 conflicts exist, show "See all N conflicts ↓" as an anchor link to `#conflicts` section
- If 0 conflicts after ICPSR fix: show "{pac_percentage}% PAC-funded. No direct conflicts detected between top donor industries and key votes." (use actual `finance.pac_percentage` value, not hardcoded)

### Data Flow

No new data needed. The `conflicts` array already contains `donationAmount`, `industryDisplayName`, `voteBill`, `voteTitle`, `votePosition`, `conflictSeverity`, and `explanation`.

---

## 3. Key Votes with Bill Links

### Vote Card Links in `MemberVotingRecord.tsx`

Each vote card gets two external links:

1. **Bill link** — bill name/number links to Congress.gov:
   - House: `https://www.congress.gov/bill/{congress}th-congress/house-bill/{number}`
   - Senate: `https://www.congress.gov/bill/{congress}th-congress/senate-bill/{number}`
   - Parse bill number from `vote.bill` field (e.g., "HR6703" → "house-bill/6703", "S1234" → "senate-bill/1234")
   - Handle all bill type prefixes: HR, S, HJRes, SJRes, HConRes, SConRes, HRes, SRes
   - Create shared utility: `billToCongressGovUrl(bill: string, congress: number): string`

2. **Roll call link** — roll number links to official record:
   - House: `https://clerk.house.gov/Votes/{year}{rollnumber}` (zero-padded to 3 digits)
   - Senate: `https://www.senate.gov/legislative/LIS/roll_call_votes/vote{congress}{session}/vote_{congress}_{session}_{rollnumber}.htm`
   - Senate session derived from vote date: odd years = session 1, even years = session 2

Both open in new tabs (`target="_blank" rel="noopener noreferrer"`).

### "Represents You?" Bill Links in `RepresentsYouSection.tsx`

Each `VoteMatch` displays a `bill` field (e.g., "HR6703"). Make this a link to Congress.gov using the same `billToCongressGovUrl` utility. The `VoteMatch` type does not have a `congress` field — default to current congress (119th) since all constituent alignment votes are from recent sessions.

### Full Record Link

At the bottom of the key votes section, after the "Show More" button:

```
Full voting record on Congress.gov →
```

Links to `https://www.congress.gov/member/{bioguideId}`. Small text, secondary styling (`text-sm text-slate-500`).

---

## 4. Party Loyalty → "Breaks with Party" Reframe

### Remove

- Remove the `<ExpandableSection title="Party Voting Statistics">` block wrapping `<VotingRecordSection>` from `src/app/rep/[id]/page.tsx`
- Remove `VotingRecordSection` import from the rep page
- Keep the `VotingRecordSection` component file (may be used elsewhere)
- Remove the `keyVotes` empty array variable (was only used by VotingRecordSection)

### Add: Compute `party_breakdown` in Prebuild Script

`key-votes.json` does not currently contain `party_breakdown`. The `KeyVote` TypeScript interface declares it as optional, but no vote record has it.

**New prebuild step:** `scripts/compute-party-breakdown.mjs`
- Reads `key-votes.json` and `members.json`
- For each vote, iterates over all vote positions, looks up each ICPSR ID's party via bioguide-to-icpsr mapping → members.json
- Computes: `dem_yea`, `dem_nay`, `rep_yea`, `rep_nay`, `other_yea`, `other_nay`
- Writes back to `key-votes.json` with `party_breakdown` populated on each vote
- Add to `package.json` prebuild chain

### Add: "Breaks with Party" Stat

In `MemberVotingRecord.tsx`, add a 5th stat to the stats grid:

- **Label:** "Breaks w/ Party"
- **Value:** X% — calculated from key votes data
- **Calculation:** For each key vote where the member voted Yea or Nay, determine party majority from `party_breakdown` (e.g., if member is "R" and `rep_yea > rep_nay`, party majority is "Yea"). If member voted against that majority, it's a break. Percentage = (votes against party majority) / (total Yea/Nay votes).
- **Styling:** Same as other stat pills. Neutral color (slate).
- **Data needed:** `party_breakdown` (from prebuild script above). Member's party passed as new prop.

### Position

Inside the key votes section stats row — deprioritized, not its own section.

---

## 5. Financial Disclosures Redesign

### Phase 1: Better Metadata Presentation (Implement Now)

**Changes to `src/components/FinancialDisclosuresSection.tsx`:**

Replace flat list with timeline card view:

- **Summary line:** "4 financial disclosures filed (2021–2024)"
- **Timeline layout:** Vertical timeline with connected cards, most recent first
- Each card shows:
  - Filing year (large, bold)
  - Filing type badge: "Original" (blue), "Amendment" (amber), "Periodic Transaction" (slate)
  - Filed date in readable format
  - "View Full Disclosure (PDF) →" link to House Clerk URL
- Timeline connector: thin vertical line on the left edge connecting cards
- Progressive disclosure preserved: summary visible, full timeline behind "Show all filings" if >3
- Filing type codes from data: `O` → Original (blue), `A` → Amendment (amber), `N` → New Filer (green), `T` → Termination (slate). Existing `getFilingTypeLabel()` already handles these.
- Use existing `pdfUrl` field from disclosure data — do NOT construct URLs manually (URL pattern differs by filing type: `ptr-pdfs` vs `financial-pdfs`)

### Phase 2: PDF Content Parsing (Document Only — Future Implementation)

#### Pipeline Design: `scripts/parse-disclosures.ts`

**Input:** House Clerk financial disclosure PDFs
**Output:** `src/data/disclosures-parsed/{bioguideId}.json`

**Steps:**
1. Download PDFs from House Clerk URLs (already have doc IDs in `house-disclosures.json`)
2. Parse PDF tables using `pdf-parse` (already a project dependency) or `pdf2json` for table extraction
3. Extract structured sections:
   - **Schedule A — Assets:** Asset name, type, value range (e.g., "$1,001–$15,000"), income type, income range
   - **Schedule B — Transactions:** Asset, transaction type (purchase/sale/exchange), date, amount range, cap gains >$200
   - **Schedule C — Earned Income:** Source, type, amount (>$200)
   - **Schedule D — Liabilities:** Creditor, type, amount range
   - **Schedule E — Positions:** Organization, position, dates
   - **Schedule F — Agreements:** Parties, dates, terms
4. Store as structured JSON per member

**Output Schema:**
```typescript
interface ParsedDisclosure {
  bioguideId: string;
  filingYear: number;
  filingType: "original" | "amendment" | "periodic_transaction";
  filedDate: string;
  docId: string;
  pdfUrl: string;
  assets: Array<{
    name: string;
    assetType: string; // "Stock", "Mutual Fund", "Real Estate", etc.
    owner: "Self" | "Spouse" | "Joint" | "Dependent";
    valueRangeLow: number;
    valueRangeHigh: number;
    incomeType: string | null;
    incomeRangeLow: number | null;
    incomeRangeHigh: number | null;
  }>;
  transactions: Array<{
    asset: string;
    transactionType: "Purchase" | "Sale" | "Exchange";
    date: string;
    amountRangeLow: number;
    amountRangeHigh: number;
    capitalGainsOver200: boolean;
  }>;
  earnedIncome: Array<{
    source: string;
    type: string;
    amount: number;
  }>;
  liabilities: Array<{
    creditor: string;
    type: string;
    amountRangeLow: number;
    amountRangeHigh: number;
  }>;
  positions: Array<{
    organization: string;
    position: string;
    fromDate: string | null;
    toDate: string | null;
  }>;
}
```

**Component Changes for Phase 2:**

Add a financial overview card above the timeline:
- **Estimated asset range:** sum of all asset value ranges (show as "$500K–$2M")
- **Top holdings:** top 5 assets by value range midpoint
- **Income sources:** earned income entries
- **Liabilities:** if any
- Each item links back to the specific filing year it was extracted from

**Known Challenges:**
- PDF format varies across years — table structure changes, different column headers
- Some filings are handwritten or scanned (older years) — OCR quality issues
- Value ranges are broad ("$1,001–$15,000") — midpoint estimates are imprecise
- Amendment filings may override original — need deduplication logic
- Periodic transaction reports are partial — only cover a specific period
- Some members file paper-only — no digital PDF available
- Rate limiting on House Clerk downloads

**Estimated Effort:** 2-3 days for pipeline, 1 day for component. Should be its own sprint.

---

## 6. Trade Data Verification

Emmer has no file in `public/data/trades/`. This may be legitimate — not all members trade individual stocks.

**Action:** Add a clear empty state to `StockTradesSection` that distinguishes between "no data available" and "no trades reported." The component fetches from `/data/trades/{bioguideId}.json` — a 404 means no file was generated (member absent from trades data), an empty array means no trades found. Both cases should show "No stock trade disclosures found for this member." (The current code already catches fetch errors and sets an empty array, but the empty state message could be clearer.)

---

## Files Modified

| File | Changes |
|------|---------|
| `src/app/rep/[id]/page.tsx` | Pass ICPSR ID to MemberVotingRecord, fix conflict detection lookup, remove VotingRecordSection block, remove keyVotes empty array |
| `src/components/MemberVotingRecord.tsx` | Accept icpsrId + party props, fix vote lookup, fix result type union, add bill/roll-call links, add "Breaks with Party" stat, add Congress.gov full record link |
| `src/components/DonorCaptureScore.tsx` | Add inline conflict evidence (top 1-2 callouts with bill links) |
| `src/components/RepresentsYouSection.tsx` | Add bill links to vote matches |
| `src/components/FinancialDisclosuresSection.tsx` | Timeline card redesign |
| `src/components/StockTradesSection.tsx` | Improve empty state messaging |
| `src/lib/bill-urls.ts` | New shared utility: `billToCongressGovUrl()`, `rollCallUrl()` |
| `scripts/compute-party-breakdown.mjs` | New prebuild script: compute party_breakdown for key votes |
| `package.json` | Add compute-party-breakdown to prebuild chain |

## Files Not Modified

- `VotingRecordSection.tsx` — kept (may be used elsewhere), just removed from rep page
- `key-votes.json` — data is correct, the bug was in lookup code
- `constituent-alignment.ts` — already works correctly

## Out of Scope

- Full vote history hosting (link to Congress.gov instead)
- PDF disclosure parsing (Phase 2, fully documented above)
- Alignment data for members not in alignment-summary.json
