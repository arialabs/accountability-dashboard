# QA/UX Review - Accountability Dashboard
**Date:** 2026-02-13  
**Reviewer:** Nova (Subagent QA Review)  
**Scope:** Full site review - all main pages + 5 representative detail pages

---

## 🔴 CRITICAL ISSUES - Data Wrong or Contradictory

### 1. **ALIGNMENT SCORES ARE MASSIVELY CONTRADICTORY**
**Pages affected:** Multiple rep pages (C001118, C001059, M001244, J000312)

**Examples:**

#### Ben Cline (C001118) - Republican:
- **Overall Voting Record Score:** 2% (displayed prominently)
- **Healthcare section:** 0% Conservative (6 votes analyzed, 0 supporting, 6 opposing)
- **National Security:** 0% Conservative (5 votes analyzed, 0 supporting, 4 opposing)
- **Economy & Taxes:** 0% Conservative (40 votes analyzed, 0 supporting, 36 opposing)
- **BUT... his Party Loyalty is 98.3%** and **Ideology Score is 0.72 (Very Conservative)**

**THE MATH DOESN'T WORK:** A Republican voting 98.3% with their party CANNOT have 0% conservative voting record. This is a fundamental data contradiction.

#### Jim Costa (C001059) - Democrat:
- **Overall Voting Record Score:** 94% (presumably progressive)
- **Voting Rights section:** 0% Conservative... but flagged as "contradiction" saying he "votes against Voting Rights 100% of the time"
- **Wait, what?** If he's voting against Voting Rights, that would be 100% conservative on that issue, not 0% conservative
- **The logic is backwards**

#### Ashley Moody (M001244) - Republican Senator:
- **Overall Score:** 1% Conservative
- **All categories:** 0-3% Conservative across the board
- **Party Loyalty:** 99.1% (nearly perfect Republican voting)
- **Ideology Score:** 0.71 (Very Conservative)

**HOW IS THIS POSSIBLE?** Someone with 99.1% party loyalty to Republicans CANNOT have 1% conservative voting record.

#### James Justice (J000312) - Republican Senator:
- **Overall Score:** 2% Conservative
- **Party Loyalty:** 99.8% (essentially perfect Republican voting)
- **Ideology Score:** 0.59 (Very Conservative)
- **Same contradiction**

**ROOT CAUSE HYPOTHESIS:**
The "Progressive/Conservative" percentage calculation appears to be **inverted** or using the wrong reference direction. When it says "0% Conservative" it might actually mean "100% Conservative" (i.e., 0% of votes were in the progressive direction).

**IMPACT:** 🔥 **CRITICAL** - This is the CORE FEATURE of the site and it's completely broken. Users cannot trust ANY alignment data.

---

### 2. **Stock Trading Data Inconsistencies**

#### Ashley Moody (M001244):
- **Shows:** 23 Total Trades, 15 Purchases, 0 Sales, 16 Unique Stocks
- **Problem 1:** 15 purchases + 0 sales ≠ 23 total trades. Missing 8 trades.
- **Problem 2:** The displayed table shows both purchase (↑) and sale (↓) arrows, contradicting "0 Sales"
- **Example:** "↓ SMCI Mar 24, 2025 $15K" — clearly marked as a sale, but header says 0 sales

#### Jim Costa (C001059):
- **Shows:** 1 Total Trade, 0 Purchases, 0 Sales, 1 Unique Stock
- **Problem:** 0 purchases + 0 sales = 0 trades, not 1 trade
- **The table shows a sale (↓)** of HTLF, so there's at least 1 sale

**IMPACT:** 🔴 **CRITICAL** - Financial disclosure data is legally sensitive. Wrong numbers = loss of credibility.

---

## 🟡 WARNING - Confusing But Not Wrong

### 3. **Contradictions Logic is Confusing**

**Example from Jim Costa (C001059):**
- **Voting Rights:** 0% Conservative (votes against Voting Rights 100%)
- **Stated Position:** "Supports same-sex marriage" + "Strongly supports easier voter registration"
- **Flagged as:** ⚠️ "Says 'Supports' but votes against Voting Rights issues 100%"

**THE CONFUSION:**
- If he's voting **against** Voting Rights, that would be a conservative position
- But the score says "0% Conservative"
- So is 0% Conservative = 100% liberal votes OR 0% conservative votes (100% against conservative positions)?

The **directionality is unclear** to users.

---

### 4. **"Says vs Does" Contradictions May Not Actually Be Contradictions**

**Example from Ben Cline (C001118):**
- **Healthcare contradiction:** Says "Supports privatize Social Security" but "votes against Healthcare issues 100% of the time"
- **Wait...** Privatizing Social Security IS a conservative position. Voting against liberal healthcare bills would ALIGN with that position, not contradict it.

**The system appears to be flagging Republicans as "contradictions" when they're actually being consistent.**

Same issue in reverse:
- **National Security:** Says "Strongly Supports expand the military" but system says "votes against National Security issues 100%"
- **But Republicans DID vote for military funding!** Voting "against" the progressive direction ON national security issues means voting FOR conservative/military positions.

**IMPACT:** 🟡 Confusing to users. The "contradiction" logic needs serious UX clarity.

---

### 5. **Empty Congress and Scandals Pages**

**Congress page:** Returns almost no content (just footer/header). Likely a JavaScript rendering issue since the page is client-side rendered but web_fetch can't execute JS.

**Scandals page:** Same issue - empty except footer.

**However:** These pages might work fine in a real browser. Needs verification.

**IMPACT:** 🟡 May be a non-issue for real users, but worth checking.

---

### 6. **Bill Detail Pages Don't Exist**

Tried accessing `/bill/hr7148` → 404

The bills page shows 95 bills but there's no way to click through to see more details.

**IMPACT:** 🟡 Not critical if bills aren't meant to have detail pages yet, but this limits usefulness.

---

## 📝 UX ISSUES - User Experience Problems

### 7. **🔥 BILL LANGUAGE IS PURE LEGISLATIVE JARGON - UNUSABLE FOR NORMAL PEOPLE**

**This was a specific concern from the user, and it's BAD.**

**Examples from /bills page:**

#### ❌ BAD - No one understands this:
- "Providing for consideration of the bill (H.R. 7148) the Consolidated Appropriations Act, 2026; providing for consideration of the bill (H.R. 7147) the Department of Homeland Security Appropriations Act, 2026; and for other purposes"
- "A joint resolution providing for congressional disapproval under chapter 8 of title 5, United States Code, of the rule submitted by the Environmental Protection Agency relating to 'Extension of Deadlines in Standards of Performance for New, Reconstructed, and Modified Sources and Emissions Guidelines for Existing Sources: Oil and Natural Gas Sector Climate Review Final Rule'."

#### ❌ WORSE - This is completely inscrutable:
- "PN252" - A mega-bill that's just a list of 100+ nominee names with no context: "Scott Mayer, of Pennsylvania, to be a Member of the National Labor Relations Board for the term of five years expiring December 16, 2029; and Mary Anne Carter, of Tennessee, to be Chairperson of the National Endowment for the Arts for a term of four years; and Christopher Yeaw, of Virginia, to be an Assistant Secretary of State (Arms Control, Nonproliferation, and Stability); and..."
  - **Goes on for PAGES**
  - **Zero plain English summary**
  - **Normal people will bounce immediately**

#### ✅ BETTER - But still not great:
- "Do No Harm in Medicaid Act" — at least has a readable title
- "Epstein Files Transparency Act" — clear what it's about

**What users need:**
- **Plain English summary:** "This bill funds government operations through September 2026, including $X for homeland security and $Y for..."
- **Why it matters:** "If this doesn't pass, the government shuts down"
- **What it actually does:** Not legislative process descriptions, but OUTCOMES

**IMPACT:** 🔥 **CRITICAL UX ISSUE** - Normal people cannot use this site to understand bills. It's written for policy wonks.

---

### 8. **Alignment Score System Not Explained Anywhere**

The homepage mentions "54% alignment" but:
- **What does alignment mean?** Votes match stated positions? Match party? Match public interest?
- **Is higher better or worse?**
- **What's the methodology?**

The methodology box on rep pages helps a bit:
> "Voting scores calculated from actual congressional votes  
> Progressive direction determined by party voting patterns  
> Contradictions flagged when voting record differs from stated positions"

**But:**
- "Progressive direction determined by party voting patterns" — WHICH party? Does this mean Democrats = progressive baseline?
- If you're Republican and vote 100% with Republicans, are you 0% aligned or 100% aligned?

**IMPACT:** 📝 Users don't know how to interpret the core metric of the site.

---

### 9. **Color Coding is Inconsistent**

- **Red badges:** Sometimes mean "bad" (conflicts of interest), sometimes just "Republican"
- **Green checkmarks:** Sometimes mean "good" (no conflicts), sometimes "passed"
- **⚠️ Warning symbol:** Used for contradictions, but also for "heavily PAC-funded" — are these equally bad?

**No legend explaining what colors mean.**

**IMPACT:** 📝 Reduces comprehension, especially for colorblind users.

---

### 10. **"Voting Record Score: 2%" vs "Party Loyalty: 98.3%"**

These numbers appear to measure completely different things, but:
- They're displayed with similar visual weight
- No explanation of why they're different
- Users will be confused why Ben Cline has 2% voting score but 98% party loyalty

**What's the difference?**
- Voting Record Score = alignment with progressive positions (apparently)
- Party Loyalty = how often you vote with your party

**But this isn't explained on the page.**

**IMPACT:** 📝 Confusing dual metrics without clear differentiation.

---

### 11. **Mobile Responsiveness Unknown**

Can't test without a real browser, but:
- The bills page has HUGE amounts of text in small cards
- Rep pages have complex multi-column layouts
- Stock trade tables look wide

**Needs testing on actual mobile devices.**

**IMPACT:** 📝 Unknown — needs verification.

---

### 12. **Navigation is OK but Could Be Clearer**

- Homepage has clear CTAs
- Top nav exists (Dashboard, Home, Executive, Legislative, Judicial, Bills, Scandals)
- **BUT:** "Dashboard" and "Home" — what's the difference? (Probably the same page)
- **AND:** "Legislative" in the nav but the actual page is `/congress` — inconsistent naming

**IMPACT:** 📝 Minor, but polish matters.

---

## 🟢 SUGGESTIONS - Improvement Ideas

### 13. **Plain English Bill Summaries**

**Current:** Legislative jargon titles only

**Suggested addition:**
```
HR7148 - Consolidated Appropriations Act, 2026
📋 Official title: "A bill making further consolidated appropriations for the fiscal year ending September 30, 2026, and for other purposes."

💬 What it actually does:
Funds federal government operations for the rest of 2026, including:
- Defense: $X billion
- Homeland Security: $Y billion  
- Social programs: $Z billion

Why it matters: Prevents government shutdown. Must pass by [DATE].
```

**Alternatively:** Use AI to generate plain English summaries from bill text (you already have Congress.gov API access).

---

### 14. **Better Alignment Score Explanation**

Add a prominent "What is alignment?" tooltip or info section:

**Suggested text:**
> **Alignment Score:** Measures how often a representative's votes match their publicly stated campaign positions.
> 
> - **100% = Perfect alignment** — votes always match what they said they'd do
> - **0% = No alignment** — votes contradict their stated positions
> - **Methodology:** We compare actual congressional votes to positions from OnTheIssues.org and campaign materials
> 
> **Note:** A low score doesn't mean they're "bad" — it means there's a gap between what they say and what they do. You decide if that matters.

---

### 15. **Visual Clarity Improvements**

**Add:**
- **Legend** for colors and icons (what do badges mean?)
- **Consistent hierarchy** — make sure primary metrics (alignment) stand out more than secondary ones (party loyalty)
- **Better contrast** for score percentages (hard to scan currently)
- **Tooltips** on hover for jargon terms ("DW-NOMINATE", "PAC", "FEC", etc.)

---

### 16. **Fix Contradiction Detection Logic**

The "Says vs Does" contradictions are valuable BUT:

**Current problem:**
- Flags Republicans as contradictory when they vote conservatively (which aligns with their stated positions)
- Flags Democrats as contradictory when they vote liberally (which aligns with their stated positions)

**Suggested fix:**
- If stated position is "Opposes Obamacare" and they vote against Obamacare expansion → **ALIGNED**
- If stated position is "Supports military" and they vote for defense spending → **ALIGNED**
- Only flag as contradiction when the **direction** of voting opposes the **direction** of stated position

**This requires fixing the directional logic in the scoring system.**

---

### 17. **Add Bill Impact Ratings**

For each bill, add:
- **Who supports it?** (% Dem vs Rep votes)
- **Estimated cost:** $X billion
- **Expected impact:** "Affects X million Americans"
- **Controversy level:** Low/Medium/High (based on vote splits)

Makes bills more scannable and understandable.

---

### 18. **Better Empty States**

**Current empty states are good** ("No stock trades found", etc.) but:

**For Congress page:**
- If the page is truly empty, add a message like: "Loading representatives..." or "Use filters to find your representative"

**For Scandals page:**
- Instead of completely empty, say: "We're building this section. Coming soon: deep dives into major corruption cases with verified sources."

---

### 19. **Add "Why This Matters" Context**

For voting records, add real-world impact:

**Example:**
> **HR7148 - Consolidated Appropriations Act**
> 
> Ben Cline voted: **YEA**
> 
> **What this means:** Approved $X billion in government spending, including funding for [specific programs that affect constituents]
> 
> **Impact on Virginia District 6:** $Y million for [local infrastructure/programs]

Connects abstract votes to concrete consequences.

---

### 20. **Improve Stock Trading Presentation**

**Current issues:**
- Hard to scan
- No context (is +24% good? Is it suspicious timing?)

**Suggested improvements:**
- **Flag suspicious timing:** "Traded 3 days before major vote on tech regulation"
- **Compare to colleagues:** "Beats 87% of Congress"
- **Explain the Buffett comparison better:** "Warren Buffett averages 19.8% annually — this representative is outperforming one of history's greatest investors. How?"

---

## 📊 SUMMARY - Priority Fixes

### 🔥 Must Fix Immediately (Site Unusable Without):
1. **Alignment score calculation is broken** — contradictory numbers everywhere
2. **Stock trade totals don't add up** — math errors in critical financial data
3. **Bill language is incomprehensible** — needs plain English summaries

### ⚡ High Priority (Major UX Issues):
4. **Alignment methodology not explained** — users don't know what scores mean
5. **Contradiction detection logic is backwards** — flagging correct behavior as contradictions
6. **No color/icon legend** — confusing visual language

### 📋 Medium Priority (Polish & Completeness):
7. **Congress and Scandals pages appear empty** (may be JS rendering issue)
8. **Bill detail pages don't exist** (404s)
9. **Navigation inconsistencies** (Dashboard vs Home, Legislative vs Congress)
10. **Voting score vs Party loyalty confusion** — need clear differentiation

### ✨ Nice to Have (Enhancements):
11. Plain English bill summaries with impact explanations
12. "Why this matters" context for votes
13. Better stock trading context and suspicious timing flags
14. Bill impact ratings (cost, affected population, controversy)
15. Improved empty states and tooltips

---

## 🎯 ROOT CAUSE ANALYSIS

### The Alignment Score Problem

After reviewing multiple reps, I believe the issue is:

**The scoring system is using "Progressive" as the baseline direction**, which means:
- **100% Progressive** = votes in progressive direction 100% of the time
- **0% Conservative** on Healthcare = votes in progressive direction 100% of the time (no conservative votes)

**But this is displayed as "Voting Record Score: 2%"** which implies **low alignment**.

**The confusion:**
- For a **Republican**: 0% Conservative = 100% Progressive = **votes AGAINST their stated conservative positions** = **CONTRADICTION**
- But currently flagged as just "2% voting record score" which is ambiguous

**The fix:**
- Either: Show **both** progressive % AND conservative % clearly
- Or: Show alignment % (how often votes match stated positions) separately from ideological direction %
- Or: Make the reference direction **match the rep's party** (Republicans scored on conservative %, Dems on progressive %)

**Current implementation makes the site nearly unusable for its core purpose.**

---

## 📸 Tested Pages

✅ Homepage - Works, clear messaging  
⚠️ /congress - Empty/minimal (likely JS rendering issue)  
✅ /executive - Placeholder content, but clear  
✅ /judicial - Good content, shows justice breakdown  
✅ /bills - Tons of bills, but language is unusable  
⚠️ /scandals - Empty/minimal  
✅ /rep/M001245 (Menefee, D) - Limited data but structure OK  
🔴 /rep/C001118 (Cline, R) - **Contradictory alignment scores**  
🔴 /rep/M001244 (Moody, R) - **Contradictory alignment scores** + **wrong stock trade totals**  
🔴 /rep/C001059 (Costa, D) - **Contradictory alignment scores** + **confusing "Says vs Does" logic**  
🔴 /rep/J000312 (Justice, R) - **Contradictory alignment scores**  
❌ /bill/hr7148 - 404 (doesn't exist)

---

**End of Report**

**Next Steps:**
1. Fix alignment score calculation immediately
2. Add plain English bill summaries
3. Explain the scoring methodology prominently
4. Fix contradiction detection logic
5. Add visual legend and improve color consistency

This site has HUGE potential but the data contradictions will kill credibility fast. Priority one is getting the numbers right.
