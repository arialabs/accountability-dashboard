# Issue #52: Public Sentiment Tracking Plan

## 1. Objective

Introduce a transparent public-sentiment signal for each member profile using three source categories:

1. Social discussion volume/sentiment.
2. News coverage tone.
3. Polling/survey approval signals.

The v1 goal is a stable, explainable sentiment context layer for users, not a predictive model.

## 2. Goals and Non-Goals

### Goals (v1)

1. Ingest at least one reliable source from each category: social, news, surveys.
2. Normalize all source outputs into a single member-keyed schema.
3. Publish a daily-updated artifact consumable by app routes/components.
4. Surface sentiment in UI with clear confidence, freshness, and methodology labels.

### Non-Goals (v1)

1. Real-time streaming sentiment updates.
2. Claiming causal links between sentiment changes and single events.
3. Feeding sentiment directly into accountability grade/scoring weights.
4. Full multilingual NLP coverage.

## 3. Data Sources

Use one primary source per category in v1, with explicit fallbacks for v1.1+.

### 3.1 Social Sources

1. Primary (v1): Reddit API/Pushshift-compatible discussion sampling for member names/handles.
- Reason: public, high-volume discussion with clear time windows.
- Output: mention count, positive/neutral/negative distribution, source volume score.

2. Optional (v1.1+): YouTube comments, Bluesky/X public posts where policy permits.

### 3.2 News Sources

1. Primary (v1): GDELT 2.0 Events + Mentions APIs for tone and volume.
- Output: article/mention counts, average tone, source diversity.

2. Optional (v1.1+): MediaCloud or curated publisher RSS sentiment pipeline.

### 3.3 Surveys/Polling Sources

1. Primary (v1): FiveThirtyEight/polling-provider datasets and state/national approval trend sources where available.
- Output: approval/disapproval/net approval and poll sample metadata.

2. Optional (v1.1+): District-level private aggregators if licensing permits.

### 3.4 Freshness and Source-of-Truth Rules

1. Refresh cadence (v1): daily batch run.
2. Serve last-known-good artifact on source failures.
3. UI must show `last_updated` and per-source lookback windows.

## 4. Pipeline Design

### 4.1 Extract

1. Build member aliases (full name, common short name, handle/keyword variants).
2. Query each source for a fixed lookback (v1: trailing 30 days).
3. Persist raw snapshots to `pipeline/output/public-sentiment-raw/` for debug/audit.

### 4.2 Transform

1. Deduplicate posts/articles by stable id/url hash.
2. Remove obvious spam/bot-like records using simple heuristics (repost ratio, low-content repeats).
3. Normalize sentiment outputs to common scale (`-1.0` to `1.0`).
4. Compute per-source quality scores using coverage + source diversity.

### 4.3 Aggregate

1. Compute source-level scores:
- `social_score`
- `news_score`
- `survey_score`

2. Compute combined score with conservative weighting (v1 default):
- social: 0.30
- news: 0.30
- surveys: 0.40

3. Compute directional trend vs previous window:
- `improving`, `flat`, `declining`

4. Attach confidence tier:
- `high`, `medium`, `low` based on minimum volume and source availability.

### 4.4 Load

1. Emit normalized artifact: `src/data/public-sentiment.json`.
2. Emit run summary: `pipeline/output/public-sentiment-metrics.json`.
3. Keep partial records with explicit `missing_sources` rather than dropping members.

## 5. Schema

### 5.1 Runtime artifact schema (`src/data/public-sentiment.json`)

Shape: `Record<string, PublicSentimentProfile>` keyed by `bioguide_id`.

```ts
interface PublicSentimentProfile {
  bioguide_id: string;
  window_start: string; // ISO date
  window_end: string; // ISO date
  overall_sentiment_score: number; // -1.0 to 1.0
  sentiment_trend: "improving" | "flat" | "declining";
  confidence: "high" | "medium" | "low";
  sources_used: Array<"social" | "news" | "survey">;
  missing_sources: Array<"social" | "news" | "survey">;
  social: {
    mention_count: number;
    sentiment_score: number; // -1.0 to 1.0
    source_diversity: number;
  } | null;
  news: {
    article_count: number;
    sentiment_score: number; // -1.0 to 1.0
    source_diversity: number;
  } | null;
  survey: {
    poll_count: number;
    approval: number | null;
    disapproval: number | null;
    net_approval: number | null;
    sentiment_score: number; // -1.0 to 1.0
  } | null;
  last_updated: string; // ISO timestamp
  source_notes?: string[];
}
```

### 5.2 Validation rules

1. All sentiment score fields must be finite and within `[-1, 1]`.
2. `overall_sentiment_score` must equal weighted aggregation of available source scores.
3. `confidence` must degrade when fewer than 2 sources are present.
4. If no sources are available, create a null-like record with `confidence: low` and explanatory `source_notes`.

## 6. UI Surfacing Plan

### 6.1 Member detail page (v1)

Add `PublicSentimentSection` with:

1. Sentiment summary card:
- Overall score label (positive/neutral/negative).
- Trend indicator (`improving/flat/declining`).
- Confidence badge.

2. Source breakdown rows:
- Social, News, Survey score + volume (mentions/articles/polls).
- Missing-source state per row.

3. Methodology and freshness footer:
- Last updated timestamp.
- 30-day lookback note.
- Link to methodology documentation.

### 6.2 Dashboard/listing surface (v1.1+)

1. Filter/sort by trend and confidence.
2. Time-series microchart across windows.

## 7. Minimal v1 Scope

1. One production source integrated per category (social + news + survey).
2. Daily batch ETL and static artifact generation.
3. Member-page sentiment section only (no homepage ranking).
4. Conservative heuristic sentiment (lexicon/model mix acceptable, no heavy custom ML training).
5. Confidence + missing-source transparency required for every record.

## 8. Acceptance Criteria

1. Data coverage
- At least 90% of members have a sentiment profile artifact record.
- At least 75% of members have two or more source categories populated.

2. Pipeline reliability
- Daily pipeline run succeeds and emits both runtime artifact and metrics summary.
- On single-source outage, pipeline still emits records with `missing_sources` populated.

3. Data quality
- Schema validation passes with no out-of-range sentiment values.
- Weighted aggregation checks pass for 100% of emitted records.

4. UI behavior
- Member detail page renders sentiment summary, source breakdown, and freshness/methodology labels.
- Missing data states are explicit and do not cause rendering errors.

5. Product guardrails
- Sentiment is labeled as contextual signal, not objective truth.
- Sentiment data does not modify accountability grade calculation in v1.
