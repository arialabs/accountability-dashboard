#!/usr/bin/env tsx
/**
 * Fetch campaign finance data from OpenFEC API
 * 
 * Usage: FEC_API_KEY=xxx tsx scripts/fetch-finance.ts
 * 
 * For each member of Congress:
 * 1. Find their FEC candidate ID
 * 2. Fetch financial totals (raised, spent, cash on hand)
 * 3. Fetch donor breakdown (PAC vs individual, small vs large)
 * 4. Fetch top contributors and industries
 * 
 * Output: src/data/finance.json
 * Source: https://api.open.fec.gov/v1
 */

import * as fs from "fs";
import * as path from "path";

const API_BASE = "https://api.open.fec.gov/v1";
const API_KEY = process.env.FEC_API_KEY || "DEMO_KEY";
const CURRENT_CYCLE = 2024;

const MEMBERS_PATH = path.join(__dirname, "../src/data/members.json");
const OUTPUT_PATH = path.join(__dirname, "../src/data/finance.json");

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
  "District of Columbia": "DC", "Puerto Rico": "PR",
};

interface FinanceRecord {
  candidate_id: string;
  cycle: number;
  total_raised: number;
  total_spent: number;
  cash_on_hand: number;
  individual_contributions: number;
  pac_contributions: number;
  party_contributions: number;
  candidate_self_funding: number;
  small_donors: number;
  large_donors: number;
  pac_percentage: number;
  small_donor_percentage: number;
  large_donor_percentage: number;
  top_contributors: Array<{ name: string; total: number; count: number; type: string }>;
  top_industries: Array<{ industry: string; total: number }>;
  data_source: "openfec";
  last_fetched: string;
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const wait = Math.pow(2, i) * 5000;
        console.log(`  ⏳ Rate limited, waiting ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

function getStateCode(state: string): string {
  return STATE_CODES[state] || state;
}

async function findCandidateId(name: string, state: string, chamber: string): Promise<string | null> {
  const stateCode = getStateCode(state);
  const office = chamber === "senate" ? "S" : "H";
  const url = `${API_BASE}/candidates/search/?q=${encodeURIComponent(name)}&state=${stateCode}&office=${office}&cycle=${CURRENT_CYCLE}&api_key=${API_KEY}`;
  
  try {
    const data = await fetchWithRetry(url);
    if (data.results && data.results.length > 0) {
      const exact = data.results.find((r: any) => 
        r.name?.toUpperCase().includes(name.split(" ").pop()?.toUpperCase() || "")
      );
      return (exact || data.results[0]).candidate_id;
    }
  } catch {
    // Not all members have FEC records
  }
  return null;
}

async function fetchFinancials(candidateId: string): Promise<any> {
  const url = `${API_BASE}/candidate/${candidateId}/totals/?cycle=${CURRENT_CYCLE}&api_key=${API_KEY}`;
  try {
    const data = await fetchWithRetry(url);
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

function buildFinanceRecord(candidateId: string, totals: any): FinanceRecord {
  const totalRaised = totals.receipts || totals.total_receipts || 0;
  const individualContrib = totals.individual_contributions || totals.individual_itemized_contributions || 0;
  const pacContrib = totals.other_political_committee_contributions || totals.pac_contributions || 0;
  const partyContrib = totals.political_party_committee_contributions || 0;
  const selfFunding = totals.candidate_contribution || 0;
  const smallDonors = totals.individual_unitemized_contributions || 0;
  const largeDonors = totals.individual_itemized_contributions || 0;

  const safeDiv = (n: number, d: number) => d > 0 ? Math.round((n / d) * 1000) / 10 : 0;

  return {
    candidate_id: candidateId,
    cycle: CURRENT_CYCLE,
    total_raised: totalRaised,
    total_spent: totals.disbursements || totals.total_disbursements || 0,
    cash_on_hand: totals.cash_on_hand_end_period || totals.last_cash_on_hand_end_period || 0,
    individual_contributions: individualContrib,
    pac_contributions: pacContrib,
    party_contributions: partyContrib,
    candidate_self_funding: selfFunding,
    small_donors: smallDonors,
    large_donors: largeDonors,
    pac_percentage: safeDiv(pacContrib, totalRaised),
    small_donor_percentage: safeDiv(smallDonors, totalRaised),
    large_donor_percentage: safeDiv(largeDonors, totalRaised),
    top_contributors: [], // Requires schedule_a aggregation (separate expensive step)
    top_industries: [],   // Requires schedule_a aggregation (separate expensive step)
    data_source: "openfec",
    last_fetched: new Date().toISOString(),
  };
}

async function main() {
  console.log("=".repeat(50));
  console.log("Campaign Finance Fetch Script");
  console.log("=".repeat(50));
  console.log(`Source: OpenFEC API`);
  console.log(`Cycle: ${CURRENT_CYCLE}`);
  console.log(`Output: ${OUTPUT_PATH}\n`);

  if (API_KEY === "DEMO_KEY") {
    console.warn("⚠️  Using DEMO_KEY — very limited rate. Set FEC_API_KEY for production.\n");
  }

  if (!fs.existsSync(MEMBERS_PATH)) {
    console.error(`❌ ${MEMBERS_PATH} not found. Run fetch-members.ts first.`);
    process.exit(1);
  }

  const members = JSON.parse(fs.readFileSync(MEMBERS_PATH, "utf-8"));
  console.log(`📋 Processing ${members.length} members...\n`);

  const finance: Record<string, FinanceRecord> = {};
  let found = 0, notFound = 0;
  const batchSize = 2;
  const batchDelay = 6000;

  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize);
    await Promise.all(batch.map(async (member: any) => {
      const candidateId = await findCandidateId(member.full_name, member.state, member.chamber);
      if (!candidateId) { notFound++; return; }
      const totals = await fetchFinancials(candidateId);
      if (!totals) { notFound++; return; }
      finance[member.bioguide_id] = buildFinanceRecord(candidateId, totals);
      found++;
    }));

    if (i % 20 === 0) {
      console.log(`  ${Math.min(i + batchSize, members.length)}/${members.length} (found: ${found}, missing: ${notFound})`);
    }
    await new Promise(r => setTimeout(r, batchDelay));
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finance, null, 2));

  console.log(`\n✅ Wrote ${OUTPUT_PATH}`);
  console.log(`   With data: ${found} | Missing: ${notFound}`);
  
  const records = Object.values(finance);
  if (records.length > 0) {
    const avg = (field: keyof FinanceRecord) => 
      records.reduce((s, r) => s + (r[field] as number), 0) / records.length;
    console.log(`   Avg PAC %: ${avg("pac_percentage").toFixed(1)}%`);
    console.log(`   Avg Small Donor %: ${avg("small_donor_percentage").toFixed(1)}%`);
  }
}

main().catch(e => { console.error("❌", e); process.exit(1); });
