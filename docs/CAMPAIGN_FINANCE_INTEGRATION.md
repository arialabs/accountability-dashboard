# Campaign Finance Integration

## Overview

The accountability dashboard now integrates real-time campaign finance data from the OpenFEC API to show where representatives get their money.

## Features

### ✅ Implemented

1. **OpenFEC API Integration**
   - Real-time data fetching from Federal Election Commission
   - Automatic candidate search by name and chamber
   - Financial summary for current election cycle
   - Donor breakdown with PAC, individual, small/large donor percentages

2. **API Route** (`/api/finance/[bioguideId]`)
   - Server-side caching (1 hour revalidation)
   - Error handling with fallback to static data
   - CDN-friendly cache headers

3. **Data Display**
   - Comprehensive finance section on representative detail pages
   - Pie chart showing funding source breakdown
   - Top contributors list (when available)
   - Grassroots vs PAC funding indicators
   - Financial summary stats (raised, spent, cash on hand)

4. **Caching Strategy**
   - In-memory cache in FEC library (5-minute TTL)
   - API route revalidation (1 hour)
   - Fallback to static data if API fails

### Components

- **DonorAnalysisSection**: Main UI component displaying finance data
- **API Route**: `/api/finance/[bioguideId]` for fetching FEC data
- **FEC Library**: `src/lib/fec.ts` - Core API integration logic
- **Data Layer**: `src/lib/data.ts` - Unified data access with FEC integration

## API Setup

### Environment Variables

Required in `.env.local`:

```bash
FEC_API_KEY=your_api_key_here
NEXT_PUBLIC_FEC_API_KEY=your_api_key_here  # For client-side access if needed
```

### Getting an API Key

1. Visit https://api.open.fec.gov/developers/
2. Sign up for a free API key
3. Add to `.env.local` (never commit!)

Stored in 1Password: `op read "op://Aria Labs/OpenFEC/credential"`

### Rate Limits

OpenFEC API limits:
- **120 requests per minute** (with API key)
- **1000 requests per hour**

Our caching strategy ensures we stay well within limits:
- 5-minute in-memory cache
- 1-hour API route revalidation
- Only fetches on-demand during page renders

## Usage

### Server-Side (Recommended)

```typescript
import { getMemberFinance } from '@/lib/data';

// In a server component or API route
const finance = await getMemberFinance(bioguideId);
```

### API Route

```bash
GET /api/finance/[bioguideId]
```

Example:
```bash
curl https://reps.arialabs.ai/api/finance/P000197
```

Response:
```json
{
  "candidate_id": "H8CA05035",
  "cycle": 2026,
  "total_raised": 2408010.13,
  "total_spent": 3306926.63,
  "cash_on_hand": 0,
  "pac_percentage": 1.4,
  "small_donor_percentage": 58.6,
  "large_donor_percentage": 33.6,
  "top_contributors": []
}
```

## Testing

Run the integration test:

```bash
cd ~/repos/accountability-dashboard
export $(cat .env.local | grep -v '^#' | xargs)
npx tsx scripts/test-fec-integration.ts
```

Expected output:
```
✅ Found candidate: H8CA05035
✅ Financial Summary (2026 cycle)
✅ Donor Breakdown
✅ All tests passed!
```

## Data Sources

- **Financial Data**: OpenFEC API v1 (https://api.open.fec.gov/)
- **Candidate Search**: By name + office type (House/Senate)
- **Cycle**: Current election cycle (automatically determined)

## Known Limitations

1. **Top Contributors**: The `/by_contributor/` endpoint may return 404 for some candidates
   - This is handled gracefully - other data still displays
   - Individual itemized contributions are still shown in aggregate

2. **Industry Breakdown**: Not available from FEC
   - Would require OpenSecrets API (future enhancement)

3. **Historical Cycles**: Currently only fetches most recent cycle
   - Could be extended to show multi-cycle trends

## Future Enhancements

- [ ] Add OpenSecrets API for industry/occupation breakdowns
- [ ] Multi-cycle comparison charts
- [ ] Committee-level finance data
- [ ] Independent expenditure tracking (Super PACs)
- [ ] Real-time filing alerts

## Files Modified

- `src/app/api/finance/[bioguideId]/route.ts` - New API route
- `src/lib/data.ts` - Integrated FEC fetching into getMemberFinance()
- `src/app/rep/[id]/page.tsx` - Made component async to await finance data
- `.env.local` - Added FEC_API_KEY

## Files Already Present

- `src/lib/fec.ts` - FEC API integration (already existed)
- `src/components/DonorAnalysisSection.tsx` - UI component (already existed)
- `src/lib/types.ts` - Type definitions (already existed)

## Build & Deploy

```bash
npm run build  # May require more memory on smaller systems
git add .
git commit -m "feat: integrate OpenFEC campaign finance data"
git push origin main
```

The API route will be automatically deployed and cached at the edge by Vercel/Next.js.
