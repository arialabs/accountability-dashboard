#!/usr/bin/env npx tsx
/**
 * Fetch top PAC donors for Congressional leadership from FEC
 * Cross-references donor interests with voting record
 */

import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENFEC_KEY = process.env.OPENFEC_API_KEY || '';

interface DonorConflict {
  pac_name: string;
  pac_committee_id: string;
  total_from_pac: number;
  interest_area: string;
  related_votes: Array<{
    bill: string;
    date: string;
    description: string;
    vote: string;
    caucus_position: string;
    aligned_with_donor: boolean;
  }>;
}

interface LeaderDonorProfile {
  bioguide_id: string;
  name: string;
  principal_committee_id: string;
  top_pac_donors: Array<{
    name: string;
    total: number;
    interest_area: string;
    committee_id: string;
  }>;
  conflicts: DonorConflict[];
  total_pac_money: number;
}

// Known interest-area PACs to look for
const INTEREST_PACS = [
  { search: 'american israel public affairs', id: 'C00797670', interest: 'Pro-Israel' },
  { search: 'united democracy project', id: 'C00816777', interest: 'Pro-Israel' },
  { search: 'norpac', id: 'C00098129', interest: 'Pro-Israel' },
  { search: 'national association of realtors', id: 'C00030718', interest: 'Real Estate' },
  { search: 'american bankers', id: 'C00004275', interest: 'Banking/Finance' },
  { search: 'credit union national', id: 'C00041061', interest: 'Banking/Finance' },
  { search: 'blue cross', id: '', interest: 'Health Insurance' },
  { search: 'pharmaceutical', id: '', interest: 'Pharma' },
  { search: 'national beer wholesalers', id: 'C00144766', interest: 'Alcohol Industry' },
  { search: 'comcast', id: 'C00248716', interest: 'Telecom/Media' },
  { search: 'at&t', id: 'C00109017', interest: 'Telecom' },
  { search: 'lockheed', id: 'C00303024', interest: 'Defense' },
  { search: 'raytheon', id: 'C00096156', interest: 'Defense' },
  { search: 'northrop', id: 'C00235267', interest: 'Defense' },
  { search: 'boeing', id: 'C00142711', interest: 'Defense/Aerospace' },
  { search: 'koch', id: '', interest: 'Oil/Gas' },
  { search: 'exxon', id: '', interest: 'Oil/Gas' },
  { search: 'chevron', id: '', interest: 'Oil/Gas' },
  { search: 'national rifle', id: 'C00053553', interest: 'Guns' },
  { search: 'gun owners', id: '', interest: 'Guns' },
  { search: 'everytown', id: '', interest: 'Gun Control' },
];

const LEADERS = [
  { bioguide_id: 'J000299', name: 'Mike Johnson', fec_id: 'H6LA04138' },
  { bioguide_id: 'S001176', name: 'Steve Scalise', fec_id: 'H0LA01087' },
  { bioguide_id: 'E000294', name: 'Tom Emmer', fec_id: 'H4MN06087' },
  { bioguide_id: 'J000294', name: 'Hakeem Jeffries', fec_id: 'H2NY10092' },
  { bioguide_id: 'C001101', name: 'Katherine Clark', fec_id: 'H4MA05084' },
  { bioguide_id: 'T000250', name: 'John Thune', fec_id: 'S2SD00068' },
  { bioguide_id: 'S000148', name: 'Chuck Schumer', fec_id: 'S8NY00082' },
  { bioguide_id: 'D000563', name: 'Dick Durbin', fec_id: 'S4IL00339' },
];

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FEC API ${res.status}`);
  return res.json();
}

async function getPrincipalCommittee(candidateId: string): Promise<string> {
  const data = await fetchJSON(
    `https://api.open.fec.gov/v1/candidate/${candidateId}/committees/?api_key=${OPENFEC_KEY}&designation=P`
  );
  return data.results?.[0]?.committee_id || '';
}

async function getPACDisbursementsTo(pacCommitteeId: string, recipientName: string): Promise<number> {
  let total = 0;
  let lastIdx = '';
  let lastAmt = '';
  
  for (let page = 0; page < 5; page++) {
    let url = `https://api.open.fec.gov/v1/schedules/schedule_b/?committee_id=${pacCommitteeId}&api_key=${OPENFEC_KEY}&per_page=100&recipient_name=${encodeURIComponent(recipientName)}`;
    if (lastIdx) {
      url += `&last_index=${lastIdx}&last_disbursement_amount=${lastAmt}`;
    }
    
    const data = await fetchJSON(url);
    const results = data.results || [];
    total += results.reduce((s: number, r: any) => s + (r.disbursement_amount || 0), 0);
    
    if (results.length < 100) break;
    
    const pagination = data.pagination || {};
    lastIdx = pagination.last_indexes?.last_index || '';
    lastAmt = pagination.last_indexes?.last_disbursement_amount || '';
    if (!lastIdx) break;
    
    await new Promise(r => setTimeout(r, 300));
  }
  
  return total;
}

async function main() {
  if (!OPENFEC_KEY) {
    console.error('Set OPENFEC_API_KEY env var');
    process.exit(1);
  }

  const results: LeaderDonorProfile[] = [];

  for (const leader of LEADERS) {
    console.log(`\n=== ${leader.name} ===`);
    
    const committeeId = await getPrincipalCommittee(leader.fec_id);
    if (!committeeId) {
      console.warn(`  No principal committee found`);
      continue;
    }
    console.log(`  Committee: ${committeeId}`);
    
    const pacDonors: Array<{ name: string; total: number; interest_area: string; committee_id: string }> = [];
    
    // Check each interest PAC
    for (const pac of INTEREST_PACS) {
      if (!pac.id) continue;
      
      try {
        const lastName = leader.name.split(' ').pop()!.toLowerCase();
        const total = await getPACDisbursementsTo(pac.id, lastName);
        
        if (total > 0) {
          console.log(`  ${pac.interest}: $${total.toLocaleString()} from ${pac.search}`);
          pacDonors.push({
            name: pac.search.toUpperCase(),
            total,
            interest_area: pac.interest,
            committee_id: pac.id,
          });
        }
        
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        // Skip on error
      }
    }
    
    // Sort by total
    pacDonors.sort((a, b) => b.total - a.total);
    
    results.push({
      bioguide_id: leader.bioguide_id,
      name: leader.name,
      principal_committee_id: committeeId,
      top_pac_donors: pacDonors,
      conflicts: [], // Will be populated by cross-referencing with votes
      total_pac_money: pacDonors.reduce((s, d) => s + d.total, 0),
    });
  }

  const outPath = resolve(__dirname, '../src/data/leadership-donors.json');
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nWrote donor data for ${results.length} leaders to ${outPath}`);
}

main();
