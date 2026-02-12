# Bill Summaries - AI-Powered Plain-English Explanations

## Overview

This feature uses Claude AI to generate plain-English summaries of congressional bills, making them understandable for citizens without legal backgrounds.

## Features

✅ **AI-Generated Summaries**: 2-3 sentence plain-English explanations
✅ **Impact Category Tags**: Visual tags showing which policy areas are affected (Healthcare, Economy, Environment, etc.)
✅ **Smart Caching**: Summaries are cached to avoid regenerating (bills don't change)
✅ **Expandable Full Text**: Users can view the original legislative language if needed
✅ **Automatic Fallback**: If AI generation fails, uses a shortened version of the description

## Architecture

### API Route
- **Location**: `src/app/api/bills/summary/route.ts`
- **Endpoints**:
  - `POST /api/bills/summary` - Generate or retrieve a bill summary
  - `GET /api/bills/summary?billId=xxx` - Retrieve a cached summary

### Caching
- **Location**: `data/bill-summaries/summaries.json`
- **Format**: JSON object with billId as key
- **Storage**: File-based caching (can be upgraded to database later)

### UI Component
- **Location**: `src/components/KeyVotes.tsx`
- **Features**:
  - Automatically loads summaries for visible votes
  - Shows AI summary by default
  - "Show full legislative text" button to expand
  - Color-coded impact category tags

## Usage

### For Users

1. **View Summary**: Bills now show AI-generated plain-English summaries by default
2. **See Impact**: Color-coded tags show which policy areas the bill affects
3. **Read Full Text**: Click "Show full legislative text" to see the original description

### For Developers

#### Generate Summaries for All Bills

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Run the batch generation script
npm run tsx scripts/generate-bill-summaries.ts
```

#### Generate Summary via API

```typescript
const response = await fetch('/api/bills/summary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    billId: '119-Senate-677',
    title: 'On the Amendment',
    description: 'To rescind certain amounts...',
    category: 'Healthcare',
  }),
});

const summary = await response.json();
```

#### Retrieve Cached Summary

```typescript
const response = await fetch('/api/bills/summary?billId=119-Senate-677');
const summary = await response.json();
```

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

Get your API key from: https://console.anthropic.com/

### Impact Category Tags

The system automatically tags bills based on keywords in their descriptions. Categories include:

- **Healthcare** - health, medicare, medicaid, hospital, insurance
- **Economy & Taxes** - tax, economy, budget, finance, spending
- **Environment** - climate, environment, energy, carbon, emissions
- **Education** - education, school, student, university
- **Immigration** - immigration, border, visa, citizenship
- **Defense** - military, defense, veteran, armed forces
- **Civil Rights** - rights, discrimination, equality, voting
- **Transportation** - transportation, infrastructure, highway, transit

## Implementation Details

### AI Prompt Template

The system uses this prompt to generate summaries:

```
You are helping citizens understand congressional bills. 

Bill: [BILL_ID]
Title: [TITLE]
Full Description: [DESCRIPTION]

Please provide a clear, 2-3 sentence plain-English summary that:
1. Explains what this bill actually does in simple terms
2. Mentions who would be affected (working families, businesses, specific groups)
3. Avoids jargon and legislative language

Keep it neutral and factual. Make it understandable to someone with no legal background.
```

### Caching Strategy

1. **Check cache first**: On request, check if summary exists in cache
2. **Generate if missing**: If not cached, call Claude API to generate
3. **Save to cache**: Store generated summary for future requests
4. **Never regenerate**: Bills don't change, so cache is permanent

### Rate Limiting

The batch generation script includes a 1-second delay between requests to avoid hitting API rate limits.

## Testing

### Manual Testing

1. Start the dev server: `npm run dev`
2. Navigate to `/votes`
3. Verify that bill cards show:
   - AI-generated summary (not the original description)
   - Color-coded impact tags
   - "Show full legislative text" button
   - Expandable full text section when clicked

### Test Summary Generation

```typescript
// Test with a sample bill
const testBill = {
  billId: 'test-001',
  title: 'Test Bill',
  description: 'A bill to provide healthcare coverage for all citizens.',
  category: 'Healthcare',
};

const response = await fetch('/api/bills/summary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testBill),
});

const result = await response.json();
console.log('Summary:', result.summary);
console.log('Impact Tags:', result.impactTags);
```

## Future Improvements

- [ ] Database storage instead of file-based caching
- [ ] Summary quality scoring and feedback
- [ ] Support for different summary lengths (short/medium/long)
- [ ] Translation to multiple languages
- [ ] A/B testing different prompt templates
- [ ] Real-time summary generation on new bills
- [ ] Bulk regeneration of summaries when prompt improves

## Cost Considerations

- **Claude API**: ~$0.003 per summary (200 tokens @ ~$0.015/1K tokens)
- **First 100 bills**: ~$0.30
- **Entire key votes dataset**: ~$1-2 for all historical summaries
- **Ongoing**: Only new bills need summaries

## Troubleshooting

### "Missing ANTHROPIC_API_KEY" error

Make sure you've added your API key to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### Summaries not appearing

1. Check browser console for API errors
2. Verify the cache file exists: `data/bill-summaries/summaries.json`
3. Check API logs for generation errors
4. Test the API directly: `curl http://localhost:3000/api/bills/summary?billId=test`

### Rate limit errors

The batch script processes 10 bills at a time with 1-second delays. To process more:

```typescript
// In scripts/generate-bill-summaries.ts
// Change this line:
for (const vote of votesNeedingSummaries.slice(0, 10)) {
// To process more:
for (const vote of votesNeedingSummaries.slice(0, 50)) {
```

## License

This feature is part of the Accountability Dashboard project. See main project LICENSE for details.
