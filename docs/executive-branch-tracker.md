# Executive Branch Accountability Tracker Plan

Issue: #43  
Status: Planning (v1)

## Goal
Add Executive Branch accountability tracking alongside existing Congress-focused features, starting with a narrow, auditable v1 centered on Cabinet officials and evidence-backed events.

## Data Sources
Use primary, publicly accessible sources first; supplement with high-quality secondary reporting only when primary records are unavailable.

1. Federal Register API (`federalregister.gov/api/v1`)
- Executive orders, presidential documents, agency rules/notices.
- Primary use: department-level action evidence and timeline events.

2. Congress.gov API (`api.congress.gov/v3`)
- Nomination and confirmation records.
- Primary use: Cabinet appointment/confirmation metadata.

3. White House official releases (`whitehouse.gov`)
- Statements, fact sheets, and briefing records.
- Primary use: declared policy intent and administration framing.

4. Agency official press/news rooms (`.gov` department sites)
- Department announcements and implementation updates.
- Primary use: attributable actions by Cabinet-led agencies.

5. Court and inspector general sources (as available)
- PACER-linked docket references, DOJ releases, OIG reports.
- Primary use: formal investigations, findings, or legal outcomes.

6. Reputable secondary outlets (AP/Reuters/major national outlets)
- Only for corroboration and context when primary records lag.
- Rule: incidents should have at least 2 independent sources if no primary document exists.

## Coverage Scope
### In scope for v1
1. People
- Senate-confirmed Cabinet secretaries in the current administration.
- Optional: Vice President as executive leadership context card (no scoring dependency).

2. Event types
- Confirmations
- Policy implementation actions (EO-linked, rulemaking milestones, formal directives)
- Ethics investigations/findings
- Criminal investigations/charges/convictions
- Major conflict-of-interest disclosures/findings

3. Time window
- Current administration term to date.
- Backfill allowed only for still-active officials included in v1.

4. Evidence standard
- Every event requires source URL(s), publication date, and source type.
- Severity-tagged events require either primary source proof or multi-source corroboration.

### Out of scope for v1
- Sub-cabinet/Senior Advisor-wide coverage.
- Predictive or sentiment-based scoring.
- Community-submitted events.
- Cross-administration historical benchmarking.

## Proposed Schema Changes
Assumes existing person/event model for congressional entities; extend with an executive-specific layer while reusing shared event/source tables where practical.

1. `executive_officials`
- `id` (pk)
- `slug` (unique)
- `full_name`
- `role_title` (e.g., Secretary of State)
- `department`
- `is_cabinet_level` (bool)
- `appointed_at` (date)
- `confirmed_at` (date, nullable)
- `confirmation_vote` (text, nullable)
- `status` (active, resigned, acting)
- `photo_url` (nullable)
- `created_at`, `updated_at`

2. `executive_events`
- `id` (pk)
- `official_id` (fk -> `executive_officials.id`)
- `event_type` (confirmation, policy_action, ethics_investigation, ethics_finding, criminal_investigation, charge, conviction, coi_disclosure)
- `severity` (info, low, medium, high, critical)
- `title`
- `summary`
- `event_date`
- `status` (open, resolved, superseded)
- `source_confidence` (primary, corroborated, single_secondary)
- `created_at`, `updated_at`

3. `executive_event_sources`
- `id` (pk)
- `event_id` (fk -> `executive_events.id`)
- `source_url`
- `source_label`
- `source_type` (federal_register, congress_gov, white_house, agency_gov, court, oig, media)
- `published_at` (date, nullable)
- `is_primary` (bool)

4. Optional alignment table for later phases (not required for v1 delivery)
- `executive_alignment_scores` with methodology versioning.
- Keep feature-flagged until evidence density supports defensible scoring.

## UI Surfacing
### v1 surfaces
1. Executive overview section/page
- Add `/executive` (or existing executive landing) with Cabinet grid cards.
- Show role, status, latest event date, and count of high-severity events.

2. Official detail pages
- Add event timeline component with filters (`event_type`, `severity`, `status`).
- Each card must show source chips/links and date metadata.

3. Cross-site discoverability
- Add top-level nav entry: `Executive`.
- Add homepage module: “Executive Branch Accountability” with 3-5 recent events.

4. Transparency affordances
- “Methodology” panel describing event thresholds, source requirements, and update cadence.
- Event cards expose a compact provenance block (primary vs corroborated).

## Minimal v1 Scope
Ship the smallest useful, auditable slice:

1. Data
- Seed 15-20 current Cabinet officials.
- Ingest and display at least 1-3 verified events per official for an initial subset of 8 officials.

2. Backend
- Read APIs for officials, official details, and paginated/filterable events.
- Source metadata returned with every event.

3. Frontend
- Executive list page + official detail page timeline.
- Severity badges and event type labels.
- Source links visible without extra clicks.

4. Non-goals
- No composite alignment score in v1.
- No automated NLP classification; use explicit, deterministic mapping rules.

## Acceptance Criteria
Issue #43 is complete when all conditions below are met:

1. Coverage
- At least 15 Cabinet officials exist in production data with required metadata.
- At least 8 officials have verified event timelines.

2. Data quality
- 100% of displayed events include at least one source URL and source type.
- High/critical severity events have primary-source evidence or 2+ independent corroborating sources.

3. Product behavior
- Users can navigate from main nav to executive overview and into official detail pages.
- Users can filter official timeline by event type and severity.
- Event cards visibly display source links and event dates.

4. Reliability
- API responses for executive pages meet existing app error handling patterns.
- Empty/error states render gracefully with retry guidance.

5. Transparency
- Methodology content is publicly visible from executive pages.
- Every event indicates confidence/provenance level.

## Delivery Notes
- Implement behind a feature flag if data completeness is still in progress.
- Prioritize source integrity and traceability over volume.
- Defer scoring until source-backed event density is stable.
