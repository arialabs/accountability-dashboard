/**
 * Congress.gov API Client
 * 
 * Fetch member voting records and bill details from Congress.gov API
 * API Docs: https://api.congress.gov/
 */

const CONGRESS_API_BASE = 'https://api.congress.gov/v3';
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;

if (!CONGRESS_API_KEY && typeof window === 'undefined') {
  console.warn('Warning: CONGRESS_API_KEY not set. Congress.gov API calls will fail.');
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CongressVote {
  congress: number;
  chamber: 'House' | 'Senate';
  rollNumber: number;
  date: string;
  question: string;
  result: 'Passed' | 'Failed' | 'Agreed to' | 'Rejected';
  bill?: {
    number: string;
    title: string;
    url: string;
  };
  description?: string;
  totals: {
    yea: number;
    nay: number;
    present: number;
    notVoting: number;
  };
  memberVote?: 'Yea' | 'Nay' | 'Present' | 'Not Voting';
}

interface RollCallVote {
  recordedVote: {
    congress: number;
    chamber: string;
    rollNumber: number;
    date: string;
    question: string;
    result: string;
    bill?: {
      number: string;
      title: string;
      url: string;
    };
    description?: string;
    vote_totals: {
      totals_by_vote: {
        YEA?: { total?: number };
        NAY?: { total?: number };
        PRESENT?: { total?: number };
        NOT_VOTING?: { total?: number };
      };
    };
  };
}

/**
 * Fetch member voting record from Congress.gov
 */
export async function getMemberVotes(
  bioguideId: string,
  limit = 50,
  offset = 0
): Promise<ApiResponse<CongressVote[]>> {
  if (!CONGRESS_API_KEY) {
    return { success: false, error: 'Congress API key not configured' };
  }

  try {
    const url = `${CONGRESS_API_BASE}/member/${bioguideId}/votes?format=json&limit=${limit}&offset=${offset}&api_key=${CONGRESS_API_KEY}`;
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const votes = data.recordedVotes?.map((v: RollCallVote) => {
      const rv = v.recordedVote;
      return {
        congress: rv.congress,
        chamber: rv.chamber === 'House of Representatives' ? 'House' as const : 'Senate' as const,
        rollNumber: rv.rollNumber,
        date: rv.date,
        question: rv.question,
        result: normalizeResult(rv.result),
        bill: rv.bill ? {
          number: rv.bill.number,
          title: rv.bill.title || rv.bill.number,
          url: rv.bill.url || `https://www.congress.gov/bill/${rv.congress}th-congress/${rv.bill.number.toLowerCase()}`
        } : undefined,
        description: rv.description,
        totals: {
          yea: rv.vote_totals?.totals_by_vote?.YEA?.total || 0,
          nay: rv.vote_totals?.totals_by_vote?.NAY?.total || 0,
          present: rv.vote_totals?.totals_by_vote?.PRESENT?.total || 0,
          notVoting: rv.vote_totals?.totals_by_vote?.NOT_VOTING?.total || 0,
        },
      };
    }) || [];

    return { success: true, data: votes };
  } catch (error) {
    console.error('Error fetching member votes:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get a specific vote's detailed information
 */
export async function getVoteDetails(
  congress: number,
  chamber: 'house' | 'senate',
  rollNumber: number
): Promise<ApiResponse<CongressVote & { votes: Record<string, string> }>> {
  if (!CONGRESS_API_KEY) {
    return { success: false, error: 'Congress API key not configured' };
  }

  try {
    const url = `${CONGRESS_API_BASE}/vote/${congress}/${chamber}/${rollNumber}?format=json&api_key=${CONGRESS_API_KEY}`;
    const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24 hours

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const rv = data.recordedVote;
    
    // Parse individual member votes
    const memberVotes: Record<string, string> = {};
    if (rv.members) {
      rv.members.forEach((m: any) => {
        if (m.bioguideId && m.vote) {
          memberVotes[m.bioguideId] = m.vote;
        }
      });
    }

    const vote: CongressVote & { votes: Record<string, string> } = {
      congress: rv.congress,
      chamber: rv.chamber === 'House of Representatives' ? 'House' : 'Senate',
      rollNumber: rv.rollNumber,
      date: rv.date,
      question: rv.question,
      result: normalizeResult(rv.result),
      bill: rv.bill ? {
        number: rv.bill.number,
        title: rv.bill.title || rv.bill.number,
        url: rv.bill.url || `https://www.congress.gov/bill/${rv.congress}th-congress/${rv.bill.number.toLowerCase()}`
      } : undefined,
      description: rv.description,
      totals: {
        yea: rv.vote_totals?.totals_by_vote?.YEA?.total || 0,
        nay: rv.vote_totals?.totals_by_vote?.NAY?.total || 0,
        present: rv.vote_totals?.totals_by_vote?.PRESENT?.total || 0,
        notVoting: rv.vote_totals?.totals_by_vote?.NOT_VOTING?.total || 0,
      },
      votes: memberVotes,
    };

    return { success: true, data: vote };
  } catch (error) {
    console.error('Error fetching vote details:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get bill details
 */
export async function getBillDetails(congress: number, billType: string, billNumber: number) {
  if (!CONGRESS_API_KEY) {
    return { success: false, error: 'Congress API key not configured' };
  }

  try {
    const url = `${CONGRESS_API_BASE}/bill/${congress}/${billType}/${billNumber}?format=json&api_key=${CONGRESS_API_KEY}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data: data.bill };
  } catch (error) {
    console.error('Error fetching bill details:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Normalize vote result strings
 */
function normalizeResult(result: string): 'Passed' | 'Failed' | 'Agreed to' | 'Rejected' {
  const normalized = result.toLowerCase();
  if (normalized.includes('pass') || normalized.includes('agreed')) return 'Passed';
  if (normalized.includes('fail') || normalized.includes('reject')) return 'Failed';
  if (normalized.includes('agree')) return 'Agreed to';
  return 'Failed';
}

export type { CongressVote, ApiResponse };
