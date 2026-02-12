# Scandal & Controversy Timeline - UX Design Specification
**Task #43** | Version 1.0 | February 2026

---

## 🎯 Overview

Design a scandal and controversy tracking timeline that displays verified incidents with rigorous source citations. This feature reinforces accountability through transparent, non-partisan reporting of ethics violations, investigations, indictments, and convictions.

### Core Principles
- **Source-First Design**: Every entry MUST display verifiable sources prominently
- **Non-Partisan**: Equal treatment across all parties
- **Severity Clarity**: Clear visual hierarchy based on incident severity
- **Chronological Context**: Timeline view shows patterns over time
- **Mobile-First**: Optimized for all screen sizes

---

## 🎨 Design Language Alignment

### Color Palette (from existing design-spec.md)
- **Background**: `bg-white`, `bg-slate-50` (alternating sections)
- **Cards**: `bg-white` with `border-slate-200`
- **Text**: `text-slate-900` (primary), `text-slate-600` (secondary), `text-slate-400` (tertiary)
- **Party colors** (muted accents only): Blue (D), Red (R), Purple (I)

### Typography
- **Headings**: Inter, `font-black`, `tracking-tight`
- **Body**: Inter, `font-medium`, `leading-relaxed`
- **Dates/Metadata**: `text-sm`, `text-slate-500`, `font-mono` for dates

---

## 📊 Severity Categorization & Color Coding

### Severity Levels (6 tiers)

#### 1. **Conviction** (Highest Severity)
- **Color**: `bg-red-600` / `text-red-700` / `border-red-300`
- **Badge**: 🔴 Red circle badge
- **Examples**: Felony conviction, misdemeanor conviction, criminal sentence
- **Background**: `bg-red-50` for card highlight

#### 2. **Indictment**
- **Color**: `bg-orange-600` / `text-orange-700` / `border-orange-300`
- **Badge**: 🟠 Orange circle badge
- **Examples**: Criminal indictment, formal charges filed
- **Background**: `bg-orange-50` for card highlight

#### 3. **Criminal Investigation**
- **Color**: `bg-amber-600` / `text-amber-700` / `border-amber-300`
- **Badge**: 🟡 Amber circle badge
- **Examples**: DOJ investigation, FBI probe, ongoing criminal inquiry
- **Background**: `bg-amber-50` for card highlight

#### 4. **Ethics Violation**
- **Color**: `bg-yellow-600` / `text-yellow-700` / `border-yellow-300`
- **Badge**: ⚠️ Yellow triangle badge
- **Examples**: House/Senate ethics committee violations, formal reprimands
- **Background**: `bg-yellow-50` for card highlight

#### 5. **Ethics Investigation**
- **Color**: `bg-blue-600` / `text-blue-700` / `border-blue-300`
- **Badge**: 🔵 Blue circle badge
- **Examples**: Active ethics committee review, OCE referral
- **Background**: `bg-blue-50` for card highlight

#### 6. **Credible Allegation**
- **Color**: `bg-slate-600` / `text-slate-700` / `border-slate-300`
- **Badge**: ⚪ Gray circle badge
- **Examples**: Substantiated media reports, whistleblower complaints (requires 2+ independent sources)
- **Background**: `bg-slate-50` for card highlight

### Visual Severity Indicator
```
[●] Conviction           Red     (Highest severity)
[●] Indictment           Orange
[●] Criminal Probe       Amber
[⚠] Ethics Violation     Yellow
[●] Ethics Probe         Blue
[○] Allegation           Gray    (Lowest severity - requires multiple sources)
```

---

## 🗓️ Timeline Layout & Card Design

### 1. Standalone Timeline Page (`/scandals` or `/accountability`)

#### Page Header
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back to Congress]                                        │
│                                                              │
│ Scandals & Controversies                                    │
│ Verified incidents with sources                             │
│                                                              │
│ [Filter Panel - See Section 4]                              │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Title**: `text-5xl md:text-6xl font-black tracking-tight text-slate-900`
- **Subtitle**: `text-lg text-slate-600 leading-relaxed`
- **Back Link**: Consistent with rep detail page breadcrumb

#### Timeline View Structure

**Desktop (>768px):**
```
Year Divider: 2024
├── [Timeline Line - Vertical]
│
├─── Jan ── [Card] ─ Conviction ● Rep. Name (R-TX)
│            Title: Wire Fraud Conviction
│            Sources: [NYT] [WaPo] [Court Docs]
│
├─── Mar ── [Card] ─ Investigation ● Sen. Name (D-CA)
│            Title: DOJ Insider Trading Probe
│            Sources: [WSJ] [Politico]
│
Year Divider: 2023
├── [Timeline Line]
│
└─── Dec ── [Card] ─ Ethics Violation ⚠️ Rep. Name (I-ME)
             Title: Campaign Finance Violation
             Sources: [House Ethics] [AP]
```

**Mobile (<768px):**
- Stack vertically without timeline line
- Year dividers remain
- Cards full-width with compact layout

---

### 2. Individual Scandal Card Design

#### Full Card Structure (Desktop)
```
┌────────────────────────────────────────────────────────────┐
│ [●] CONVICTION                          [R] John Doe        │
│     Jan 15, 2024                           Rep, TX-12       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ Wire Fraud and Tax Evasion Conviction                       │
│                                                             │
│ Federal jury convicted Representative Doe on 8 counts of   │
│ wire fraud and 3 counts of tax evasion related to campaign │
│ finance violations. Sentenced to 18 months federal prison.  │
│                                                             │
├─ SOURCES ──────────────────────────────────────────────────┤
│                                                             │
│ 📰 New York Times                    [View Article →]      │
│    "Rep. Doe Convicted on Fraud Charges"                   │
│    Published: Jan 15, 2024                                 │
│                                                             │
│ 📰 Washington Post                   [View Article →]      │
│    "Texas Congressman Found Guilty"                        │
│    Published: Jan 15, 2024                                 │
│                                                             │
│ ⚖️ Court Document                    [View PDF →]         │
│    U.S. District Court, Southern District of Texas         │
│    Case No. 4:23-cr-00452                                  │
│                                                             │
│ [+ Show 2 more sources]                                    │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Component Breakdown

**Card Container:**
```tsx
className="bg-white border-2 border-slate-200 rounded-xl p-6 
           shadow-sm hover:shadow-lg transition-all duration-300
           hover:border-slate-300"
```

**Header Section:**
- **Left side**: Severity badge + label + date
- **Right side**: Member name + party badge + chamber/district
- **Party badge**: Small pill consistent with congress page (`px-2 py-0.5 rounded-full text-xs font-semibold`)

**Title:**
```tsx
className="text-2xl font-bold text-slate-900 mb-3 leading-tight"
```

**Description:**
```tsx
className="text-slate-700 leading-relaxed text-base mb-6"
```

**Sources Section:**
- **Divider**: `border-t border-slate-200 pt-4 mt-4`
- **"SOURCES" label**: `text-xs font-black uppercase tracking-wider text-slate-500 mb-3`
- **Each source**: Mini-card with icon, title, publication date, link

**Source Item Structure:**
```tsx
<div className="bg-slate-50 rounded-lg p-3 flex items-start gap-3 mb-2">
  {/* Icon */}
  <span className="text-2xl flex-shrink-0">📰</span>
  
  {/* Content */}
  <div className="flex-1 min-w-0">
    <div className="font-semibold text-slate-900 text-sm">Source Name</div>
    <div className="text-slate-600 text-sm leading-snug">"Article Title"</div>
    <div className="text-slate-400 text-xs mt-1">Published: Date</div>
  </div>
  
  {/* Action */}
  <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-semibold 
                         flex-shrink-0">
    View →
  </a>
</div>
```

**Source Icons:**
- 📰 News article
- ⚖️ Court document
- 📄 Official report (ethics committee, inspector general)
- 🏛️ Congressional record
- 📊 Government filing

---

### 3. Mobile Card Design (<768px)

#### Compact Layout
```
┌───────────────────────────────┐
│ [●] CONVICTION                │
│ Jan 15, 2024                  │
│                               │
│ John Doe (R-TX)               │
│ Rep, TX-12                    │
├───────────────────────────────┤
│ Wire Fraud Conviction         │
│                               │
│ [Truncated description...]    │
│ [Read More ↓]                 │
│                               │
│ SOURCES (3)                   │
│ • NYT [→]                     │
│ • WaPo [→]                    │
│ • Court Docs [→]              │
└───────────────────────────────┘
```

**Mobile-Specific Changes:**
- Stack header vertically (badge/date first, then name/party)
- Truncate description to 2 lines with "Read More" toggle
- Collapse sources to simple bulleted list with expand option
- Maintain touch-friendly tap targets (min 44x44px)

---

## 🔍 Filtering System

### Filter Panel Design (Above Timeline)

```
┌────────────────────────────────────────────────────────────┐
│ 📍 FILTERS                          [Clear All Filters ✕] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ [Search: name or keyword...]                      [🔍]     │
│                                                             │
│ Party:  [All] [Democrat] [Republican] [Independent]        │
│                                                             │
│ Severity:                                                   │
│ [☑ Conviction] [☑ Indictment] [☑ Investigation]            │
│ [☑ Ethics Violation] [☑ Ethics Probe] [☑ Allegation]       │
│                                                             │
│ Category: [All Categories ▼]                               │
│   Options: Financial Crimes, Ethics Violations,            │
│            Sexual Misconduct, Abuse of Power,              │
│            Campaign Finance, Insider Trading, Other        │
│                                                             │
│ Date Range: [Start: ____] to [End: ____]                   │
│                                                             │
│ Chamber: [All] [House] [Senate]                            │
│                                                             │
└────────────────────────────────────────────────────────────┘

Showing 47 incidents
```

### Filter Components Spec

**Panel Container:**
```tsx
className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8"
```

**Party Filter Buttons** (same as congress page):
```tsx
className="px-4 py-2 rounded-lg font-medium text-sm transition min-h-[44px]
           ${active ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}"
```

**Severity Checkboxes:**
- Custom styled checkboxes with severity color coding
- Show count in parentheses: `[☑ Conviction (8)]`
- Each checkbox maintains severity color: border and text match tier

**Category Dropdown:**
```tsx
<select className="w-full px-4 py-3 border border-slate-300 rounded-lg 
                   bg-white text-slate-700 font-medium leading-relaxed
                   focus:ring-2 focus:ring-blue-500 min-h-[44px]">
```

**Date Range:**
- Two date inputs side-by-side
- Format: MM/DD/YYYY or date picker
- Quick filters: "Last 30 days", "This year", "All time"

**Active Filter Pills** (appears when filters applied):
```
Applied: [Party: Democrat ✕] [Severity: Conviction ✕] [2023-2024 ✕]
```
- Small pills below filter panel
- Click X to remove individual filter
- "Clear All Filters" removes everything

---

## 🔗 Integration with Individual Rep Pages

### Option A: Dedicated "Scandals" Tab/Section

Add a new section to rep detail page after "Financial Disclosures":

```tsx
// In src/app/rep/[id]/page.tsx

<ScandalsSection 
  bioguideId={member.bioguide_id}
  memberName={member.full_name}
/>
```

**Section Header:**
```
┌────────────────────────────────────────────────────────┐
│ ⚠️ Scandals & Controversies                           │
│                                                         │
│ Verified incidents with sources                        │
└────────────────────────────────────────────────────────┘
```

**Display Logic:**
- **If NO scandals**: Show clean record message
  ```
  ┌────────────────────────────────────────────┐
  │ ✓ No verified incidents on record         │
  │                                            │
  │ This member has no documented scandals,   │
  │ ethics violations, or investigations      │
  │ meeting our sourcing requirements.        │
  └────────────────────────────────────────────┘
  ```

- **If 1-3 scandals**: Show full cards inline (same design as timeline)

- **If 4+ scandals**: Show 3 most recent + "View All (N) Incidents →" link to full timeline filtered to this member

### Option B: Summary Card in Sidebar

Alternative: Add compact scandal summary in sidebar (after Alignment Score):

```
┌───────────────────────────────┐
│ ⚠️ ACCOUNTABILITY ALERTS      │
├───────────────────────────────┤
│                               │
│ [●] 1 Conviction              │
│ [⚠] 2 Ethics Violations       │
│ [●] 1 Active Investigation    │
│                               │
│ [View Full Timeline →]        │
│                               │
└───────────────────────────────┘
```

**Recommendation**: Use **Option A** (dedicated section) for transparency. Option B can be added later as quick reference.

---

## 📱 Mobile Layout

### Mobile Timeline (<768px)

**Sticky Filter Button:**
```
[Filter & Sort ⚙️]  (fixed at bottom of screen)
```
- Tapping opens bottom sheet with filter options
- Floating action button style: `fixed bottom-6 right-6`

**Year Dividers:**
```tsx
className="sticky top-0 bg-slate-100 py-2 px-4 font-black 
           text-slate-900 text-lg z-10"
```
- Sticky to top as user scrolls
- Clear visual separation

**Card Stack:**
- Full-width cards with 16px horizontal padding
- 16px gap between cards
- Swipe right to reveal quick actions (share, bookmark)

**Source Expansion:**
- Sources collapsed by default: "Sources (3) ▼"
- Tap to expand accordion-style
- Each source link opens in new tab/browser

**Load More:**
```
┌────────────────────────┐
│ Load More Incidents ↓  │
└────────────────────────┘
```
- Pagination: 20 items per page
- Infinite scroll option for mobile

---

## 📋 Data Structure & Source Requirements

### Scandal Entry Schema
```typescript
interface ScandalEntry {
  id: string;
  bioguide_id: string;
  member_name: string;
  party: "D" | "R" | "I";
  chamber: "house" | "senate";
  state: string;
  district?: string;
  
  // Incident details
  date: string; // ISO 8601
  severity: "conviction" | "indictment" | "criminal_investigation" 
          | "ethics_violation" | "ethics_investigation" | "allegation";
  category: string[]; // ["insider_trading", "campaign_finance"]
  title: string;
  description: string;
  
  // Sources (REQUIRED - minimum 1, recommend 2+)
  sources: Source[];
  
  // Metadata
  status: "ongoing" | "resolved" | "dismissed";
  outcome?: string; // For resolved cases
  created_at: string;
  updated_at: string;
}

interface Source {
  type: "news" | "court_doc" | "official_report" | "congressional_record" | "filing";
  title: string;
  publication: string; // e.g., "New York Times"
  url: string;
  published_date: string;
  archived_url?: string; // Internet Archive backup
  credibility_rating?: "high" | "medium"; // Based on source reliability
}
```

### Source Requirements (Verification Rules)

**Tier 1: Conviction, Indictment**
- MUST have: 1+ court document OR 2+ major news sources
- Major news: NYT, WaPo, WSJ, AP, Reuters, Bloomberg, Politico

**Tier 2: Investigations**
- MUST have: 2+ independent news sources OR 1 official government source

**Tier 3: Ethics Violations**
- MUST have: Official ethics committee report OR 2+ news sources

**Tier 4: Allegations**
- MUST have: 3+ independent sources from different organizations
- At least one must be major news outlet
- Include disclaimer: "Allegation based on media reports"

---

## 🎨 Component Library (New Components)

### 1. `ScandalTimeline.tsx`
**Purpose**: Main timeline view with year dividers and filters
**Props:**
```typescript
interface ScandalTimelineProps {
  scandals: ScandalEntry[];
  initialFilters?: FilterState;
  showFilters?: boolean;
}
```

### 2. `ScandalCard.tsx`
**Purpose**: Individual scandal card with sources
**Props:**
```typescript
interface ScandalCardProps {
  scandal: ScandalEntry;
  compact?: boolean; // Mobile view
  showMember?: boolean; // Hide on individual rep page
}
```

### 3. `SeverityBadge.tsx`
**Purpose**: Reusable severity indicator
**Props:**
```typescript
interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}
```

### 4. `SourceList.tsx`
**Purpose**: Expandable source citations
**Props:**
```typescript
interface SourceListProps {
  sources: Source[];
  expanded?: boolean;
  maxVisible?: number;
}
```

### 5. `ScandalFilters.tsx`
**Purpose**: Filter panel with all controls
**Props:**
```typescript
interface ScandalFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  stats: FilterStats; // Counts for each option
}
```

### 6. `ScandalsSection.tsx`
**Purpose**: Rep page integration component
**Props:**
```typescript
interface ScandalsSectionProps {
  bioguideId: string;
  memberName: string;
  maxVisible?: number; // Default: 3
}
```

---

## ♿ Accessibility Considerations

### ARIA Labels
```tsx
<section aria-label="Scandals and controversies timeline">
  <div role="list">
    <article role="listitem" aria-label="Conviction: Wire Fraud, Jan 15 2024">
      ...
    </article>
  </div>
</section>
```

### Keyboard Navigation
- **Tab order**: Filters → Cards → Sources
- **Enter/Space**: Expand collapsed sources
- **Escape**: Close expanded source details
- All interactive elements have `:focus-visible` rings

### Screen Reader Announcements
- Filter changes announce result count: "Showing 12 incidents"
- Severity badges read as: "Severity: Conviction, highest level"
- Source counts: "3 verified sources available"

### Color Contrast
- All severity colors meet WCAG AA standards (4.5:1 ratio)
- Don't rely solely on color: Use icons + text labels
- Test: Red-green colorblind users can distinguish severity levels

### Focus Management
- Trap focus in filter panel when open (mobile)
- Return focus to filter button when closed
- Skip links: "Skip to timeline content"

---

## 🧪 Edge Cases & Special States

### Empty States

**No Results:**
```
┌─────────────────────────────────────┐
│         🔍                          │
│                                     │
│   No incidents match your filters  │
│                                     │
│   Try adjusting your search or     │
│   clearing some filters            │
│                                     │
│   [Clear All Filters]              │
└─────────────────────────────────────┘
```

**Member with No Scandals:**
```
┌─────────────────────────────────────┐
│         ✓                           │
│                                     │
│   Clean Record                      │
│                                     │
│   No verified incidents on record  │
│   for this member.                  │
│                                     │
└─────────────────────────────────────┘
```

### Loading States

**Initial Load:**
- Skeleton cards (6 placeholders)
- Shimmer animation: `animate-pulse`

**Filter Update:**
- Dim existing cards (50% opacity)
- Show spinner overlay
- Smooth fade-in when results load

### Error States

**Data Fetch Error:**
```
┌─────────────────────────────────────┐
│         ⚠️                          │
│                                     │
│   Unable to load scandals          │
│                                     │
│   Please try again later           │
│                                     │
│   [Retry]                          │
└─────────────────────────────────────┘
```

**Broken Source Link:**
- Show warning icon next to source
- Provide archived URL if available
- Maintain data integrity disclaimer

### Data Updates

**Ongoing Investigations:**
- Badge: "ONGOING" in blue
- Last updated timestamp
- Link to latest source update

**Resolved Cases:**
- Badge: "RESOLVED" in green
- Outcome summary in description
- Final source (verdict, settlement, dismissal)

---

## 📐 Spacing & Layout Grid

### Desktop (>1024px)
```
Container: max-w-7xl mx-auto px-8
├─ Filter Panel: w-full mb-8
└─ Timeline Grid: single column (centered)
   ├─ Card: max-w-4xl mx-auto
   └─ Gap: gap-6
```

### Tablet (768px - 1024px)
```
Container: px-6
├─ Filter Panel: w-full mb-6
└─ Timeline: single column
   ├─ Card: w-full
   └─ Gap: gap-4
```

### Mobile (<768px)
```
Container: px-4
├─ Filter Sheet: bottom drawer
└─ Timeline: w-full
   ├─ Card: w-full
   └─ Gap: gap-4
```

---

## 🚀 Implementation Phases

### Phase 1: Core Timeline (MVP)
- [ ] `ScandalCard` component
- [ ] `SeverityBadge` component
- [ ] `SourceList` component
- [ ] Basic timeline view (`/scandals` page)
- [ ] Hardcoded test data (5-10 entries)

### Phase 2: Filtering & Search
- [ ] `ScandalFilters` component
- [ ] URL query params for filter state
- [ ] Search functionality
- [ ] Filter persistence (localStorage)

### Phase 3: Rep Page Integration
- [ ] `ScandalsSection` component
- [ ] Rep page layout integration
- [ ] "View All" linking to filtered timeline

### Phase 4: Data & Polish
- [ ] Real data integration (JSON/API)
- [ ] Mobile optimizations
- [ ] Loading states
- [ ] Error handling
- [ ] Analytics tracking

---

## 📊 Success Metrics

### User Engagement
- **Primary**: % of users clicking scandal sources (target: >60%)
- Time spent on scandal pages
- Filter usage patterns

### Transparency
- **Primary**: Average sources per scandal entry (target: ≥3)
- Source diversity (# of unique publications)
- % of entries with official documents

### Accessibility
- Lighthouse accessibility score ≥95
- Keyboard navigation completion rate
- Screen reader compatibility verified

---

## 🎨 Visual References

### Color Palette Quick Reference
```css
/* Severity Colors */
.conviction       { bg: red-600,    text: red-700,    border: red-300    }
.indictment       { bg: orange-600, text: orange-700, border: orange-300 }
.investigation    { bg: amber-600,  text: amber-700,  border: amber-300  }
.ethics-violation { bg: yellow-600, text: yellow-700, border: yellow-300 }
.ethics-probe     { bg: blue-600,   text: blue-700,   border: blue-300   }
.allegation       { bg: slate-600,  text: slate-700,  border: slate-300  }

/* Party Colors (muted) */
.party-d { bg: blue-100,   text: blue-700   }
.party-r { bg: red-100,    text: red-700    }
.party-i { bg: purple-100, text: purple-700 }
```

### Typography Scale
```css
.timeline-title    { font-size: 3rem;    font-weight: 900; } /* 48px */
.card-title        { font-size: 1.5rem;  font-weight: 700; } /* 24px */
.card-description  { font-size: 1rem;    font-weight: 400; } /* 16px */
.source-label      { font-size: 0.875rem; font-weight: 600; } /* 14px */
.metadata          { font-size: 0.75rem; font-weight: 400; } /* 12px */
```

---

## 📝 Content Guidelines

### Scandal Titles
- **Format**: `[Crime/Violation Type] + [Key Detail]`
- **Examples**:
  - ✅ "Wire Fraud and Tax Evasion Conviction"
  - ✅ "Insider Trading Investigation (NVDA, TSLA)"
  - ❌ "Bad Stuff Happened" (too vague)
  - ❌ "Rep. Doe is a Crook" (editorialized)

### Descriptions
- **Length**: 2-4 sentences, 50-150 words
- **Tone**: Neutral, factual, past tense
- **Include**: Who, what, when, outcome (if resolved)
- **Avoid**: Commentary, speculation, partisan language

### Source Titles
- Use exact article headline (truncate if >80 chars)
- Include publication name
- Format dates consistently: "Jan 15, 2024"

---

## 🔒 Data Integrity & Moderation

### Quality Control Checklist
Before adding any scandal entry:
- [ ] Minimum source requirements met for severity tier
- [ ] All source URLs verified and accessible
- [ ] Archive.org backup created for all sources
- [ ] Description is neutral and factual
- [ ] Dates are accurate (cross-referenced)
- [ ] Member information correct (bioguide ID, party, etc.)
- [ ] Severity classification appropriate

### Update Policy
- **Ongoing cases**: Review monthly, update status
- **Resolved cases**: Add final outcome within 48 hours
- **Corrections**: If source retracts, update or remove entry
- **Appeals**: Contact form for members to dispute entries (requires counter-sources)

---

## 🎯 Next Steps

1. **Review & Approve**: Stakeholder sign-off on design spec
2. **Create Components**: Start with `SeverityBadge` and `ScandalCard`
3. **Sample Data**: Build JSON fixture with 10-15 real scandals
4. **Build Timeline Page**: Implement `/scandals` route
5. **Integration**: Add to rep detail pages
6. **Testing**: Accessibility audit, mobile testing
7. **Launch**: Soft launch with data disclaimer, gather feedback

---

## 📚 Appendix: Example Data

### Sample Scandal Entry (JSON)
```json
{
  "id": "scandal-001",
  "bioguide_id": "C000880",
  "member_name": "Mike Crapo",
  "party": "R",
  "chamber": "senate",
  "state": "ID",
  "date": "2012-12-23",
  "severity": "conviction",
  "category": ["dui", "criminal"],
  "title": "DUI Conviction",
  "description": "Senator Crapo pleaded guilty to driving under the influence after being arrested in Alexandria, Virginia with a blood alcohol level of 0.11%. He was sentenced to 180 days in jail (suspended) and fined $250.",
  "sources": [
    {
      "type": "news",
      "title": "Idaho Sen. Crapo Pleads Guilty to DUI",
      "publication": "Washington Post",
      "url": "https://www.washingtonpost.com/...",
      "published_date": "2013-01-04",
      "credibility_rating": "high"
    },
    {
      "type": "court_doc",
      "title": "Case No. GC12015942-00",
      "publication": "Alexandria General District Court",
      "url": "https://...",
      "published_date": "2013-01-04"
    }
  ],
  "status": "resolved",
  "outcome": "Guilty plea, fine, license suspension",
  "created_at": "2024-02-11T00:00:00Z",
  "updated_at": "2024-02-11T00:00:00Z"
}
```

---

**End of Specification**

*This design prioritizes transparency, non-partisanship, and rigorous sourcing. Every design decision reinforces public accountability.*
