# Data Integrity Audit — Findings

**Audit date:** 2026-03-12
**Scope:** All JSON data files in `src/data/` (37 files)
**Auditor:** Automated analysis via Node.js scripts

---

## Summary Statistics

| Check | Total | Complete / OK | Partial / Issues |
|---|---|---|---|
| Members (members.json) | 538 | 538 (100%) | 0 missing required fields |
| Members with finance data | 538 | 9 (1.7%) | 529 have NO finance entry |
| Members with alignment scores | 538 | 254 (47.2%) | 284 have no alignment score |
| Members with position data | 538 | 270 (50.2%) | 268 have no position entry |
| Members with committee-conflicts | 538 | 117 (21.7%) | 421 have no entry |
| Members with trading-summaries | 538 | ~209 (match) | 127 stale IDs not in current members |
| Members with house-disclosures | 538 | 388 (72.1%) | 150 have no disclosure |
| Scandals with null bioguide_id | 53 total | 44 (83%) | 9 executive-branch entries with null |
| Key votes | 258 total | 82 have result | 176 (68.2%) have result = "Unknown" |
| StockTrade type vs actual data | — | — | 6 field name mismatches |
| Member type vs actual data | — | — | 5 field mismatches |
| Contributor type vs actual data | — | — | 2 mismatches |

---

## 1. Member Data Completeness

**File:** `src/data/members.json`

### 1.1 Core Field Completeness
**Severity: NONE — all 538 members are complete**

Every member has non-null, non-empty values for:
- `bioguide_id` (538/538, all unique — no duplicates)
- `full_name`, `party`, `state`, `chamber`
- `photo_url` (all are valid `https://` URLs or null; none are empty strings)
- `bills_sponsored`, `bills_cosponsored`, `votes_cast` (all numeric)

### 1.2 Members with `votes_cast = 0`
**Severity: minor**

9 members have `votes_cast = 0`. Six are legitimate non-voting delegates (DC, Puerto Rico, Guam, USVI, CNMI, American Samoa). Three are regular voting members with zero recorded votes — likely a data pipeline miss:

| bioguide_id | Name | Chamber | State |
|---|---|---|---|
| M001245 | Christian Menefee | House | Texas |
| S000033 | Bernard Sanders | Senate | Vermont |
| K000383 | Angus King | Senate | Maine |

**Suggested fix:** Re-run the Congress.gov votes sync for these three members. Sanders and King are Independents — verify the sync script handles non-D/R parties.

### 1.3 `party_loyalty_pct` Null for Same 9 Members
**Severity: minor**
`party_loyalty_pct` is null for all 9 members with `votes_cast = 0`. This is expected for delegates but is a data gap for Sanders, King, and Menefee.

### 1.4 Missing Optional Fields: `senate_class`, `next_election`, `ideology_score`
**Severity: major**
Zero members have `senate_class`, `next_election`, or `ideology_score` populated. These fields exist in the `Member` TypeScript interface (see type mismatch section below) but are absent from all 538 JSON entries. If this data is intended to be displayed, it must be populated.

---

## 2. Cross-File ID Consistency

### 2.1 finance.json
**Severity: critical**
Only **9 of 538 members** (1.7%) have finance entries. The 9 covered members are all congressional leadership (McConnell, Durbin, Johnson, Scalise, Emmer, Jeffries, Clark, Thune, Schumer). The remaining 529 members have no finance data.

All 9 IDs present in `finance.json` exist in `members.json` — no orphan IDs.

**Suggested fix:** Either populate finance data for all or most members, or add UI logic to gracefully handle absent finance entries for the vast majority of members. The current state makes the finance card silently empty for 99% of member pages.

### 2.2 alignment-scores.json
**Severity: major**
254 of 538 members (47.2%) have alignment score entries. 284 members are absent. All 254 IDs in `alignment-scores.json` exist in `members.json` — no orphan IDs.

**Suggested fix:** Run alignment scoring for the remaining 284 members (primarily House members with voting records).

### 2.3 scandals.json
**Severity: major**
9 of 53 scandal entries have `bioguide_id = null`. These are all executive-branch entries (Trump, Flynn, Petraeus, Libby, Albert Fall). The data model uses `bioguide_id` as the join key but executive officials do not have bioguide IDs.

Additionally, 25 of the 45 unique non-null bioguide IDs in `scandals.json` do not match any current member in `members.json`. These are former members (e.g., Santos S001135, Menendez M000639) who are no longer serving and have been removed from `members.json`.

**Suggested fix:**
1. Add an `official_type: "congress" | "executive"` discriminator field to `ScandalEntry`. For executive entries, use `official_id` instead of `bioguide_id`.
2. Update type interface: `ScandalEntry.state` should be optional — Trump's entries are missing `state`.
3. Keep former-member scandal entries but add a `is_former_member: true` flag so the UI can handle them.

### 2.4 key-votes.json
**Severity: none (ICPSR mapping is complete)**
All 540 unique ICPSR IDs found in vote records within `key-votes.json` have a corresponding entry in `icpsr-to-bioguide.json`. The mapping chain is intact.

One member — **Christian Menefee (M001245)** — is absent from `bioguide-to-icpsr.json`. He is a new member (TX-18 as of Jan 2025) whose ICPSR ID may not have been assigned yet. He already has `votes_cast = 0`, so this is consistent.

The `bioguide-to-icpsr.json` mapping has 10 extra IDs (former members) not present in current `members.json`. This is expected for a mapping file that accumulates entries.

### 2.5 committee-conflicts.json
**Severity: major**
Only 117 of 538 members have entries. Structure is an object keyed by `bioguide_id`. All 117 IDs match `members.json` — no orphans.

**Suggested fix:** Expand committee conflict analysis to cover all 538 members.

### 2.6 house-disclosures.json
**Severity: minor**
388 of 538 members have disclosure entries. The missing 150 are predominantly Senate members (the file is named `house-disclosures`), which is expected. All 388 `bioguideId` values match `members.json`.

**Field naming inconsistency (severity: minor):** `house-disclosures.json` uses `bioguideId` (camelCase) while every other data file uses `bioguide_id` (snake_case). This requires special-case handling in any code that reads both.

**Suggested fix:** Normalize to `bioguide_id` on next data refresh, or add a normalizer in the data loading layer.

### 2.7 trading-summaries.json
**Severity: major**
127 of the 336 keys in `trading-summaries.json` do **not** match any current member in `members.json`. These are stale entries for former members or members removed from the current roster. The 127 orphan IDs include IDs also found in the `bioguide-to-icpsr.json` mapping as "extras" (former members).

Additionally, `flag_rate` is stored as a **string** (e.g., `"75.4"`) in all 336 entries, not a number. Any code performing arithmetic on this field will receive NaN.

**Suggested fix:**
1. Prune `trading-summaries.json` to current member IDs only, or add a `is_current_member` flag.
2. Fix `flag_rate` to be a numeric type: `75.4` not `"75.4"`.

### 2.8 trades-by-member.json
**Severity: major (stale IDs) + minor (null company)**
Valid JSON: YES. Size: 74.9 MB. Contains 336 member entries with 109,156 total trades.

127 of 336 member IDs do not match current `members.json` (same set as `trading-summaries.json`). These are stale former-member entries.

All 109,156 trades have required fields populated: `ticker`, `tradedDate`, `transaction`, `tradeSizeUsd`. However, **all 109,156 trades have `company = null`** — the company name field is never populated despite being present in every trade object.

**Suggested fix:**
1. Populate `company` from a ticker-to-company lookup, or remove the field if unused.
2. Prune stale member IDs as with `trading-summaries.json`.
3. Given the 75 MB file size, consider splitting into per-member files (one JSON per bioguide_id in a `trades/` subdirectory) to avoid loading 75 MB on every page that needs a single member's trades.

---

## 3. Type Definition Accuracy

**Files:** `src/lib/types.ts`, `src/types/executive.ts`, `src/types/index.ts`

### 3.1 Member Interface vs members.json
**Severity: major**

| Field | Status | Detail |
|---|---|---|
| `party_alignment_pct` | In type, NOT in data | JSON has `party_loyalty_pct` instead |
| `ideology_score` | In type, NOT in data | Field absent from all 538 records |
| `senate_class` | In type, NOT in data | Field absent from all 538 records |
| `next_election` | In type, NOT in data | Field absent from all 538 records |
| `party_loyalty_pct` | In data, NOT in type | The actual field name used in JSON |

**Critical:** `party_alignment_pct` in the type vs `party_loyalty_pct` in the JSON means any code referencing `member.party_alignment_pct` will always return `undefined`.

**Suggested fix:** Rename `party_alignment_pct` → `party_loyalty_pct` in `src/lib/types.ts`, or rename the JSON field and all data. Also add `party_loyalty_pct: number | null` to the `Member` interface.

### 3.2 Contributor Interface vs finance.json
**Severity: major**

| Field | Status | Detail |
|---|---|---|
| `count: number` | In type, SOMETIMES missing | 2 of 9 finance entries (McConnell, Durbin) lack `count` on contributors |
| `type` value | Mismatch | Type allows `'individual' | 'pac' | 'party' | 'committee'`; data has `"Super PAC"`, `"Business PAC"`, `"Real Estate PAC"`, etc. |
| `employer`, `occupation` | In type, NOT in data | Optional in type, never present in data |

**Suggested fix:** Either broaden the `Contributor.type` to `string`, or normalize the data values to match the union type. The `count` field should be made optional (`count?: number`).

### 3.3 StockTrade Interface vs trades-by-member.json
**Severity: critical**

The `StockTrade` interface in `src/lib/types.ts` does not match the actual shape of trade data at all:

| Type field | Actual data field | Status |
|---|---|---|
| `disclosure_date` | `filedDate` | Renamed |
| `transaction_date` | `tradedDate` | Renamed |
| `company_name` | `company` | Renamed (and always null) |
| `asset_type` | (absent) | Field does not exist in data |
| `transaction_type` | `transaction` | Renamed; values differ ("purchase"/"sale" vs "Purchase"/"Sale") |
| `amount_range` | (absent) | Field does not exist in data |
| `amount_min`, `amount_max` | `tradeSizeUsd` | Different structure (range vs single value) |
| (absent) | `excessReturn` | Not in type |
| (absent) | `suspicious_flags` | Not in type |
| (absent) | `risk_score` | Not in type |

**Suggested fix:** Rewrite the `StockTrade` interface to match the actual data shape. The current type is entirely inconsistent with the real data.

### 3.4 TradingProfile Interface vs trading-summaries.json
**Severity: major**

The `TradingProfile` interface in `src/lib/types.ts` has fields `total_value_min`, `total_value_max`, `committee_related_trades`, `days_to_disclosure_avg`, and `flagged_trades: FlaggedTrade[]` — none of which exist in `trading-summaries.json`. The actual data has `total_risk_score`, `avg_risk_per_trade`, `avg_excess_return`, `suspicious_patterns`, and `overall_suspicion_level`.

**Suggested fix:** Rewrite `TradingProfile` to reflect actual data shape, or create a separate `TradingSummary` interface for `trading-summaries.json`.

### 3.5 BillVote Interface vs key-votes.json
**Severity: minor**

| Field | Status |
|---|---|
| `plainEnglishSummary` | In type, NOT in data (optional in type, so not a bug — but data never populates it) |
| `bill` | In data, NOT in type |

**Suggested fix:** Add `bill?: string` to `BillVote` interface.

### 3.6 Source Interface Conflict (executive.ts vs lib/types.ts)
**Severity: minor**

`Source` is defined in both `src/lib/types.ts` and `src/types/executive.ts` with slightly different `credibility_rating` values:
- `lib/types.ts`: `"high" | "medium"` (no "low")
- `executive.ts`: `"high" | "medium" | "low"`

`src/types/index.ts` re-exports executive.ts only. Code importing from `lib/types.ts` gets the narrower type.

**Suggested fix:** Unify to a single `Source` interface with `"high" | "medium" | "low"`.

---

## 4. Finance Data Quality

**File:** `src/data/finance.json`

- **Coverage:** 9 of 538 members (1.7%) — critically low
- **Members covered:** Congressional leadership only (House and Senate leaders from both parties)
- **Cycle consistency:** 7 entries use cycle 2024, 2 use cycle 2026 (McConnell, Durbin). Mixed cycles may cause incorrect UI display if a "current cycle" is assumed.
- **Percentage sums:** All 9 entries have `pac_percentage + small_donor_percentage + large_donor_percentage` that do NOT sum to 100. Sums range from 18.5 to 91.4. This is because these three categories are not mutually exclusive: PAC contributions are a separate dimension from itemized individual contributions. The percentages are each calculated as a share of `total_raised`, but the categories overlap (e.g., a large PAC contribution counts in both `pac_percentage` and would count as a "large donor"). This is potentially confusing in UI display.
- **Top contributor type values:** Do not match the `Contributor.type` union in `types.ts` (see section 3.2).

---

## 5. Scandals Data Quality

**File:** `src/data/scandals.json`

- **Total entries:** 53
- **Unique members with scandals (current + former):** 45 unique bioguide IDs (including null)
- **Current members with scandal data:** 20 (IDs that match `members.json`)
- **Former members with scandal data:** 25 (valid IDs but not in current `members.json`)
- **Null bioguide_id entries:** 9 (all executive-branch officials: Trump ×5, Flynn, Petraeus, Libby, Albert Fall)
- **Source URLs:** All source URLs start with `https://` — no bad URLs detected
- **Severity distribution:** conviction (30), ethics_violation (9), indictment (7), ethics_investigation (5), criminal_investigation (1), allegation (1)

**Members currently in `members.json` WITH scandal data:**

B001281, B001306, C000880, C001063, C001114, C001120, F000466, G000586, G000600, H001090, L000562, L000575, M001137, N000188, P000034, P000610, S001150, T000193, T000467, T000478

**Data issues:**
- 9 entries with `bioguide_id = null` and missing `state` field (executive-branch entries)
- No cross-link between executive scandal entries and cabinet officials in `cabinet.json`

---

## 6. Stock Trades Data

**File:** `src/data/trades-by-member.json`

- **Valid JSON:** YES
- **File size:** 74.9 MB
- **Total member entries:** 336
- **Total individual trades:** 109,156
- **Stale member IDs (not in members.json):** 127
- **Trades missing `ticker`:** 0
- **Trades missing `tradedDate`:** 0
- **Trades missing `transaction`:** 0
- **Trades missing `tradeSizeUsd`:** 0
- **Trades with `company = null`:** 109,156 (100%) — company name is never populated

**Major concern:** At 74.9 MB, this file is loaded in its entirety whenever any trade data is needed. A static Next.js export deploys this as a single 75 MB JSON bundle, which will cause severe performance issues in any page component that imports it. This file should be split per-member.

---

## 7. Key Votes Data

**File:** `src/data/key-votes.json`

- **Total votes:** 258
- **Chamber distribution:** Senate 189, House 69
- **Date range:** 2025-01-15 to 2026-01-30
- **All required fields present:** YES (id, congress, chamber, rollnumber, date, title, description, category, yea_count, nay_count, result, votes)
- **`result = "Unknown"`:** 176 of 258 votes (68.2%)
- **Average votes per key-vote:** 188.8 (ICPSR IDs per vote record)
- **Vote position format:** Keys are ICPSR IDs (numeric strings), values are "Yea"/"Nay"/"Not Voting"/"Present"

**Category distribution:**
| Category | Count |
|---|---|
| Economy & Taxes | 117 |
| National Security | 38 |
| Climate & Environment | 37 |
| Healthcare | 35 |
| Other | 13 |
| Immigration | 11 |
| Government Ethics | 6 |
| Voting Rights | 1 |

**Issues:**
- 68.2% of votes have `result = "Unknown"` despite `yea_count` and `nay_count` being populated. The `result` field can be derived from yea/nay counts for simple majority votes. 100 of the 176 "Unknown" votes have `yea_count > nay_count`.
- Senate is heavily over-represented (189 vs 69 House). The `Voting Rights` category has only 1 vote entry.
- `bill` field present in data but absent from `BillVote` type (see section 3.5).

**Suggested fix:** Compute `result` from yea/nay counts where currently "Unknown". For bills requiring supermajority (e.g., cloture at 60), document the threshold in the data model.

---

## 8. Additional Cross-File Findings

### 8.1 Alignment Scores for Zero-Vote Members
**Severity: minor**
Senator Angus King (K000383) has an alignment score in `alignment-scores.json` despite `votes_cast = 0` in `members.json`. This is an inconsistency — either his vote count needs updating or his alignment entry should be reviewed.

### 8.2 positions.json Coverage
**Severity: major**
Only 270 of 538 members (50.2%) have position data. All 270 IDs match `members.json`. The 268 missing members have no OnTheIssues.org data, which means the "say vs do" comparison feature is unavailable for half of Congress.

### 8.3 Members with Zero Bills and Zero Votes
**Severity: minor**
Christian Menefee (M001245, TX-18) has 0 bills sponsored, 0 bills cosponsored, 0 votes cast, and no alignment score. He appears as a new member stub with no legislative activity data. He is also the only member missing from `bioguide-to-icpsr.json`.

---

## Priority Fix List

| Priority | Issue | File(s) | Effort |
|---|---|---|---|
| P0-Critical | `StockTrade` interface completely mismatches actual data | `src/lib/types.ts` | Low — rewrite interface |
| P0-Critical | `party_alignment_pct` in type vs `party_loyalty_pct` in data | `src/lib/types.ts`, `members.json` | Low — rename field in type |
| P0-Critical | 75 MB trades file loaded whole; will cause perf issues | `src/data/trades-by-member.json` | High — split per-member |
| P1-Major | Finance data for only 9/538 members | `src/data/finance.json` | High — data sourcing |
| P1-Major | 127 stale member IDs in trading-summaries and trades-by-member | Both trading files | Medium — prune & sync |
| P1-Major | `flag_rate` stored as string not number | `src/data/trading-summaries.json` | Low — data fix |
| P1-Major | `TradingProfile` type mismatches trading-summaries data | `src/lib/types.ts` | Low — rewrite interface |
| P1-Major | 9 scandals with null bioguide_id (executive branch) need separate ID scheme | `src/data/scandals.json` | Medium — schema design |
| P1-Major | 176/258 key votes have `result = "Unknown"` | `src/data/key-votes.json` | Low — compute from yea/nay |
| P2-Minor | `house-disclosures.json` uses `bioguideId` (camelCase) not `bioguide_id` | `src/data/house-disclosures.json` | Low — normalize key |
| P2-Minor | `Contributor.type` union doesn't match actual values in data | `src/lib/types.ts` | Low — broaden type |
| P2-Minor | Sanders, King, Menefee show 0 votes despite being full voting members | `src/data/members.json` | Medium — data refresh |
| P2-Minor | `company = null` for all 109,156 trades | `src/data/trades-by-member.json` | High — data enrichment |
| P2-Minor | `BillVote` type missing `bill` field present in data | `src/lib/types.ts` | Low — add optional field |
| P2-Minor | `Source` interface defined twice with diverging `credibility_rating` | `src/lib/types.ts`, `src/types/executive.ts` | Low — unify |
