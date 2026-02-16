/**
 * API client for the Reps API Worker
 * Fetches live data from Congress.gov, Voteview, and OpenFEC via our Cloudflare Worker proxy
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://reps-api.jeremyspofford.workers.dev";

interface FetchOptions {
  params?: Record<string, string>;
  signal?: AbortSignal;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = new URL(path, API_BASE);
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  const resp = await fetch(url.toString(), {
    signal: options.signal,
    headers: { "Content-Type": "application/json" },
  });

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error((error as any).error || `API error: ${resp.status}`);
  }

  return resp.json() as Promise<T>;
}

// ==================== Types ====================

export interface ApiMember {
  bioguide_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  party: string;
  state: string;
  district: number | null;
  chamber: "house" | "senate";
  photo_url: string | null;
  terms?: any;
}

export interface ApiMemberDetail extends ApiMember {
  birth_year: string;
  bills_sponsored: number;
  bills_cosponsored: number;
  leadership: any[];
  party_history: any[];
}

export interface ApiVoteviewMember {
  icpsr: number;
  bioguide_id: string;
  name: string;
  party_code: number;
  state_abbrev: string;
  nominate_dim1: number;
  nominate_dim2: number;
  nokken_poole_dim1: number;
  votes?: number;
  errors?: number;
}

export interface ApiFinance {
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
}

export interface ApiLeaderboardEntry {
  bioguide_id: string;
  name: string;
  party: string;
  state: string;
  chamber: "house" | "senate";
  photo_url: string | null;
  ideology_score: number | null;
  votes_cast: number;
}

export interface ApiLeaderboard {
  total: number;
  with_scores: number;
  members: ApiLeaderboardEntry[];
}

// ==================== API Functions ====================

export async function fetchMembers(params?: {
  chamber?: string;
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}): Promise<{ members: ApiMember[]; pagination: any }> {
  const queryParams: Record<string, string> = {};
  if (params?.chamber) queryParams.chamber = params.chamber;
  if (params?.limit) queryParams.limit = String(params.limit);
  if (params?.offset) queryParams.offset = String(params.offset);

  return apiFetch("/api/members", { params: queryParams, signal: params?.signal });
}

export async function fetchMemberDetail(
  bioguideId: string,
  signal?: AbortSignal
): Promise<ApiMemberDetail> {
  return apiFetch(`/api/members/${bioguideId}`, { signal });
}

export async function fetchVotes(params?: {
  chamber?: string;
  congress?: string;
  signal?: AbortSignal;
}): Promise<ApiVoteviewMember[]> {
  const queryParams: Record<string, string> = {};
  if (params?.chamber) queryParams.chamber = params.chamber;
  if (params?.congress) queryParams.congress = params.congress;

  return apiFetch("/api/votes", { params: queryParams, signal: params?.signal });
}

export async function fetchFinance(
  candidateId: string,
  cycle?: string,
  signal?: AbortSignal
): Promise<ApiFinance> {
  const params: Record<string, string> = {};
  if (cycle) params.cycle = cycle;

  return apiFetch(`/api/finance/${candidateId}`, { params, signal });
}

export async function searchCandidate(
  name: string,
  office?: string,
  signal?: AbortSignal
): Promise<Array<{ candidate_id: string; name: string; party: string; office: string; state: string }>> {
  const params: Record<string, string> = { name };
  if (office) params.office = office;

  return apiFetch("/api/finance/search", { params, signal });
}

export async function fetchLeaderboard(signal?: AbortSignal): Promise<ApiLeaderboard> {
  return apiFetch("/api/leaderboard", { signal });
}
