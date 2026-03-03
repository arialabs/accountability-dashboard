/**
 * Targeted script to update top_contributors for known congressional leaders
 * Uses Schedule A API with known committee IDs for reliable results.
 * 
 * Run with: FEC_API_KEY=xxx pnpm tsx pipeline/update-top-contributors.ts
 */

import * as fs from "fs";

const FEC_API_BASE = "https://api.open.fec.gov/v1";
const API_KEY = process.env.FEC_API_KEY || "DEMO_KEY";
const CURRENT_CYCLE = 2024;

// Known committee IDs for congressional leaders (from issue #104)
// bioguide_id -> [committee_id, last_name_for_filtering]
const KNOWN_COMMITTEES: Record<string, [string, string]> = {
  // House
  "J000299": ["C00608695", "Johnson"],   // Mike Johnson (Speaker)
  "S001176": ["C00394957", "Scalise"],   // Steve Scalise
  "E000294": ["C00545749", "Emmer"],     // Tom Emmer
  "J000294": ["C00503052", "Jeffries"],  // Hakeem Jeffries
  "C001101": ["C00541888", "Clark"],     // Katherine Clark
  // Senate
  "T000250": ["C00409581", "Thune"],     // John Thune
  "S000148": ["C00346312", "Schumer"],   // Chuck Schumer
};

const SELF_TRANSFER_PATTERNS = [
  /winred/i,
  /actblue/i,
  /ngp van/i,
  /democratic congressional campaign/i,
  /national republican congressional/i,
  /democratic senatorial campaign/i,
  /national republican senatorial/i,
  /democratic national committee/i,
  /republican national committee/i,
  /joint fundraising/i,
  /grassroots media/i,          // ActBlue's processing arm
  /democracy engine/i,          // WinRed-like processor
];

// Patterns that indicate member's own leadership PACs / victory committees
const MEMBER_SELF_TRANSFER_SUFFIXES = [
  /\bleadership\b/i,
  /\bleadership fund\b/i,
  /\bvictory\b/i,
  /\bmajority\b/i,
  /\bmajority fund\b/i,
  /\bmajority committee\b/i,
  /\bfor congress\b/i,
  /\bfor senate\b/i,
  /\bdefend the vote\b/i,
  /\bfair shot pac\b/i,
];

function isSelfTransfer(name: string, memberLastName?: string): boolean {
  if (SELF_TRANSFER_PATTERNS.some(p => p.test(name))) return true;
  // If name starts with/contains the member's own name + a PAC suffix keyword
  if (memberLastName) {
    const nameLower = name.toLowerCase();
    const lastLower = memberLastName.toLowerCase();
    if (nameLower.includes(lastLower)) {
      if (MEMBER_SELF_TRANSFER_SUFFIXES.some(p => p.test(name))) return true;
      // "TEAM SCALISE", "GROW THE MAJORITY" (for Johnson) etc
      if (/^team\s+/i.test(name)) return true;
      if (/^grow the majority/i.test(name)) return true;
    }
    // "TEAM SCALISE" pattern: starts with "TEAM" and contains lastname
    if (/^team\s+/i.test(name) && nameLower.includes(lastLower)) return true;
  }
  return false;
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        const waitTime = Math.min(2000 * Math.pow(2, attempt), 30000);
        console.log(`  Rate limited, waiting ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      return response;
    } catch (err) {
      if (attempt === maxRetries - 1) return null;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  return null;
}

async function getTopContributorsForCommittee(committeeId: string, memberLastName: string): Promise<Array<{
  name: string; total: number; count: number; type: string;
}>> {
  const url = `${FEC_API_BASE}/schedules/schedule_a/?api_key=${API_KEY}&committee_id=${committeeId}&two_year_transaction_period=${CURRENT_CYCLE}&per_page=100&sort=-contribution_receipt_amount&is_individual=false`;
  
  const response = await fetchWithRetry(url);
  if (!response || !response.ok) {
    console.error(`  Failed to fetch: ${response?.status}`);
    return [];
  }
  
  const data = await response.json();
  const raw: any[] = data.results || [];
  
  // Aggregate by contributor name
  const aggregated = new Map<string, { total: number; count: number; type: string }>();
  for (const r of raw) {
    const name: string = r.contributor_name || r.committee_name || 'Unknown';
    if (isSelfTransfer(name, memberLastName)) continue;
    const amount = r.contribution_receipt_amount || 0;
    if (amount <= 0) continue;
    const existing = aggregated.get(name);
    if (existing) {
      existing.total += amount;
      existing.count += 1;
    } else {
      const entityType = (r.entity_type || '').toUpperCase();
      let type = 'committee';
      if (entityType === 'IND') type = 'individual';
      else if (entityType === 'PAC') type = 'pac';
      else if (entityType === 'PTY') type = 'party';
      aggregated.set(name, { total: amount, count: 1, type });
    }
  }
  
  return Array.from(aggregated.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([name, d]) => ({ name, total: Math.round(d.total), count: d.count, type: d.type }));
}

async function main() {
  console.log("=".repeat(60));
  console.log("Updating top_contributors for congressional leaders");
  console.log(`Using API key: ${API_KEY === 'DEMO_KEY' ? 'DEMO_KEY ⚠️' : '***' + API_KEY.slice(-4)}`);
  console.log("=".repeat(60));

  const financeJsonPath = "./src/data/finance.json";
  let financeData: Record<string, any> = {};
  if (fs.existsSync(financeJsonPath)) {
    financeData = JSON.parse(fs.readFileSync(financeJsonPath, "utf-8"));
    console.log(`\nLoaded ${Object.keys(financeData).length} existing finance records`);
  }

  let updated = 0;
  for (const [bioguideId, [committeeId, lastName]] of Object.entries(KNOWN_COMMITTEES)) {
    console.log(`\nFetching top contributors for ${bioguideId} / ${lastName} (committee: ${committeeId})...`);
    const contributors = await getTopContributorsForCommittee(committeeId, lastName);
    console.log(`  Found ${contributors.length} contributors`);
    contributors.forEach(c => console.log(`    ${c.name}: $${c.total.toLocaleString()}`));
    
    if (contributors.length > 0) {
      if (financeData[bioguideId]) {
        financeData[bioguideId].top_contributors = contributors;
        updated++;
      } else {
        // Create a minimal record
        financeData[bioguideId] = { top_contributors: contributors };
        updated++;
      }
    }
    
    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  fs.writeFileSync(financeJsonPath, JSON.stringify(financeData, null, 2));
  console.log(`\n✓ Updated ${updated} members in ${financeJsonPath}`);

  // Also update pipeline/output/finance.json
  const outputPath = "./pipeline/output/finance.json";
  if (fs.existsSync(outputPath)) {
    const outputData = JSON.parse(fs.readFileSync(outputPath, "utf-8") || "{}");
    for (const [bioguideId, committeeId] of Object.entries(KNOWN_COMMITTEES)) {
      if (financeData[bioguideId]?.top_contributors?.length > 0 && outputData[bioguideId]) {
        outputData[bioguideId].top_contributors = financeData[bioguideId].top_contributors;
      }
    }
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`✓ Updated pipeline/output/finance.json`);
  }
}

main().catch(console.error);
