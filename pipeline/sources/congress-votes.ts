/**
 * Fetch voting records from Congress.gov API
 * 
 * API Docs: https://github.com/LibraryOfCongress/api.congress.gov
 * Stores in database for real-time tracking
 */

import { parseStringPromise } from 'xml2js';

const CONGRESS_API_BASE = "https://api.congress.gov/v3";
const CURRENT_CONGRESS = 119;

// Loaded from environment (1Password)
const API_KEY = process.env.CONGRESS_API_KEY;

if (!API_KEY) {
  throw new Error("CONGRESS_API_KEY environment variable required");
}

interface HouseVote {
  congress: number;
  identifier: number;
  rollCallNumber: number;
  sessionNumber: number;
  result: string;
  voteQuestion: string;
  legislationNumber?: string;
  legislationType?: string;
  legislationUrl?: string;
  sourceDataURL: string;
  startDate: string;
  updateDate: string;
}

interface SenateVote {
  congress: number;
  rollCallNumber: number;
  session: number;
  result: string;
  question: string;
  billNumber?: string;
  billType?: string;
  billUrl?: string;
  voteUrl: string;
  date: string;
}

interface MemberVote {
  bioguide_id: string;
  name: string;
  party: string;
  state: string;
  vote: string; // Yea, Nay, Present, Not Voting
}

/**
 * Fetch with API key authentication
 */
async function fetchWithAuth(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "X-API-Key": API_KEY as string,
    },
  });
}

/**
 * Fetch recent House votes
 */
export async function fetchRecentHouseVotes(
  congress: number = CURRENT_CONGRESS,
  limit: number = 20,
  offset: number = 0
): Promise<HouseVote[]> {
  console.log(`Fetching recent House votes (Congress ${congress}, limit: ${limit}, offset: ${offset})...`);

  const url = `${CONGRESS_API_BASE}/house-vote/${congress}?offset=${offset}&limit=${limit}&format=json`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error(`Congress API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.houseRollCallVotes || [];
}

/**
 * Fetch recent Senate votes
 */
export async function fetchRecentSenateVotes(
  congress: number = CURRENT_CONGRESS,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  console.log(`Fetching recent Senate votes (Congress ${congress}, limit: ${limit}, offset: ${offset})...`);

  const url = `${CONGRESS_API_BASE}/senate-vote/${congress}?offset=${offset}&limit=${limit}&format=json`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error(`Congress API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.senateRollCallVotes || [];
}

/**
 * Parse House roll call XML to extract member votes
 */
export async function parseHouseRollCallXML(xmlUrl: string): Promise<MemberVote[]> {
  console.log(`Parsing House roll call XML: ${xmlUrl}`);
  
  const response = await fetch(xmlUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch XML: ${response.status}`);
  }

  const xmlText = await response.text();
  const parsed = await parseStringPromise(xmlText);

  const recordedVotes = parsed['rollcall-vote']?.['vote-data']?.[0]?.['recorded-vote'] || [];
  
  return recordedVotes.map((rv: any) => {
    const legislator = rv.legislator?.[0] || {};
    const vote = rv.vote?.[0] || '';
    
    return {
      bioguide_id: legislator.$?.['name-id'] || '',
      name: legislator._ || '',
      party: legislator.$?.party || '',
      state: legislator.$?.state || '',
      vote: vote,
    };
  });
}

/**
 * Parse Senate roll call XML to extract member votes
 */
export async function parseSenateRollCallXML(xmlUrl: string): Promise<MemberVote[]> {
  console.log(`Parsing Senate roll call XML: ${xmlUrl}`);
  
  const response = await fetch(xmlUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch XML: ${response.status}`);
  }

  const xmlText = await response.text();
  const parsed = await parseStringPromise(xmlText);

  const members = parsed['roll_call_vote']?.members?.[0]?.member || [];
  
  return members.map((m: any) => ({
    bioguide_id: m.lis_member_id?.[0] || '',
    name: `${m.first_name?.[0] || ''} ${m.last_name?.[0] || ''}`.trim(),
    party: m.party?.[0] || '',
    state: m.state?.[0] || '',
    vote: m.vote_cast?.[0] || '',
  }));
}

/**
 * Transform vote data to database schema
 */
export function transformHouseVote(vote: HouseVote, memberVotes: MemberVote[]) {
  const rollCallId = `${vote.congress}-house-${vote.rollCallNumber}`;
  const billId = vote.legislationNumber && vote.legislationType
    ? `${vote.legislationType.toLowerCase()}${vote.legislationNumber}-${vote.congress}`
    : null;

  return memberVotes.map(mv => ({
    bioguide_id: mv.bioguide_id,
    roll_call_id: rollCallId,
    bill_id: billId,
    vote_date: vote.startDate.split('T')[0],
    vote_position: mv.vote,
    question: vote.voteQuestion || '',
    result: vote.result,
    chamber: 'house',
  }));
}

/**
 * Transform Senate vote data
 */
export function transformSenateVote(vote: any, memberVotes: MemberVote[]) {
  const rollCallId = `${vote.congress}-senate-${vote.rollCallNumber}`;
  const billId = vote.billNumber && vote.billType
    ? `${vote.billType.toLowerCase()}${vote.billNumber}-${vote.congress}`
    : null;

  return memberVotes.map(mv => ({
    bioguide_id: mv.bioguide_id,
    roll_call_id: rollCallId,
    bill_id: billId,
    vote_date: vote.date || new Date().toISOString().split('T')[0],
    vote_position: mv.vote,
    question: vote.question || '',
    result: vote.result || '',
    chamber: 'senate',
  }));
}

/**
 * Sync recent votes to database
 */
export async function syncRecentVotes(db: any, lookbackDays: number = 7) {
  console.log(`\nSyncing votes from the past ${lookbackDays} days...`);
  
  let totalSynced = 0;
  
  // Fetch recent House votes
  try {
    const houseVotes = await fetchRecentHouseVotes(CURRENT_CONGRESS, 50);
    console.log(`Found ${houseVotes.length} recent House votes`);
    
    for (const vote of houseVotes) {
      try {
        // Parse member votes from XML
        const memberVotes = await parseHouseRollCallXML(vote.sourceDataURL);
        const transformedVotes = transformHouseVote(vote, memberVotes);
        
        // Insert into database (on conflict ignore)
        for (const v of transformedVotes) {
          await db.execute({
            sql: `INSERT INTO votes (bioguide_id, roll_call_id, bill_id, vote_date, vote_position, question, result)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(bioguide_id, roll_call_id) DO NOTHING`,
            args: [v.bioguide_id, v.roll_call_id, v.bill_id, v.vote_date, v.vote_position, v.question, v.result],
          });
        }
        
        totalSynced += transformedVotes.length;
        console.log(`✓ Synced House vote ${vote.rollCallNumber} (${transformedVotes.length} members)`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Failed to process House vote ${vote.rollCallNumber}:`, err);
      }
    }
  } catch (err) {
    console.error('Failed to fetch House votes:', err);
  }
  
  // Fetch recent Senate votes
  try {
    const senateVotes = await fetchRecentSenateVotes(CURRENT_CONGRESS, 50);
    console.log(`Found ${senateVotes.length} recent Senate votes`);
    
    for (const vote of senateVotes) {
      try {
        // Senate votes include their own URL structure
        const xmlUrl = vote.voteUrl?.replace('/vote/', '/vote/vote_xml/') || '';
        if (!xmlUrl) continue;
        
        const memberVotes = await parseSenateRollCallXML(xmlUrl);
        const transformedVotes = transformSenateVote(vote, memberVotes);
        
        for (const v of transformedVotes) {
          await db.execute({
            sql: `INSERT INTO votes (bioguide_id, roll_call_id, bill_id, vote_date, vote_position, question, result)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(bioguide_id, roll_call_id) DO NOTHING`,
            args: [v.bioguide_id, v.roll_call_id, v.bill_id, v.vote_date, v.vote_position, v.question, v.result],
          });
        }
        
        totalSynced += transformedVotes.length;
        console.log(`✓ Synced Senate vote ${vote.rollCallNumber} (${transformedVotes.length} members)`);
        
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Failed to process Senate vote ${vote.rollCallNumber}:`, err);
      }
    }
  } catch (err) {
    console.error('Failed to fetch Senate votes:', err);
  }
  
  console.log(`\n✓ Synced ${totalSynced} total vote records`);
  return totalSynced;
}

// CLI mode for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Testing Congress.gov vote API...\n");
  
  fetchRecentHouseVotes(CURRENT_CONGRESS, 2)
    .then(async votes => {
      console.log(`\nFetched ${votes.length} recent House votes`);
      if (votes[0]) {
        console.log("\nSample vote:");
        console.log(JSON.stringify(votes[0], null, 2));
        
        console.log("\n\nFetching member votes for roll call #" + votes[0].rollCallNumber);
        const members = await parseHouseRollCallXML(votes[0].sourceDataURL);
        console.log(`Found ${members.length} member votes`);
        console.log("\nSample members:");
        console.log(members.slice(0, 5));
      }
    })
    .catch(console.error);
}
