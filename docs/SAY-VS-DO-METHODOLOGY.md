# Say vs Do Scoring — Methodology v3.0

_Last updated: 2026-02-19_

## Overview

The "Say vs Do" score measures how consistently a politician **votes** with their **stated positions**.

A score of **100%** means every vote aligns perfectly with every stated position.  
A score of **0%** means the politician votes opposite to everything they claim to believe.

---

## What Changed in v3.0 (Why This Was Rewritten)

### The v2.0 Bug: `publicBenefit` Was Nearly Useless

Previous versions determined a vote's ideological direction using a `publicBenefit` field labeled `positive`, `negative`, or `mixed`. The algorithm treated `positive` as the liberal direction and anything else as conservative.

**Problem:** 192 of 258 votes (75%) were labeled `mixed`, causing the algorithm to treat them as conservative-direction votes. This inverted alignment scores for the majority of the dataset — members who consistently voted liberal on "mixed" bills scored *lower*, not higher.

This is the root cause of bugs #37 and #39 (scores appearing backwards).

### The v3.0 Fix: Party Voting Patterns

v3.0 removes the `publicBenefit` dependency entirely and uses **partisan voting patterns** instead:

- If Democrats vote Yea and Republicans vote Nay → Yea is the **liberal direction**
- If Republicans vote Yea and Democrats vote Nay → Yea is the **conservative direction**
- If the vote is bipartisan (< 30% split between parties) → **skip it**

Bipartisan votes are skipped because they don't reveal anything about Say vs Do alignment — if everyone agrees, there's nothing to measure.

---

## Algorithm (Step by Step)

### Input data
- **Stated positions:** OnTheIssues.org scrape — each position has a `topic` (e.g., "Expand ObamaCare") and an `intensity` from 1–5
- **Key votes:** Congress.gov roll call votes with per-member Yea/Nay records
- **Member roster:** bioguide_id + party (D/R/I) for all 538 members

### Step 1: Determine vote direction

For each roll call vote, count party-line voting:
```
demYeaPct = demYeaCount / (demYeaCount + demNayCount)
repYeaPct = repYeaCount / (repYeaCount + repNayCount)
split = |demYeaPct - repYeaPct|

if split > 0.30:
  direction = (demYeaPct > repYeaPct) ? "liberal" : "conservative"
else:
  direction = "unclear" → SKIP this vote
```

### Step 2: Determine topic ideology

Each OnTheIssues topic has a fixed ideological direction:

| Topic | Ideology |
|-------|----------|
| Expand ObamaCare | liberal |
| Higher taxes on the wealthy | liberal |
| Prioritize green energy | liberal |
| Pathway to citizenship | liberal |
| Abortion is a woman's right | liberal |
| Make voter registration easier | liberal |
| Comfortable with same-sex marriage | liberal |
| Legally require hiring women & minorities | liberal |
| Fight EPA regulatory over-reach | conservative |
| Absolute right to gun ownership | conservative |
| Privatize Social Security | conservative |
| Expand the military | conservative |
| Vouchers for school choice | conservative |
| Keep God in the public sphere | conservative |
| America was founded on Christian values | conservative |
| Stricter punishment reduces crime | conservative |
| Marijuana is a gateway drug | conservative |
| Peace through Strength | conservative |
| Stay away from the UN & Globalism | conservative |
| Support American Exceptionalism | conservative |
| Businesses have a right to pollute | conservative |
| Support & expand free trade | neutral (skip) |
| Avoid foreign entanglements | neutral (skip) |
| Stay out of foreign wars | neutral (skip) |

### Step 3: Determine expected vote direction

Given a stated position's `topic` ideology and `intensity`:

```
memberSupports = (intensity >= 4)   // 4-5 = Supports, 1-2 = Opposes, 3 = skip

if topicIdeology == "liberal":
  expectedDirection = memberSupports ? "liberal" : "conservative"
  
if topicIdeology == "conservative":
  expectedDirection = memberSupports ? "conservative" : "liberal"
  
if topicIdeology == "neutral" or intensity == 3:
  SKIP this position
```

**Example:** A member with intensity=5 on "Expand ObamaCare" (liberal topic) expects to vote in the **liberal direction** (Yea when Dems vote Yea).

**Example:** A member with intensity=1 on "Fight EPA regulatory over-reach" (conservative topic) expects to vote in the **liberal direction** (Yea when Dems vote Yea, i.e., opposing EPA deregulation).

### Step 4: Compare expected vs actual

For each (position, vote) pair:
- If the member voted in the expected ideological direction → **aligned**
- Otherwise → **misaligned**
- If the member voted "Not Voting" or "Present" → **skip**

### Step 5: Compute weighted score

Each comparison carries a weight based on:
- **Intensity weight:** `abs(intensity - 3) / 2` → [0.5, 0.5, skip, 0.5, 0.5, 1.0, 1.0]
  - Strongly held positions (1 or 5) count twice as much as mild positions (2 or 4)
  - Neutral (3) is never scored
- **Time weight:** Recent votes count more than old ones
  - ≤ 30 days: 1.0x
  - 30–180 days: 0.9–1.0x
  - 180–365 days: 0.7–0.9x
  - 1–2 years: 0.6x
  - 2+ years: 0.5x

```
score = Σ(weight × aligned) / Σ(weight) × 100
```

---

## Confidence Levels

| Level | Comparisons Required | Meaning |
|-------|---------------------|---------|
| **High** | ≥ 20 | Reliable score |
| **Medium** | ≥ 10 | Reasonably reliable |
| **Low** | ≥ 3 | Treat with caution |
| **Insufficient** | < 3 | Too little data — score not shown |

Reasons for low comparison counts:
- Member has few stated positions on OnTheIssues
- Member's stated topics don't match any partisan vote categories
- Member voted "Not Voting" on most relevant roll calls

---

## What This Score Measures (and What It Doesn't)

### ✅ What it measures
- Consistency between stated policy positions and roll call votes
- Weighted by how strongly the position is held

### ❌ What it does NOT measure
- Whether their policies are good or bad
- Whether they're a "good" or "bad" politician
- Whether their stated positions represent their constituents' views
- Campaign finance influence (tracked separately)

---

## Output Format

Each member's result includes:

```json
{
  "bioguide_id": "...",
  "name": "...",
  "alignment_score": 72,
  "total_votes_analyzed": 15,
  "confidence": "medium",
  "say_vs_do_v3": {
    "score": 72,
    "total_comparisons": 15,
    "topic_breakdown": [...],
    "category_breakdown": [...],
    "methodology": "say-vs-do-v3"
  }
}
```

The `topic_breakdown` field shows the score for each OnTheIssues topic, giving full transparency into how the overall score was computed.

---

## Files

| File | Purpose |
|------|---------|
| `src/lib/say-vs-do.ts` | Core algorithm implementation |
| `src/lib/say-vs-do.test.ts` | 60+ unit tests |
| `scripts/compute-scores.ts` | Runner script |
| `src/data/alignment-scores.json` | Generated scores (git-ignored in prod) |
| `src/data/alignment-summary.json` | Summary for display layer |
