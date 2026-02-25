# Issue #104: Donor Data Integration + Analysis/Opinion Page Concept

## 1. Objective

Add a reliable donor-data pipeline and present it in two surfaces:

- Representative detail pages (factual donor transparency context).
- A new Analysis/Opinion page concept (clearly labeled editorial interpretation built on the same underlying data).

This plan defines implementation steps, schema updates, UI scope, and a minimal v1 that can ship safely.

## 2. Goals and Non-Goals

### Goals

- Standardize donor and campaign-finance data into a single internal schema.
- Keep factual data and editorial commentary separated at the data model and UI levels.
- Provide explainable donor context for each member (totals, source mix, top contributors).
- Launch a minimal Analysis/Opinion surface that references traceable source facts.

### Non-Goals (v1)

- Full investigative scoring of donor influence.
- Real-time streaming updates.
- Deep cross-cycle econometric analysis.
- Automatically generated legal/compliance judgments.

## 3. Data Sources

## 3.1 Required for v1

1. OpenFEC API (`api.open.fec.gov/v1`)
- Candidate search and ID mapping.
- Candidate totals for current cycle.
- Top contributors (where available).

2. Existing member identity data (Congress.gov-derived member dataset already in repo)
- Bioguide ID linkage.
- Chamber/state/district metadata for display and joins.

## 3.2 Optional for v1.1+

1. OpenSecrets (industry/lobby context).
2. Historical FEC cycles beyond current/most recent cycle.
3. Committee-level finance and independent expenditure overlays.

## 3.3 Source-of-truth and freshness

- Source of truth for numeric donor values: OpenFEC responses normalized into pipeline outputs.
- Refresh cadence (v1): daily pipeline run + on-demand fallback route with short cache TTL.
- UI must display the cycle and last-updated timestamp.

## 4. Pipeline Implementation Plan

1. Member-to-candidate mapping
- Input: member profile (`bioguide_id`, name, chamber, state).
- Action: resolve FEC `candidate_id` via search endpoint + disambiguation rules.
- Output: stable mapping table persisted in pipeline artifacts.

2. Financial totals fetch
- Pull totals for the target cycle (v1: current cycle only).
- Normalize receipts, disbursements, cash on hand, PAC/individual/party buckets.

3. Contributor fetch
- Pull top contributors endpoint for mapped candidates.
- Handle 404/empty results as expected non-fatal outcomes.

4. Derived metrics
- Compute: `pac_percentage`, `small_donor_percentage`, `large_donor_percentage`.
- Add confidence flags (example: `data_completeness` = `high|medium|low`).

5. Validation and quality gates
- Numeric sanity checks (non-negative, finite values).
- Percentage bounds and tolerance checks.
- Required-field checks by record type.

6. Persist build artifacts
- `src/data/finance.json` (normalized member-keyed finance records).
- `src/data/finance-mapping.json` (bioguide-to-candidate mapping, debug metadata).

7. Runtime serving
- Continue API route pattern (`/api/finance/[bioguideId]`) with:
  - static artifact read first;
  - optional live refresh attempt;
  - cache headers + fallback behavior.

8. Monitoring hooks
- Log structured fetch failures by endpoint/type.
- Track key run metrics: mapped members %, records with contributor data %, fetch error rate.

## 5. Schema Changes

## 5.1 Data artifact schema (`src/data/finance.json`)

Add/confirm fields:

- `bioguide_id: string`
- `candidate_id: string | null`
- `cycle: number`
- `total_raised: number`
- `total_spent: number`
- `cash_on_hand: number`
- `individual_contributions: number`
- `pac_contributions: number`
- `party_contributions: number`
- `small_donors: number`
- `large_donors: number`
- `pac_percentage: number`
- `small_donor_percentage: number`
- `large_donor_percentage: number`
- `top_contributors: Array<{ name: string; total: number; count?: number; type: 'individual' | 'pac' | 'party' | 'committee' }>`
- `data_completeness: 'high' | 'medium' | 'low'`
- `last_updated: string` (ISO timestamp)
- `source_notes: string[]` (optional human-readable caveats)

## 5.2 Analysis/Opinion content schema (new)

Proposed new artifact: `src/data/analysis-opinions.json`

- `id: string`
- `slug: string`
- `title: string`
- `member_bioguide_id: string`
- `published_at: string` (ISO)
- `updated_at: string` (ISO)
- `stance: 'supports' | 'questions' | 'mixed'`
- `summary: string`
- `claims: Array<{ claim: string; evidence: string; evidence_type: 'finance_metric' | 'vote' | 'public_statement'; source_ref: string }>`
- `methodology_version: string`
- `editorial_disclaimer: string`

Design rule: no computed editorial claim without at least one explicit `source_ref` and `evidence` entry.

## 5.3 Type and API updates

- Update/confirm `MemberFinance` TypeScript type in `src/lib/types.ts`.
- Add `AnalysisOpinion` type.
- Add optional API route for opinion entries (v1 can be static-file-backed server component).

## 6. UI Plan

## 6.1 Representative detail page (existing surface)

Section: `DonorAnalysisSection` enhancements

- Top row KPI cards: total raised, PAC %, small donor %, cash on hand.
- Contributor list with clear "data may be incomplete" state.
- Source and freshness line: cycle + last updated.
- Methodology tooltip linking to donor-plan docs/methodology page.

## 6.2 New Analysis/Opinion page concept

Route concept: `/analysis` (index) and `/analysis/[slug]` (detail)

Index sections:

1. Editorial policy banner
- Explicit label: "Analysis/Opinion".
- Clarifies facts vs interpretation.

2. Featured analysis cards
- Member name, stance tag, last updated, short summary.

3. Filter controls (minimal)
- Chamber, party, stance.

Detail sections:

1. Thesis block
- Short editorial thesis.

2. Evidence table
- Claims mapped to explicit sources and finance metrics.

3. Counterpoints
- Required section for balanced framing (even if brief).

4. Data appendix
- Raw finance metrics snapshot and cycle context.

5. Disclaimer/footer
- Not legal advice; interpretation may evolve with new filings.

## 7. Minimal v1 Scope

Ship v1 with the smallest complete loop:

1. Data
- Current-cycle OpenFEC totals + top contributors when available.
- Daily pipeline generation of normalized finance artifact.

2. Member page
- Improve existing donor section with completeness + freshness metadata.

3. Analysis/Opinion
- Launch `/analysis` + one template-driven opinion detail page fed from static JSON.
- Manual editorial entries (no auto-generation).

4. Guardrails
- Hard separation in UI labels and schema between factual data and opinion content.

Deferred after v1:

- Industry-level enrichment.
- Multi-cycle trends.
- Automated ranking/scoring of donor influence.

## 8. Acceptance Criteria

1. Pipeline
- For at least 95% of current members, `bioguide_id -> candidate_id` mapping is resolved or explicitly marked unmapped.
- `finance.json` is generated with required v1 fields and passes validation checks.
- Pipeline logs summary metrics for mapping coverage and error rate.

2. API/Data access
- `getMemberFinance(bioguideId)` returns normalized schema and never throws uncaught errors for missing records.
- Missing/partial records surface `data_completeness` and `source_notes`.

3. Member UI
- Donor section renders KPI cards, contributors (or explicit empty-state), and cycle/last-updated line.
- If live API fails, page still renders from static artifact.

4. Analysis/Opinion UI
- `/analysis` route lists entries with stance tags and updated dates.
- `/analysis/[slug]` renders thesis + evidence + disclaimer sections.
- Every claim shown has at least one source reference.

5. Editorial safety
- Analysis/Opinion surfaces are explicitly labeled and visually distinct from factual data widgets.

6. Quality
- Type checks pass.
- Existing finance integration tests continue passing; new tests added for opinion schema validation and page rendering basics.

## 9. Implementation Sequence

1. Schema + type finalization (`MemberFinance` + `AnalysisOpinion`).
2. Pipeline mapping/normalization and artifact generation updates.
3. Validation + tests for finance and opinion schemas.
4. Member donor UI enhancements.
5. New Analysis/Opinion routes and static content wiring.
6. QA pass for fallback states, labels, and content integrity.

## 10. Open Questions

1. Should v1 analysis entries be staff-authored only, or allow external contributor drafts?
2. What minimum evidence threshold is required per opinion claim (1 source vs 2+ sources)?
3. Do we show unmapped members publicly in `/analysis`, or hide until mapping is resolved?
4. Should contributor names be normalized (dedupe aliases/LLC variants) in v1, or deferred?
5. Is cycle selection user-configurable in v1, or fixed to current cycle with explicit label?
6. What legal/compliance review is required before publishing donor-linked opinion text?

## 11. Out-of-Scope Risks to Track

- Candidate-name ambiguity can create mapping errors without robust disambiguation.
- OpenFEC endpoint variability (especially contributor endpoint) can reduce completeness.
- Users may interpret editorial claims as factual unless labels/disclaimers are prominent.

