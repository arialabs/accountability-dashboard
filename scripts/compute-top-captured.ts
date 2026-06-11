#!/usr/bin/env tsx
/**
 * Regenerate src/data/top-captured.json from current finance data.
 *
 * "Captured" here means: highest share of campaign funding from PACs.
 * Congressional leadership is excluded (they're covered by the leadership
 * spotlight) and members below MIN_TOTAL_RAISED are excluded so tiny
 * campaigns with one PAC check don't dominate the list.
 *
 * Inputs:  src/data/members.json, src/data/finance.json, src/data/scandals.json
 * Output:  src/data/top-captured.json  ({ meta, entries })
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { LEADERSHIP_IDS } from "../src/lib/leadership.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../src/data");

const TOP_N = 50;
const MIN_TOTAL_RAISED = 100_000;

const STATE_ABBREV: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO",
  Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH",
  Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
  "District of Columbia": "DC",
};

const abbrev = (state: string) =>
  STATE_ABBREV[state] ?? state.slice(0, 2).toUpperCase();

interface Member {
  bioguide_id: string;
  full_name: string;
  party: string;
  state: string;
  district: number | null;
  chamber: string;
}

interface Finance {
  cycle: number;
  total_raised: number;
  pac_percentage: number;
  large_donor_percentage: number;
}

const members: Member[] = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "members.json"), "utf-8")
);
const finance: Record<string, Finance> = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "finance.json"), "utf-8")
);
const scandals: Array<{ bioguide_id: string }> = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "scandals.json"), "utf-8")
);

const scandalCounts = new Map<string, number>();
for (const s of scandals) {
  scandalCounts.set(s.bioguide_id, (scandalCounts.get(s.bioguide_id) ?? 0) + 1);
}

const entries = members
  .filter((m) => !LEADERSHIP_IDS.has(m.bioguide_id))
  .flatMap((m) => {
    const f = finance[m.bioguide_id];
    if (!f || !f.total_raised || f.total_raised < MIN_TOTAL_RAISED) return [];
    if (!f.pac_percentage || f.pac_percentage <= 0) return [];
    return [
      {
        bioguide_id: m.bioguide_id,
        name: m.full_name,
        role:
          m.chamber === "senate"
            ? `Sen. ${abbrev(m.state)}`
            : `Rep. ${abbrev(m.state)}-${m.district ?? "AL"}`,
        party: m.party,
        state: m.state,
        chamber: m.chamber,
        district: m.district ?? null,
        pac_percentage: f.pac_percentage,
        large_donor_percentage: f.large_donor_percentage ?? 0,
        total_raised: f.total_raised,
        scandals: scandalCounts.get(m.bioguide_id) ?? 0,
      },
    ];
  })
  .sort((a, b) => b.pac_percentage - a.pac_percentage)
  .slice(0, TOP_N);

const cycles = [...new Set(Object.values(finance).map((f) => f.cycle))].sort();

const output = {
  meta: {
    generated_at: new Date().toISOString(),
    source: "FEC via OpenFEC API",
    cycles,
    min_total_raised: MIN_TOTAL_RAISED,
    excluded: "congressional leadership",
  },
  entries,
};

fs.writeFileSync(
  path.join(DATA_DIR, "top-captured.json"),
  JSON.stringify(output, null, 2)
);

console.log(
  `Wrote ${entries.length} top-captured entries (cycles: ${cycles.join(", ")})`
);
