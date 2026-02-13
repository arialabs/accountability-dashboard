#!/usr/bin/env tsx
/**
 * Fetch all current members of Congress from Congress.gov API
 * 
 * Usage: CONGRESS_API_KEY=xxx tsx scripts/fetch-members.ts
 * 
 * Output: src/data/members.json
 * Source: https://api.congress.gov/v3
 */

import * as fs from "fs";
import * as path from "path";

const API_BASE = "https://api.congress.gov/v3";
const API_KEY = process.env.CONGRESS_API_KEY;
const OUTPUT_PATH = path.join(__dirname, "../src/data/members.json");

if (!API_KEY) {
  console.error("❌ CONGRESS_API_KEY required. Get one at https://api.congress.gov/sign-up/");
  process.exit(1);
}

interface RawMember {
  bioguideId: string;
  name: string;
  partyName: string;
  state: string;
  district?: number;
  depiction?: { imageUrl: string };
  terms: { item: Array<{ chamber: string; startYear: number; endYear?: number }> };
  url: string;
  sponsoredLegislation?: { count: number };
  cosponsoredLegislation?: { count: number };
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const wait = Math.pow(2, i) * 2000;
        console.log(`  Rate limited, waiting ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

function parseName(fullName: string): { first: string; last: string } {
  // Congress.gov format: "Last, First" or "Last, First Middle"
  const parts = fullName.split(", ");
  if (parts.length >= 2) {
    return { last: parts[0].trim(), first: parts[1].trim().split(" ")[0] };
  }
  const words = fullName.split(" ");
  return { first: words[0], last: words[words.length - 1] };
}

function mapParty(partyName: string): string {
  if (partyName.startsWith("Democrat")) return "D";
  if (partyName.startsWith("Republican")) return "R";
  if (partyName.startsWith("Independent")) return "I";
  return partyName.charAt(0);
}

function getCurrentChamber(terms: RawMember["terms"]): "house" | "senate" {
  const items = terms?.item || [];
  const current = items.find(t => !t.endYear || t.endYear >= new Date().getFullYear());
  if (current) return current.chamber === "Senate" ? "senate" : "house";
  const latest = items.sort((a, b) => (b.startYear || 0) - (a.startYear || 0))[0];
  return latest?.chamber === "Senate" ? "senate" : "house";
}

async function fetchAllMembers(): Promise<RawMember[]> {
  const members: RawMember[] = [];
  let offset = 0;
  const limit = 250;

  console.log("📥 Fetching current members from Congress.gov...");

  while (true) {
    const url = `${API_BASE}/member?currentMember=true&limit=${limit}&offset=${offset}&api_key=${API_KEY}`;
    const data = await fetchWithRetry(url);

    if (!data.members || data.members.length === 0) break;
    members.push(...data.members);
    console.log(`  Fetched ${members.length} members so far...`);

    if (!data.pagination?.next) break;
    offset += limit;
    await new Promise(r => setTimeout(r, 500)); // Be nice to the API
  }

  return members;
}

async function enrichWithBills(member: RawMember): Promise<RawMember> {
  try {
    const url = `${API_BASE}/member/${member.bioguideId}?api_key=${API_KEY}`;
    const data = await fetchWithRetry(url);
    if (data.member) {
      member.sponsoredLegislation = data.member.sponsoredLegislation;
      member.cosponsoredLegislation = data.member.cosponsoredLegislation;
    }
  } catch (e) {
    console.warn(`  ⚠️ Could not enrich ${member.bioguideId}: ${e}`);
  }
  return member;
}

function transformMember(raw: RawMember) {
  const { first, last } = parseName(raw.name);
  return {
    bioguide_id: raw.bioguideId,
    first_name: first,
    last_name: last,
    full_name: `${first} ${last}`,
    party: mapParty(raw.partyName),
    state: raw.state,
    district: raw.district ?? null,
    chamber: getCurrentChamber(raw.terms),
    photo_url: raw.depiction?.imageUrl || `https://bioguide.congress.gov/bioguide/photo/${raw.bioguideId.charAt(0)}/${raw.bioguideId}.jpg`,
    bills_sponsored: raw.sponsoredLegislation?.count ?? 0,
    bills_cosponsored: raw.cosponsoredLegislation?.count ?? 0,
    committees: [], // Enriched separately
  };
}

async function main() {
  console.log("=".repeat(50));
  console.log("Congress Member Fetch Script");
  console.log("=".repeat(50));
  console.log(`Source: Congress.gov API v3`);
  console.log(`Output: ${OUTPUT_PATH}\n`);

  // Step 1: Fetch all current members
  const rawMembers = await fetchAllMembers();
  console.log(`\n✓ Fetched ${rawMembers.length} current members`);

  // Step 2: Enrich with bill counts (batched to avoid rate limits)
  console.log("\n📥 Enriching with bill sponsorship data...");
  const batchSize = 10;
  for (let i = 0; i < rawMembers.length; i += batchSize) {
    const batch = rawMembers.slice(i, i + batchSize);
    await Promise.all(batch.map(enrichWithBills));
    if (i % 50 === 0) console.log(`  Enriched ${Math.min(i + batchSize, rawMembers.length)}/${rawMembers.length}...`);
    await new Promise(r => setTimeout(r, 1000));
  }

  // Step 3: Transform and write
  const members = rawMembers.map(transformMember);
  
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(members, null, 2));

  console.log(`\n✅ Wrote ${members.length} members to ${OUTPUT_PATH}`);
  console.log(`   House: ${members.filter(m => m.chamber === "house").length}`);
  console.log(`   Senate: ${members.filter(m => m.chamber === "senate").length}`);
  console.log(`   Democrats: ${members.filter(m => m.party === "D").length}`);
  console.log(`   Republicans: ${members.filter(m => m.party === "R").length}`);
  console.log(`   Independent: ${members.filter(m => m.party === "I").length}`);
}

main().catch(e => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
