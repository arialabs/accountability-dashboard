/**
 * compute-donor-percentiles.ts
 *
 * Build-time script that reads finance.json + members.json and computes
 * per-industry donation percentiles across all members, grouped by chamber.
 *
 * Output: src/data/donor-percentiles.json
 *
 * Run: tsx scripts/compute-donor-percentiles.ts
 */

import * as fs from "fs";
import * as path from "path";

// ── Types ──────────────────────────────────────────────────────────────────────

interface IndustryDonation {
  industry: string;
  total: number;
  pac_amount: number;
  individual_amount: number;
}

interface FinanceRecord {
  candidate_id: string;
  cycle: number;
  total_raised: number;
  top_industries: IndustryDonation[];
}

interface MemberRecord {
  bioguide_id: string;
  full_name: string;
  party: string;
  state: string;
  chamber: "house" | "senate";
}

/** Percentile context for a single member+industry pair */
export interface IndustryPercentileContext {
  /** What percentile is this member in for their chamber (0–100) */
  chamber_percentile: number;
  /** Human-readable: "More than X% of senators" */
  chamber_label: string;
  /** Rank within member's state for this industry (1 = highest) */
  state_rank: number | null;
  /** Total members in this state with data for this industry */
  state_member_count: number | null;
  /** True if this member has the highest amount in their state */
  is_state_leader: boolean;
}

/** donor-percentiles.json shape */
export interface DonorPercentilesData {
  generated_at: string;
  /** bioguide_id → industry → percentile context */
  members: Record<string, Record<string, IndustryPercentileContext>>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function percentileOf(value: number, sortedValues: number[]): number {
  if (sortedValues.length === 0) return 50;
  if (sortedValues.length === 1) return 50;
  const below = sortedValues.filter((v) => v < value).length;
  const pct = Math.round((below / sortedValues.length) * 100);
  return pct;
}

function chamberLabel(percentile: number, chamber: "house" | "senate"): string {
  const noun = chamber === "senate" ? "senators" : "House members";
  if (percentile >= 99) return `Top 1% of all ${noun}`;
  if (percentile >= 90) return `Top ${100 - percentile}% of all ${noun}`;
  if (percentile >= 50) return `More than ${percentile}% of ${noun}`;
  if (percentile >= 25) return `Below average among ${noun}`;
  return `Among lowest ${100 - percentile}% of ${noun}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const root = path.resolve(__dirname, "..");

  const financeRaw = fs.readFileSync(path.join(root, "src/data/finance.json"), "utf8");
  const membersRaw = fs.readFileSync(path.join(root, "src/data/members.json"), "utf8");

  const finance: Record<string, FinanceRecord> = JSON.parse(financeRaw);
  const members: MemberRecord[] = JSON.parse(membersRaw);

  // Build lookup: bioguide_id → member
  const memberMap = new Map<string, MemberRecord>();
  for (const m of members) {
    memberMap.set(m.bioguide_id, m);
  }

  // Collect all industry amounts grouped by chamber
  // chamber → industry → [{ bioguide_id, amount }]
  const chamberIndustryAmounts: Record<
    string,
    Record<string, Array<{ bioguide_id: string; amount: number }>>
  > = { house: {}, senate: {} };

  // Also collect by state
  // state → industry → [{ bioguide_id, amount }]
  const stateIndustryAmounts: Record<
    string,
    Record<string, Array<{ bioguide_id: string; amount: number }>>
  > = {};

  for (const [bioguide_id, fin] of Object.entries(finance)) {
    const member = memberMap.get(bioguide_id);
    if (!member) continue;
    if (!fin.top_industries || fin.top_industries.length === 0) continue;

    const chamber = member.chamber;
    const state = member.state;

    if (!chamberIndustryAmounts[chamber]) {
      chamberIndustryAmounts[chamber] = {};
    }
    if (!stateIndustryAmounts[state]) {
      stateIndustryAmounts[state] = {};
    }

    for (const ind of fin.top_industries) {
      if (!chamberIndustryAmounts[chamber][ind.industry]) {
        chamberIndustryAmounts[chamber][ind.industry] = [];
      }
      chamberIndustryAmounts[chamber][ind.industry].push({
        bioguide_id,
        amount: ind.total,
      });

      if (!stateIndustryAmounts[state][ind.industry]) {
        stateIndustryAmounts[state][ind.industry] = [];
      }
      stateIndustryAmounts[state][ind.industry].push({
        bioguide_id,
        amount: ind.total,
      });
    }
  }

  // Pre-sort all chamber industry arrays ascending (for percentile computation)
  for (const chamber of Object.values(chamberIndustryAmounts)) {
    for (const arr of Object.values(chamber)) {
      arr.sort((a, b) => a.amount - b.amount);
    }
  }

  // Pre-sort all state industry arrays descending (for rank computation)
  for (const state of Object.values(stateIndustryAmounts)) {
    for (const arr of Object.values(state)) {
      arr.sort((a, b) => b.amount - a.amount);
    }
  }

  // Build per-member percentile context
  const result: DonorPercentilesData = {
    generated_at: new Date().toISOString(),
    members: {},
  };

  for (const [bioguide_id, fin] of Object.entries(finance)) {
    const member = memberMap.get(bioguide_id);
    if (!member) continue;
    if (!fin.top_industries || fin.top_industries.length === 0) continue;

    const chamber = member.chamber;
    const state = member.state;

    result.members[bioguide_id] = {};

    for (const ind of fin.top_industries) {
      const chamberArr = chamberIndustryAmounts[chamber]?.[ind.industry] ?? [];
      const sortedAmounts = chamberArr.map((x) => x.amount);
      const pct = percentileOf(ind.total, sortedAmounts);
      const label = chamberLabel(pct, chamber);

      // State rank
      const stateArr = stateIndustryAmounts[state]?.[ind.industry] ?? [];
      const stateRank =
        stateArr.length > 0
          ? stateArr.findIndex((x) => x.bioguide_id === bioguide_id) + 1
          : null;

      result.members[bioguide_id][ind.industry] = {
        chamber_percentile: pct,
        chamber_label: label,
        state_rank: stateArr.length > 0 ? stateRank : null,
        state_member_count: stateArr.length > 0 ? stateArr.length : null,
        is_state_leader: stateRank === 1 && stateArr.length > 1,
      };
    }
  }

  const outPath = path.join(root, "src/data/donor-percentiles.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`✅ donor-percentiles.json written — ${Object.keys(result.members).length} members processed`);
}

main();
