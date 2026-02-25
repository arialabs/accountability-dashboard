# Issue #23: EPIC - Government Accountability Platform v1.0

## 1. Objective

Define a concrete v1.0 delivery plan for a Government Accountability Platform that unifies legislative, executive, and judicial accountability surfaces into one coherent, source-transparent product baseline.

This epic plan sets scope boundaries, milestones, dependencies on related issues, MVP checklist items, and acceptance criteria for release readiness.

## 2. Scope

### In Scope (v1.0)

1. Core accountability surfaces across all three branches:
- Legislative: member profiles, voting records, finance/conflict context, key vote tracking.
- Executive: president actions/conflicts, cabinet profiles, timeline surfaces.
- Judicial: Supreme Court profiles and detail pages.

2. Source-backed transparency features:
- Last-updated/freshness indicators where data latency is material.
- Methodology visibility and source attribution in major accountability modules.

3. Baseline pipeline reliability:
- Scheduled ingestion for implemented sources.
- Idempotent updates and basic run observability artifacts/logging.

4. Cross-feature consistency:
- Shared data quality expectations for schema validation, null handling, and fallback behavior.
- Consistent UI state handling for loading/error/empty scenarios.

### Out of Scope (v1.0)

1. Real-time push notifications and per-user alerting.
2. Full historical backfills for every dataset.
3. Predictive ranking/ML-driven corruption forecasting.
4. New paid/external infrastructure requirements beyond current stack.

## 3. Milestones

### Milestone 1: Foundation and Data Integrity

Target outcome:
- Stable canonical data artifacts and schema compatibility across branch modules.

Deliverables:
1. Validate baseline data contracts used by `src/data/*.json` and route-level loaders.
2. Confirm ingestion jobs produce deterministic/idempotent outputs.
3. Establish freshness/error handling conventions used by downstream UI.

### Milestone 2: Legislative Accountability Core

Target outcome:
- Production-ready legislative surfaces with vote, finance, and conflict context.

Deliverables:
1. Integrate near-real-time vote ingestion plan outputs.
2. Ensure campaign finance integration remains stable and source-attributed.
3. Verify member detail pages expose accountability context without regressions.

### Milestone 3: Executive Accountability Core

Target outcome:
- Cohesive executive branch tracking with policy/action/conflict visibility.

Deliverables:
1. Deliver executive tracker baseline and supporting data model.
2. Integrate federal register and spending/impact context where planned.
3. Ensure executive pages follow common status/freshness conventions.

### Milestone 4: Judicial Accountability Core

Target outcome:
- Standardized SCOTUS profile coverage integrated with judicial navigation.

Deliverables:
1. Deliver complete justice profile schema/data for current court.
2. Ensure detail pages include profile metadata and source transparency.
3. Confirm fallback behavior for optional/missing fields.

### Milestone 5: Release Hardening and v1.0 Signoff

Target outcome:
- End-to-end v1 readiness with documented quality gates.

Deliverables:
1. Regression pass on top routes and branch-specific critical flows.
2. Data-quality spot checks and stale/failure mode verification.
3. Final release checklist completion and owner signoff.

## 4. Dependencies on Other Issues

The epic depends on planning and/or delivery outputs from the following issues.

### Core Dependencies (Required for v1.0)

1. Issue #30 - Real-Time Vote Tracking Integration
- Dependency type: Legislative data freshness and canonical roll-call pipeline.
- Why it matters: Provides the vote recency/reconciliation backbone for legislative accountability.

2. Issue #43 - Executive Branch Tracker
- Dependency type: Executive feature baseline and accountability model.
- Why it matters: Defines core executive data surfaces required for branch completeness in v1.

3. Issue #25 - Supreme Court Justice Profiles
- Dependency type: Judicial profile completeness and source structure.
- Why it matters: Establishes minimum judicial accountability coverage in v1.

4. Issue #5 - FEC Campaign Finance Integration (Completed)
- Dependency type: Campaign finance data foundation.
- Why it matters: Supports conflict/influence context in legislative scoring and profiles.

### Supporting Dependencies (Can land during v1 window if scoped)

1. Issue #45 - Federal Register API Integration
- Adds executive action provenance and timeline depth.

2. Issue #46 - USASpending.gov Integration
- Adds spending-beneficiary accountability context.

3. Issue #49 - Financial Impact Calculator
- Adds quantified policy impact context in executive/policy surfaces.

4. Issue #50 - Affected Programs Tracker
- Adds program-level accountability framing for policy changes.

5. Issue #52 - Public Sentiment Tracking
- Adds contextual sentiment telemetry; non-blocking for core accountability release.

### Dependency Management Rules

1. v1 launch requires all core dependencies complete and validated.
2. Supporting dependencies can be deferred if doing so does not break branch-level minimum functionality.
3. Any dependency delay must include a documented fallback and explicit scope cut.

## 5. MVP Checklist

- [ ] v1 epic plan document approved by maintainers.
- [ ] Legislative branch core pages load with current, source-attributed data.
- [ ] Executive branch core pages load with action/conflict context and freshness metadata.
- [ ] Judicial branch SCOTUS profiles are complete for current justices.
- [ ] Data ingestion jobs run on schedule with no blocking failures for 24h.
- [ ] Error, stale, and empty states are present on key accountability surfaces.
- [ ] Methodology/source transparency is visible on major accountability modules.
- [ ] Regression tests pass for critical routes and data loaders.
- [ ] Release notes summarize v1 scope, deferred items, and known limitations.

## 6. Acceptance Criteria

Issue #23 is complete when all criteria below are met:

1. Documentation completeness
- `docs/gov-accountability-v1-epic.md` exists and includes scope, milestones, dependencies, MVP checklist, and risks.

2. Scope control
- v1 in-scope and out-of-scope boundaries are explicit and review-approved.
- Core dependencies are identified as required vs. supporting.

3. Milestone readiness
- Each milestone has an explicit target outcome and concrete deliverables.
- Dependency gating logic is documented for release decisions.

4. Release quality gates
- MVP checklist includes data reliability, UX state handling, and test/regression requirements.
- Risks include mitigations and owner/action expectations.

5. Traceability
- Related issue IDs are listed in a dependency section and mapped to why each is needed.
- Any deferred dependency has a fallback/scope-cut rule.

## 7. Risks and Mitigations

1. Risk: Scope creep across multiple branches
- Impact: Delays or fragmented release quality.
- Mitigation: Enforce core vs. supporting dependency gates and defer non-core features.

2. Risk: Data freshness/reliability variance by source
- Impact: Stale or inconsistent accountability views.
- Mitigation: Standardize freshness metadata, fallback rules, and run-level observability.

3. Risk: Inconsistent transparency UX across modules
- Impact: User trust erosion and unclear provenance.
- Mitigation: Require source/methodology visibility and consistent state patterns before signoff.

4. Risk: Regressions from parallel issue merges
- Impact: Breakage in shared data loaders/routes.
- Mitigation: Run route-level regression suite plus targeted smoke tests for each branch area.

5. Risk: Dependency slippage in supporting features
- Impact: Overcommitment to broad v1 narrative.
- Mitigation: Publish explicit deferred list in release notes and preserve core branch completeness.

## 8. Suggested Execution Order

1. Lock epic scope and dependency gates (this issue).
2. Complete/validate core dependency issues (#30, #43, #25).
3. Run cross-branch integration and regression hardening.
4. Pull in supporting dependencies only if they do not jeopardize v1 date.
5. Final signoff with MVP checklist and acceptance criteria review.
