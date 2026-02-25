# Issue #49: Financial Impact Calculator Plan

## 1. Objective

Add a transparent Financial Impact Calculator that estimates the budget and household impact of a policy/action and shows the assumptions used for each estimate.

This plan defines data sources, calculation approach, schema, UI surfacing, minimal v1 scope, and acceptance criteria.

## 2. Data Sources

### 2.1 Required for v1

1. Curated policy estimate inputs (new artifact): `src/data/financial-impact-inputs.json`
- Manually curated cost/savings ranges for tracked policy items.
- Includes low/central/high estimates, estimate window, and source links.

2. Existing policy/action records
- `src/data/policy-impacts.json`
- `src/data/executive-actions.json`
- `src/data/key-votes.json`
- Used for linking calculator estimates to policy entities already shown in the app.

3. Household denominator reference (new artifact): `src/data/economic-baselines.json`
- Stores baseline denominator values for per-household and per-capita calculations.
- v1 fields: `us_households`, `us_population`, `last_updated`, `source_url`.

### 2.2 Recommended external sources for curated inputs

1. Congressional Budget Office (CBO) cost estimates.
2. Joint Committee on Taxation (JCT) revenue estimates.
3. Office of Management and Budget (OMB) budget tables.
4. Bureau of Labor Statistics (BLS) CPI-U (optional v1 if inflation adjustment is enabled).

### 2.3 Source-of-truth and freshness

- Source of truth for calculator estimates in v1: curated JSON artifacts in `src/data`.
- Refresh cadence: update on normal data refresh cycle (daily/weekly pipeline cadence), with manual edits when major new estimates are published.
- UI must always show estimate window and source list.

## 3. Calculation Approach

### 3.1 Inputs

For each policy/action estimate:

- `impact_low`, `impact_central`, `impact_high` (USD; negative = savings, positive = cost).
- `window_start_year`, `window_end_year`.
- Optional inflation basis (`dollars_year`) for constant-dollar normalization.
- Optional confidence grade (`high|medium|low`).

### 3.2 Core formulas (v1)

1. `years = window_end_year - window_start_year + 1`
2. `annual_impact = impact_central / years`
3. `household_impact_annual = annual_impact / us_households`
4. `per_capita_impact_annual = annual_impact / us_population`
5. Range calculations:
- `annual_impact_low = impact_low / years`
- `annual_impact_high = impact_high / years`
- household and per-capita ranges use the same denominator approach.

Sign convention:
- Positive values represent additional public cost.
- Negative values represent net savings/revenue gain.

### 3.3 v1 assumptions and guardrails

1. No macroeconomic dynamic scoring in v1.
2. No distributional split by income decile in v1.
3. No automatic blending of conflicting sources; each estimate entry must identify a primary source.
4. If denominator data is missing, show total/annual impact only and a clear "per-household unavailable" note.

## 4. Schema

### 4.1 `src/data/financial-impact-inputs.json`

Shape: `Record<string, FinancialImpactInput>` keyed by `impact_id`.

```ts
export interface FinancialImpactInput {
  impact_id: string;
  policy_id: string; // links to policy/action/vote record
  policy_type: "policy_impact" | "executive_action" | "vote";
  title: string;
  impact_low: number;
  impact_central: number;
  impact_high: number;
  window_start_year: number;
  window_end_year: number;
  dollars_year?: number; // constant-dollar basis, if provided
  confidence: "high" | "medium" | "low";
  source_urls: string[];
  source_notes?: string[];
  last_updated: string; // ISO timestamp
}
```

### 4.2 `src/data/economic-baselines.json`

```ts
export interface EconomicBaselines {
  us_households: number;
  us_population: number;
  basis_year: number;
  source_urls: string[];
  last_updated: string; // ISO timestamp
}
```

### 4.3 Computed output type (app layer)

Add derived type in `src/lib/types.ts`:

```ts
export interface FinancialImpactResult {
  impact_id: string;
  policy_id: string;
  total_central: number;
  total_low: number;
  total_high: number;
  annual_central: number;
  annual_low: number;
  annual_high: number;
  household_annual_central: number | null;
  household_annual_low: number | null;
  household_annual_high: number | null;
  per_capita_annual_central: number | null;
  per_capita_annual_low: number | null;
  per_capita_annual_high: number | null;
  window_start_year: number;
  window_end_year: number;
  confidence: "high" | "medium" | "low";
  source_urls: string[];
  last_updated: string;
}
```

## 5. UI Surfacing

### 5.1 Primary surfaces (v1)

1. Policy detail pages
- Add a `FinancialImpactCalculator` card below existing impact/context sections.
- Show total range, annualized range, and per-household annual estimate.

2. Executive action detail pages
- Show compact calculator block when linked `impact_id` exists.
- Empty state: "No published estimate yet."

3. Key vote detail pages
- Show "Estimated Financial Impact" panel if curated estimate is available.

### 5.2 Component behavior

1. Range-first presentation (`low - high`) with central estimate visually emphasized.
2. Unit toggle in v1: `Total` vs `Annual`.
3. Metadata row: estimate window, confidence, last updated, and source links.
4. Disclaimer text:
- "Estimates depend on assumptions and may change with new scoring."

### 5.3 Accessibility and formatting

1. Currency values use compact formatting with full-value tooltip or subtitle.
2. Support negative values with explicit "savings" label to avoid sign confusion.
3. Ensure keyboard/screen-reader access for source and methodology links.

## 6. Minimal v1 Scope

1. Data
- Create `financial-impact-inputs.json` with a starter set of manually curated estimates (target 10-20 high-traffic policies/actions).
- Create `economic-baselines.json` with household and population denominators.

2. Calculation layer
- Add pure utility that computes derived annual/per-household/per-capita values from the source artifact.
- Add validation for missing/invalid windows and non-finite numeric values.

3. UI
- Add read-only calculator card on policy detail pages.
- Add compact read-only panel for executive actions and key votes when linked data exists.

4. Guardrails
- No predictive simulation inputs (tax rate sliders, growth assumptions, etc.) in v1.
- No changes to accountability score weighting in v1.

Deferred after v1:

- Inflation-adjusted toggle and basis-year conversion.
- Distributional breakdown by household income band.
- Scenario editor for user-defined assumptions.

## 7. Acceptance Criteria

1. Data readiness
- `src/data/financial-impact-inputs.json` and `src/data/economic-baselines.json` exist and validate against v1 schema.
- Every `impact_id` has at least one source URL and a valid year window.

2. Calculation correctness
- Derived annual values equal total/window-years for low, central, and high estimates.
- Per-household and per-capita outputs match denominator calculations within rounding tolerance.
- Negative values are rendered and labeled as savings.

3. App behavior
- Policy detail pages render calculator card when estimate exists.
- Executive action and key vote pages show calculator panel only when linked estimate exists.
- Missing estimate paths render explicit empty state without runtime errors.

4. Transparency and UX
- UI shows estimate window, confidence, and last-updated timestamp.
- Source links are visible and keyboard accessible.
- Disclaimer is present on all calculator surfaces.

5. Regression safety
- Existing policy/action/vote pages continue to render when calculator artifacts are missing or empty.
