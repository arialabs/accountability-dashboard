# Deep Dive Expansion Plan (Issue #21)

## Objective
Expand the Deep Dives section with additional high-impact investigations that are data-backed, non-partisan, and maintainable with the current content model.

## Current Baseline
As of February 25, 2026, the app includes 3 published deep dives:
1. Congressional stock trading
2. Pharma lobbying and drug prices
3. Defense contractor revolving door

## Proposed New Deep Dive Topics

### Priority 1 (v1 candidates)

#### 1) Supreme Court Ethics and Undisclosed Benefits
- Why it matters: Judicial accountability affects national policy and public trust.
- Key questions:
  - What gifts, travel, and financial relationships were undisclosed?
  - What disclosure rules existed at the time of each event?
  - What enforcement gaps remain after recent ethics-code updates?
- Candidate data points:
  - Disclosed vs. reported-but-undisclosed benefits
  - Timeline of reporting, investigations, and rule changes
  - Recusal-related controversies by case

#### 2) Congressional Earmarks and Donor Alignment
- Why it matters: Tracks whether federal spending benefits major donors or related entities.
- Key questions:
  - Which lawmakers requested earmarks tied to top contributors or clients?
  - What sectors and geographies receive repeated directed funding?
  - Are there disclosure or conflict flags in request forms?
- Candidate data points:
  - Earmark request amounts and recipients
  - Top donor overlap by cycle
  - Committee and jurisdiction context

#### 3) Cabinet and Executive Branch Conflicts of Interest
- Why it matters: Executive appointments can influence regulation, procurement, and enforcement.
- Key questions:
  - Which officials retained assets or relationships creating active conflicts?
  - What recusals, waivers, or ethics agreements were filed?
  - Which agencies had recurring conflict patterns?
- Candidate data points:
  - Conflict type taxonomy (financial, revolving door, family, procurement)
  - Agency-level conflict counts and severity
  - Resolution status and timeline

### Priority 2 (next wave)

#### 4) Federal Contract Awards and Political Influence
- Focus on contract growth tied to lobbying spend and political giving.

#### 5) Campaign Finance Loopholes and Dark-Money Routing
- Focus on PAC/nonprofit transfer chains and disclosure blind spots.

#### 6) Oversight Failures: Ethics Complaints vs. Outcomes
- Focus on how often complaints lead to formal action, sanctions, or closure without findings.

## Recommended Data Sources
Use primary sources first, then high-quality investigative outlets for corroboration.

### Government / primary datasets
- Senate and House financial disclosures
- House and Senate ethics committee documents and filings
- Supreme Court annual disclosure reports and code-of-conduct documents
- USAspending.gov award and recipient datasets
- Federal Election Commission (FEC) contribution and committee filings
- Lobbying Disclosure Act (LDA) filings via Senate disclosure portal
- Office of Government Ethics (OGE) forms, waivers, and ethics agreements
- Federal Register notices for relevant rulemaking and ethics guidance

### Secondary investigative/reference sources
- ProPublica
- OpenSecrets
- Campaign Legal Center reports
- Congressional Research Service (CRS) reports
- Major national outlets with document-backed investigative reporting

## Deep Dive Content Structure (Standard Template)
Each new deep dive should follow this structure so it maps directly to the existing rendering model.

1. Headline package
- Title, subtitle, description
- Published date and updated date
- Tags (3-6)

2. Executive summary
- 2-4 paragraphs with explicit thesis and scope boundaries

3. Key findings
- 4-8 bullet findings with quantitative facts

4. Timeline
- Major events in chronological order with dates and source links

5. Sectioned analysis
- Section A: What happened (facts and chronology)
- Section B: Money and influence patterns
- Section C: Rules, enforcement, and accountability gaps
- Section D: Impact and unresolved questions

6. Financial / quantitative tables
- Standardized metrics and units

7. Key individuals and entities
- Named officials, organizations, and their roles

8. Sources and methodology
- Source list with direct URLs
- Method notes on matching, assumptions, and limitations

## Minimal v1 Scope
Deliver exactly 2 new deep dives from Priority 1 to de-risk quality and review load.

### v1 deliverables
1. Two complete deep dive records in `src/data/deep-dives/` using current schema
2. `src/data/deep-dives/index.ts` updated to include both new entries
3. Fact-check pass with at least 12 sources per deep dive
4. Timeline and key findings populated for each
5. Basic UI verification on list page and detail pages

### Suggested v1 pair
1. Supreme Court Ethics and Undisclosed Benefits
2. Cabinet and Executive Branch Conflicts of Interest

## Acceptance Criteria
Issue #21 is complete when all criteria below are met:

1. Planning document exists at `docs/deep-dive-expansion.md` and includes:
- At least 6 proposed new topics
- Data source plan (primary + secondary)
- Standardized content structure
- Minimal v1 scope
- Explicit acceptance criteria

2. v1 scope is implementation-ready:
- Two Priority 1 investigations selected
- Required fields mapped to current `DeepDiveInvestigation` schema
- Source minimum and timeline minimum defined

3. Quality and accountability standards are documented:
- Primary-source-first sourcing policy
- Fact/claim traceability expectations
- Methodology notes requirement for assumptions/limitations

## Risks and Mitigations
- Risk: Source volatility or paywalled material
- Mitigation: Prefer public primary filings and keep secondary citations as corroboration.

- Risk: Perceived partisan framing
- Mitigation: Require bipartisan/systemic framing with explicit methodology and neutral language.

- Risk: Scope creep in first expansion
- Mitigation: Cap v1 to 2 deep dives and defer remaining topics to next wave.

## Out of Scope for Issue #21
- Writing full deep dive article content
- UI redesign for deep dive pages
- Schema changes beyond current model
