# Voting & Disclosure Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the ICPSR vote lookup bug that makes key votes and conflict detection empty for all members, add bill/roll-call source links, inline conflict evidence in DonorCaptureScore, reframe party loyalty as "Breaks with Party," and redesign financial disclosures as a timeline.

**Architecture:** Six independent tasks that share one new utility module (`bill-urls.ts`). Task 1 (ICPSR fix) is the critical blocker — it makes votes visible. Task 3 (bill URLs utility) is used by Tasks 4, 5, and 6. Tasks 2 and 7 are fully independent.

**Tech Stack:** Next.js 16 (static export), React 19, TypeScript, Vitest + React Testing Library, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-13-voting-disclosure-redesign.md`

---

## Chunk 1: Data Fix + Utility

### Task 1: Fix ICPSR Vote Lookup in MemberVotingRecord

The key-votes.json data stores vote positions keyed by ICPSR IDs (e.g., `"21531": "Yea"`), but `MemberVotingRecord.tsx` looks them up using bioguide IDs (e.g., `"E000294"`). This makes key votes empty for every member. The `constituent-alignment.ts` module already does the correct mapping via `bioguide-to-icpsr.json` — we need to follow that pattern.

**Files:**
- Modify: `src/components/MemberVotingRecord.tsx` — add `icpsrId` prop, use it for vote lookup
- Modify: `src/components/MemberVotingRecord.test.tsx` — update tests to use ICPSR-keyed votes
- Modify: `src/app/rep/[id]/page.tsx` — pass `icpsrId` prop, fix conflict detection lookup

- [ ] **Step 1: Update test mock data to use ICPSR IDs**

In `src/components/MemberVotingRecord.test.tsx`, the mock votes use bioguide IDs as keys (`"B001234": "Yea"`). Update them to use ICPSR-style IDs, and pass `icpsrId` prop:

```tsx
const mockKeyVotes = [
  {
    id: "119-House-1",
    congress: 119,
    chamber: "House" as const,
    rollnumber: 1,
    date: "2025-01-20",
    bill: "HR1",
    title: "Healthcare Reform Act",
    description: "A major healthcare bill",
    category: "Healthcare",
    yea_count: 220,
    nay_count: 210,
    result: "Passed",
    votes: {
      "99901": "Yea",   // ICPSR ID for B001234
      "99902": "Nay",   // ICPSR ID for S005678
    },
  },
  {
    id: "119-House-2",
    congress: 119,
    chamber: "House" as const,
    rollnumber: 2,
    date: "2025-01-21",
    bill: "HR2",
    title: "Climate Action Now",
    description: "Climate legislation",
    category: "Climate & Environment",
    yea_count: 218,
    nay_count: 212,
    result: "Passed",
    votes: {
      "99901": "Nay",
      "99902": "Yea",
    },
  },
  {
    id: "119-Senate-1",
    congress: 119,
    chamber: "Senate" as const,
    rollnumber: 1,
    date: "2025-01-22",
    bill: "S1",
    title: "Tax Reform",
    description: "Tax changes",
    category: "Economy & Taxes",
    yea_count: 51,
    nay_count: 49,
    result: "Passed",
    votes: {
      "99901": "Yea",
      "99902": "Nay",
    },
  },
];
```

Update all test renders to pass `icpsrId="99901"`:

```tsx
<MemberVotingRecord
  bioguideId="B001234"
  icpsrId="99901"
  memberName="John Smith"
  chamber="House"
  keyVotes={mockKeyVotes}
/>
```

Also update the `result` type in test data from `"Passed" as const` to just `"Passed"` (string, no const assertion) since we're broadening the type.

**Important:** The mock data bill format changes from `"H.R. 1"` to `"HR1"` (matching real data in key-votes.json). Update ALL existing test assertions that reference bill text:
- `screen.getByText("H.R. 1")` → `screen.getByText("HR1")`
- `screen.getByText("H.R. 2")` → `screen.getByText("HR2")`
- `screen.queryByText("S. 1")` → `screen.queryByText("S1")`

Add a test for ICPSR fallback to bioguide:

```tsx
it("falls back to bioguideId when icpsrId not provided", () => {
  const votesWithBioguideKeys = [{
    ...mockKeyVotes[0],
    votes: { "B001234": "Yea" },
  }];
  render(
    <MemberVotingRecord
      bioguideId="B001234"
      memberName="John Smith"
      chamber="House"
      keyVotes={votesWithBioguideKeys}
    />
  );
  expect(screen.getByText("Healthcare Reform Act")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/MemberVotingRecord.test.tsx`
Expected: FAIL — component doesn't accept `icpsrId` prop yet, and ICPSR-keyed votes won't match bioguide lookup.

- [ ] **Step 3: Update MemberVotingRecord component**

In `src/components/MemberVotingRecord.tsx`:

1. Add `icpsrId` to props interface:

```tsx
interface MemberVotingRecordProps {
  bioguideId: string;
  icpsrId?: string;
  memberName: string;
  chamber: "House" | "Senate";
  keyVotes: KeyVote[];
}
```

2. Update the destructuring:

```tsx
export function MemberVotingRecord({
  bioguideId,
  icpsrId,
  memberName,
  chamber,
  keyVotes
}: MemberVotingRecordProps) {
```

3. Change vote lookup (line 72-79) to use ICPSR ID with bioguide fallback:

```tsx
const memberVotes = useMemo(() => {
  const voteKey = icpsrId || bioguideId;
  return keyVotes
    .filter(v => v.chamber === chamber && v.votes[voteKey])
    .map(v => ({
      ...v,
      memberVote: v.votes[voteKey] as "Yea" | "Nay" | "Not Voting",
    }));
}, [keyVotes, chamber, icpsrId, bioguideId]);
```

4. Broaden the `result` type in `KeyVote` interface from `"Passed" | "Failed" | "Unknown"` to `string`:

```tsx
result: string;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/MemberVotingRecord.test.tsx`
Expected: PASS — all existing + new fallback test pass.

- [ ] **Step 5: Fix ICPSR lookup in page.tsx conflict detection**

In `src/app/rep/[id]/page.tsx`, the conflict detection block (around line 140) uses `vote.votes[id]` (bioguide). Change to use `icpsrId` which is already resolved on line 159:

Move the ICPSR resolution above the conflict detection block:

```tsx
// Resolve ICPSR ID for vote lookups (key-votes.json uses ICPSR IDs)
const icpsrId = (bioguideToIcpsrData as Record<string, string>)[id];
```

Then in the conflict vote lookup (~line 142):

```tsx
const memberVotes = (keyVotesData as unknown as Array<{ bill: string; title: string; description: string; category: string; date: string; votes: Record<string, string> }>)
  .filter(vote => vote.votes && icpsrId && vote.votes[icpsrId])
  .map(vote => ({
    bill: vote.bill,
    title: vote.title,
    category: vote.category,
    date: vote.date,
    vote: vote.votes[icpsrId!] as "Yea" | "Nay" | "Present" | "Not Voting",
    description: vote.description,
  }));
```

Remove the duplicate `const icpsrId = ...` line that was previously below (around line 162).

- [ ] **Step 6: Pass icpsrId to MemberVotingRecord in page.tsx**

Update the `<MemberVotingRecord>` JSX (around line 458) to pass the ICPSR ID:

```tsx
<MemberVotingRecord
  bioguideId={member.bioguide_id}
  icpsrId={icpsrId}
  memberName={member.full_name}
  chamber={member.chamber === "house" ? "House" : "Senate"}
  keyVotes={keyVotesData as unknown as Array<{
    id: string;
    congress: number;
    chamber: "House" | "Senate";
    rollnumber: number;
    date: string;
    bill: string;
    title: string;
    description: string;
    category: string;
    yea_count: number;
    nay_count: number;
    result: string;
    votes: Record<string, string>;
  }>}
/>
```

Note: `result` type changed from `"Passed" | "Failed" | "Unknown"` to `string`.

- [ ] **Step 7: Remove VotingRecordSection from rep page**

In `src/app/rep/[id]/page.tsx`:

1. Remove the import: `import VotingRecordSection from "@/components/VotingRecordSection";`
2. Remove the `keyVotes` empty array variable (lines ~188-197)
3. Remove the entire `<ErrorBoundary context="party loyalty and ideology data">` block wrapping `<ExpandableSection title="Party Voting Statistics">` (lines ~507-520)

- [ ] **Step 8: Run full test suite and build**

Run: `npx vitest run && npx next build`
Expected: All tests pass, build succeeds.

- [ ] **Step 9: Commit**

```bash
git add src/components/MemberVotingRecord.tsx src/components/MemberVotingRecord.test.tsx src/app/rep/[id]/page.tsx
git commit -m "fix: resolve ICPSR vote lookup bug — key votes now populate for all members

Votes in key-votes.json are keyed by ICPSR IDs, not bioguide IDs.
MemberVotingRecord and conflict detection now use ICPSR mapping.
Also removes Party Voting Statistics section from rep page."
```

---

### Task 2: Compute party_breakdown Data

`key-votes.json` declares `party_breakdown` in its TypeScript interface but no vote record actually has it. We need a prebuild script to compute it from the ICPSR vote positions and member party data.

**Files:**
- Create: `scripts/compute-party-breakdown.mjs`
- Modify: `package.json` — add to prebuild chain

- [ ] **Step 1: Write the script**

Create `scripts/compute-party-breakdown.mjs`:

```javascript
#!/usr/bin/env node
/**
 * Compute party_breakdown for each key vote.
 *
 * For every vote record in key-votes.json, tallies how many Democrats
 * and Republicans voted Yea vs Nay using ICPSR→bioguide→party mapping.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const keyVotes = JSON.parse(readFileSync(join(ROOT, "src/data/key-votes.json"), "utf-8"));
const members = JSON.parse(readFileSync(join(ROOT, "src/data/members.json"), "utf-8"));
const bioguideToIcpsr = JSON.parse(readFileSync(join(ROOT, "src/data/bioguide-to-icpsr.json"), "utf-8"));

// Build reverse map: ICPSR ID → party
const icpsrToParty = {};
for (const [bioguideId, icpsrId] of Object.entries(bioguideToIcpsr)) {
  const member = members.find((m) => m.bioguide_id === bioguideId);
  if (member) {
    icpsrToParty[icpsrId] = member.party;
  }
}

console.log(`Mapped ${Object.keys(icpsrToParty).length} ICPSR IDs to parties`);

let updated = 0;
for (const vote of keyVotes) {
  let dem_yea = 0, dem_nay = 0, rep_yea = 0, rep_nay = 0, other_yea = 0, other_nay = 0;

  for (const [icpsrId, position] of Object.entries(vote.votes)) {
    const party = icpsrToParty[icpsrId];
    if (position === "Yea") {
      if (party === "D") dem_yea++;
      else if (party === "R") rep_yea++;
      else other_yea++;
    } else if (position === "Nay") {
      if (party === "D") dem_nay++;
      else if (party === "R") rep_nay++;
      else other_nay++;
    }
    // "Present" and "Not Voting" are not counted
  }

  vote.party_breakdown = { dem_yea, dem_nay, rep_yea, rep_nay, other_yea, other_nay };
  updated++;
}

writeFileSync(join(ROOT, "src/data/key-votes.json"), JSON.stringify(keyVotes, null, 2) + "\n");
console.log(`Updated ${updated} votes with party_breakdown`);
```

- [ ] **Step 2: Run the script**

Run: `node scripts/compute-party-breakdown.mjs`
Expected: "Mapped ~538 ICPSR IDs to parties", "Updated 258 votes with party_breakdown"

- [ ] **Step 3: Verify data**

Run: `node -e "const d=require('./src/data/key-votes.json'); console.log(d[0].party_breakdown)"`
Expected: `{ dem_yea: N, dem_nay: N, rep_yea: N, rep_nay: N, other_yea: N, other_nay: N }`

- [ ] **Step 4: Add to prebuild chain**

In `package.json`, update the `prebuild` script:

```json
"prebuild": "node scripts/compute-party-loyalty.mjs && node scripts/compute-party-breakdown.mjs && npm run icons:generate && npm run donor-percentiles",
```

- [ ] **Step 5: Commit**

```bash
git add scripts/compute-party-breakdown.mjs package.json src/data/key-votes.json
git commit -m "feat: compute party_breakdown for all key votes

Prebuild script tallies D/R/other Yea/Nay counts per vote using
ICPSR-to-party mapping. Enables 'Breaks with Party' stat."
```

---

### Task 3: Create Bill URL Utility

Shared utility for constructing Congress.gov bill page URLs and roll call links. Used by Tasks 4, 5, and 6.

**Files:**
- Create: `src/lib/bill-urls.ts`
- Create: `src/lib/bill-urls.test.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/bill-urls.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { billToCongressGovUrl, rollCallUrl } from "./bill-urls";

describe("billToCongressGovUrl", () => {
  it("converts HR bills", () => {
    expect(billToCongressGovUrl("HR6703", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/house-bill/6703"
    );
  });

  it("converts S bills", () => {
    expect(billToCongressGovUrl("S1234", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/senate-bill/1234"
    );
  });

  it("converts HJRES bills", () => {
    expect(billToCongressGovUrl("HJRES100", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/house-joint-resolution/100"
    );
  });

  it("converts SJRES bills", () => {
    expect(billToCongressGovUrl("SJRES50", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/senate-joint-resolution/50"
    );
  });

  it("converts HCONRES bills", () => {
    expect(billToCongressGovUrl("HCONRES10", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/house-concurrent-resolution/10"
    );
  });

  it("converts SCONRES bills", () => {
    expect(billToCongressGovUrl("SCONRES5", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/senate-concurrent-resolution/5"
    );
  });

  it("converts HRES bills", () => {
    expect(billToCongressGovUrl("HRES1014", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/house-resolution/1014"
    );
  });

  it("returns null for PN (nominations)", () => {
    expect(billToCongressGovUrl("PN121", 119)).toBeNull();
  });

  it("converts SRES bills", () => {
    expect(billToCongressGovUrl("SRES42", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/senate-resolution/42"
    );
  });

  it("returns null for unrecognized prefixes", () => {
    expect(billToCongressGovUrl("UNKNOWN99", 119)).toBeNull();
  });
});

describe("rollCallUrl", () => {
  it("generates House roll call URL", () => {
    expect(rollCallUrl("House", 399, "2025-03-15", 119)).toBe(
      "https://clerk.house.gov/Votes/2025399"
    );
  });

  it("does not zero-pad House roll call numbers", () => {
    expect(rollCallUrl("House", 5, "2025-01-10", 119)).toBe(
      "https://clerk.house.gov/Votes/20255"
    );
  });

  it("generates Senate roll call URL (session 1 — congress start year)", () => {
    expect(rollCallUrl("Senate", 100, "2025-06-15", 119)).toBe(
      "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00100.htm"
    );
  });

  it("generates Senate roll call URL (session 2 — second year)", () => {
    expect(rollCallUrl("Senate", 677, "2026-01-30", 119)).toBe(
      "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1192/vote_119_2_00677.htm"
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/bill-urls.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement the utility**

Create `src/lib/bill-urls.ts`:

```typescript
/**
 * URL construction for Congress.gov bill pages and roll call records.
 */

const BILL_PREFIX_MAP: Record<string, string> = {
  HR: "house-bill",
  S: "senate-bill",
  HJRES: "house-joint-resolution",
  SJRES: "senate-joint-resolution",
  HCONRES: "house-concurrent-resolution",
  SCONRES: "senate-concurrent-resolution",
  HRES: "house-resolution",
  SRES: "senate-resolution",
};

// Ordered longest-prefix-first so "HCONRES" matches before "HR"
const PREFIXES = Object.keys(BILL_PREFIX_MAP).sort((a, b) => b.length - a.length);

/**
 * Convert a bill identifier (e.g., "HR6703") to a Congress.gov URL.
 * Returns null for nominations (PN) or unrecognized prefixes.
 */
export function billToCongressGovUrl(bill: string, congress: number): string | null {
  for (const prefix of PREFIXES) {
    if (bill.startsWith(prefix)) {
      const number = bill.slice(prefix.length);
      if (!number || isNaN(Number(number))) return null;
      const slug = BILL_PREFIX_MAP[prefix];
      return `https://www.congress.gov/bill/${congress}th-congress/${slug}/${number}`;
    }
  }
  return null;
}

/**
 * Construct an official roll call vote URL.
 *
 * House: https://clerk.house.gov/Votes/{year}{rollnumber}
 * Senate: https://www.senate.gov/legislative/LIS/roll_call_votes/vote{congress}{session}/vote_{congress}_{session}_{rollnumber}.htm
 */
export function rollCallUrl(
  chamber: "House" | "Senate",
  rollnumber: number,
  date: string,
  congress: number
): string {
  if (chamber === "House") {
    const year = new Date(date).getFullYear();
    return `https://clerk.house.gov/Votes/${year}${rollnumber}`;
  }

  // Senate: session 1 = even year (start of congress), session 2 = odd year
  // Congress 119 started Jan 2025 (odd) → session 1 is odd year, session 2 is even
  const year = new Date(date).getFullYear();
  const congressStartYear = 2025 + (congress - 119) * 2;
  const session = year === congressStartYear ? 1 : 2;
  const paddedRoll = String(rollnumber).padStart(5, "0");
  return `https://www.senate.gov/legislative/LIS/roll_call_votes/vote${congress}${session}/vote_${congress}_${session}_${paddedRoll}.htm`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/bill-urls.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/bill-urls.ts src/lib/bill-urls.test.ts
git commit -m "feat: add bill URL utility for Congress.gov links

Converts bill IDs (HR, S, HJRES, etc.) to Congress.gov URLs.
Constructs House/Senate roll call vote URLs."
```

---

## Chunk 2: Component Updates

### Task 4: Add Bill Links to MemberVotingRecord

Add Congress.gov bill page and roll call links to each vote card, plus a "Full voting record" link at the bottom.

**Files:**
- Modify: `src/components/MemberVotingRecord.tsx`
- Modify: `src/components/MemberVotingRecord.test.tsx`

**Depends on:** Task 1 (ICPSR fix), Task 3 (bill-urls utility)

- [ ] **Step 1: Add tests for bill and roll call links**

In `src/components/MemberVotingRecord.test.tsx`, add:

```tsx
it("renders bill link to Congress.gov", () => {
  render(
    <MemberVotingRecord
      bioguideId="B001234"
      icpsrId="99901"
      memberName="John Smith"
      chamber="House"
      keyVotes={mockKeyVotes}
    />
  );
  const billLink = screen.getByRole("link", { name: /HR1/i });
  expect(billLink).toHaveAttribute("href", "https://www.congress.gov/bill/119th-congress/house-bill/1");
  expect(billLink).toHaveAttribute("target", "_blank");
});

it("renders roll call link", () => {
  render(
    <MemberVotingRecord
      bioguideId="B001234"
      icpsrId="99901"
      memberName="John Smith"
      chamber="House"
      keyVotes={mockKeyVotes}
    />
  );
  const rollCallLink = screen.getByRole("link", { name: /Roll #1/i });
  expect(rollCallLink).toHaveAttribute("href", expect.stringContaining("clerk.house.gov"));
});

it("renders Congress.gov full record link", () => {
  render(
    <MemberVotingRecord
      bioguideId="B001234"
      icpsrId="99901"
      memberName="John Smith"
      chamber="House"
      keyVotes={mockKeyVotes}
    />
  );
  const fullRecordLink = screen.getByRole("link", { name: /Full voting record/i });
  expect(fullRecordLink).toHaveAttribute("href", "https://www.congress.gov/member/B001234");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/MemberVotingRecord.test.tsx`
Expected: FAIL — no links rendered yet.

- [ ] **Step 3: Add bill and roll call links to vote cards**

In `src/components/MemberVotingRecord.tsx`:

1. Add import at top:

```tsx
import { billToCongressGovUrl, rollCallUrl } from "@/lib/bill-urls";
```

2. In the vote card JSX (inside the `displayVotes.map()` around line 217-218), replace the static bill text and roll call number with links:

Replace:
```tsx
{vote.bill && (
  <p className="text-xs text-slate-400 mb-1">{vote.bill}</p>
)}
```

With:
```tsx
{vote.bill && (() => {
  const billUrl = billToCongressGovUrl(vote.bill, vote.congress);
  return billUrl ? (
    <a href={billUrl} target="_blank" rel="noopener noreferrer"
       className="text-xs text-blue-500 hover:text-blue-700 hover:underline mb-1 inline-block"
       onClick={(e) => e.stopPropagation()}>
      {vote.bill}
    </a>
  ) : (
    <p className="text-xs text-slate-400 mb-1">{vote.bill}</p>
  );
})()}
```

Replace the roll call display:
```tsx
<span>Roll #{vote.rollnumber}</span>
```

With:
```tsx
<a href={rollCallUrl(vote.chamber, vote.rollnumber, vote.date, vote.congress)}
   target="_blank" rel="noopener noreferrer"
   className="text-blue-500 hover:text-blue-700 hover:underline"
   aria-label={`Roll #${vote.rollnumber}`}
   onClick={(e) => e.stopPropagation()}>
  Roll #{vote.rollnumber}
</a>
```

3. After the "Show More" button (around line 256), add the Congress.gov full record link:

```tsx
{/* Full voting record link */}
<div className="mt-4 pt-3 border-t border-slate-100">
  <a
    href={`https://www.congress.gov/member/${bioguideId}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Full voting record on Congress.gov"
    className="text-sm text-slate-500 hover:text-blue-600 hover:underline transition-colors"
  >
    Full voting record on Congress.gov →
  </a>
</div>
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/MemberVotingRecord.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/MemberVotingRecord.tsx src/components/MemberVotingRecord.test.tsx
git commit -m "feat: add Congress.gov bill and roll call links to key votes

Each vote card links bill name to Congress.gov and roll number
to official roll call record. Full record link at section bottom."
```

---

### Task 5: Add "Breaks with Party" Stat

Add a 5th stat to the key votes stats grid showing how often the member votes against their own party majority.

**Files:**
- Modify: `src/components/MemberVotingRecord.tsx`
- Modify: `src/components/MemberVotingRecord.test.tsx`
- Modify: `src/app/rep/[id]/page.tsx` — pass `memberParty` prop

**Depends on:** Task 1 (ICPSR fix), Task 2 (party_breakdown data)

- [ ] **Step 1: Add test for "Breaks with Party" stat**

In `src/components/MemberVotingRecord.test.tsx`:

Update mockKeyVotes to include `party_breakdown`:

```tsx
// Add to first mock vote:
party_breakdown: { dem_yea: 0, dem_nay: 200, rep_yea: 220, rep_nay: 10, other_yea: 0, other_nay: 0 },
// Add to second mock vote:
party_breakdown: { dem_yea: 200, dem_nay: 0, rep_yea: 18, rep_nay: 212, other_yea: 0, other_nay: 0 },
```

Add test:

```tsx
it("shows 'Breaks w/ Party' stat", () => {
  render(
    <MemberVotingRecord
      bioguideId="B001234"
      icpsrId="99901"
      memberParty="R"
      memberName="John Smith"
      chamber="House"
      keyVotes={mockKeyVotes}
    />
  );
  expect(screen.getByText("Breaks w/ Party")).toBeInTheDocument();
  // Member "99901" voted Yea on vote 1 (R majority is Yea) — aligned
  // Member "99901" voted Nay on vote 2 (R majority is Nay) — aligned
  // So 0% breaks
  expect(screen.getByText("0%")).toBeInTheDocument();
});

it("shows non-zero 'Breaks w/ Party' when member dissents", () => {
  // Override vote 1: make member vote Nay while R majority is Yea = 1 break out of 2
  const dissenterVotes = mockKeyVotes.map((v, i) => i === 0
    ? { ...v, votes: { ...v.votes, "99901": "Nay" } }
    : v
  );
  render(
    <MemberVotingRecord
      bioguideId="B001234"
      icpsrId="99901"
      memberParty="R"
      memberName="John Smith"
      chamber="House"
      keyVotes={dissenterVotes}
    />
  );
  expect(screen.getByText("50%")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/MemberVotingRecord.test.tsx`
Expected: FAIL — no `memberParty` prop or "Breaks w/ Party" text.

- [ ] **Step 3: Implement "Breaks with Party" stat**

In `src/components/MemberVotingRecord.tsx`:

1. Add `memberParty` to props:

```tsx
interface MemberVotingRecordProps {
  bioguideId: string;
  icpsrId?: string;
  memberParty?: string;
  memberName: string;
  chamber: "House" | "Senate";
  keyVotes: KeyVote[];
}
```

2. Add `party_breakdown` to `KeyVote` interface (should already be optional):

```tsx
party_breakdown?: {
  dem_yea: number;
  dem_nay: number;
  rep_yea: number;
  rep_nay: number;
  other_yea: number;
  other_nay: number;
};
```

3. Update destructuring and add calculation to the stats `useMemo`:

```tsx
const stats = useMemo(() => {
  const yeas = memberVotes.filter(v => v.memberVote === "Yea").length;
  const nays = memberVotes.filter(v => v.memberVote === "Nay").length;
  const notVoting = memberVotes.filter(v => v.memberVote === "Not Voting").length;
  const total = memberVotes.length;
  const participationRate = total > 0 ? ((yeas + nays) / total * 100) : 0;

  // "Breaks with Party" — how often they voted against their own party majority
  let breaksWithParty = 0;
  let scorableVotes = 0;
  if (memberParty) {
    for (const v of memberVotes) {
      if (!v.party_breakdown) continue;
      if (v.memberVote !== "Yea" && v.memberVote !== "Nay") continue;
      const pb = v.party_breakdown;
      const partyYea = memberParty === "D" ? pb.dem_yea : memberParty === "R" ? pb.rep_yea : pb.other_yea;
      const partyNay = memberParty === "D" ? pb.dem_nay : memberParty === "R" ? pb.rep_nay : pb.other_nay;
      if (partyYea === 0 && partyNay === 0) continue;
      const partyMajority = partyYea > partyNay ? "Yea" : "Nay";
      scorableVotes++;
      if (v.memberVote !== partyMajority) breaksWithParty++;
    }
  }
  const breaksPct = scorableVotes > 0 ? Math.round((breaksWithParty / scorableVotes) * 100) : null;

  return { yeas, nays, notVoting, total, participationRate, breaksPct };
}, [memberVotes, memberParty]);
```

4. Add the 5th stat pill after the Participation stat in the grid. Change grid from `grid-cols-2 md:grid-cols-4` to `grid-cols-2 md:grid-cols-5`:

```tsx
{stats.breaksPct !== null && (
  <div className="bg-slate-50 rounded-xl p-4 text-center">
    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Breaks w/ Party</p>
    <p className="text-2xl font-black text-slate-700">{stats.breaksPct}%</p>
  </div>
)}
```

- [ ] **Step 4: Pass memberParty from page.tsx**

In `src/app/rep/[id]/page.tsx`, add `memberParty` to the `<MemberVotingRecord>` JSX:

```tsx
<MemberVotingRecord
  bioguideId={member.bioguide_id}
  icpsrId={icpsrId}
  memberParty={member.party}
  memberName={member.full_name}
  ...
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/components/MemberVotingRecord.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/MemberVotingRecord.tsx src/components/MemberVotingRecord.test.tsx src/app/rep/[id]/page.tsx
git commit -m "feat: add 'Breaks with Party' stat to key votes section

Replaces the removed Party Voting Statistics section. Shows how
often member votes against their own party majority on key issues."
```

---

### Task 6: Add Bill Links to RepresentsYouSection

Add Congress.gov links to bill references in the "Represents You?" section.

**Files:**
- Modify: `src/components/RepresentsYouSection.tsx`
- Modify: `src/components/RepresentsYouSection.test.tsx`

**Depends on:** Task 3 (bill-urls utility)

- [ ] **Step 1: Add test for bill links**

In `src/components/RepresentsYouSection.test.tsx`, read the existing test file first. Add a test:

```tsx
it("renders bill references as Congress.gov links", () => {
  // Use existing mock data pattern but ensure a vote has a bill field
  // Render component, then check for link — the link text is vote.shortLabel, not vote.bill
  // Adapt test to use the exact shortLabel text from the existing test mock data
  const link = screen.getByRole("link", { name: /the vote short label text/i });
  expect(link).toHaveAttribute("href", expect.stringContaining("congress.gov"));
});
```

**Note:** Adapt the link name regex to match the `shortLabel` value from the existing test mock data in `RepresentsYouSection.test.tsx`. The `bill` field (e.g., "HR6703") is used for URL construction, but `shortLabel` (e.g., "Lower Health Care Premiums Act") is the visible link text.

(Adapt to the exact mock data structure already in the test file.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/RepresentsYouSection.test.tsx`
Expected: FAIL — bill text isn't a link.

- [ ] **Step 3: Add bill links**

In `src/components/RepresentsYouSection.tsx`:

1. Add import:

```tsx
import { billToCongressGovUrl } from "@/lib/bill-urls";
```

2. In the vote match display (around line 127), wrap the `shortLabel` or bill reference with a link. Find where `vote.bill` is used and replace static text with:

```tsx
<span className="font-medium">
  {(() => {
    const url = billToCongressGovUrl(vote.bill, 119);
    return url ? (
      <a href={url} target="_blank" rel="noopener noreferrer"
         className="text-blue-600 hover:underline">
        {vote.shortLabel}
      </a>
    ) : (
      vote.shortLabel
    );
  })()}
</span>
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/RepresentsYouSection.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/RepresentsYouSection.tsx src/components/RepresentsYouSection.test.tsx
git commit -m "feat: add Congress.gov bill links to Represents You section"
```

---

### Task 7: Inline Conflict Evidence in DonorCaptureScore

Show top 1-2 conflicts as callout cards inside the DonorCaptureScore component, with bill links.

**Files:**
- Modify: `src/components/DonorCaptureScore.tsx`
- Modify: `src/components/DonorCaptureScore.test.tsx`

**Depends on:** Task 3 (bill-urls utility)

- [ ] **Step 1: Add tests for inline evidence**

In `src/components/DonorCaptureScore.test.tsx`, add:

```tsx
it("shows top conflict evidence when conflicts exist", () => {
  const conflicts = [makeConflict("high")];
  render(
    <DonorCaptureScore
      conflicts={conflicts}
      finance={makeFinance(40, 20)}
      memberName="Rep Test"
    />
  );
  expect(screen.getByText(/Pharmaceuticals/)).toBeInTheDocument();
  expect(screen.getByText(/H\.R\. 3/i)).toBeInTheDocument();
});

it("shows 'See all N conflicts' link when more than 2", () => {
  const conflicts = [makeConflict("high"), makeConflict("medium"), makeConflict("low")];
  render(
    <DonorCaptureScore
      conflicts={conflicts}
      finance={makeFinance(40, 20)}
      memberName="Rep Test"
    />
  );
  expect(screen.getByText(/See all 3 conflicts/i)).toBeInTheDocument();
});

it("shows PAC-only explanation when 0 conflicts but PAC funding", () => {
  render(
    <DonorCaptureScore
      conflicts={[]}
      finance={makeFinance(35, 20)}
      memberName="Rep Test"
    />
  );
  expect(screen.getByText(/No direct conflicts detected/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/DonorCaptureScore.test.tsx`
Expected: FAIL — no evidence callouts rendered.

- [ ] **Step 3: Add inline evidence rendering**

In `src/components/DonorCaptureScore.tsx`:

1. Add import:

```tsx
import { billToCongressGovUrl } from "@/lib/bill-urls";
```

2. After the plain-language summary `<p>` tag (around line 166), add evidence callouts:

```tsx
{/* Top conflict evidence — show your work */}
{conflicts.length > 0 && (
  <div className="mt-4 space-y-2">
    {conflicts.slice(0, 2).map((conflict, idx) => {
      const billUrl = billToCongressGovUrl(conflict.voteBill, 119);
      return (
        <div
          key={idx}
          className={`flex items-start gap-3 rounded-xl p-3 text-sm border ${
            conflict.conflictSeverity === "high"
              ? "bg-red-50 border-red-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <span className="text-lg shrink-0" aria-hidden="true">{conflict.icon}</span>
          <p className="text-slate-700">
            Received <span className="font-bold">${(conflict.donationAmount / 1000).toFixed(0)}K</span> from {conflict.industryDisplayName}, then voted <span className="font-bold">{conflict.votePosition}</span> on{" "}
            {billUrl ? (
              <a href={billUrl} target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:underline font-medium">
                {conflict.voteBill}
              </a>
            ) : (
              <span className="font-medium">{conflict.voteBill}</span>
            )}
            {conflict.voteTitle && (
              <span className="text-slate-500"> ({conflict.voteTitle})</span>
            )}
          </p>
        </div>
      );
    })}
    {conflicts.length > 2 && (
      <a
        href="#conflicts"
        className="text-sm text-blue-600 hover:underline font-medium inline-block mt-1"
      >
        See all {conflicts.length} conflicts ↓
      </a>
    )}
  </div>
)}
{conflicts.length === 0 && hasFinanceData && (
  <p className="mt-3 text-sm text-slate-500 italic">
    {pacPct.toFixed(0)}% PAC-funded. No direct conflicts detected between top donor industries and key votes.
  </p>
)}
```

3. Add `id="conflicts"` to the ConflictOfInterestSection in `src/app/rep/[id]/page.tsx` so the anchor link works:

In `page.tsx`, find the Conflicts section and add the id:

```tsx
<ErrorBoundary context="conflict of interest analysis">
  <div id="conflicts">
    <ConflictOfInterestSection conflicts={conflicts} memberName={member.full_name} />
  </div>
</ErrorBoundary>
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/DonorCaptureScore.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/DonorCaptureScore.tsx src/components/DonorCaptureScore.test.tsx src/app/rep/[id]/page.tsx
git commit -m "feat: show conflict evidence in DonorCaptureScore verdict

Top 1-2 conflicts shown inline with dollar amounts and bill links.
'See all N conflicts' anchor link when more than 2 exist."
```

---

## Chunk 3: UI Refinements

### Task 8: Financial Disclosures Timeline Redesign

Replace the flat list of PDF links with a timeline card layout.

**Files:**
- Modify: `src/components/FinancialDisclosuresSection.tsx`
- Modify: `src/components/FinancialDisclosuresSection.test.tsx`

- [ ] **Step 1: Read existing test file and update for new layout**

Read `src/components/FinancialDisclosuresSection.test.tsx`. The redesign changes progressive disclosure behavior:
- **Old:** All filings hidden behind "Show all filings" toggle
- **New:** First 3 filings visible in timeline, rest behind "Show all N filings" toggle

Update existing tests that click "Show all filings" before asserting content — the first 3 items are now immediately visible. Also update card title text from `"YYYY Annual Financial Disclosure"` to `"YYYY Financial Disclosure"` (we drop "Annual").

- [ ] **Step 2: Add test for timeline layout**

```tsx
it("renders filings in a timeline layout with year headers", () => {
  render(
    <FinancialDisclosuresSection disclosures={mockDisclosures} memberName="Test Rep" />
  );
  // Summary should show year range
  expect(screen.getByText(/financial disclosure/i)).toBeInTheDocument();
  // Filing type badge visible
  expect(screen.getByText("Original")).toBeInTheDocument();
});
```

- [ ] **Step 3: Redesign the component**

In `src/components/FinancialDisclosuresSection.tsx`, replace `FinancialDisclosuresContent` with a timeline layout:

```tsx
function FinancialDisclosuresContent({
  disclosures,
  formatDate,
  getFilingTypeLabel,
  getFilingTypeBadgeColor,
}: {
  disclosures: FinancialDisclosure[];
  formatDate: (dateStr: string) => string;
  getFilingTypeLabel: (type: string) => string;
  getFilingTypeBadgeColor: (type: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...disclosures].sort((a, b) => b.year - a.year);
  const displayItems = expanded ? sorted : sorted.slice(0, 3);
  const years = sorted.map(d => d.year);
  const yearRange = years.length > 1 ? `${years[years.length - 1]}–${years[0]}` : `${years[0]}`;

  return (
    <>
      <p className="text-slate-700 mb-6">
        {disclosures.length} financial disclosure filing{disclosures.length !== 1 ? "s" : ""} on record ({yearRange}).
      </p>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" aria-hidden="true" />

        <div className="space-y-4">
          {displayItems.map((filing, idx) => (
            <div key={idx} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-slate-300 shrink-0">
                <span className="text-sm font-bold text-slate-600">{String(filing.year).slice(-2)}</span>
              </div>

              {/* Card */}
              <a
                href={filing.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{filing.year} Financial Disclosure</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getFilingTypeBadgeColor(filing.filingType)}`}>
                      {getFilingTypeLabel(filing.filingType)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">Filed {formatDate(filing.filingDate)}</p>
                </div>
                <span className="text-blue-600 font-semibold text-sm group-hover:underline shrink-0">
                  View PDF →
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {sorted.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {expanded ? "Show fewer" : `Show all ${sorted.length} filings`}
        </button>
      )}

      {/* Data Source */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Data from House Clerk Financial Disclosures •{" "}
          <a href="https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure"
             target="_blank" rel="noopener noreferrer"
             className="text-blue-400 hover:text-blue-500 underline">
            Official Source
          </a>
        </p>
      </div>
    </>
  );
}
```

Also update `getFilingTypeLabel` to handle `"T"` (Termination):

```tsx
const getFilingTypeLabel = (type: string) => {
  switch (type) {
    case "O": return "Original";
    case "A": return "Amendment";
    case "N": return "New Filer";
    case "T": return "Termination";
    default: return type;
  }
};
```

Add the badge color helper function alongside `getFilingTypeLabel`:

```tsx
const getFilingTypeBadgeColor = (type: string) => {
  switch (type) {
    case "O": return "bg-blue-100 text-blue-700";
    case "A": return "bg-amber-100 text-amber-700";
    case "N": return "bg-green-100 text-green-700";
    case "T": return "bg-slate-100 text-slate-700";
    default: return "bg-slate-100 text-slate-700";
  }
};
```

Pass it to `FinancialDisclosuresContent`.

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/FinancialDisclosuresSection.test.tsx`
Expected: PASS

- [ ] **Step 5: Run build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/FinancialDisclosuresSection.tsx src/components/FinancialDisclosuresSection.test.tsx
git commit -m "feat: redesign financial disclosures as timeline

Timeline card layout with year dots, filing type badges,
and progressive disclosure. Replaces flat PDF link list."
```

---

### Task 9: Improve StockTradesSection Empty State

Improve the empty state message to be clearer about what "no data" means.

**Files:**
- Modify: `src/components/StockTradesSection.tsx`

- [ ] **Step 1: Read the current empty state**

Read the component to find where it handles the empty/no-data case.

- [ ] **Step 2: Update empty state message**

Find the empty state rendering and update the message. Currently likely says something generic — change to:

```tsx
<div className="text-center py-8">
  <p className="text-slate-500">No stock trade disclosures found for {memberName}.</p>
  <p className="text-xs text-slate-400 mt-1">Not all members of Congress are required to report stock trades.</p>
</div>
```

- [ ] **Step 3: Run build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/StockTradesSection.tsx
git commit -m "fix: improve stock trades empty state messaging"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass, zero failures.

- [ ] **Step 2: Run production build**

Run: `npx next build`
Expected: Build succeeds with all pages generated.

- [ ] **Step 3: Spot-check Emmer's page**

Start dev server (`pnpm dev`) and verify at `localhost:3000/rep/E000294`:
- Key Vote Record section shows votes (not empty)
- DonorCaptureScore shows conflict evidence callouts
- Bill names link to Congress.gov
- Roll call numbers link to official records
- "Breaks w/ Party" stat appears in the stats row
- Party Voting Statistics section is gone
- Financial disclosures show as timeline cards
- "Full voting record on Congress.gov →" link at bottom of key votes

- [ ] **Step 4: Final commit if any tweaks needed**
