# Leadership Scrutiny Feature Spec

## Goal
Show whether Congressional leaders are leading their party in the direction voters want, or serving their donors instead. Real scrutiny, not just finance cards.

## Three Pillars of Scrutiny

### 1. Caucus Alignment — "Are they leading or defecting?"
Compare each leader's votes against their caucus majority position on key votes.

**Data we have:**
- Key votes with per-member positions (ICPSR mapped to bioguide) ✅
- Party membership for all members ✅

**What to show:**
- Overall caucus alignment % (e.g. "Thune votes with Republicans 95.2% of the time")
- Specific votes where leader broke from caucus, with context
- Category breakdown (breaks on economy bills vs national security vs healthcare)

**Current findings:**
- Johnson: 100% aligned (Speaker votes party line)
- Jeffries: 100% aligned
- Thune: 95.2% — broke 9 times, mostly on economy/tax bills
- Schumer: 97.9% — broke 4 times, notably on Israel arms sales and economy

### 2. Donor-to-Vote Conflicts — "Follow the money to the votes"
Cross-reference top donor industries with votes on bills affecting those industries.

**Data we need:**
- FEC contribution data by industry (OpenFEC aggregated receipts) — NEED TO FETCH
- Key votes categorized by industry impact — PARTIALLY HAVE (categories exist)
- Mapping of vote categories to donor industries

**What to show:**
- "Received $X from [industry], voted [for/against] [bill] affecting that industry"
- Conflict score: how often do their votes align with donor interests vs constituent interests
- Specific examples (e.g. Jeffries + pro-Israel PACs + Israel policy votes)

**Known conflicts to investigate:**
- Jeffries: Pro-Israel PAC funding → Israel policy positions
- Thune: Telecom/finance industry funding → deregulation votes
- Johnson: Energy industry → climate/energy votes
- Schumer: Wall Street funding → financial regulation

### 3. Constituent Representation — "Who do they actually represent?"
Compare leader positions against what polls show their constituents want.

**Data sources (future):**
- Pew Research polling data
- District-level opinion data
- State-level ballot measures as proxy for voter sentiment

**What to show:**
- "67% of [state] voters support X, but [leader] voted against it"
- Gap between constituent opinion and leader's voting record

## Implementation Plan

### Phase 1 (Now) — Caucus Alignment
- [x] Calculate caucus break data for all leaders
- [ ] Pre-compute and store in `leadership-scrutiny.json`
- [ ] Add "breaks from party" section to leader cards
- [ ] Highlight specific break votes with bill context
- [ ] Color-code: green (aligned), amber (some breaks), red (frequent breaks)

### Phase 2 (Next) — Donor Conflicts
- [ ] Fetch FEC industry-aggregated contributions per leader
- [ ] Map vote categories to donor industries
- [ ] Calculate conflict scores
- [ ] Add "donor vs duty" section to leader cards
- [ ] Specific conflict callouts with evidence

### Phase 3 (Future) — Constituent Gaps
- [ ] Integrate polling data source
- [ ] Calculate opinion-vote gap per leader
- [ ] Add constituent representation score

## Data Pipeline
```
FEC API (industry contributions) + Key Votes (ICPSR → bioguide) + Members (party)
    ↓
leadership-scrutiny.json (pre-computed at build time)
    ↓
LeadershipSpotlight component (server-rendered)
```

## QA Checklist
- [ ] Test on mobile (Safari iOS)
- [ ] Hard refresh after deploy to verify no stale cache
- [ ] Verify all 8 leaders render with data
- [ ] Check that break votes link to actual bill pages
- [ ] Verify finance numbers match FEC source
