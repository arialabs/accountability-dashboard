/**
 * Fetch campaign finance data from FEC API
 * 
 * Fetches:
 * - Total receipts/disbursements
 * - Individual vs PAC contributions
 * - Small donor (<$200) vs large donor breakdown
 * - Top contributors
 * 
 * Docs: https://api.open.fec.gov/developers/
 */

const FEC_API_BASE = "https://api.open.fec.gov/v1";
const API_KEY = process.env.FEC_API_KEY || "DEMO_KEY";
const CURRENT_CYCLE = 2024;

// Retry helper with exponential backoff for rate limits
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      
      // If rate limited, wait and retry with exponential backoff
      if (response.status === 429) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (err) {
      if (attempt === maxRetries - 1) {
        console.error(`Fetch error after ${maxRetries} attempts:`, err);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  return null;
}

// State name to code mapping
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
  "District of Columbia": "DC", "Puerto Rico": "PR", "Guam": "GU", "American Samoa": "AS",
  "U.S. Virgin Islands": "VI", "Northern Mariana Islands": "MP"
};

function getStateCode(state: string): string {
  return STATE_CODES[state] || state; // Return as-is if already a code
}

export interface FECFinanceData {
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
  top_contributors: Array<{
    name: string;
    total: number;
    count: number;
    type: 'individual' | 'pac' | 'party' | 'committee';
  }>;
  top_industries: Array<{
    industry: string;
    total: number;
    pac_amount: number;
    individual_amount: number;
  }>;
}

interface FECSearchResult {
  candidate_id: string;
  name: string;
  party: string;
  state: string;
  district: string;
  office: string;
}

// Search for a candidate by name and state
async function searchCandidate(
  name: string,
  state: string,
  office: "H" | "S",
  district?: number
): Promise<FECSearchResult | null> {
  const lastName = name.split(" ").pop()?.toUpperCase() || name;
  
  let url = `${FEC_API_BASE}/candidates/search/?api_key=${API_KEY}&q=${encodeURIComponent(lastName)}&state=${state}&office=${office}&cycle=2024&sort=-election_years&per_page=5`;
  
  if (office === "H" && district) {
    url += `&district=${String(district).padStart(2, '0')}`;
  }
  
  try {
    const response = await fetchWithRetry(url);
    if (!response || !response.ok) {
      if (response) console.error(`FEC search failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const candidates = data.results || [];
    
    // Find best match by comparing names
    const searchNameLower = name.toLowerCase();
    const firstName = searchNameLower.split(" ")[0];
    
    const match = candidates.find((c: FECSearchResult) => {
      const cName = c.name.toLowerCase();
      // FEC names are "LASTNAME, FIRSTNAME"
      return cName.includes(firstName) || 
             searchNameLower.includes(cName.split(",")[0]);
    });
    
    return match || candidates[0] || null;
  } catch (err) {
    console.error(`FEC search error:`, err);
    return null;
  }
}

// Get detailed financial totals for a candidate
async function getCandidateTotals(candidateId: string): Promise<any | null> {
  const url = `${FEC_API_BASE}/candidate/${candidateId}/totals/?api_key=${API_KEY}&cycle=${CURRENT_CYCLE}&sort=-cycle`;
  
  try {
    const response = await fetchWithRetry(url);
    if (!response || !response.ok) return null;
    
    const data = await response.json();
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

// Self-transfer entities to filter out (WinRed, ActBlue, own party committees, etc.)
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
  /grassroots media/i,
  /democracy engine/i,
];

// Suffixes that indicate member's own leadership PAC or victory committee
const MEMBER_SELF_TRANSFER_SUFFIXES = [
  /\bleadership\b/i,
  /\bleadership fund\b/i,
  /\bvictory\b/i,
  /\bmajority\b/i,
  /\bmajority fund\b/i,
  /\bmajority committee\b/i,
  /\bfor congress\b/i,
  /\bfor senate\b/i,
];

function isSelfTransfer(name: string, memberLastName?: string): boolean {
  if (SELF_TRANSFER_PATTERNS.some(p => p.test(name))) return true;
  if (memberLastName) {
    const nameLower = name.toLowerCase();
    const lastLower = memberLastName.toLowerCase();
    if (nameLower.includes(lastLower)) {
      if (MEMBER_SELF_TRANSFER_SUFFIXES.some(p => p.test(name))) return true;
      if (/^team\s+/i.test(name)) return true;
    }
  }
  return false;
}

// Get the principal campaign committee ID for a candidate
async function getCandidatePrincipalCommittee(candidateId: string): Promise<string | null> {
  const url = `${FEC_API_BASE}/candidate/${candidateId}/committees/?api_key=${API_KEY}&designation=P&cycle=${CURRENT_CYCLE}`;
  try {
    const response = await fetchWithRetry(url);
    if (!response || !response.ok) return null;
    const data = await response.json();
    const committee = data.results?.[0];
    return committee?.committee_id || null;
  } catch {
    return null;
  }
}

// Get top contributors for a candidate via Schedule A (committee-based)
async function getTopContributors(candidateId: string, memberLastName?: string): Promise<any[]> {
  // First get the principal committee ID
  const committeeId = await getCandidatePrincipalCommittee(candidateId);
  if (!committeeId) {
    // Fallback to the by_contributor endpoint
    const url = `${FEC_API_BASE}/schedules/schedule_a/by_contributor/?api_key=${API_KEY}&candidate_id=${candidateId}&cycle=${CURRENT_CYCLE}&sort=-total&per_page=20`;
    try {
      const response = await fetchWithRetry(url);
      if (!response || !response.ok) return [];
      const data = await response.json();
      return data.results || [];
    } catch {
      return [];
    }
  }

  // Fetch Schedule A contributions to the committee
  const url = `${FEC_API_BASE}/schedules/schedule_a/?api_key=${API_KEY}&committee_id=${committeeId}&two_year_transaction_period=${CURRENT_CYCLE}&per_page=100&sort=-contribution_receipt_amount&is_individual=false`;
  try {
    const response = await fetchWithRetry(url);
    if (!response || !response.ok) return [];
    const data = await response.json();
    const raw: any[] = data.results || [];

    // Aggregate by contributor name, filtering self-transfers
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
        aggregated.set(name, { total: amount, count: 1, type: r.entity_type || 'ORG' });
      }
    }

    // Sort by total and return top 10
    return Array.from(aggregated.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([name, d]) => ({ contributor_name: name, total: d.total, count: d.count, entity_type: d.type }));
  } catch {
    return [];
  }
}

// Fetch comprehensive finance data for a single member
export async function fetchMemberFinanceDetailed(
  fullName: string,
  state: string,
  chamber: "house" | "senate",
  district?: number | null,
  bioguideId?: string
): Promise<FECFinanceData | null> {
  const office = chamber === "house" ? "H" : "S";
  const stateCode = getStateCode(state);
  
  const candidate = await searchCandidate(fullName, stateCode, office, district || undefined);
  if (!candidate) {
    return null;
  }
  
  const totals = await getCandidateTotals(candidate.candidate_id);
  if (!totals) {
    return null;
  }
  
  // Fetch top contributors (pass last name for self-transfer filtering)
  const memberLastName = fullName.split(" ").pop();
  const rawContributors = await getTopContributors(candidate.candidate_id, memberLastName);
  
  // Parse totals
  const totalRaised = totals.receipts || 0;
  const individualContributions = totals.individual_contributions || 0;
  const pacContributions = totals.other_political_committee_contributions || 0;
  const partyContributions = totals.political_party_committee_contributions || 0;
  const candidateSelfFunding = totals.candidate_contribution || 0;
  const smallDonors = totals.individual_unitemized_contributions || 0;  // <$200
  const largeDonors = totals.individual_itemized_contributions || 0;    // >$200
  
  // Calculate percentages
  const pacPercentage = totalRaised > 0 ? (pacContributions / totalRaised) * 100 : 0;
  const smallDonorPercentage = totalRaised > 0 ? (smallDonors / totalRaised) * 100 : 0;
  const largeDonorPercentage = totalRaised > 0 ? (largeDonors / totalRaised) * 100 : 0;
  
  // Process contributors
  const topContributors = rawContributors.slice(0, 10).map((c: any) => {
    const entityType = (c.entity_type || '').toUpperCase();
    let type: 'individual' | 'pac' | 'party' | 'committee' = 'committee';
    if (entityType === 'IND') type = 'individual';
    else if (entityType === 'PAC') type = 'pac';
    else if (entityType === 'PTY') type = 'party';
    return {
      name: c.contributor_name || c.committee_name || 'Unknown',
      total: Math.round(c.total || 0),
      count: c.count || 1,
      type,
    };
  });
  
  return {
    candidate_id: candidate.candidate_id,
    cycle: CURRENT_CYCLE,
    total_raised: Math.round(totalRaised),
    total_spent: Math.round(totals.disbursements || 0),
    cash_on_hand: Math.round(parseFloat(String(totals.cash_on_hand_end_period)) || 0),
    individual_contributions: Math.round(individualContributions),
    pac_contributions: Math.round(pacContributions),
    party_contributions: Math.round(partyContributions),
    candidate_self_funding: Math.round(candidateSelfFunding),
    small_donors: Math.round(smallDonors),
    large_donors: Math.round(largeDonors),
    pac_percentage: Math.round(pacPercentage * 10) / 10,
    small_donor_percentage: Math.round(smallDonorPercentage * 10) / 10,
    large_donor_percentage: Math.round(largeDonorPercentage * 10) / 10,
    top_contributors: topContributors,
    top_industries: [], // Would need OpenSecrets for industry data
  };
}

// Batch fetch for all members
export async function fetchAllMemberFinance(
  members: Array<{
    bioguide_id: string;
    full_name: string;
    state: string;
    chamber: "house" | "senate";
    district: number | null;
  }>,
  batchSize = 2,
  delayMs = 6000
): Promise<Record<string, FECFinanceData>> {
  const results: Record<string, FECFinanceData> = {};
  
  console.log(`\nFetching detailed FEC finance data for ${members.length} members...`);
  console.log(`Using ${API_KEY === 'DEMO_KEY' ? 'DEMO_KEY (slow)' : 'production key'}`);
  console.log(`Batch size: ${batchSize}, Delay: ${delayMs}ms\n`);
  
  let found = 0;
  let errors = 0;
  
  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize);
    
    const promises = batch.map(async (member) => {
      try {
        const finance = await fetchMemberFinanceDetailed(
          member.full_name,
          member.state,
          member.chamber,
          member.district,
          member.bioguide_id
        );
        
        if (finance && finance.total_raised > 0) {
          results[member.bioguide_id] = finance;
          found++;
        }
      } catch (err) {
        errors++;
      }
    });
    
    await Promise.all(promises);
    
    const progress = Math.min(i + batchSize, members.length);
    process.stdout.write(`\r  Processed ${progress}/${members.length} (found ${found}, errors ${errors})...`);
    
    if (i + batchSize < members.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.log(`\n✓ Found finance data for ${found}/${members.length} members (${errors} errors)`);
  return results;
}

// Legacy export for backward compatibility
export async function enrichMembersWithFinance<T extends {
  full_name: string;
  state: string;
  chamber: "house" | "senate";
  district: number | null;
}>(
  members: T[],
  batchSize = 5,
  delayMs = 1000
): Promise<Map<string, { receipts: number; disbursements: number; cashOnHand: number }>> {
  const results = new Map<string, { receipts: number; disbursements: number; cashOnHand: number }>();
  
  for (const member of members) {
    const finance = await fetchMemberFinanceDetailed(
      member.full_name,
      member.state,
      member.chamber,
      member.district
    );
    
    if (finance) {
      results.set(member.full_name, {
        receipts: finance.total_raised,
        disbursements: finance.total_spent,
        cashOnHand: finance.cash_on_hand,
      });
    }
  }
  
  return results;
}

// Run directly for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Testing FEC API with Bernie Sanders...\n");
  
  fetchMemberFinanceDetailed("Bernard Sanders", "VT", "senate")
    .then(result => {
      if (result) {
        console.log("\n✓ Bernie Sanders finance data:");
        console.log(`  Total raised: $${(result.total_raised / 1000000).toFixed(1)}M`);
        console.log(`  PAC %: ${result.pac_percentage}%`);
        console.log(`  Small donor %: ${result.small_donor_percentage}%`);
        console.log(`  Top contributors: ${result.top_contributors.length}`);
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log("No data found");
      }
    })
    .catch(console.error);
}
