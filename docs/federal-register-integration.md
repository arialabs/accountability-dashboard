# Issue #45: Federal Register API Integration Plan

## 1. Objective

Integrate Federal Register data as a first-class source for executive accountability so users can reliably track executive orders and related presidential/agency actions with source links and freshness metadata.

This plan defines endpoint usage, pipeline flow, schema updates, UI surfacing, a minimal v1 scope, and acceptance criteria.

## 2. Endpoint Plan

Primary API base: `https://www.federalregister.gov/api/v1`

### 2.1 Core v1 endpoints

1. `GET /documents.json`
- Executive orders query:
  - `conditions[type]=PRESDOCU`
  - `conditions[presidential_document_type]=executive_order`
  - `conditions[president]={slug}` (v1 default: `donald-trump`)
  - `conditions[publication_date][gte|lte]` for backfill/incremental windows
  - `per_page`, `page`, `order=newest`
- Used for the primary order list and pipeline ingestion.

2. `GET /documents/{document_number}.json`
- Used to enrich selected records with additional details as needed (full text metadata, document context).
- v1 can call this selectively (major orders only) to limit latency.

### 2.2 v1.1+ endpoints (deferred)

1. `GET /documents.json` with:
- `conditions[president]={slug}` (all presidential documents)
- `conditions[agency_ids][]=...` and optional `conditions[type]=RULE|PRORULE|NOTICE`
- Enables agency-level action views beyond executive orders.

### 2.3 Reliability controls

1. Retry `429` and `5xx` with exponential backoff and jitter.
2. Cap page traversal per run and resume next run if needed.
3. Record endpoint + query context in structured logs for failure analysis.
4. Preserve last-known-good artifact when upstream API is unavailable.

## 3. Pipeline Design

### 3.1 Extraction

1. Add/extend `pipeline/sources/federal-register.ts` as the canonical client.
2. Pull executive orders by date window:
- Backfill mode: fixed historical window.
- Incremental mode: `last_successful_publication_date` -> now.
3. Paginate until exhausted or run cap reached.

### 3.2 Transformation

Normalize each document to a stable internal shape:

- Identity: `document_number`, `executive_order_number`
- Core content: `title`, `abstract`, `type`, `subtype`
- Dates: `publication_date`, `signing_date`
- Links: `html_url`, `pdf_url`, `body_html_url`
- Context: `agencies[]`, `citation`, `start_page`, `end_page`
- Derived fields: `category`, `significance`, `is_major`

### 3.3 Loading

1. Write pipeline artifact: `pipeline/output/executive-orders.json`.
2. Write runtime artifact: `src/data/executive-orders.json`.
3. Include top-level metadata:
- `generated_at`
- `source` (`federal_register`)
- `api_version` (`v1`)
- `query_window`
- `record_count`

### 3.4 Validation and quality gates

1. Reject records missing `document_number`, `title`, or URLs.
2. Enforce date parseability for `publication_date`.
3. De-duplicate by `document_number`.
4. Emit run metrics:
- fetched, accepted, rejected, deduped
- retry_count
- oldest/newest publication date in artifact

## 4. Schema Changes

### 4.1 TypeScript interfaces

Update/add types in `src/lib/types.ts` (or `src/data/executive-types.ts`) for a stable FR-backed model:

```ts
export interface FederalRegisterDocumentLite {
  document_number: string;
  executive_order_number?: number;
  title: string;
  abstract?: string;
  publication_date: string;
  signing_date?: string;
  type: string;
  subtype?: string;
  html_url: string;
  pdf_url?: string;
  body_html_url?: string;
  agencies: Array<{ id: number; name: string }>;
  citation?: string;
}

export interface ExecutiveOrdersArtifact {
  generated_at: string;
  source: "federal_register";
  api_version: "v1";
  query_window: { start?: string; end?: string };
  record_count: number;
  orders: FederalRegisterDocumentLite[];
}
```

### 4.2 Optional SQL alignment (if DB-backed ingestion is enabled)

`database/schema-executive.sql` already includes `executive_orders` with FR-friendly fields. For stronger idempotency, v1 should add:

1. Unique constraint/index on `federal_register_number`.
2. Optional index on `publication_date` for incremental sync lookups.

## 5. UI Surfacing

### 5.1 v1 surfaces

1. Executive orders page (`/executive/president/orders`)
- Show order number, title, signing/publication date, abstract.
- Provide links to Federal Register HTML/PDF.
- Show source attribution and refresh cadence.

2. Executive timeline (`/executive/timeline`)
- Add executive-order events from FR artifact.
- Include category/significance tags when available.

### 5.2 UX/data handling requirements

1. Empty state when no orders match filter.
2. Failure state with fallback to last successful artifact.
3. Visual freshness indicator: "Last updated {timestamp}".
4. Preserve SSR-safe behavior and avoid client-only dependency for core listing.

## 6. Minimal v1 Scope

1. Ingest executive orders only (`presidential_document_type=executive_order`).
2. Single president slug configurable via env/config (default `donald-trump`).
3. One runtime artifact (`src/data/executive-orders.json`) refreshed on pipeline run.
4. Read-only UI list with source links and freshness metadata.
5. No sentiment scoring, no cross-president comparisons, no full-text NLP.

## 7. Acceptance Criteria

1. Endpoint integration
- Pipeline successfully calls `GET /documents.json` with executive-order filters and pagination.
- Retries are applied for `429/5xx`, and failures are logged with endpoint context.

2. Data correctness
- 100% of stored records include `document_number`, `title`, and at least one source URL.
- No duplicate `document_number` entries in the final artifact.

3. Artifact contract
- `src/data/executive-orders.json` conforms to documented schema and includes metadata (`generated_at`, `record_count`, `query_window`).

4. UI surfacing
- `/executive/president/orders` renders the artifact records with working links to Federal Register pages.
- UI shows source attribution and last-updated timestamp.

5. Operational safety
- On upstream outage, app continues serving the last-known-good artifact.
- Pipeline exits with non-zero status only on hard-failure conditions (e.g., invalid artifact write), not transient single-request failures.

## 8. Out of Scope (v1)

1. Agency-wide regulations/notice ingestion.
2. Historical ingestion for all presidents.
3. Automated impact scoring from full text.
4. User-facing filters by agency/topic beyond basic list ordering.
