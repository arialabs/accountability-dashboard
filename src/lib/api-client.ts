/**
 * API client for the Reps API Worker
 * Fetches data from our Cloudflare Worker which serves enriched government data
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://reps-api-worker.jeremyspofford.workers.dev";

async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE}${path}`;
  const resp = await fetch(url, {
    signal,
    headers: { "Content-Type": "application/json" },
  });

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error((error as any).error || `API error: ${resp.status}`);
  }

  return resp.json() as Promise<T>;
}

// ==================== Types (matching worker response format) ====================

/** Member as returned by /api/members (same as local members.json) */
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
  bills_sponsored: number;
  bills_cosponsored: number;
  committees: any[];
  party_loyalty_pct: number;
  ideology_score: number | null;
  votes_cast: number;
  votes_against_party: number;
}

/** Leaderboard entry from /api/leaderboard */
export interface ApiLeaderboardEntry {
  bioguideId: string;
  name: string;
  party: string;
  state: string;
  chamber: "House" | "Senate";
  alignmentScore: number;
  positionsWithVotes: number;
  totalPositions: number;
}

/** Leaderboard response from /api/leaderboard */
export interface ApiLeaderboardData {
  topAligned: ApiLeaderboardEntry[];
  bottomAligned: ApiLeaderboardEntry[];
  averageScore: number;
  totalMembers: number;
  membersWithData: number;
  allEntries?: ApiLeaderboardEntry[];
}

/** Voteview member data */
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

// ==================== API Functions ====================

/** Fetch all members (returns array directly) */
export async function fetchMembers(signal?: AbortSignal): Promise<ApiMember[]> {
  return apiFetch<ApiMember[]>("/api/members", signal);
}

/** Fetch single member detail */
export async function fetchMemberDetail(
  bioguideId: string,
  signal?: AbortSignal
): Promise<ApiMember> {
  return apiFetch<ApiMember>(`/api/members/${bioguideId}`, signal);
}

/** Fetch alignment leaderboard */
export async function fetchLeaderboard(signal?: AbortSignal): Promise<ApiLeaderboardData> {
  return apiFetch<ApiLeaderboardData>("/api/leaderboard", signal);
}

/** Fetch alignment scores */
export async function fetchAlignmentScores(signal?: AbortSignal): Promise<any[]> {
  return apiFetch<any[]>("/api/alignment", signal);
}

/** Fetch alignment for a specific member */
export async function fetchMemberAlignment(
  bioguideId: string,
  signal?: AbortSignal
): Promise<any> {
  return apiFetch<any>(`/api/alignment/${bioguideId}`, signal);
}

/** Fetch key votes data */
export async function fetchKeyVotes(signal?: AbortSignal): Promise<any[]> {
  return apiFetch<any[]>("/api/key-votes", signal);
}

/** Fetch positions data */
export async function fetchPositions(signal?: AbortSignal): Promise<any> {
  return apiFetch<any>("/api/positions", signal);
}

/** Fetch stock trades for a member */
export async function fetchTrades(
  bioguideId: string,
  signal?: AbortSignal
): Promise<any> {
  return apiFetch<any>(`/api/trades/${bioguideId}`, signal);
}

/** Fetch financial disclosures for a member */
export async function fetchDisclosures(
  bioguideId: string,
  signal?: AbortSignal
): Promise<any[]> {
  return apiFetch<any[]>(`/api/disclosures/${bioguideId}`, signal);
}

/** Fetch scandals */
export async function fetchScandals(signal?: AbortSignal): Promise<any[]> {
  return apiFetch<any[]>("/api/scandals", signal);
}

/** Fetch voting records (Voteview data) */
export async function fetchVotes(params?: {
  chamber?: string;
  congress?: string;
  signal?: AbortSignal;
}): Promise<any[]> {
  // Placeholder - actual implementation depends on worker supporting this endpoint
  return [];
}
