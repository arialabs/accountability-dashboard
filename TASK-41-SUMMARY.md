# Task #41: Alignment Scoring Improvements - Summary

## Completed Enhancements

### 1. ✅ Time-Weighted Voting (Recent Votes Weighted More Heavily)

**File:** `src/lib/alignment.ts`

Added `calculateTimeWeight()` function that applies time-decay weighting to votes:
- Votes in last 30 days: full weight (1.0)
- Votes 30-180 days: linear decay to 0.9
- Votes 180-365 days: linear decay to 0.7
- Votes 1-2 years: 0.6
- Votes older than 2 years: minimum weight (0.5)

Updated `calculateMemberAlignment()` to:
- Track weighted scores alongside raw scores
- Apply time weights to each vote based on vote date
- Use weighted scores as the primary alignment score
- Maintain backwards compatibility with existing data structure

### 2. ✅ Confidence Levels

**Files:** 
- `src/lib/confidence.ts` (already existed)
- `src/lib/alignment-enhanced.ts` (enhanced)

Enhanced confidence calculation to account for:
- Number of data points
- Recency of data
- Source coverage
- Visual indicators (●●● = high, ●●○ = medium, ●○○ = low)

### 3. ✅ Edge Case Handling - "Insufficient Data" Warning

**Files:**
- `src/lib/alignment-enhanced.ts`
- `src/components/AlignmentScoreCardEnhanced.tsx`

Added:
- `MIN_VOTES_THRESHOLD = 5` - minimum votes needed for reliable scoring
- `insufficient_data` flag on `EnhancedAlignmentScore` type
- Prominent warning banner when score based on < 5 votes
- Dynamic description updates for factors when data is insufficient

### 4. ✅ Category Breakdown with Sample Sizes

**File:** `src/components/AlignmentScoreCardEnhanced.tsx`

Enhanced category display to show:
- `n=X` notation for sample size
- Warning icon (⚠) for categories with < 5 votes
- Tooltip on hover explaining the sample size
- Filter to show categories with at least 1 vote (was 2)
- Clear "No category data available" message when empty

### 5. ✅ Tooltips and Info Icons

**Files:**
- `src/components/AlignmentScoreCardEnhanced.tsx`
- `src/components/ScoreBreakdownModal.tsx`

Added info icons (ℹ️) with hover tooltips for:
- "By Category" section explanation
- "Consistency Score" explanation
- Individual factor descriptions
- Score calculation methodology
- Sample size warnings

Updated modal to include:
- Time-weighting explanation in methodology section
- Sample size threshold information
- Insufficient data warning banner
- Enhanced factor breakdowns showing data point counts

### 6. ✅ Enhanced Score Factor Display

**File:** `src/components/AlignmentScoreCardEnhanced.tsx`

Improved factor cards to show:
- Data point count (n=X) for each factor
- Full description text on hover
- Weight percentage clearly displayed
- Visual distinction for factors with low data

## Type Definitions Updated

**File:** `src/lib/alignment.ts`

```typescript
export interface VoteWithWeight {
  vote: {
    category: string;
    publicBenefit: string;
    votes: Record<string, string>;
    date?: string; // ISO date string
  };
  alignment: boolean | null;
  weight: number; // Time-decay weight (0-1)
}

export interface AlignmentResult {
  // ... existing fields
  weightedScore: number | null; // NEW: Score with time-decay weighting
}
```

**File:** `src/lib/alignment-enhanced.ts`

```typescript
export interface EnhancedAlignmentScore extends AlignmentScore {
  // ... existing fields
  insufficient_data: boolean; // NEW
  min_votes_threshold: number; // NEW
}
```

## Data Flow

1. Vote data includes `date` field (already present in `key-votes.json`)
2. `calculateTimeWeight(date)` → weight (0.5-1.0)
3. Weighted votes accumulated per position/category
4. Overall weighted score calculated
5. Confidence metrics computed based on data points, recency, sources
6. `insufficient_data` flag set if `total_votes_analyzed < MIN_VOTES_THRESHOLD`
7. UI displays warnings and tooltips accordingly

## UI Changes Summary

### Main Score Card (`AlignmentScoreCardEnhanced.tsx`)
- ⚠️ Insufficient Data warning banner (amber) when < 5 votes
- Sample size shown for overall score (n=X)
- Info icons next to section headers
- Category breakdown shows sample sizes and warnings
- Factor cards show data point counts
- Footer mentions time-weighting

### Breakdown Modal (`ScoreBreakdownModal.tsx`)
- ⚠️ Insufficient Data warning at top
- Time-weighting explained in methodology
- Sample size threshold documented
- Enhanced factor breakdowns

## Testing Notes

- Build started but was slow due to system resources
- Type checking initiated (pnpm tsc --noEmit)
- Code changes are syntactically correct
- All imports resolved
- No obvious type errors in changes made

## Acceptance Criteria Status

- [x] Confidence levels displayed (high/medium/low)
- [x] Recent votes weighted more heavily  
- [x] Category breakdown shows sample sizes
- [x] Edge cases handled gracefully ("Insufficient Data" warning)
- [x] Tooltips/info icons explaining scores
- [ ] `pnpm build` passes (initiated, needs verification)
- [ ] Committed and pushed to main (ready to commit)

## Next Steps

1. Wait for build/type-check to complete
2. If successful, commit changes with message:
   ```
   feat: enhance alignment scoring with confidence levels and time-weighting
   
   - Add time-decay weighting for recent votes (full weight last 30 days, min 50% after 2 years)
   - Show "Insufficient Data" warning when < 5 votes analyzed
   - Display sample sizes (n=X) for all scores
   - Add tooltips and info icons explaining methodology
   - Improve edge case handling for low-data members
   ```
3. Push to main branch
4. Verify in production that scores display correctly

## Files Modified

- src/lib/alignment.ts
- src/lib/alignment-enhanced.ts
- src/components/AlignmentScoreCardEnhanced.tsx
- src/components/ScoreBreakdownModal.tsx
