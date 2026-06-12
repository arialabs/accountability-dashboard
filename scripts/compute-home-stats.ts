#!/usr/bin/env tsx
/**
 * Generate src/data/home-stats.json — all data-bearing numbers shown on the
 * homepage hero/spotlight, computed from the actual data files at build time
 * so they can't silently drift from reality.
 *
 * Inputs: members.json, key-votes.json, cabinet.json, leadership-finance.json,
 *         leadership-donors.json
 * Output: src/data/home-stats.json
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../src/data");

const read = (name: string) =>
  JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf-8"));

const members: Array<{
  bioguide_id: string;
  party_loyalty_pct?: number | null;
  votes_cast?: number;
}> = read("members.json");
const keyVotes: Array<{ votes: Record<string, string> }> = read("key-votes.json");
const cabinet: { members: unknown[] } = read("cabinet.json");
const leadershipFinance: Array<{
  bioguide_id: string;
  name: string;
  cycle: number;
  total_raised: number;
  pac_percentage: number;
}> = read("leadership-finance.json");
const leadershipDonors: Array<{
  bioguide_id: string;
  top_pac_donors: Array<{ name: string; total: number; interest_area: string }>;
}> = read("leadership-donors.json");

// ── Site-wide stats ──────────────────────────────────────────────────────────

const MIN_VOTES = 10; // same threshold as /congress/independence
const INDEPENDENCE_LOYALTY_CUTOFF = 90;

const scorable = members.filter((m) => (m.votes_cast ?? 0) >= MIN_VOTES);
const independentReps = scorable.filter(
  (m) =>
    typeof m.party_loyalty_pct === "number" &&
    m.party_loyalty_pct > 0 &&
    m.party_loyalty_pct < INDEPENDENCE_LOYALTY_CUTOFF
);

const votesAnalyzed = keyVotes.reduce(
  (sum, v) => sum + Object.keys(v.votes).length,
  0
);

// ── Leadership spotlight stats ───────────────────────────────────────────────

function financeFor(bioguideId: string) {
  return leadershipFinance.find((f) => f.bioguide_id === bioguideId) ?? null;
}

function memberFor(bioguideId: string) {
  return members.find((m) => m.bioguide_id === bioguideId) ?? null;
}

/** Normalize donor interest-area label variants into one sector bucket. */
function sectorLabel(area: string): string {
  const a = area.toLowerCase();
  if (a.includes("telecom")) return "Telecom";
  if (a.includes("bank") || a.includes("finance")) return "Banking";
  if (a.includes("defense")) return "Defense";
  if (a.includes("real estate")) return "Real Est";
  if (a.includes("alcohol")) return "Alcohol";
  if (a.includes("health") || a.includes("pharma")) return "Health";
  if (a.includes("energy") || a.includes("oil")) return "Energy";
  return area.length > 9 ? `${area.slice(0, 8)}…` : area;
}

function topDonorSectors(bioguideId: string, count = 5) {
  const record = leadershipDonors.find((d) => d.bioguide_id === bioguideId);
  if (!record) return [];

  const totals = new Map<string, number>();
  for (const donor of record.top_pac_donors) {
    const label = sectorLabel(donor.interest_area);
    totals.set(label, (totals.get(label) ?? 0) + donor.total);
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, count);
  const max = sorted[0]?.[1] ?? 1;
  return sorted.map(([label, total]) => ({
    label,
    total,
    pct: Math.round((total / max) * 100),
  }));
}

function caucusBreaks(bioguideId: string) {
  const m = memberFor(bioguideId);
  if (!m || typeof m.party_loyalty_pct !== "number" || !m.votes_cast) return null;
  return {
    votes_cast: m.votes_cast,
    party_loyalty_pct: m.party_loyalty_pct,
    breaks: Math.round((m.votes_cast * (100 - m.party_loyalty_pct)) / 100),
  };
}

const FEATURED_ID = "E000294"; // Tom Emmer
const SUPPORTING_IDS = ["T000250", "C001101"]; // John Thune, Katherine Clark

const featuredFinance = financeFor(FEATURED_ID);

const output = {
  meta: {
    generated_at: new Date().toISOString(),
    sources: [
      "members.json (Congress.gov / Voteview)",
      "key-votes.json (Voteview)",
      "leadership-finance.json (FEC)",
      "leadership-donors.json (FEC Schedule A)",
      "cabinet.json",
    ],
  },
  site_stats: {
    members_total: members.length,
    executive_officials: (cabinet.members?.length ?? 0) + 2, // + President, VP
    votes_analyzed: votesAnalyzed,
    independent_reps: independentReps.length,
    independence_loyalty_cutoff: INDEPENDENCE_LOYALTY_CUTOFF,
  },
  spotlight: {
    featured: {
      bioguide_id: FEATURED_ID,
      total_raised: featuredFinance?.total_raised ?? null,
      pac_percentage: featuredFinance?.pac_percentage ?? null,
      cycle: featuredFinance?.cycle ?? null,
      party_loyalty_pct: memberFor(FEATURED_ID)?.party_loyalty_pct ?? null,
      donor_sectors: topDonorSectors(FEATURED_ID),
    },
    supporting: SUPPORTING_IDS.map((id) => ({
      bioguide_id: id,
      total_raised: financeFor(id)?.total_raised ?? null,
      pac_percentage: financeFor(id)?.pac_percentage ?? null,
      cycle: financeFor(id)?.cycle ?? null,
      caucus: caucusBreaks(id),
    })),
  },
};

fs.writeFileSync(
  path.join(DATA_DIR, "home-stats.json"),
  JSON.stringify(output, null, 2)
);

console.log("home-stats.json written:");
console.log(JSON.stringify(output.site_stats, null, 2));
