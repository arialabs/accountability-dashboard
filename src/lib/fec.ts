/**
 * OpenFEC API integration
 * Fetches campaign finance data for congressional candidates
 */

import { logger } from './logger';
import type {
  FECCandidate,
  FECFinancialSummary,
  FECContributor,
  FECDonorBreakdown,
  PaginatedResponse,
  CacheEntry,
  ApiResponse,
  ApiError,
  FECApiFinancialTotals,
  FECApiContributor,
  FECApiScheduleAContribution,
} from './types';

const FEC_API_BASE = 'https://api.open.fec.gov/v1';
const FEC_API_KEY = process.env.FEC_API_KEY;

if (!FEC_API_KEY && typeof window === 'undefined') {
  logger.warn('FEC_API_KEY is not set in server environment variables');
}

// In-memory cache (5 minutes default TTL)
const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generic fetch with caching and error handling
 */
async function fetchFECData<T>(
  endpoint: string,
  params: Record<string, string>,
  cacheTTL = DEFAULT_CACHE_TTL
): Promise<ApiResponse<T>> {
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
  
  // Check cache
  const cached = cache.get(cacheKey) as CacheEntry<T> | undefined;
  if (cached && Date.now() < cached.expires_at) {
    return {
      success: true,
      data: cached.data,
      cached: true,
      cache_timestamp: cached.timestamp,
    };
  }

  if (!FEC_API_KEY) {
    return {
      success: false,
      error: 'FEC_API_KEY not configured',
    };
  }

  try {
    const url = new URL(`${FEC_API_BASE}${endpoint}`);
    url.searchParams.set('api_key', FEC_API_KEY);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      
      let errorCode: ApiError['code'] = 'SERVER_ERROR';
      if (response.status === 429) errorCode = 'RATE_LIMIT';
      else if (response.status === 404) errorCode = 'NOT_FOUND';
      else if (response.status === 400) errorCode = 'INVALID_REQUEST';
      
      return {
        success: false,
        error: `FEC API error (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json() as T;
    
    // Cache successful response
    const now = Date.now();
    cache.set(cacheKey, {
      data,
      timestamp: now,
      expires_at: now + cacheTTL,
    });

    return {
      success: true,
      data,
      cached: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

type FECApiResponse<T> = PaginatedResponse<T>;

/**
 * Search for a candidate by name
 */
export async function searchCandidateByName(
  firstName: string,
  lastName: string,
  office: 'H' | 'S' = 'H'
): Promise<FECCandidate | null> {
  const name = `${lastName}, ${firstName}`;
  
  const response = await fetchFECData<FECApiResponse<FECCandidate>>(
    '/candidates/search/',
    {
      q: name,
      office,
      sort: '-election_years',
      per_page: '5',
    }
  );

  if (!response.success || !response.data?.results) {
    return null;
  }

  // Return the most recent candidate match
  return response.data.results.length > 0 ? response.data.results[0] : null;
}

/**
 * Most recent completed FEC election cycle — used as fallback when the
 * current year returns no data (e.g. retired members, off-cycle senators).
 */
const FALLBACK_CYCLE = 2024;

/**
 * Get financial summary for a candidate.
 * Tries the requested (or current) cycle first; falls back to FALLBACK_CYCLE
 * so that senators who retired or are not up in the current cycle (e.g.
 * McConnell, Durbin) still get data shown.
 */
export async function getCandidateFinancials(
  candidateId: string,
  cycle?: number
): Promise<FECFinancialSummary | null> {
  const currentYear = new Date().getFullYear();
  // FEC cycles are even-numbered 2-year periods; snap to nearest even year.
  const targetCycle = cycle || (currentYear % 2 === 0 ? currentYear : currentYear + 1);
  
  const response = await fetchFECData<FECApiResponse<FECApiFinancialTotals>>(
    `/candidate/${candidateId}/totals/`,
    {
      cycle: targetCycle.toString(),
      sort: '-cycle',
    }
  );

  // If no data for the target cycle, try the fallback cycle (most recent completed)
  if (
    !response.success ||
    !response.data?.results ||
    response.data.results.length === 0
  ) {
    if (targetCycle !== FALLBACK_CYCLE) {
      return getCandidateFinancials(candidateId, FALLBACK_CYCLE);
    }
    return null;
  }

  const totals = response.data.results[0];
  
  return {
    candidate_id: candidateId,
    cycle: totals.cycle || targetCycle,
    total_receipts: totals.receipts || 0,
    total_disbursements: totals.disbursements || 0,
    cash_on_hand: totals.cash_on_hand_end_period || 0,
    individual_contributions: totals.individual_contributions || 0,
    pac_contributions: (totals.other_political_committee_contributions || 0),
    party_contributions: totals.political_party_committee_contributions || 0,
    candidate_contributions: totals.candidate_contribution || 0,
    other_receipts: totals.other_receipts || 0,
    individual_itemized: totals.individual_itemized_contributions || 0,
    individual_unitemized: totals.individual_unitemized_contributions || 0,
  };
}

/**
 * Get top contributors for a candidate.
 * Falls back to FALLBACK_CYCLE when the current cycle returns no results.
 */
export async function getTopContributors(
  candidateId: string,
  cycle?: number,
  limit = 10
): Promise<FECContributor[]> {
  const currentYear = new Date().getFullYear();
  const targetCycle = cycle || (currentYear % 2 === 0 ? currentYear : currentYear + 1);
  
  const response = await fetchFECData<FECApiResponse<FECApiContributor>>(
    `/candidate/${candidateId}/schedules/schedule_a/by_contributor/`,
    {
      cycle: targetCycle.toString(),
      sort: '-total',
      per_page: limit.toString(),
    }
  );

  if (!response.success || !response.data?.results || response.data.results.length === 0) {
    // Retry with fallback cycle if current cycle has no data
    if (targetCycle !== FALLBACK_CYCLE) {
      return getTopContributors(candidateId, FALLBACK_CYCLE, limit);
    }
    return [];
  }

  return response.data.results.map((contrib) => ({
    name: contrib.contributor_name || 'Unknown',
    total: contrib.total || 0,
    count: contrib.count || 0,
    type: contrib.contributor_type === 'individual' ? 'individual' : 'pac',
  }));
}

/**
 * Get detailed Schedule A contributions for industry analysis.
 * Falls back to FALLBACK_CYCLE when current cycle returns no data.
 */
export async function getScheduleAContributions(
  candidateId: string,
  cycle?: number,
  limit = 100
): Promise<Array<{
  contributor_name: string;
  contributor_employer: string | null;
  contributor_occupation: string | null;
  contribution_receipt_amount: number;
  contribution_receipt_date: string;
  committee_name: string;
}>> {
  const currentYear = new Date().getFullYear();
  const targetCycle = cycle || (currentYear % 2 === 0 ? currentYear : currentYear + 1);
  
  const response = await fetchFECData<FECApiResponse<FECApiScheduleAContribution>>(
    `/schedules/schedule_a/`,
    {
      two_year_transaction_period: targetCycle.toString(),
      contributor_id: candidateId,
      sort: '-contribution_receipt_amount',
      per_page: limit.toString(),
    },
    30 * 60 * 1000 // Cache for 30 minutes
  );

  if (!response.success || !response.data?.results || response.data.results.length === 0) {
    // Retry with fallback cycle if current cycle has no data
    if (targetCycle !== FALLBACK_CYCLE) {
      return getScheduleAContributions(candidateId, FALLBACK_CYCLE, limit);
    }
    return [];
  }

  return response.data.results.map((contrib) => ({
    contributor_name: contrib.contributor_name || 'Unknown',
    contributor_employer: contrib.contributor_employer || null,
    contributor_occupation: contrib.contributor_occupation || null,
    contribution_receipt_amount: contrib.contribution_receipt_amount || 0,
    contribution_receipt_date: contrib.contribution_receipt_date || '',
    committee_name: contrib.committee?.name || 'Unknown Committee',
  }));
}

/**
 * Get comprehensive donor breakdown for a candidate
 */
export async function getDonorBreakdown(
  candidateId: string,
  cycle?: number
): Promise<FECDonorBreakdown | null> {
  const financials = await getCandidateFinancials(candidateId, cycle);
  
  if (!financials) {
    return null;
  }

  const topContributors = await getTopContributors(candidateId, cycle, 10);
  
  const totalRaised = financials.total_receipts;
  const pacTotal = financials.pac_contributions;
  const individualTotal = financials.individual_contributions;
  const smallDonorTotal = financials.individual_unitemized;
  const largeDonorTotal = financials.individual_itemized;
  
  // Calculate percentages
  const pacPercentage = totalRaised > 0 ? (pacTotal / totalRaised) * 100 : 0;
  const individualPercentage = totalRaised > 0 ? (individualTotal / totalRaised) * 100 : 0;
  const smallDonorPercentage = totalRaised > 0 ? (smallDonorTotal / totalRaised) * 100 : 0;
  const largeDonorPercentage = totalRaised > 0 ? (largeDonorTotal / totalRaised) * 100 : 0;
  
  return {
    candidate_id: candidateId,
    cycle: financials.cycle,
    pac_percentage: Math.round(pacPercentage * 10) / 10,
    individual_percentage: Math.round(individualPercentage * 10) / 10,
    small_donor_percentage: Math.round(smallDonorPercentage * 10) / 10,
    large_donor_percentage: Math.round(largeDonorPercentage * 10) / 10,
    top_contributors: topContributors,
    total_raised: totalRaised,
    pac_total: pacTotal,
    individual_total: individualTotal,
    small_donor_total: smallDonorTotal,
    large_donor_total: largeDonorTotal,
  };
}

/**
 * Get FEC data for a member (search + financials in one call)
 */
export async function getMemberFECData(
  firstName: string,
  lastName: string,
  chamber: 'house' | 'senate'
): Promise<{
  candidate: FECCandidate | null;
  financials: FECFinancialSummary | null;
}> {
  const office = chamber === 'house' ? 'H' : 'S';
  const candidate = await searchCandidateByName(firstName, lastName, office);
  
  if (!candidate) {
    return { candidate: null, financials: null };
  }

  const financials = await getCandidateFinancials(candidate.candidate_id);
  
  return { candidate, financials };
}

/**
 * Clear the FEC data cache (useful for testing or forced refresh)
 */
export function clearFECCache(): void {
  cache.clear();
}
