#!/usr/bin/env tsx
/**
 * Seed finance.json with FEC data for members currently missing it.
 *
 * This script:
 * 1. Reads members.json to find all members
 * 2. Reads existing finance.json
 * 3. Fetches data from FEC API for members not yet in finance.json
 * 4. Writes merged data back to finance.json
 *
 * Usage:
 *   FEC_API_KEY=your_key tsx scripts/seed-finance.ts [--only-missing] [--limit N]
 *   FEC_API_KEY=your_key tsx scripts/seed-finance.ts --bioguide M000355,D000563
 */

import * as fs from "fs";
import * as path from "path";

const FEC_API_BASE = "https://api.open.fec.gov/v1";
const API_KEY = process.env.FEC_API_KEY;

if (!API_KEY) {
  console.error("❌ FEC_API_KEY not set. Export it first:");
  console.error("   export FEC_API_KEY=your_key");
  process.exit(1);
}

// Most recent completed cycle used as fallback
const FALLBACK_CYCLE = 2024;
// Current cycle: snap to next even year if needed
const currentYear = new Date().getFullYear();
const CURRENT_CYCLE = currentYear % 2 === 0 ? currentYear : currentYear + 1;

const STATE_CODES: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
  "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
  "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
  "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
  "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
  "District of Columbia": "DC",
};

function getStateCode(state: string): string {
  return STATE_CODES[state] || state;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJSON(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (res.status === 429) {
      console.log("  Rate limited, waiting 5s...");
      await sleep(5000);
      return fetchJSON(url);
    }
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function searchCandidate(
  firstName: string,
  lastName: string,
  state: string,
  office: "H" | "S"
): Promise<string | null> {
  const url = `${FEC_API_BASE}/candidates/search/?api_key=${API_KEY}&q=${encodeURIComponent(lastName)}&state=${state}&office=${office}&sort=-election_years&per_page=10`;
  const data = await fetchJSON(url);
  if (!data?.results?.length) return null;

  // Pick best match: prefer candidates whose name contains the first name
  const firstLower = firstName.toLowerCase();
  const lastLower = lastName.toLowerCase();
  const sorted = (data.results as Array<{ candidate_id: string; name: string; election_years?: number[] }>).sort((a, b) => {
    // Prefer recent elections
    const aMax = Math.max(...(a.election_years || [0]));
    const bMax = Math.max(...(b.election_years || [0]));
    return bMax - aMax;
  });

  // First try exact first-name match in FEC name (format: "LAST, FIRST")
  const exact = sorted.find(c => {
    const parts = c.name.toLowerCase().split(",");
    return parts[1]?.trim().startsWith(firstLower[0]) && parts[0].includes(lastLower);
  });
  if (exact) return exact.candidate_id;

  // Fallback: most recent candidate with matching last name
  return sorted[0]?.candidate_id || null;
}

async function getFinancials(candidateId: string, cycle: number): Promise<any | null> {
  const url = `${FEC_API_BASE}/candidate/${candidateId}/totals/?api_key=${API_KEY}&cycle=${cycle}&sort=-cycle`;
  const data = await fetchJSON(url);
  if (!data?.results?.length) return null;
  return data.results[0];
}

async function getContributors(candidateId: string, cycle: number): Promise<any[]> {
  const url = `${FEC_API_BASE}/candidate/${candidateId}/schedules/schedule_a/by_contributor/?api_key=${API_KEY}&cycle=${cycle}&sort=-total&per_page=10`;
  const data = await fetchJSON(url);
  return data?.results || [];
}

async function fetchMemberFinance(member: {
  bioguide_id: string;
  first_name: string;
  last_name: string;
  state: string;
  chamber: string;
}) {
  const office = member.chamber === "house" ? "H" : "S";
  const stateCode = getStateCode(member.state);

  const candidateId = await searchCandidate(member.first_name, member.last_name, stateCode, office);
  if (!candidateId) return null;

  // Try current cycle, fallback to 2024
  let totals = await getFinancials(candidateId, CURRENT_CYCLE);
  let cycle = CURRENT_CYCLE;

  if (!totals || (totals.receipts || 0) < 1000) {
    totals = await getFinancials(candidateId, FALLBACK_CYCLE);
    cycle = FALLBACK_CYCLE;
  }

  if (!totals) return null;

  const contributors = await getContributors(candidateId, cycle);

  const totalRaised = totals.receipts || 0;
  const pacContributions = totals.other_political_committee_contributions || 0;
  const individualContributions = totals.individual_contributions || 0;
  const smallDonors = totals.individual_unitemized_contributions || 0;
  const largeDonors = totals.individual_itemized_contributions || 0;

  return {
    candidate_id: candidateId,
    cycle,
    total_raised: Math.round(totalRaised),
    total_spent: Math.round(totals.disbursements || 0),
    cash_on_hand: Math.round(totals.cash_on_hand_end_period || 0),
    individual_contributions: Math.round(individualContributions),
    pac_contributions: Math.round(pacContributions),
    party_contributions: Math.round(totals.political_party_committee_contributions || 0),
    candidate_self_funding: Math.round(totals.candidate_contribution || 0),
    small_donors: Math.round(smallDonors),
    large_donors: Math.round(largeDonors),
    pac_percentage: totalRaised > 0 ? Math.round((pacContributions / totalRaised) * 1000) / 10 : 0,
    small_donor_percentage: totalRaised > 0 ? Math.round((smallDonors / totalRaised) * 1000) / 10 : 0,
    large_donor_percentage: totalRaised > 0 ? Math.round((largeDonors / totalRaised) * 1000) / 10 : 0,
    top_contributors: contributors.slice(0, 10).map((c: any) => ({
      name: c.contributor_name || "Unknown",
      total: c.total || 0,
      count: c.count || 1,
      type: c.committee_id ? "pac" : "individual",
    })),
    top_industries: [],
  };
}

async function main() {
  const args = process.argv.slice(2);
  const onlyMissing = args.includes("--only-missing");
  const limitArg = args.find(a => a.startsWith("--limit="))?.split("=")[1];
  const limit = limitArg ? parseInt(limitArg, 10) : Infinity;
  const bioguideArg = args.find(a => a.startsWith("--bioguide="))?.split("=")[1];
  const targetBioguides = bioguideArg ? bioguideArg.split(",") : null;

  const srcDataDir = path.resolve("./src/data");

  // Read members.json
  const members = JSON.parse(fs.readFileSync(`${srcDataDir}/members.json`, "utf-8")) as Array<{
    bioguide_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    state: string;
    chamber: string;
  }>;

  // Read existing finance.json
  let existingData: Record<string, any> = {};
  const financeJsonPath = `${srcDataDir}/finance.json`;
  if (fs.existsSync(financeJsonPath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(financeJsonPath, "utf-8"));
    } catch {
      // fresh start
    }
  }

  console.log(`\n📊 Finance Seed Script`);
  console.log(`  Members: ${members.length}`);
  console.log(`  Existing finance records: ${Object.keys(existingData).length}`);
  console.log(`  Current cycle: ${CURRENT_CYCLE}, Fallback: ${FALLBACK_CYCLE}`);
  console.log(`  API key: ${API_KEY!.substring(0, 8)}...`);

  // Determine which members to process
  let toProcess = members;
  if (targetBioguides) {
    toProcess = members.filter(m => targetBioguides.includes(m.bioguide_id));
    console.log(`  Processing ${toProcess.length} specific members: ${targetBioguides.join(", ")}`);
  } else if (onlyMissing) {
    toProcess = members.filter(m => !existingData[m.bioguide_id]);
    console.log(`  Processing ${toProcess.length} members without finance data`);
  } else {
    console.log(`  Processing all ${toProcess.length} members`);
  }

  if (toProcess.length > limit) {
    toProcess = toProcess.slice(0, limit);
    console.log(`  Limited to first ${limit} members`);
  }

  const result: Record<string, any> = { ...existingData };
  let found = 0;
  let errors = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const member = toProcess[i];
    process.stdout.write(`\r  [${i + 1}/${toProcess.length}] ${member.full_name}...                    `);

    try {
      const finance = await fetchMemberFinance({
        bioguide_id: member.bioguide_id,
        first_name: member.first_name,
        last_name: member.last_name,
        state: member.state,
        chamber: member.chamber,
      });

      if (finance && finance.total_raised > 0) {
        result[member.bioguide_id] = finance;
        found++;
      }
    } catch (err) {
      errors++;
    }

    // Rate limiting: 1 request per 500ms for the search + 2 for data = ~1.5s per member
    await sleep(800);
  }

  console.log(`\n\n✓ Fetched data for ${found}/${toProcess.length} members (${errors} errors)`);
  console.log(`  Total records in finance.json: ${Object.keys(result).length}`);

  // Write back
  fs.writeFileSync(financeJsonPath, JSON.stringify(result, null, 2));
  console.log(`✓ Wrote ${financeJsonPath}`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
