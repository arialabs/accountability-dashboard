# UX Improvements: Trust & Credibility Redesign

**Date:** February 13, 2026  
**Goal:** Make every data point feel verifiable, understandable, and trustworthy within 5 seconds.

---

## 1. Homepage / Say vs. Do Leaderboard

### Score Display — Immediate Comprehension
**Problem:** "85%" is meaningless without context. Users ask: "85% of what?"

**Solution:** Replace bare percentages with contextual score cards:

```
┌──────────────────────────────────────┐
│  Rep. Jane Smith         Score: 85%  │
│  ████████████████░░░░                │
│  "Compared 12 public statements      │
│   against 47 votes on related bills" │
│  ─────────────────────────────────── │
│  📊 How is this calculated?          │
│  🕐 Last updated: Feb 13, 2026      │
└──────────────────────────────────────┘
```

**Key changes:**
- Below every score: "Based on X statements vs Y votes"
- Inline "How is this calculated?" link → `/methodology`
- Color meaning is explicit: 🟢 70%+ = Votes match words | 🟡 50-69% = Mixed | 🔴 <50% = Says one thing, does another
- Never show a score without showing the sample size

### Data Freshness
- Every leaderboard shows: "Data from Congress.gov & OnTheIssues · Updated Feb 13, 2026"
- Stale data (>30 days) gets a ⚠️ warning badge

### Filters & Sort
- **Party:** D / R / I toggle (already exists as chamber filter — extend)
- **State:** Dropdown with search
- **Score range:** Slider (0-100%)
- **Chamber:** House / Senate / All (exists)
- **Sort by:** Score (high→low, low→high), Name, State

---

## 2. Individual Representative Pages

### Score Breakdown — Show the Math
**Problem:** A single number hides important nuance.

**Solution:** `ScoreExplainer` component showing:
1. **Overall score** with confidence indicator (dots: ● ● ● ○ ○)
2. **Factor breakdown** — weighted bar chart (already exists in `ScoreBreakdownModal`, promote to inline)
3. **Sample size warning** when data is thin
4. **"View all X votes analyzed"** expandable section

### Statement vs Vote Comparison
**The killer feature for trust.** Side-by-side cards:

```
┌─────────────────────┬──────────────────────┐
│  📢 THEY SAID       │  🗳️ THEY VOTED       │
│                     │                      │
│  "I will always     │  Voted NO on         │
│   protect Social    │  HR 4521: Social     │
│   Security"         │  Security Protection │
│   — Campaign, 2024  │  Act (Jan 15, 2026)  │
│                     │                      │
│  Source: OnTheIssues │  Source: Congress.gov │
│  ↗ View original    │  ↗ View roll call    │
└─────────────────────┴──────────────────────┘
│  ⚠️ MISALIGNED — Said they'd protect it, voted against it
└────────────────────────────────────────────────
```

### Vote History Timeline
- Chronological list with verdict badges (Yea/Nay/Not Voting)
- Filter by category (Healthcare, Defense, Economy, etc.)
- Each vote links to Congress.gov roll call

### Campaign Finance
- Donut chart: PAC vs Individual vs Small Dollar
- "Top 5 Industries" bar chart
- Correlation callout: "Received $X from [Industry] → Voted [for/against] [Industry Bill]"

---

## 3. Trust Indicators (Site-Wide)

### `DataSourceBadge` — On Every Data Point
Small inline badge: `📄 Congress.gov` or `💰 OpenFEC` or `📰 OnTheIssues`
- Clickable → opens source in new tab
- Tooltip shows: "Retrieved [date] from [full URL]"

### Methodology Page (`/methodology`)
Full transparency page covering:
1. What data sources we use (Congress.gov API, OpenFEC, OnTheIssues)
2. How alignment scores are calculated (weighted factors, time decay)
3. Known limitations (position data gaps, vote categorization challenges)
4. Confidence scoring explained
5. Changelog: version history of scoring algorithm
6. "Disagree? File an issue" → GitHub link

### Attribution Footer (Site-Wide)
```
Data sourced from: Congress.gov · OpenFEC · OnTheIssues.org
Scoring methodology v1.2 · Last updated Feb 13, 2026
Open source: github.com/arialabs/accountability-dashboard
```

### Timestamps
- Every data card: "Updated [relative time]" (e.g., "2 days ago")
- Hover for absolute: "February 11, 2026 at 3:42 PM EST"

---

## 4. New Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `ScoreExplainer` | Inline score breakdown with context | Rep pages, leaderboard hover |
| `DataSourceBadge` | Attribution badge for any data point | Everywhere |
| `MethodologyPage` | Full scoring transparency | `/methodology` |
| `VoteComparisonCard` | Statement vs vote side-by-side | Rep pages |

---

## 5. Design Principles

1. **No number without context** — Every stat shows what it measures and sample size
2. **No claim without source** — Every data point links to its origin
3. **No score without explanation** — Users can always drill into the math
4. **Freshness is visible** — Users know when data was last updated
5. **Uncertainty is honest** — Low-confidence scores are flagged, not hidden

---

## 6. Implementation Priority

1. **P0:** `DataSourceBadge` + attribution footer (quick wins, huge trust boost)
2. **P0:** `VoteComparisonCard` (the "aha moment" for users)
3. **P1:** `ScoreExplainer` inline version (promote existing modal content)
4. **P1:** `/methodology` page
5. **P2:** Filters/sort on leaderboard
6. **P2:** Campaign finance correlation callouts
