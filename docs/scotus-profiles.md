# Issue #25: Supreme Court Justice Profiles Plan

## 1. Objective

Expand and standardize Supreme Court justice profiles so each justice page has consistent, source-backed biographical and accountability context, with clear data provenance and minimal schema support for future pipeline automation.

This plan covers data sources, profile fields, schema changes, UI placement, minimal v1 scope, and acceptance criteria.

## 2. Goals and Non-Goals

### Goals (v1)

1. Define a consistent profile schema for all nine current justices.
2. Enrich `src/data/scotus.json` with structured profile metadata and source attribution.
3. Surface profile data in existing judicial routes without creating a new product area.
4. Keep v1 compatible with static JSON loading while preparing optional database support.

### Non-Goals (v1)

1. Historical profiles for all former justices.
2. Automated case-level ingestion from bulk legal datasets.
3. Predictive ideology or outcome modeling.
4. Full investigative conflict scoring for judiciary (deferred to later issue).

## 3. Data Sources

## 3.1 Primary Sources

1. Supreme Court official website (`supremecourt.gov`)
- Justice biography pages (official role, appointment details, portrait links).
- Opinion PDFs for notable rulings.

2. Congress.gov / Senate records
- Confirmation year and appointing president verification context.

3. Martin-Quinn scores (official dataset/publication distribution)
- Ideology score baseline used by existing UI.

## 3.2 Secondary Sources (profile enrichment)

1. Federal Judicial Center (FJC) biographical directory
- Education, prior courts, career chronology.

2. Fix the Court disclosure database (already referenced in current data)
- Financial disclosure links by year.

## 3.3 Source-of-Truth Rules

1. Official role and appointment metadata: Supreme Court site first.
2. Ideology numeric value: Martin-Quinn dataset.
3. Notable ruling summaries: Supreme Court opinion pages first, secondary explanatory sources only for plain-language context.
4. Every non-trivial profile claim should include a source URL in v1 data artifacts.

## 4. Profile Fields (v1)

## 4.1 Existing fields to preserve

- `id`
- `name`
- `title`
- `appointed_by`
- `confirmation_year`
- `photo_url`
- `ideology_score`
- `ideology_label`
- `bio`
- `key_rulings[]`

## 4.2 New fields to add (minimal, high-value)

- `date_of_birth: string` (ISO `YYYY-MM-DD` when available)
- `birth_place: string`
- `education: string[]`
- `prior_roles: string[]` (court/government/legal roles)
- `appointed_by_party: 'Democratic' | 'Republican' | 'Other'`
- `confirmation_vote: string` (e.g., `50-48`)
- `tenure_start: string` (ISO date of commission/oath used consistently)
- `profile_last_updated: string` (ISO timestamp)
- `sources: Array<{ label: string; url: string; type: 'official' | 'dataset' | 'reference' }>`

## 4.3 Optional fields (v1.1+)

- `religion` (if policy approves inclusion)
- `clerkships[]`
- `books[]`
- `financial_disclosure_summary`
- `recusal_log[]`

## 5. Schema Changes

v1 should remain static-file-first, but define schema upgrades for reliability.

## 5.1 TypeScript schema updates

File: `src/lib/types.ts`

1. Extend `SupremeCourtJustice` with the v1 new fields above.
2. Add a reusable `ProfileSource` type for `sources[]`.
3. Keep `key_rulings` optional for backward compatibility during migration.

## 5.2 Data artifact changes

File: `src/data/scotus.json`

1. Update all nine justice records to include required v1 fields.
2. Ensure each justice has at least one official source and one ideology/data source reference.
3. Normalize dates to ISO format.

## 5.3 Optional SQL schema (future-proofing)

File: `database/schema.sql` (or dedicated migration file)

1. Add `scotus_justices` table for normalized persistence:
- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL`
- `title TEXT NOT NULL`
- `appointed_by TEXT NOT NULL`
- `appointed_by_party TEXT`
- `confirmation_year INTEGER NOT NULL`
- `confirmation_vote TEXT`
- `tenure_start DATE`
- `date_of_birth DATE`
- `birth_place TEXT`
- `photo_url TEXT`
- `ideology_score REAL`
- `ideology_label TEXT`
- `bio TEXT NOT NULL`
- `profile_last_updated DATETIME`
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`

2. Add `scotus_profile_sources` table:
- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `justice_id TEXT NOT NULL REFERENCES scotus_justices(id)`
- `label TEXT NOT NULL`
- `url TEXT NOT NULL`
- `source_type TEXT NOT NULL`
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`

3. Add index:
- `CREATE INDEX idx_scotus_sources_justice_id ON scotus_profile_sources(justice_id);`

## 6. UI Placement

Use existing judicial surfaces; no new top-level navigation required in v1.

1. `src/app/judicial/scotus/page.tsx`
- Keep list/grid as the directory entry point.
- Add profile completeness indicators only if data is missing.

2. `src/app/judicial/scotus/[id]/page.tsx`
- Add a `Profile` block under hero with birth, education, prior roles, appointment vote.
- Keep ideology and notable rulings sections; append a small `Sources` section at page bottom.
- Show `profile_last_updated` near metadata for transparency.

3. `src/app/judicial/page.tsx`
- Keep current overview and CTA flow unchanged for v1.

## 7. Minimal v1 Scope

1. Data
- Extend and normalize `src/data/scotus.json` for all nine current justices using required v1 fields.

2. Types
- Update `SupremeCourtJustice` to match new fields.

3. UI
- Render new profile fields on `/judicial/scotus/[id]`.
- Add source list + last-updated timestamp.

4. Validation
- Add lightweight validation/test coverage to ensure all nine records include required fields.

Deferred after v1:

- SQL persistence + automated ingest jobs.
- Historical justice expansion.
- Recusal/disclosure scoring overlays.

## 8. Acceptance Criteria

1. Data completeness
- `src/data/scotus.json` contains exactly nine current justices.
- 100% of records include required v1 fields and at least two source entries.

2. Type/schema integrity
- TypeScript build passes with updated `SupremeCourtJustice` type.
- No runtime errors when loading justice pages with new fields.

3. UI behavior
- Each `/judicial/scotus/[id]` page shows profile fields, ideology section, notable rulings, and sources.
- Missing optional fields degrade gracefully (no page crash; clear fallback text).

4. Transparency
- Each justice page displays `profile_last_updated`.
- Sources are visible and linkable from the justice detail page.

5. Scope control
- No new top-level routes are added beyond existing judicial paths.
- No historical justices included in v1 data payload.
