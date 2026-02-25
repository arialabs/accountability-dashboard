# Issue #50: Affected Programs Tracker Plan

## 1. Objective

Design and ship a first version of an Affected Programs Tracker that links government actions to impacted public programs and surfaces that impact clearly in the app.

This plan defines data sources, pipeline design, schema, UI surfacing, minimal v1 scope, and acceptance criteria.

## 2. Data Sources

### 2.1 Required for v1

1. Existing executive actions artifact: `src/data/executive-actions.json`
- Primary event stream for policy actions and dates.
- Used as the canonical action record in v1.

2. Existing policy impact dataset: `src/data/policy-impacts.json`
- Source for impact descriptions and affected-domain context.
- Used to seed affected-program mappings where available.

3. Program reference catalog (new static artifact): `src/data/program-catalog.json`
- Curated list of major federal programs tracked in v1.
- Includes stable program IDs and taxonomy metadata.

4. Manual curation overlay (new): `src/data/affected-program-links.json`
- Human-reviewed action-to-program links with confidence and source notes.
- Used to avoid speculative automatic inference in v1.

### 2.2 Optional for v1.1+

1. Federal Register document text metadata for richer action-program matching.
2. USAspending recipient/agency data for budget-level context by program.
3. Agency press release feeds for direct program-level implementation signals.

### 2.3 Source-of-truth and freshness

- Source of truth for action records: `executive-actions.json`.
- Source of truth for program taxonomy: `program-catalog.json`.
- Source of truth for impact linkage: `affected-program-links.json`.
- Refresh cadence (v1): regenerate on normal data pipeline runs (daily or current project cadence).
- UI must show a `last_updated` timestamp and confidence level per linkage.

## 3. Pipeline Plan

### 3.1 New pipeline module

Add `pipeline/sources/affected-programs.ts` with these stages:

1. Extract actions
- Load executive actions and impact records.

2. Normalize actions
- Build a stable action key and normalize dates, categories, and source URLs.

3. Join against curated mappings
- Match actions to program IDs from `affected-program-links.json`.
- Carry link confidence (`high|medium|low`) and `source_notes`.

4. Validate program references
- Ensure every `program_id` exists in `program-catalog.json`.
- Reject orphaned mappings and log errors.

5. Build output artifacts
- `pipeline/output/affected-programs.json` (debug + metrics).
- `src/data/affected-programs.json` (runtime artifact).

6. Emit summary metrics
- actions processed
- actions with >=1 affected program
- unmapped actions
- invalid program references

### 3.2 Reliability and fallback behavior

1. Pipeline should not hard-fail on partial mapping gaps.
2. If link artifact fails validation, preserve last-known-good runtime artifact.
3. Log structured warnings for unmapped actions and low-confidence mappings.

## 4. Schema

### 4.1 New runtime artifact: `src/data/affected-programs.json`

Shape: `Record<string, AffectedProgramsRecord>` keyed by normalized `action_id`.

```ts
export interface AffectedProgramLink {
  program_id: string;
  program_name: string;
  impact_type: "expanded" | "reduced" | "restructured" | "at_risk" | "unclear";
  confidence: "high" | "medium" | "low";
  source_url?: string;
  source_notes?: string[];
}

export interface AffectedProgramsRecord {
  action_id: string;
  action_title: string;
  action_date: string; // ISO date
  action_type: "executive_order" | "memo" | "rule" | "other";
  affected_programs: AffectedProgramLink[];
  last_updated: string; // ISO timestamp
}
```

### 4.2 New supporting artifact: `src/data/program-catalog.json`

Proposed fields:

- `program_id: string` (stable key, e.g. `medicaid`)
- `program_name: string`
- `agency: string`
- `category: "health" | "education" | "housing" | "labor" | "energy" | "tax" | "justice" | "other"`
- `description: string`
- `is_v1_tracked: boolean`

### 4.3 Types and loaders

1. Add interfaces in `src/lib/types.ts`.
2. Add loader/helper in `src/lib/data.ts`:
- `getAffectedProgramsByAction(actionId: string)`
- `getAffectedProgramsSummaryByProgram(programId: string)` (optional for list views).

## 5. UI Surfacing

### 5.1 Executive action detail/list surfaces (v1)

Add an "Affected Programs" block where executive actions are shown:

1. Show affected program chips/list per action.
2. Show impact type badge (`expanded`, `reduced`, etc.).
3. Show confidence indicator and source note tooltip.
4. Show empty state: "No verified program linkage yet."

### 5.2 Program-centric tracker view (v1)

Add a minimal route: `/executive/president/programs` (or existing executive section equivalent):

1. Program rows/cards with:
- program name
- count of linked actions
- latest linked action date
- dominant impact type

2. Click-through opens filtered action list for that program.

3. Header includes source/freshness disclosure and caveat text:
- "Links are evidence-based and may be incomplete in early coverage."

### 5.3 Design and UX constraints

1. Keep the section informational, not a scoring/ranking mechanism in v1.
2. Avoid causal claims beyond cited linkage notes.
3. Preserve existing executive timeline behavior when no affected-program data exists.

## 6. Minimal v1 Scope

1. Data
- Curate a starter `program-catalog.json` (target: 20-30 major programs).
- Maintain manual mapping file for action-to-program links.
- Generate `src/data/affected-programs.json` in pipeline.

2. Pipeline
- Add `affected-programs` source module with validation and run metrics.

3. App layer
- Add types and read helpers for affected-program records.

4. UI
- Show affected-program chips on executive action surfaces.
- Add a simple program-centric tracker page with linked action counts.

5. Guardrails
- No automatic speculative NLP mapping in v1.
- No weighting into existing accountability score.

Deferred after v1:

- Automatic text/entity matching with model-assisted suggestions.
- Program budget trend overlays.
- Cross-branch impacts (legislative + judicial) in one unified tracker.

## 7. Acceptance Criteria

1. Data artifact generation
- Pipeline produces `src/data/affected-programs.json` and validates schema successfully.
- 100% of emitted `program_id` values resolve to entries in `program-catalog.json`.

2. Coverage baseline
- At least 30% of v1 action records have at least one verified affected-program link, or unmet coverage is explicitly reported in pipeline summary output.

3. App behavior
- Loader functions return normalized data or safe empty results without uncaught exceptions.
- Executive action UI renders affected programs when present and clear empty states when absent.

4. Program tracker UX
- Program page lists tracked programs with linked-action counts and latest update date.
- Program detail/filter view shows only linked actions for selected program.

5. Transparency
- Every rendered linkage includes confidence level.
- If a linkage has evidence notes or source URL, it is displayed in UI metadata.

6. Regression safety
- Existing executive pages continue to render when affected-program artifact is missing or empty.

## 8. Implementation Sequence

1. Finalize `program-catalog` and linkage schema.
2. Implement `pipeline/sources/affected-programs.ts` and runtime artifact output.
3. Add type definitions and data-access helpers.
4. Add affected-program UI block in executive action surfaces.
5. Add minimal program-centric tracker route.
6. Add validation tests and basic rendering tests for empty/populated states.
