# Executive Branch Accountability - Implementation Plan

## Task Overview
Extend the accountability dashboard to track Executive Branch cabinet members and their alignment with presidential promises/policies.

## Data Sources Research

### 1. **Federal Register API** 
- **URL:** https://www.federalregister.gov/api/v1/
- **Data:** Executive Orders, Presidential Documents, Agency Actions
- **Endpoint:** `/documents.json?conditions[type][]=PRESDOCU&conditions[president]=donald-trump`
- **Rate Limit:** No strict limit, but respect fair use
- **Free:** Yes

### 2. **Congress.gov API**
- **URL:** https://api.congress.gov/v3/
- **Data:** Nomination votes, confirmation records
- **Endpoint:** `/nomination/{congress}/{nomination-number}`
- **Rate Limit:** 5,000/hour with API key
- **Free:** Yes (requires API key)

### 3. **News APIs for Policy Announcements**
- **NewsAPI:** https://newsapi.org/ (100 requests/day free)
- **GNews API:** https://gnews.io/ (100 requests/day free)
- **Query:** Cabinet member name + policy keywords

### 4. **The White House Website**
- **URL:** https://www.whitehouse.gov/
- **Data:** Official statements, briefings, promises
- **Method:** Web scraping with puppeteer/cheerio

## Database Schema Extensions

### New Tables:

1. **presidential_promises**
   - id, president, promise_text, category, date_made, source_url, status

2. **cabinet_members**
   - id, name, position, department, appointed_date, confirmed_date, senate_vote, bio, photo_url

3. **cabinet_actions**
   - id, cabinet_member_id, action_type, title, description, date, source_url, related_promise_ids

4. **alignment_scores**
   - cabinet_member_id, promise_id, alignment_score, rationale, last_updated

## Implementation Steps

### Phase 1: Data Models & Schema (✓ Current)
- [x] Research data sources
- [ ] Create database schema SQL
- [ ] Create TypeScript types
- [ ] Add sample data

### Phase 2: Data Pipeline
- [ ] Federal Register fetcher
- [ ] Congress.gov confirmation votes
- [ ] News aggregation script
- [ ] Alignment scoring logic

### Phase 3: API Routes
- [ ] `/api/cabinet/members` - Get all cabinet members
- [ ] `/api/cabinet/[id]` - Get specific member with actions
- [ ] `/api/promises` - Get presidential promises
- [ ] `/api/alignment/[memberId]` - Get alignment score

### Phase 4: UI Components
- [ ] Alignment score badge component
- [ ] Presidential promises list
- [ ] Cabinet actions timeline
- [ ] Enhanced cabinet member detail page
- [ ] Comparison/scoring dashboard

### Phase 5: Integration & Testing
- [ ] Integrate with existing dashboard
- [ ] Add tests for new components
- [ ] Build passes
- [ ] Push to main

## Alignment Scoring Logic

### Scoring Factors (0-100):
1. **Policy Execution** (40%): Did they implement related promises?
2. **Public Statements** (20%): Do they support the promises publicly?
3. **Agency Actions** (30%): Executive orders, regulations aligned with promises
4. **Consistency** (10%): Track record over time

### Data Collection:
- Track executive orders by department
- Monitor policy announcements
- Compare against stated campaign promises
- Note contradictions or reversals

## Next Steps
1. Create database schema
2. Build data fetcher for Federal Register
3. Implement basic alignment scoring
4. Update UI to show alignment metrics
