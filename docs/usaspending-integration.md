# Issue #46: USASpending.gov Integration Plan

## 1. Objective

Integrate federal spending data from USASpending.gov so each member page can show where federal contract/grant dollars flow in the member's state/district and which top recipients receive those funds.

This plan covers endpoint selection, ETL design, schema changes, UI surfacing, and a minimal v1 scope that can ship safely.

## 2. Goals and Non-Goals

### Goals (v1)

1. Add a reliable USASpending data source to the existing pipeline.
2. Produce normalized, member-keyed spending artifacts for runtime reads.
3. Surface spending context on member detail pages with clear source/freshness metadata.
4. Keep federal spending data descriptive (transparency), not opinionated scoring.

### Non-Goals (v1)

1. Real-time spending updates.
2. Full award-level drilldowns in the UI.
3. Causal claims that spending outcomes were driven by a specific member.
4. New scoring weights tied to spending totals.

## 3. Data Endpoints

USASpending v2 APIs should be used as source of truth for federal spending totals and recipients.

### 3.1 Core endpoint families for v1

1. `POST /api/v2/search/spending_by_geography/`
- Use for state-level and congressional district-level totals.
- Primary input filters: fiscal year range, award type set (contracts + grants), geography.
- Primary output fields: aggregated obligation/outlay totals.

2. `POST /api/v2/search/spending_by_category/`
- Use for recipient rollups (top organizations) filtered by geography + fiscal year.
- Category target for v1: recipient.
- Primary output fields: recipient name/identifier and aggregated dollars.

3. `POST /api/v2/search/spending_by_award/` (pipeline-only, sampled)
- Use for spot-validation of aggregated totals and data quality checks.
- v1 does not need full award ingestion; sample top N rows for validation.

4. `GET /api/v2/references/agency/` and related references endpoints
- Use to normalize top-tier/sub-tier agency names in rollups.
- Optional in v1 UI, but useful for consistent naming in artifacts.

Note: During implementation, confirm final request/response payload keys against current API docs before coding extractors.

### 3.2 Freshness and cadence

1. Refresh cadence: weekly pipeline run (aligned with current data refresh rhythms).
2. Fallback: serve latest successful static artifact if USASpending API errors.
3. UI must show `as_of_fiscal_year` and `last_updated` timestamp.

## 4. ETL Pipeline Design

### 4.1 New pipeline source module

Add `pipeline/sources/usaspending.ts` with stages:

1. Input preparation
- Load members from `pipeline/output/members.json`.
- Build geography keys per member:
  - Senate: state-level geography.
  - House: district-level geography (fallback to state if district query unavailable).

2. Extract
- Pull spending totals by geography and fiscal year window (v1: last 3 completed FYs).
- Pull top recipients for each member geography.
- Optionally pull top agencies for context.

3. Transform
- Normalize currency fields to numbers.
- Create comparable member-level records regardless of chamber.
- Compute derived values:
  - `total_obligated_3y`
  - `contracts_obligated_3y`
  - `grants_obligated_3y`
  - `top_recipients` (top 10)
  - `per_capita_obligated` (if population data is available; otherwise defer)

4. Load
- Write `pipeline/output/federal-spending.json`.
- Copy/emit runtime artifact `src/data/federal-spending.json`.

5. Validate
- Required fields present.
- All currency values finite and non-negative.
- Coverage threshold and error-rate checks (see acceptance criteria).

### 4.2 Pipeline orchestration

1. Add USASpending step to `pipeline/index.ts` after member load, before score generation.
2. Ensure pipeline continues on partial failures with structured error summaries.
3. Emit run metrics:
- members processed
- members with spending record
- district fallbacks to state
- endpoint failures by type

### 4.3 Caching and retry strategy

1. Request retries: exponential backoff on 429/5xx.
2. In-run cache keyed by endpoint + request body hash.
3. Persist last-known-good artifact if refresh fails.

## 5. Schema Changes

### 5.1 New TypeScript interfaces (`src/lib/types.ts`)

Add:

```ts
export interface FederalRecipient {
  recipient_id: string | null;
  recipient_name: string;
  amount_obligated: number;
  award_count?: number;
}

export interface FederalSpendingProfile {
  bioguide_id: string;
  chamber: "house" | "senate";
  state: string;
  district: number | null;
  fiscal_year_start: number;
  fiscal_year_end: number;
  total_obligated: number;
  contracts_obligated: number;
  grants_obligated: number;
  direct_payments_obligated?: number;
  top_recipients: FederalRecipient[];
  top_agencies?: Array<{
    agency_name: string;
    amount_obligated: number;
  }>;
  data_completeness: "high" | "medium" | "low";
  source: "usaspending";
  source_version: "v2";
  last_updated: string;
  notes?: string[];
}
```

### 5.2 New data artifact

1. `src/data/federal-spending.json`
- Shape: `Record<string, FederalSpendingProfile>` keyed by `bioguide_id`.

2. Optional debug artifact
- `pipeline/output/usaspending-debug.json` with request metadata and fallback reasons.

### 5.3 Data access layer updates (`src/lib/data.ts`)

1. Add static loader for `federal-spending.json`.
2. Add `getMemberFederalSpending(bioguideId: string): FederalSpendingProfile | null`.
3. Keep null-safe behavior consistent with existing finance helpers.

## 6. UI Surfacing Plan

### 6.1 Member detail page (v1)

Add a new section: `FederalSpendingSection`.

Display:

1. KPI cards
- Total obligated (3 FY window)
- Contracts share
- Grants share

2. Top recipients table/list
- Recipient name
- Dollars obligated
- Optional award count if available

3. Geography and time context
- "Statewide" vs "District" label
- FY range
- Last updated timestamp

4. Source disclosure
- "Source: USASpending.gov"
- brief tooltip noting that spending presence does not imply member-directed earmark.

### 6.2 Dashboard/search surfaces (v1.1+)

Defer cross-member rankings and filters until after v1 reliability is proven.

## 7. Minimal v1 Scope

1. Data
- Ingest last 3 completed fiscal years from USASpending.
- Contracts + grants only.
- Member-keyed totals + top 10 recipients.

2. Pipeline
- New `usaspending` source integrated into main pipeline.
- Emit `src/data/federal-spending.json` on successful run.

3. App layer
- Add types + loader function in `src/lib/types.ts` and `src/lib/data.ts`.

4. UI
- Add read-only `FederalSpendingSection` on member detail pages.
- Include source + freshness labels.

5. Guardrails
- No new scoring impact in v1.
- Explicit disclaimer about interpretation limits.

## 8. Acceptance Criteria

1. Endpoint integration
- Pipeline successfully calls geography + category endpoint families for configured FY range.
- Non-2xx responses are retried and logged with endpoint context.

2. Coverage
- At least 95% of members produce a non-null federal spending profile.
- Any missing members are explicitly listed in pipeline summary output.

3. Artifact quality
- `src/data/federal-spending.json` is generated and committed by pipeline run.
- All records include required v1 fields, `data_completeness`, and `last_updated`.

4. App behavior
- `getMemberFederalSpending()` returns normalized data or `null` without uncaught exceptions.
- Member detail page renders section for populated records and clear empty state otherwise.

5. UX clarity
- UI shows FY window and source attribution.
- UI includes interpretation disclaimer text.

6. Regression safety
- Existing finance/alignment/trading sections continue to render unchanged.
- Pipeline run does not fail hard when USASpending is temporarily unavailable; last-known-good artifact remains readable.

## 9. Implementation Sequence

1. Define interfaces + data loader.
2. Build `pipeline/sources/usaspending.ts` extractor/normalizer.
3. Wire into `pipeline/index.ts` with metrics and error handling.
4. Create `FederalSpendingSection` component and mount in member page.
5. Add tests for normalization and null-safe rendering behavior.
6. Run full pipeline smoke test and finalize docs updates.
