#!/usr/bin/env npx tsx
/**
 * Fetch FEC financial data for Congressional leadership
 * Outputs to src/data/leadership-finance.json
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENFEC_KEY = process.env.OPENFEC_API_KEY || process.env.FEC_API_KEY || '';

interface LeaderFinance {
  bioguide_id: string;
  fec_candidate_id: string;
  name: string;
  role: string;
  party: 'R' | 'D';
  chamber: 'house' | 'senate';
  category: 'majority' | 'minority';
  order: number;
  cycle: number;
  total_raised: number;
  total_spent: number;
  cash_on_hand: number;
  individual_contributions: number;
  individual_itemized: number;
  individual_unitemized: number;
  pac_contributions: number;
  pac_percentage: number;
  small_donor_percentage: number;
  top_contributors: Array<{ name: string; total: number; type: string }>;
}

// Hardcoded FEC candidate IDs — looked up manually
const LEADERS = [
  { bioguide_id: 'J000299', fec_id: 'H6LA04138', name: 'Mike Johnson', role: 'Speaker of the House', party: 'R' as const, chamber: 'house' as const, category: 'majority' as const, order: 1 },
  { bioguide_id: 'S001176', fec_id: 'H0LA01087', name: 'Steve Scalise', role: 'House Majority Leader', party: 'R' as const, chamber: 'house' as const, category: 'majority' as const, order: 2 },
  { bioguide_id: 'E000294', fec_id: 'H4MN06087', name: 'Tom Emmer', role: 'House Majority Whip', party: 'R' as const, chamber: 'house' as const, category: 'majority' as const, order: 3 },
  { bioguide_id: 'J000294', fec_id: 'H2NY10092', name: 'Hakeem Jeffries', role: 'House Minority Leader', party: 'D' as const, chamber: 'house' as const, category: 'minority' as const, order: 1 },
  { bioguide_id: 'C001101', fec_id: 'H4MA05084', name: 'Katherine Clark', role: 'House Minority Whip', party: 'D' as const, chamber: 'house' as const, category: 'minority' as const, order: 2 },
  { bioguide_id: 'T000250', fec_id: 'S2SD00068', name: 'John Thune', role: 'Senate Majority Leader', party: 'R' as const, chamber: 'senate' as const, category: 'majority' as const, order: 1 },
  { bioguide_id: 'S000148', fec_id: 'S8NY00082', name: 'Chuck Schumer', role: 'Senate Minority Leader', party: 'D' as const, chamber: 'senate' as const, category: 'minority' as const, order: 1 },
  { bioguide_id: 'D000563', fec_id: 'S4IL00339', name: 'Dick Durbin', role: 'Senate Minority Whip', party: 'D' as const, chamber: 'senate' as const, category: 'minority' as const, order: 2 },
];

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FEC API error ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function getFinancials(candidateId: string): Promise<any> {
  const url = `https://api.open.fec.gov/v1/candidate/${candidateId}/totals/?api_key=${OPENFEC_KEY}&per_page=1&election_full=true`;
  const data = await fetchJSON(url);
  return data.results?.[0] || null;
}

async function getTopPACContributors(candidateId: string): Promise<Array<{ name: string; total: number; type: string }>> {
  try {
    const url = `https://api.open.fec.gov/v1/schedules/schedule_a/?candidate_id=${candidateId}&api_key=${OPENFEC_KEY}&per_page=10&sort=-contribution_receipt_amount&contributor_type=committee&two_year_transaction_period=2024`;
    const data = await fetchJSON(url);
    return (data.results || []).slice(0, 5).map((r: any) => ({
      name: r.contributor_name || 'Unknown',
      total: r.contribution_receipt_amount || 0,
      type: r.entity_type_desc || 'PAC',
    }));
  } catch {
    return [];
  }
}

async function main() {
  if (!OPENFEC_KEY) {
    console.error('Set OPENFEC_API_KEY env var');
    process.exit(1);
  }

  const results: LeaderFinance[] = [];

  for (const leader of LEADERS) {
    console.log(`Fetching: ${leader.name} (${leader.fec_id})...`);
    
    try {
      const fin = await getFinancials(leader.fec_id);
      if (!fin) {
        console.warn(`  ⚠ No financial data for ${leader.name}`);
        continue;
      }

      const totalRaised = fin.receipts || fin.contributions || 0;
      const pacContrib = fin.other_political_committee_contributions || 0;
      const indivContrib = fin.individual_contributions || 0;
      const indivItemized = fin.individual_itemized_contributions || 0;
      const indivUnitemized = fin.individual_unitemized_contributions || 0;

      // Get top PAC contributors
      const contributors = await getTopPACContributors(leader.fec_id);

      const entry: LeaderFinance = {
        bioguide_id: leader.bioguide_id,
        fec_candidate_id: leader.fec_id,
        name: leader.name,
        role: leader.role,
        party: leader.party,
        chamber: leader.chamber,
        category: leader.category,
        order: leader.order,
        cycle: fin.candidate_election_year || 2024,
        total_raised: totalRaised,
        total_spent: fin.disbursements || 0,
        cash_on_hand: fin.last_cash_on_hand_end_period || 0,
        individual_contributions: indivContrib,
        individual_itemized: indivItemized,
        individual_unitemized: indivUnitemized,
        pac_contributions: pacContrib,
        pac_percentage: totalRaised > 0 ? Math.round((pacContrib / totalRaised) * 1000) / 10 : 0,
        small_donor_percentage: indivContrib > 0 ? Math.round((indivUnitemized / indivContrib) * 1000) / 10 : 0,
        top_contributors: contributors,
      };

      results.push(entry);
      console.log(`  ✅ Raised: $${totalRaised.toLocaleString()}, PAC: ${entry.pac_percentage}%, Small donor: ${entry.small_donor_percentage}%`);
      
      // Rate limit
      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      console.error(`  ❌ Error for ${leader.name}:`, err);
    }
  }

  const outPath = resolve(__dirname, '../src/data/leadership-finance.json');
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} leaders to ${outPath}`);
}

main();
