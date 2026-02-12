# UX Design Spec: Presidential Policy Impact Tracker

**Task #42** | Created: 2026-02-11  
**Purpose:** Design a data-driven policy impact tracker that rates presidential policies by their NET IMPACT on Americans, not by promise-keeping.

---

## Core Philosophy

This is **NOT** a "promise tracker." A harmful policy that was "kept as promised" should show **RED**, not green.

### Key Principles
1. **Impact over rhetoric** — Score based on measurable outcomes
2. **Non-partisan framing** — Use economic data, polling, expert analysis
3. **Transparency** — Show the data sources behind each rating
4. **Consistency** — Match existing Congress page design patterns

---

## 1. Page Layout & Information Hierarchy

### Route Structure
```
/president                    → Overview dashboard
/president/policies           → All policies (filterable)
/president/policies/[slug]    → Individual policy detail page
```

### Overview Dashboard (`/president`)

```
┌─────────────────────────────────────────────────────────────┐
│  Presidential Policy Impact Tracker                        │
│  Track the real-world impact of presidential policies      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Overall      │  │ Policies     │  │ Americans    │     │
│  │ Impact Score │  │ Tracked      │  │ Affected     │     │
│  │              │  │              │  │              │     │
│  │   C-        │  │     47      │  │   327M      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Impact by Category                                    │ │
│  │                                                       │ │
│  │  Economy        █████████░░░ 62 (C+)                │ │
│  │  Healthcare     ████░░░░░░░░ 35 (F)                 │ │
│  │  Immigration    ██████░░░░░░ 48 (D)                 │ │
│  │  Environment    ███░░░░░░░░░ 28 (F)                 │ │
│  │  Education      ██████████░░ 71 (B-)                │ │
│  │  Foreign Policy ███████████░ 78 (B)                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Recent Policy Updates                [View All →]     │ │
│  │                                                       │ │
│  │  [Card] [Card] [Card] [Card]                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- **Header:** Same style as Congress page — large, bold heading (text-5xl md:text-6xl font-black)
- **Stat Cards:** Match existing pattern (bg-white rounded-xl border border-slate-200 p-6 shadow-sm)
- **Category Bars:** Horizontal progress bars with impact score + letter grade
- **Recent Updates:** Horizontal scroll on mobile, grid on desktop

---

## 2. Policy Impact Scores & Color Coding

### The Critical Difference: Impact vs. Promise-Keeping

**Traditional Promise Tracker (WRONG):**
```
Promise: "Cut regulations"
Status: ✓ Kept
Color: GREEN ← This is misleading!
```

**Our Impact Tracker (CORRECT):**
```
Policy: Regulatory Rollback XYZ
Impact: -15 (Increased workplace injuries by 23%)
Color: RED ← Shows actual harm
```

### Impact Score Scale (0-100)

| Score Range | Grade | Color | Meaning |
|------------|-------|-------|---------|
| 90-100 | A | `bg-green-100 text-green-800 border-green-200` | Major positive impact |
| 80-89 | B | `bg-lime-100 text-lime-800 border-lime-200` | Significant positive impact |
| 70-79 | C+ | `bg-yellow-100 text-yellow-800 border-yellow-200` | Modest positive impact |
| 60-69 | C | `bg-amber-100 text-amber-700 border-amber-200` | Neutral/mixed |
| 50-59 | C- | `bg-orange-100 text-orange-700 border-orange-200` | Slight negative impact |
| 40-49 | D | `bg-red-100 text-red-700 border-red-200` | Moderate harm |
| 30-39 | F | `bg-red-200 text-red-900 border-red-300` | Significant harm |
| 0-29 | F- | `bg-red-300 text-red-950 border-red-400` | Severe harm |

### Visual Components

#### Policy Card (List View)
```tsx
<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
  {/* Category Tag */}
  <div className="flex items-center gap-2 mb-3">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
      Economy
    </span>
    <span className="text-xs text-slate-400">•</span>
    <span className="text-xs text-slate-500">Updated 3 days ago</span>
  </div>
  
  {/* Policy Title */}
  <h3 className="text-xl font-bold text-slate-900 mb-2">
    Tariff Policy 2025
  </h3>
  
  {/* Impact Score Badge */}
  <div className="flex items-center gap-3 mb-4">
    <div className="px-4 py-2 rounded-lg bg-red-100 text-red-800 border border-red-200 font-bold text-lg">
      42 (D)
    </div>
    <div className="text-sm text-slate-600">
      Negative impact on consumer prices
    </div>
  </div>
  
  {/* Key Metrics Preview */}
  <div className="grid grid-cols-2 gap-3 mb-4">
    <div className="text-sm">
      <div className="text-slate-500">Price Increase</div>
      <div className="font-semibold text-slate-900">+12.3%</div>
    </div>
    <div className="text-sm">
      <div className="text-slate-500">Jobs Lost</div>
      <div className="font-semibold text-slate-900">~47,000</div>
    </div>
  </div>
  
  {/* Promise vs Reality Indicator */}
  <div className="border-t border-slate-200 pt-4 mt-4">
    <div className="flex items-start gap-3 text-sm">
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
          <span className="text-amber-700 text-xs">!</span>
        </div>
      </div>
      <div>
        <div className="font-medium text-slate-700 mb-1">Promise vs Reality Gap</div>
        <div className="text-slate-600">
          <strong>Promised:</strong> "Lower prices for Americans"<br/>
          <strong>Reality:</strong> Consumer prices rose 12.3% due to retaliatory tariffs
        </div>
      </div>
    </div>
  </div>
  
  <Link href="/president/policies/tariff-2025" className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-4 inline-block">
    View full analysis →
  </Link>
</div>
```

#### Impact Badge Component
```tsx
interface ImpactBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showGrade?: boolean;
}

// Usage:
<ImpactBadge score={42} size="lg" showGrade={true} />
// Renders: "42 (D)" with appropriate color
```

---

## 3. Category Organization

### Primary Categories

```typescript
const POLICY_CATEGORIES = {
  ECONOMY: {
    slug: 'economy',
    name: 'Economy & Jobs',
    icon: '💼',
    description: 'GDP, employment, inflation, trade',
    subcategories: ['Jobs', 'Inflation', 'Trade', 'GDP Growth']
  },
  HEALTHCARE: {
    slug: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    description: 'Coverage, costs, outcomes',
    subcategories: ['Coverage', 'Drug Prices', 'Outcomes', 'Access']
  },
  IMMIGRATION: {
    slug: 'immigration',
    name: 'Immigration',
    icon: '🛂',
    description: 'Border policy, asylum, enforcement',
    subcategories: ['Border Security', 'Asylum', 'Legal Immigration', 'Enforcement']
  },
  ENVIRONMENT: {
    slug: 'environment',
    name: 'Environment & Energy',
    icon: '🌍',
    description: 'Climate, pollution, energy policy',
    subcategories: ['Climate', 'Air Quality', 'Energy', 'Conservation']
  },
  EDUCATION: {
    slug: 'education',
    name: 'Education',
    icon: '📚',
    description: 'Schools, student loans, outcomes',
    subcategories: ['K-12', 'Higher Ed', 'Student Loans', 'Outcomes']
  },
  FOREIGN_POLICY: {
    slug: 'foreign-policy',
    name: 'Foreign Policy',
    icon: '🌐',
    description: 'Diplomacy, defense, alliances',
    subcategories: ['Diplomacy', 'Defense', 'Alliances', 'Trade Relations']
  },
  CIVIL_RIGHTS: {
    slug: 'civil-rights',
    name: 'Civil Rights & Justice',
    icon: '⚖️',
    description: 'Voting rights, criminal justice, equality',
    subcategories: ['Voting Rights', 'Criminal Justice', 'Equality', 'Free Speech']
  },
  INFRASTRUCTURE: {
    slug: 'infrastructure',
    name: 'Infrastructure',
    icon: '🏗️',
    description: 'Transportation, utilities, broadband',
    subcategories: ['Transportation', 'Broadband', 'Utilities', 'Public Works']
  }
};
```

### Category Filter UI (Match Congress Page Pattern)

```tsx
<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
  <div className="space-y-4">
    {/* Search */}
    <input
      type="text"
      placeholder="Search policies..."
      className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    />
    
    {/* Category Filters */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <select className="px-4 py-3 border border-slate-300 rounded-lg">
        <option value="">All Categories</option>
        <option value="economy">💼 Economy & Jobs</option>
        <option value="healthcare">🏥 Healthcare</option>
        {/* ... */}
      </select>
      
      <select className="px-4 py-3 border border-slate-300 rounded-lg">
        <option value="">Impact Range</option>
        <option value="positive">Positive Impact (60+)</option>
        <option value="neutral">Neutral (40-59)</option>
        <option value="negative">Negative Impact (&lt;40)</option>
      </select>
      
      <select className="px-4 py-3 border border-slate-300 rounded-lg">
        <option value="">Date Range</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 3 months</option>
        <option value="1y">Last year</option>
        <option value="all">All time</option>
      </select>
      
      <select className="px-4 py-3 border border-slate-300 rounded-lg">
        <option value="">Sort By</option>
        <option value="impact">Impact Score</option>
        <option value="recent">Most Recent</option>
        <option value="affected">People Affected</option>
      </select>
    </div>
  </div>
</div>
```

---

## 4. Promise vs Reality Comparisons

### The Challenge
We need to show when a policy was "as promised" but still harmful, OR when it deviated from the promise in unexpected ways.

### Solution: Dual Metrics

Every policy tracks:
1. **Promise Alignment** (0-100): How closely the policy matched the campaign promise
2. **Impact Score** (0-100): The actual measurable outcomes for Americans

### Visual Pattern: Four Quadrants

```
         High Impact (Good for Americans)
                    │
                    │
  Low Alignment ────┼──── High Alignment
  (Broke Promise)   │     (Kept Promise)
                    │
         Low Impact (Bad for Americans)
```

**Examples:**

| Quadrant | Promise | Impact | Display |
|----------|---------|--------|---------|
| **Top-Right** | ✓ Kept | ✓ Good | 🟢 "Delivered as promised with positive results" |
| **Top-Left** | ✗ Broke | ✓ Good | 🟡 "Deviated from promise, but beneficial outcome" |
| **Bottom-Right** | ✓ Kept | ✗ Bad | 🔴 "Kept promise, but harmful to Americans" |
| **Bottom-Left** | ✗ Broke | ✗ Bad | 🔴 "Failed promise with negative impact" |

### UI Component: Promise vs Reality Card

```tsx
<div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
  <h4 className="font-bold text-slate-900 mb-4">Promise vs Reality</h4>
  
  {/* Promise Alignment */}
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-slate-700">Promise Alignment</span>
      <span className="text-sm font-bold text-slate-900">85%</span>
    </div>
    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full bg-blue-500" style={{width: '85%'}}></div>
    </div>
    <p className="text-xs text-slate-600 mt-1">
      Policy closely matched campaign promise
    </p>
  </div>
  
  {/* Impact Score */}
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-slate-700">Impact on Americans</span>
      <span className="text-sm font-bold text-red-700">38 (F)</span>
    </div>
    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full bg-red-500" style={{width: '38%'}}></div>
    </div>
    <p className="text-xs text-red-600 mt-1">
      Significant negative economic impact
    </p>
  </div>
  
  {/* Quadrant Assessment */}
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <span className="text-2xl">🔴</span>
      <div className="text-sm">
        <div className="font-bold text-red-900 mb-1">
          Kept Promise, Harmful Outcome
        </div>
        <div className="text-red-700">
          This policy was implemented as promised during the campaign, 
          but measurable outcomes show negative impact on Americans.
        </div>
      </div>
    </div>
  </div>
  
  {/* What Was Promised */}
  <div className="mt-4 space-y-3">
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
        What Was Promised
      </div>
      <div className="text-sm text-slate-700 bg-white rounded p-3 border border-slate-200">
        "I will impose tariffs to bring manufacturing jobs back to America 
        and make American products cheaper."
      </div>
    </div>
    
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
        What Actually Happened
      </div>
      <div className="text-sm text-slate-700 bg-white rounded p-3 border border-slate-200">
        • Consumer prices increased 12.3% on affected goods<br/>
        • 47,000 jobs lost due to retaliatory tariffs<br/>
        • Manufacturing output declined 3.2%<br/>
        • Trade deficit grew by $45B
      </div>
    </div>
  </div>
</div>
```

---

## 5. Individual Policy Detail Page

### Layout Structure

```
/president/policies/[slug]

┌─────────────────────────────────────────────────────────────┐
│  ← Back to Policies                                         │
│                                                             │
│  💼 Economy & Jobs                          Updated 2d ago  │
│                                                             │
│  Tariff Policy 2025                                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Impact Score │  │ Americans    │  │ Promise      │     │
│  │              │  │ Affected     │  │ Alignment    │     │
│  │   42 (D)    │  │   145M      │  │    85%      │     │
│  │   Negative   │  │              │  │   Mostly Kept│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  [Promise vs Reality Card]                                 │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Measurable Outcomes                                   │ │
│  │                                                       │ │
│  │  📊 Economic Impact                                   │ │
│  │  • Consumer prices: +12.3% on affected goods         │ │
│  │  • Job losses: ~47,000 (manufacturing sector)        │ │
│  │  • Trade deficit: +$45B annually                     │ │
│  │  • GDP impact: -0.2%                                 │ │
│  │                                                       │ │
│  │  📈 Data Source: Bureau of Labor Statistics, Q4 2025 │ │
│  │  🔗 View full BLS report                             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Public Polling                                        │ │
│  │                                                       │ │
│  │  Approve: 32%  ████████░░░░░░░░░░░░░░░░░░░           │ │
│  │  Disapprove: 61%  ███████████████████░░░░░░░░        │ │
│  │  No Opinion: 7%  ██░░░░░░░░░░░░░░░░░░░░░░░░          │ │
│  │                                                       │ │
│  │  📊 Source: Aggregated polling (12 surveys)          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Expert Analysis                                       │ │
│  │                                                       │ │
│  │  [Card] Congressional Budget Office                  │ │
│  │  [Card] Federal Reserve Analysis                     │ │
│  │  [Card] Brookings Institution                        │ │
│  │  [Card] American Enterprise Institute                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Policy Timeline                                       │ │
│  │                                                       │ │
│  │  Jan 20, 2025 - Executive Order signed               │ │
│  │  Feb 15, 2025 - Tariffs take effect                  │ │
│  │  Mar 10, 2025 - Retaliatory tariffs imposed          │ │
│  │  Apr 5, 2025 - First job losses reported             │ │
│  │  May 1, 2025 - Consumer price increases measured     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Related Policies                                      │ │
│  │                                                       │ │
│  │  [Card] [Card] [Card]                                │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Expert Analysis Card Component

```tsx
<div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
  <div className="flex items-start gap-4">
    {/* Source Logo/Icon */}
    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
      <span className="text-xl">🏛️</span>
    </div>
    
    <div className="flex-1 min-w-0">
      {/* Source Name */}
      <div className="font-bold text-slate-900 mb-1">
        Congressional Budget Office
      </div>
      
      {/* Political Lean Indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
          Non-partisan
        </span>
        <span className="text-xs text-slate-500">Government Agency</span>
      </div>
      
      {/* Summary */}
      <p className="text-sm text-slate-700 mb-3">
        "The proposed tariffs are projected to reduce GDP by 0.2% and 
        increase consumer costs by an average of $540 per household annually."
      </p>
      
      {/* Methodology Badge */}
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <span className="bg-slate-100 px-2 py-1 rounded">
          📊 Economic modeling
        </span>
        <span className="bg-slate-100 px-2 py-1 rounded">
          ✓ Peer-reviewed
        </span>
      </div>
      
      {/* Link */}
      <a 
        href="https://cbo.gov/..." 
        target="_blank"
        className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 inline-block"
      >
        Read full analysis →
      </a>
    </div>
  </div>
</div>
```

### Political Lean/Bias Indicators

To maintain non-partisan credibility, show source bias transparently:

```typescript
const SOURCE_BIAS = {
  'Congressional Budget Office': { lean: 'Non-partisan', type: 'Government' },
  'Federal Reserve': { lean: 'Non-partisan', type: 'Government' },
  'Brookings Institution': { lean: 'Center-Left', type: 'Think Tank' },
  'American Enterprise Institute': { lean: 'Center-Right', type: 'Think Tank' },
  'Heritage Foundation': { lean: 'Conservative', type: 'Think Tank' },
  'Center for American Progress': { lean: 'Progressive', type: 'Think Tank' },
  'Pew Research': { lean: 'Non-partisan', type: 'Research' },
  'RAND Corporation': { lean: 'Non-partisan', type: 'Research' }
};
```

Display multiple perspectives from different leans to show balance.

---

## 6. Mobile Layout Considerations

### Responsive Breakpoints (Match Existing)

```css
/* Tailwind defaults */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

### Mobile-First Adjustments

#### Header
```tsx
<h1 className="text-4xl sm:text-5xl md:text-6xl font-black">
  Presidential Policies
</h1>
```

#### Stat Cards (Stack on Mobile)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

#### Filter UI (Vertical Stack on Mobile)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  <select>...</select>
  <select>...</select>
  <select>...</select>
  <select>...</select>
</div>
```

#### Policy Cards (Full Width on Mobile)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  <PolicyCard />
  <PolicyCard />
  <PolicyCard />
</div>
```

#### Touch Targets (Minimum 44px)
```tsx
className="min-h-[44px] px-4 py-3"  // All interactive elements
```

#### Horizontal Scroll for Data Tables
```tsx
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>
```

#### Hide/Show Elements by Screen Size
```tsx
{/* Desktop: full text */}
<div className="hidden md:block">
  Full detailed description...
</div>

{/* Mobile: truncated */}
<div className="md:hidden">
  Short summary...
</div>
```

#### Impact Badge Sizes
```tsx
// Desktop: large
<ImpactBadge score={42} size="lg" className="hidden md:block" />

// Mobile: medium
<ImpactBadge score={42} size="md" className="md:hidden" />
```

---

## 7. Data Sources to Reference

### Primary Data Sources

#### 1. **Economic Metrics**
- **Bureau of Labor Statistics (BLS)**
  - Employment data, wage growth, inflation
  - API: `https://api.bls.gov/publicAPI/v2/`
- **Bureau of Economic Analysis (BEA)**
  - GDP, trade balance, economic indicators
  - API: `https://apps.bea.gov/api/`
- **Federal Reserve Economic Data (FRED)**
  - Comprehensive economic time series
  - API: `https://api.stlouisfed.org/fred/`

#### 2. **Polling Data**
- **FiveThirtyEight Polling Aggregator**
  - Presidential approval, policy-specific polls
  - `https://projects.fivethirtyeight.com/polls/`
- **RealClearPolitics**
  - Poll aggregation and averages
- **Pew Research Center**
  - In-depth policy polling

#### 3. **Expert Analysis**
- **Congressional Budget Office (CBO)**
  - Non-partisan economic analysis
  - `https://www.cbo.gov/`
- **Government Accountability Office (GAO)**
  - Federal program evaluations
- **Federal Reserve Research Papers**
- **Academic Journals** (JSTOR, NBER)

#### 4. **Policy Documents**
- **Federal Register API** (Already integrated!)
  - Executive orders, presidential documents
  - `pipeline/sources/federal-register.ts`
- **Congress.gov API**
  - Related legislation
- **White House Statements**

#### 5. **Healthcare Outcomes**
- **CDC Data & Statistics**
  - Health outcomes, disease rates
- **CMS (Medicare/Medicaid)**
  - Coverage data, costs
- **Kaiser Family Foundation**
  - Healthcare policy analysis

#### 6. **Environmental Data**
- **EPA Air Quality Data**
  - Pollution levels, enforcement
- **NOAA Climate Data**
  - Temperature, extreme weather events
- **EIA (Energy Information Administration)**
  - Energy production, prices

#### 7. **Immigration Data**
- **DHS Immigration Statistics**
  - Border apprehensions, deportations
- **CBP Border Data**
  - Border crossings, wait times
- **USCIS Data**
  - Legal immigration processing

### Data Integration Pattern

```typescript
// src/lib/data-sources.ts

interface DataSource {
  name: string;
  url: string;
  bias: 'Non-partisan' | 'Center-Left' | 'Center-Right' | 'Conservative' | 'Progressive';
  type: 'Government' | 'Think Tank' | 'Research' | 'Academic';
  dataType: 'Economic' | 'Polling' | 'Analysis' | 'Policy';
  apiEndpoint?: string;
  updateFrequency: 'Real-time' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
}

const DATA_SOURCES: Record<string, DataSource> = {
  BLS: {
    name: 'Bureau of Labor Statistics',
    url: 'https://bls.gov',
    bias: 'Non-partisan',
    type: 'Government',
    dataType: 'Economic',
    apiEndpoint: 'https://api.bls.gov/publicAPI/v2/',
    updateFrequency: 'Monthly'
  },
  CBO: {
    name: 'Congressional Budget Office',
    url: 'https://cbo.gov',
    bias: 'Non-partisan',
    type: 'Government',
    dataType: 'Analysis',
    updateFrequency: 'Quarterly'
  },
  // ... more sources
};
```

### Citation Component

```tsx
<div className="bg-slate-50 border-l-4 border-blue-500 p-4 text-sm">
  <div className="flex items-start gap-3">
    <span className="text-blue-600 text-lg">📊</span>
    <div>
      <div className="font-semibold text-slate-900 mb-1">Data Source</div>
      <div className="text-slate-700">
        Bureau of Labor Statistics, "Consumer Price Index Summary", 
        December 2025
      </div>
      <a 
        href="https://bls.gov/..." 
        target="_blank"
        className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
      >
        View original data →
      </a>
    </div>
  </div>
</div>
```

---

## 8. Scoring Methodology

### How Impact Scores Are Calculated

#### Multi-Factor Scoring Model

```typescript
interface ImpactFactors {
  economic: number;        // -50 to +50
  social: number;          // -50 to +50
  polling: number;         // -25 to +25 (public perception)
  expert: number;          // -25 to +25 (expert consensus)
}

function calculateImpactScore(factors: ImpactFactors): number {
  const raw = factors.economic + factors.social + factors.polling + factors.expert;
  // Convert from -150 to +150 range to 0-100 scale
  return Math.round((raw + 150) / 3);
}
```

#### Example: Tariff Policy

```typescript
const tariffImpact: ImpactFactors = {
  economic: -35,      // Negative GDP impact, job losses, price increases
  social: -20,        // Manufacturing communities affected
  polling: -18,       // 61% disapproval
  expert: -22         // Strong consensus from economists
};

// Total: -95, Score: 18 (F-)
```

#### Example: Infrastructure Investment

```typescript
const infrastructureImpact: ImpactFactors = {
  economic: +40,      // GDP boost, job creation
  social: +35,        // Improved transit, broadband access
  polling: +20,       // 72% approval
  expert: +18         // Positive expert analysis
};

// Total: +113, Score: 88 (B)
```

### Transparency Display

```tsx
<div className="bg-white rounded-lg border border-slate-200 p-6">
  <h4 className="font-bold text-slate-900 mb-4">How This Score Was Calculated</h4>
  
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">Economic Impact</span>
      <span className="font-mono text-sm font-semibold text-red-700">-35</span>
    </div>
    <div className="text-xs text-slate-600 mb-2">
      GDP -0.2%, jobs -47k, prices +12.3%
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">Social Impact</span>
      <span className="font-mono text-sm font-semibold text-red-700">-20</span>
    </div>
    <div className="text-xs text-slate-600 mb-2">
      Manufacturing communities negatively affected
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">Public Polling</span>
      <span className="font-mono text-sm font-semibold text-red-700">-18</span>
    </div>
    <div className="text-xs text-slate-600 mb-2">
      61% disapproval (12 polls averaged)
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">Expert Analysis</span>
      <span className="font-mono text-sm font-semibold text-red-700">-22</span>
    </div>
    <div className="text-xs text-slate-600 mb-2">
      Consensus: negative impact (CBO, Fed, 8 research institutions)
    </div>
    
    <div className="border-t border-slate-200 pt-3 mt-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-900">Final Impact Score</span>
        <span className="text-2xl font-bold text-red-700">18 (F-)</span>
      </div>
    </div>
  </div>
  
  <a href="#methodology" className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-4 inline-block">
    Learn more about our methodology →
  </a>
</div>
```

---

## 9. Design System Summary

### Colors (Consistent with Congress Pages)

```css
/* Primary Palette */
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-300: #cbd5e1;
--slate-600: #475569;
--slate-700: #334155;
--slate-900: #0f172a;

/* Impact Colors */
--green-100: #dcfce7;   /* Positive impact */
--green-700: #15803d;
--yellow-100: #fef3c7;  /* Neutral */
--yellow-700: #a16207;
--red-100: #fee2e2;     /* Negative impact */
--red-700: #b91c1c;

/* Accent */
--blue-600: #2563eb;    /* Links, CTAs */
--blue-700: #1d4ed8;
```

### Typography

```css
/* Headings */
.heading-1 { @apply text-5xl md:text-6xl font-black tracking-tight text-slate-900; }
.heading-2 { @apply text-3xl md:text-4xl font-bold text-slate-900; }
.heading-3 { @apply text-xl md:text-2xl font-bold text-slate-900; }

/* Body */
.body-lg { @apply text-lg text-slate-600 leading-relaxed; }
.body { @apply text-base text-slate-700; }
.body-sm { @apply text-sm text-slate-600; }

/* Labels */
.label { @apply text-xs font-semibold text-slate-500 uppercase tracking-wider; }
```

### Component Classes

```css
/* Cards */
.card {
  @apply bg-white rounded-xl border border-slate-200 shadow-sm;
}

.card-hover {
  @apply bg-white rounded-xl border border-slate-200 shadow-sm 
         hover:shadow-md transition-shadow cursor-pointer;
}

/* Badges */
.badge {
  @apply inline-flex items-center px-3 py-1 rounded-full 
         text-xs font-semibold;
}

/* Buttons */
.btn-primary {
  @apply px-4 py-3 bg-blue-600 text-white font-medium rounded-lg 
         hover:bg-blue-700 transition min-h-[44px];
}

.btn-secondary {
  @apply px-4 py-3 border border-slate-300 text-slate-700 font-medium 
         rounded-lg hover:bg-slate-50 transition min-h-[44px];
}
```

### Spacing System

```css
/* Consistent spacing (match Congress pages) */
--spacing-card: 1.5rem;     /* p-6 */
--spacing-section: 2rem;    /* space-y-8 */
--spacing-page: 4rem;       /* py-16 */
```

---

## 10. Implementation Checklist

### Phase 1: Data & Backend
- [ ] Create database schema for policies (`presidential_policies` table)
- [ ] Implement impact scoring algorithm
- [ ] Set up data source integrations (BLS, CBO, polling APIs)
- [ ] Create API routes (`/api/president/policies`, `/api/president/policies/[id]`)
- [ ] Build data pipeline for automatic updates

### Phase 2: UI Components
- [ ] `<ImpactBadge>` component
- [ ] `<PolicyCard>` component
- [ ] `<PromiseVsRealityCard>` component
- [ ] `<ExpertAnalysisCard>` component
- [ ] `<DataSourceCitation>` component
- [ ] `<ImpactScoreBreakdown>` component
- [ ] `<CategoryFilter>` component

### Phase 3: Pages
- [ ] `/president` overview dashboard
- [ ] `/president/policies` listing page
- [ ] `/president/policies/[slug]` detail page
- [ ] Mobile responsive testing

### Phase 4: Data Population
- [ ] Seed initial policies (10-15 major policies)
- [ ] Add economic data from BLS/BEA
- [ ] Integrate polling data
- [ ] Add expert analysis citations
- [ ] Calculate impact scores

### Phase 5: Polish
- [ ] Methodology documentation page
- [ ] About/FAQ section
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] SEO metadata

---

## 11. Key Differentiators from Promise Trackers

| Traditional Promise Tracker | Our Impact Tracker |
|----------------------------|-------------------|
| ✓ = Promise kept (GREEN) | Score based on outcomes, not promises |
| Focus on politician's words | Focus on Americans' lives |
| Binary kept/broken | Nuanced 0-100 impact scale |
| "He did what he said!" | "Did it help or hurt people?" |
| Political accountability | Real-world accountability |

### Example Comparison

**Promise Tracker:**
```
✓ Impose tariffs on imports
Status: KEPT ✓
Color: Green
```

**Our Impact Tracker:**
```
Policy: Import Tariffs 2025
Impact Score: 18 (F-)
Color: Red
Why: Consumer prices +12.3%, jobs -47k, GDP -0.2%
Promise Kept: Yes (85% alignment)
Result: Harmful to Americans
```

---

## 12. Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Color Contrast
- All text must meet 4.5:1 contrast ratio (7:1 for large text)
- Don't rely on color alone — use icons + text labels
- Test with tools: WebAIM Contrast Checker

#### Keyboard Navigation
```tsx
// All interactive elements must be keyboard accessible
<button 
  className="..." 
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  View Policy
</button>
```

#### Screen Reader Support
```tsx
// Proper ARIA labels
<div aria-label="Impact score: 42 out of 100, grade D, negative impact">
  <ImpactBadge score={42} />
</div>

// Skip links
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

#### Focus Indicators
```css
/* Visible focus states */
.focus-ring {
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
```

#### Alt Text for Data Visualizations
```tsx
<img 
  src="/charts/economic-impact.png" 
  alt="Bar chart showing economic impact factors: GDP -35, Jobs -20, Prices -18, Trade -22"
/>
```

---

## 13. Future Enhancements

### V2 Features
- **Comparison Tool**: Compare policies side-by-side
- **Personalized Impact**: "How does this affect someone like me?" (by state, income, age)
- **Historical Comparison**: Compare to previous administrations
- **Prediction Tracker**: Track predicted vs actual outcomes
- **Community Notes**: Verified user contributions (Twitter-style)
- **Email Alerts**: Notify when policies in your categories update
- **Data Export**: Download raw data as CSV/JSON
- **Embeddable Widgets**: Share impact scores on other sites

### Advanced Data Integrations
- Machine learning for sentiment analysis on policy documents
- Real-time economic indicator tracking
- Geographic heatmaps (which states affected most?)
- Demographic breakdowns (impact by income bracket, age, etc.)

---

## Conclusion

This UX design creates a **truth-focused, data-driven policy tracker** that prioritizes **measurable impact over political rhetoric**. By separating "promise-keeping" from "actual outcomes," we hold leadership accountable to what matters most: how policies affect Americans' lives.

The design maintains consistency with the existing Congress accountability dashboard while introducing new components specifically built for impact-based analysis.

---

**Next Steps:**
1. Review this spec with the team
2. Prioritize components for Phase 1 development
3. Begin database schema and API implementation
4. Design mockups in Figma (optional but recommended)
5. Start with 5-10 high-impact policies as MVP

**Questions? Feedback?**
This is a living document. Update as the design evolves.
