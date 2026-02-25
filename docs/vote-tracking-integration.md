# Issue #30: Real-Time Vote Tracking Integration Plan

## 1. Objective

Implement a reliable near-real-time vote tracking pipeline that ingests roll call updates, normalizes member vote records, and surfaces freshness-aware vote status in the UI.

This plan defines v1 scope using two sources (Congress.gov and ProPublica), required pipeline and schema updates, and acceptance criteria.

## 2. Goals and Non-Goals

### Goals (v1)

1. Ingest and normalize recent House and Senate roll call votes on a recurring schedule.
2. Reconcile Congress.gov and ProPublica data into a single canonical vote record model.
3. Store source provenance and sync status so stale/partial records are visible.
4. Surface vote freshness and latest activity in existing app vote surfaces.

### Non-Goals (v1)

1. Second-by-second streaming updates.
2. Full historical backfill of all prior congresses.
3. New scoring/ranking models based on real-time vote momentum.
4. Push notifications to end users.

## 3. Data Sources

### 3.1 Congress.gov (Primary Source of Truth)

1. API base: `https://api.congress.gov/v3`
2. Endpoints used in v1:
- `house-vote/{congress}`
- `senate-vote/{congress}`
- linked XML roll call records for per-member vote positions
3. Why primary:
- Official federal source for roll calls and vote metadata.
- Already integrated in `pipeline/sources/congress-votes.ts`.
4. Known limitations:
- Occasional publication lag and endpoint irregularities.
- Chamber-specific response and XML shape differences.

### 3.2 ProPublica Congress API (Secondary/Fallback)

1. API base: `https://api.propublica.org/congress/v1`
2. Endpoints used in v1:
- `/house/votes/recent.json`
- `/senate/votes/recent.json`
- `/members/{bioguideId}/votes.json` for targeted backfill/reconciliation
3. Why secondary:
- Strong uptime and quick recent-vote summaries.
- Useful for mismatch detection and gap-filling during Congress.gov failures.
4. Known limitations:
- Different identifiers/field naming than Congress.gov.
- May omit fields needed for complete canonical bill linkage.

### 3.3 Source Priority and Freshness Rules

1. Canonical vote metadata priority: Congress.gov, then ProPublica fallback.
2. Member vote positions: prefer official roll call XML from Congress.gov when present.
3. Freshness target (v1): poll every 5 minutes during configured hours; outside window every 15 minutes.
4. Serve last-known-good records if both sources fail; annotate stale state in data and UI.

## 4. Pipeline Design

### 4.1 Extract

1. Scheduler triggers `pipeline/sync-votes.ts` on a short interval.
2. Fetch recent House and Senate vote lists from Congress.gov.
3. Fetch recent vote summaries from ProPublica in parallel.
4. Pull member-level roll call details (Congress XML first, ProPublica member vote fallback when needed).

### 4.2 Normalize and Reconcile

1. Normalize source payloads into canonical fields:
- `roll_call_id`, `congress`, `chamber`, `session`, `bill_id`, `question`, `result`, `vote_date`, `vote_position`.
2. Build deterministic roll call key format:
- `{congress}-{chamber}-{roll_call_number}`.
3. Reconcile conflicts:
- If both sources match: mark `reconciliation_status=matched`.
- If source mismatch: keep Congress.gov canonical value, flag discrepancy for review.
- If Congress.gov missing but ProPublica present: ingest provisional record flagged as fallback.

### 4.3 Load and Idempotency

1. Upsert canonical roll call metadata and member votes.
2. Preserve idempotency with unique constraints on `(bioguide_id, roll_call_id)`.
3. Store source provenance and sync timestamps for each row.
4. Keep sync run metrics (fetched, inserted, updated, mismatched, failed).

### 4.4 Reliability and Operations

1. Retry policy: exponential backoff for transient 429/5xx errors.
2. Circuit-breaker behavior per source to prevent cascading failures.
3. Emit pipeline run summary artifact:
- `pipeline/output/vote-sync-metrics.json`.
4. Alert conditions (v1 basic):
- no successful sync for >30 minutes,
- mismatch rate above threshold,
- sharp drop in member vote coverage.

## 5. Schema Changes

Current schema includes `votes` but lacks explicit roll call metadata/provenance tracking. v1 adds minimal supporting structures.

### 5.1 New table: `roll_calls`

Purpose: one row per roll call event so member votes do not duplicate shared metadata.

Proposed fields:

- `roll_call_id TEXT PRIMARY KEY`
- `congress INTEGER NOT NULL`
- `chamber TEXT NOT NULL` (`house|senate`)
- `session INTEGER`
- `roll_call_number INTEGER NOT NULL`
- `bill_id TEXT`
- `question TEXT`
- `result TEXT`
- `vote_date DATE NOT NULL`
- `source_primary TEXT NOT NULL` (`congress_gov|propublica`)
- `source_secondary TEXT`
- `reconciliation_status TEXT NOT NULL` (`matched|mismatch|fallback`)
- `last_synced_at DATETIME NOT NULL`
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`

### 5.2 Changes to existing `votes` table

Add fields:

- `chamber TEXT` (denormalized for query speed and compatibility)
- `source TEXT` (`congress_gov|propublica`)
- `is_provisional BOOLEAN DEFAULT FALSE`
- `last_synced_at DATETIME`

Constraints/indexes:

- keep `UNIQUE(bioguide_id, roll_call_id)`
- add `INDEX idx_votes_roll_call_id ON votes(roll_call_id)`
- add `INDEX idx_votes_last_synced ON votes(last_synced_at)`

### 5.3 Optional v1 artifact for UI serving

New runtime artifact: `src/data/live-votes.json`

- Member-keyed latest vote snapshot for fast UI reads.
- Includes `last_updated`, `is_stale`, and `source_notes`.

## 6. UI Surfacing Plan

### 6.1 Member Profile Vote Sections

1. Show "Last vote" card with:
- latest roll call title/question,
- member position,
- timestamp,
- source badge and staleness badge.
2. Add empty/loading/error states for members with no recent votes.
3. Keep existing alignment/say-vs-do sections unchanged in v1 except for freshness line.

### 6.2 Votes Listing Surface (`/votes`)

1. Add "Live" status indicator with last refresh timestamp.
2. Show per-vote reconciliation marker when data came from fallback.
3. Provide minimal filters:
- chamber,
- date (today/7d),
- source quality (`all|official_only|includes_fallback`).

### 6.3 Data Transparency

1. Add "Data freshness" legend and source links (Congress.gov, ProPublica).
2. Display clear caveat when records are provisional or stale.

## 7. Minimal v1 Scope

1. Sources:
- Congress.gov primary ingest for House/Senate recent roll calls.
- ProPublica as fallback and reconciliation source.
2. Pipeline:
- Scheduled sync every 5-15 minutes.
- Idempotent upsert with mismatch/provisional flags.
- Basic run metrics artifact.
3. Schema:
- Introduce `roll_calls` table and minimal `votes` provenance fields.
4. UI:
- freshness/status indicators on member and vote list surfaces.
- no new standalone product area.

Deferred after v1:

- Full historical backfill.
- Real-time websockets/SSE push.
- User alerts and subscriptions.
- Advanced discrepancy triage dashboard.

## 8. Acceptance Criteria

1. Data ingestion and coverage
- Scheduled sync executes successfully for 24 hours without manual intervention.
- For each sync window, at least 95% of roll calls fetched from Congress.gov are persisted with member vote rows.
- When Congress.gov fails, ProPublica fallback writes provisional records with explicit flags.

2. Reconciliation quality
- All canonical records include `source_primary`, `reconciliation_status`, and `last_synced_at`.
- Mismatched source records are retained with `reconciliation_status=mismatch` and do not crash ingestion.

3. Schema and query behavior
- New tables/columns migrate cleanly on existing DB.
- Core vote queries continue to work and can filter by `chamber`, `vote_date`, and freshness metadata.

4. UI behavior
- Member and votes pages display latest refresh timestamp and stale/provisional state.
- UI renders valid empty/error states when no recent votes are available.

5. Operational visibility
- `pipeline/output/vote-sync-metrics.json` is produced per run with counts for fetched, upserted, mismatched, failed.
- Failures are logged with source and endpoint context for debugging.
