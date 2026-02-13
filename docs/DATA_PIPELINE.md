# Data Pipeline Architecture

> How reps.arialabs.ai gets its data — and how every score is calculated.

## Overview

The accountability dashboard uses **exclusively real data** from authoritative government sources. No scores are fabricated. Every number traces back to a public API or official record.

### Data Sources

| Source | What We Get | API | Update Frequency |
|--------|------------|-----|-----------------|
| **Congress.gov** | Members, bills, vote records, committees | `api.congress.gov/v3` | Weekly |
| **Voteview (UCLA)** | Ideology scores (DW-NOMINATE), party loyalty | CSV download | Weekly |
| **OpenFEC** | Campaign finance, donors, PAC money | `api.open.fec.gov/v1` | Weekly |
| **OnTheIssues.org** | Stated policy positions | Web scrape | Monthly |

### Pipeline Steps

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ Congress.gov │───▶│ Members +    │───▶│ Enrich with │───▶│ Compute      │
│ API          │    │ Committees   │    │ Voteview +   │    │ Alignment    │
└─────────────┘    └──────────────┘    │ FEC data     │    │ Scores       │
                                       └─────────────┘    └──────────────┘
                                              │                    │
                                              ▼                    ▼
                                       ┌─────────────┐    ┌──────────────┐
                                       │ src/data/    │    │ src/data/    │
                                       │ members.json │    │ alignment-   │
                                       │ finance.json │    │ scores.json  │
                                       └─────────────┘    └──────────────┘
```

---

## Data Models

### Member (from Congress.gov + Voteview)

```typescript
{
  bioguide_id: string;       // Unique ID from Congress.gov
  full_name: string;
  party: "D" | "R" | "I";
  state: string;
  district: number | null;   // null for senators
  chamber: "house" | "senate";
  photo_url: string;
  bills_sponsored: number;   // From Congress.gov
  bills_cosponsored: number; // From Congress.gov
  committees: Committee[];   // From Congress.gov
  party_loyalty_pct: number; // From Voteview (% votes with party)
  ideology_score: number;    // DW-NOMINATE dim1 (-1 liberal to +1 conservative)
  votes_cast: number;        // From Voteview
}
```

### Campaign Finance (from OpenFEC)

```typescript
{
  candidate_id: string;      // FEC candidate ID
  cycle: number;             // Election cycle (e.g., 2024)
  total_raised: number;
  total_spent: number;
  individual_contributions: number;
  pac_contributions: number;
  small_donors: number;      // ≤$200 (unitemized)
  large_donors: number;      // >$200 (itemized)
  pac_percentage: number;    // pac_contributions / total_raised * 100
  top_contributors: [{
    name: string;
    total: number;
    type: "individual" | "pac" | "party";
  }];
  top_industries: [{
    industry: string;
    total: number;
  }];
}
```

### Alignment Score (Computed)

```typescript
{
  bioguide_id: string;
  alignment_score: number;           // 0-100
  total_votes_analyzed: number;
  aligned_votes: number;
  misaligned_votes: number;
  category_breakdown: {
    [category: string]: {
      aligned: number;
      total: number;
      score: number;
    }
  };
  notable_misalignments: [{
    bill_id: string;
    bill_title: string;
    stated_position: string;
    actual_vote: string;
    category: string;
  }];
  methodology_version: string;       // e.g., "2.0"
  last_computed: string;             // ISO timestamp
}
```

---

## Score Calculation Methodology (v2.0)

### "Say vs. Do" Alignment Score

This is the core metric. It measures whether a member's **actual votes** align with their **stated positions**.

#### Inputs

1. **Stated Positions** — From OnTheIssues.org, which aggregates:
   - Campaign website statements
   - Floor speeches
   - Press releases
   - Interview quotes
   - Previous voting record summaries
   
   Each position has a `topic`, `stance` (Strongly Supports → Strongly Opposes), and `intensity` (1-5).

2. **Actual Votes** — From Congress.gov roll call votes on key bills. Each bill is categorized by topic.

3. **Campaign Finance Context** — From OpenFEC. Used as a transparency flag, not a score input.

#### Algorithm

```
For each member:
  1. Get their stated positions (P) from OnTheIssues
  2. Get their vote records (V) from Congress.gov
  3. For each vote V[i]:
     a. Map the bill's category to a position topic
     b. Determine if the vote ALIGNS with or CONTRADICTS the stated position
        - Position says "Supports X" + Vote is "Yea" on pro-X bill → ALIGNED
        - Position says "Supports X" + Vote is "Nay" on pro-X bill → MISALIGNED
        - Position says "Opposes X" + Vote is "Yea" on pro-X bill → MISALIGNED
        - Position says "Opposes X" + Vote is "Nay" on pro-X bill → ALIGNED
     c. Record the alignment/misalignment
  4. alignment_score = (aligned_votes / total_votes_analyzed) * 100
  5. Break down by category for transparency
```

#### Bill-to-Position Mapping

Bills are manually categorized into topics that map to OnTheIssues positions:

| Bill Category | OnTheIssues Topic |
|--------------|-------------------|
| Healthcare/ACA | "Expand ObamaCare" |
| Climate/Environment | "Prioritize green energy" |
| Gun Control | "Gun Control" |
| Immigration | "Immigration" |
| Defense Spending | "Make military spending" |
| Tax Policy | "Higher taxes on the wealthy" |
| Abortion | "Abortion is a woman's unrestricted right" |
| Education | "Vouchers for school choice" |

#### What Counts as a "Key Vote"

Not every procedural vote is analyzed. We focus on:
- Final passage votes on major legislation
- Amendment votes on contentious provisions
- Cloture votes on significant bills (Senate)
- Veto override attempts

#### Edge Cases

- **New members** (< 5 votes analyzed): Score shown with "limited data" badge
- **Missing positions**: If no OnTheIssues data, member is excluded from alignment scoring
- **Not Voting / Abstain**: Excluded from calculation (neither aligned nor misaligned)
- **No matching position**: If a bill doesn't map to any stated position, it's excluded

#### Confidence Indicator

```
votes_analyzed >= 50  → High confidence
votes_analyzed >= 20  → Medium confidence  
votes_analyzed >= 5   → Low confidence
votes_analyzed < 5    → Insufficient data (score not displayed)
```

### Red Flags (Transparency Indicators)

Red flags are NOT subjective judgments. They're factual indicators:

1. **High PAC Dependency** — PAC contributions > 50% of total raised
2. **Donor-Vote Alignment** — Voted in favor of legislation benefiting top 10 donors/industries
3. **Low Disclosure Compliance** — Late or incomplete financial disclosures
4. **Committee-Related Trading** — Stock trades in companies under member's committee jurisdiction

Each flag includes the raw data so users can judge for themselves.

---

## API Endpoints Used

### Congress.gov (`api.congress.gov/v3`)

| Endpoint | Purpose |
|----------|---------|
| `GET /member?currentMember=true&limit=250` | All current members |
| `GET /member/{bioguide_id}` | Member detail (bills sponsored/cosponsored) |
| `GET /bill/{congress}/{type}/{number}` | Bill details |
| `GET /bill/{congress}/{type}/{number}/actions` | Bill action history |

**Rate Limit**: 5,000 requests/hour (with API key)

### OpenFEC (`api.open.fec.gov/v1`)

| Endpoint | Purpose |
|----------|---------|
| `GET /candidates/search` | Find FEC candidate ID from name/state |
| `GET /candidate/{id}/totals` | Financial summary |
| `GET /schedules/schedule_a` | Individual contributions (itemized) |
| `GET /schedules/schedule_b` | Disbursements |

**Rate Limit**: 1,000 requests/hour (with API key)

### Voteview (UCLA)

| Resource | Purpose |
|----------|---------|
| `voteview.com/static/data/out/members/HSall_members.csv` | All member ideology scores |
| `voteview.com/static/data/out/rollcalls/` | Roll call vote data |

**Rate Limit**: None (static CSV files)

---

## Storage Approach

**JSON files in `src/data/`** — imported statically by Next.js at build time.

Why JSON files instead of a database:
- Zero runtime dependencies
- Instant page loads (data baked into static HTML)
- Git-tracked — every data change is auditable
- Simple deployment (Cloudflare Pages)

Files:
- `members.json` — All 535 members with basic data
- `finance.json` — Campaign finance keyed by bioguide_id
- `committees.json` — Committee assignments
- `alignment-scores.json` — Computed Say vs. Do scores
- `alignment-summary.json` — Sorted summary for leaderboard
- `positions.json` — Stated positions from OnTheIssues
- `key-votes.json` — Key bill votes with member roll calls

---

## Update Schedule

| Data | Frequency | Trigger |
|------|-----------|---------|
| Members | Weekly | Cron (Sunday 2am ET) |
| Votes | Weekly | Cron (Sunday 2am ET) |
| Finance | Weekly | Cron (Sunday 2am ET) |
| Alignment Scores | Weekly | After votes + positions update |
| Positions | Monthly | Manual trigger |

Pipeline runs via GitHub Actions or local `pnpm pipeline`.

---

## Running the Pipeline

```bash
# Full pipeline
CONGRESS_API_KEY=xxx FEC_API_KEY=xxx pnpm pipeline

# Individual steps
CONGRESS_API_KEY=xxx pnpm pipeline:members
FEC_API_KEY=xxx tsx scripts/fetch-finance.ts
tsx scripts/fetch-votes.ts
tsx scripts/compute-scores.ts
```

---

## Transparency Commitment

1. **Every score shows its math** — Click any alignment score to see which votes contributed
2. **Every data point cites its source** — API endpoint, date fetched, raw values
3. **Methodology is versioned** — Changes to scoring are documented with version bumps
4. **Data is git-tracked** — Anyone can see exactly when data changed and why
5. **No editorial judgment** — We present facts; users draw conclusions
