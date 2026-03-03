/**
 * Data loading utilities for the accountability dashboard
 * v2: Real data only, no fake scores
 */

import membersData from "../data/members.json";
import financeData from "../data/finance.json";
// trades-by-member.json excluded from build (72MB exceeds CF Pages 25MB limit)
// TODO: Split per-member or serve from API
const tradesData: Record<string, any[]> = {};
import scotusData from "../data/scotus.json";
import houseDisclosuresData from "../data/house-disclosures.json";
import alignmentData from "../data/alignment-scores.json";
import usaspendingData from "../data/usaspending.json";
import type { Member, CampaignFinance, SupremeCourtJustice, AgencySpendingProfile, USASpendingDataStore } from "./types";
import { getDonorBreakdown, searchCandidateByName, getCandidateFinancials, getScheduleAContributions } from './fec';
import { aggregateByIndustry } from './industry-classifier';

// Alignment score types
interface CategoryBreakdown {
  aligned: number;
  total: number;
  score: number;
}

interface NotableMisalignment {
  vote_id: string;
  topic: string;
  stated_stance: string;
  actual_vote: string;
  expected_vote: string;
}

export interface AlignmentScore {
  bioguide_id: string;
  name: string;
  total_votes_analyzed: number;
  aligned_votes: number;
  misaligned_votes: number;
  alignment_score: number;
  category_breakdown: Record<string, CategoryBreakdown>;
  notable_misalignments: NotableMisalignment[];
}

// Re-export types for convenience
export type { Member, CampaignFinance, SupremeCourtJustice } from "./types";

// State name to abbreviation mapping
const STATE_ABBREV: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
  "Puerto Rico": "PR", "Guam": "GU", "American Samoa": "AS",
  "Virgin Islands": "VI", "Northern Mariana Islands": "MP",
};

interface RawMember {
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
  committees: Array<{
    name: string;
    code: string;
    chamber: "house" | "senate" | "joint";
    rank?: number;
    is_chair: boolean;
    is_ranking_member: boolean;
    subcommittees?: Array<{
      name: string;
      code: string;
      rank?: number;
      is_chair: boolean;
      is_ranking_member: boolean;
    }>;
  }>;
  party_loyalty_pct?: number | null;
  ideology_score?: number | null;
  votes_cast?: number;
}

// Transform raw member data
function transformMember(raw: RawMember): Member {
  return {
    bioguide_id: raw.bioguide_id,
    first_name: raw.first_name,
    last_name: raw.last_name,
    full_name: raw.full_name,
    party: raw.party as Member["party"],
    state: STATE_ABBREV[raw.state] || raw.state,
    district: raw.district,
    chamber: raw.chamber,
    photo_url: raw.photo_url,
    bills_sponsored: raw.bills_sponsored || 0,
    bills_cosponsored: raw.bills_cosponsored || 0,
    committees: raw.committees || [],
    party_alignment_pct: raw.party_loyalty_pct ?? 0,
    ideology_score: raw.ideology_score ?? null,
    votes_cast: raw.votes_cast || 0,
  };
}

// JSON imports are already module-cached by webpack/Node — no extra caching needed.
// See: https://nextjs.org/docs/app/api-reference/functions/unstable_cache
// Transforming directly keeps state immutable and safe across HMR reloads.

export function getMembers(): Member[] {
  return (membersData as RawMember[]).map(transformMember);
}

export function getMember(bioguideId: string): Member | undefined {
  return getMembers().find(m => m.bioguide_id === bioguideId);
}

// Finance data access — builds Map from JSON import on each call.
// JSON imports are module-cached by the bundler, so no module-level Map needed.
function getFinanceMap(): Map<string, CampaignFinance> {
  const map = new Map<string, CampaignFinance>();
  const data = financeData as unknown as Record<string, CampaignFinance>;
  for (const [bioguideId, finance] of Object.entries(data)) {
    map.set(bioguideId, finance);
  }
  return map;
}

// Static finance data (from pre-built JSON)
export function getMemberFinanceStatic(bioguideId: string): CampaignFinance | null {
  return getFinanceMap().get(bioguideId) || null;
}

/**
 * Helper: Find FEC candidate record for a member
 */
async function findFECCandidate(member: Member) {
  const office = member.chamber === 'house' ? 'H' : 'S';
  return await searchCandidateByName(
    member.first_name,
    member.last_name,
    office
  );
}

/**
 * Helper: Fetch all FEC data for a member in parallel
 */
async function fetchFECDataForMember(candidateId: string) {
  return await Promise.all([
    getDonorBreakdown(candidateId),
    getCandidateFinancials(candidateId),
    getScheduleAContributions(candidateId, undefined, 500),
  ]);
}

/**
 * Helper: Transform FEC API data to CampaignFinance format
 */
function transformToFinance(
  candidateId: string,
  breakdown: any,
  financials: any,
  scheduleAData: any[]
): CampaignFinance {
  // Classify contributions by industry
  const industries = aggregateByIndustry(scheduleAData);
  const topIndustries = industries.slice(0, 10).map(ind => ({
    industry: ind.displayName,
    total: ind.total,
    pac_amount: 0, // Not available from Schedule A directly
    individual_amount: ind.total,
  }));

  return {
    candidate_id: candidateId,
    cycle: breakdown.cycle,
    total_raised: breakdown.total_raised,
    total_spent: financials?.total_disbursements || 0,
    cash_on_hand: financials?.cash_on_hand || 0,
    individual_contributions: breakdown.individual_total,
    pac_contributions: breakdown.pac_total,
    party_contributions: financials?.party_contributions || 0,
    candidate_self_funding: financials?.candidate_contributions || 0,
    small_donors: breakdown.small_donor_total,
    large_donors: breakdown.large_donor_total,
    pac_percentage: breakdown.pac_percentage,
    small_donor_percentage: breakdown.small_donor_percentage,
    large_donor_percentage: breakdown.large_donor_percentage,
    top_contributors: breakdown.top_contributors,
    top_industries: topIndustries,
  };
}

/**
 * Get member finance data - fetches from OpenFEC API in real-time
 * Falls back to static data if API fails
 * 
 * Refactored to use single-purpose helper functions for better maintainability
 */
export async function getMemberFinance(bioguideId: string): Promise<CampaignFinance | null> {
  const member = getMember(bioguideId);
  if (!member) return null;

  try {
    // Step 1: Find candidate in FEC database
    const candidate = await findFECCandidate(member);
    if (!candidate) {
      return getMemberFinanceStatic(bioguideId);
    }

    // Step 2: Fetch all FEC data in parallel
    const [breakdown, financials, scheduleAData] = await fetchFECDataForMember(candidate.candidate_id);

    if (!breakdown) {
      return getMemberFinanceStatic(bioguideId);
    }

    // Step 3: Transform to our format
    return transformToFinance(candidate.candidate_id, breakdown, financials, scheduleAData);
  } catch (error) {
    // Fall back to static data on error
    return getMemberFinanceStatic(bioguideId);
  }
}

export function getMembersByState(stateAbbrev: string): Member[] {
  return getMembers().filter(m => m.state === stateAbbrev);
}

export function getMembersByChamber(chamber: "house" | "senate"): Member[] {
  return getMembers().filter(m => m.chamber === chamber);
}

export function getMembersByParty(party: string): Member[] {
  return getMembers().filter(m => m.party === party);
}

// Get unique states with their counts
export function getStates(): Array<{ abbrev: string; name: string; count: number }> {
  const stateCount = new Map<string, number>();
  
  for (const member of getMembers()) {
    stateCount.set(member.state, (stateCount.get(member.state) || 0) + 1);
  }
  
  const abbrevToName = Object.fromEntries(
    Object.entries(STATE_ABBREV).map(([name, abbrev]) => [abbrev, name])
  );
  
  return Array.from(stateCount.entries())
    .map(([abbrev, count]) => ({
      abbrev,
      name: abbrevToName[abbrev] || abbrev,
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Get party breakdown
export function getPartyBreakdown() {
  const members = getMembers();
  return {
    total: members.length,
    democrats: members.filter(m => m.party === "D").length,
    republicans: members.filter(m => m.party === "R").length,
    independents: members.filter(m => m.party === "I").length,
    other: members.filter(m => !["D", "R", "I"].includes(m.party)).length,
    house: members.filter(m => m.chamber === "house").length,
    senate: members.filter(m => m.chamber === "senate").length,
  };
}

// Get members sorted by total raised (for rankings)
export function getMembersByFunding(): Array<Member & { finance: CampaignFinance | null }> {
  const members = getMembers();
  const financeMap = getFinanceMap();
  
  return members
    .map(m => ({
      ...m,
      finance: financeMap.get(m.bioguide_id) || null,
    }))
    .sort((a, b) => {
      const aRaised = a.finance?.total_raised || 0;
      const bRaised = b.finance?.total_raised || 0;
      return bRaised - aRaised;
    });
}

// Stock trades data (from Quiver Quant)
const tradesMap = tradesData as Record<string, Array<{
  ticker: string;
  company: string | null;
  tradedDate: string;
  filedDate: string;
  transaction: string;
  tradeSizeUsd: number;
  excessReturn: number | null;
}>>;

// Get stock trades for a member by bioguide_id
export function getMemberTrades(bioguideId: string) {
  const trades = tradesMap[bioguideId] || [];
  // Sort by trade date, most recent first
  return trades.sort((a, b) => 
    new Date(b.tradedDate).getTime() - new Date(a.tradedDate).getTime()
  );
}

// Convert committee data to format expected by CommitteeMemberships component
export function getMemberCommitteesForDisplay(bioguideId: string): Array<{
  name: string;
  role: "Chair" | "Ranking Member" | "Member" | "Vice Chair";
  subcommittees?: string[];
}> {
  const member = getMember(bioguideId);
  if (!member || !member.committees) return [];
  
  return member.committees.map(committee => {
    let role: "Chair" | "Ranking Member" | "Member" | "Vice Chair" = "Member";
    
    if (committee.is_chair) {
      role = "Chair";
    } else if (committee.is_ranking_member) {
      role = "Ranking Member";
    }
    
    // Extract subcommittee names
    const subcommittees = committee.subcommittees?.map(sub => sub.name) || [];
    
    return {
      name: committee.name,
      role,
      subcommittees: subcommittees.length > 0 ? subcommittees : undefined,
    };
  });
}

// ==================== Supreme Court Data ====================

export function getSupremeCourtJustices(): SupremeCourtJustice[] {
  return scotusData as SupremeCourtJustice[];
}

export function getSupremeCourtJustice(id: string): SupremeCourtJustice | undefined {
  return getSupremeCourtJustices().find(j => j.id === id);
}

// Get justices sorted by ideology (liberal to conservative)
export function getJusticesByIdeology(): SupremeCourtJustice[] {
  return [...getSupremeCourtJustices()].sort((a, b) => a.ideology_score - b.ideology_score);
}

// Get ideology breakdown
export function getIdeologyBreakdown() {
  const justices = getSupremeCourtJustices();
  return {
    total: justices.length,
    liberal: justices.filter(j => j.ideology_score < -1).length,
    moderate: justices.filter(j => j.ideology_score >= -1 && j.ideology_score <= 1).length,
    conservative: justices.filter(j => j.ideology_score > 1).length,
  };
}

// ==================== Financial Disclosures Data ====================

export interface FinancialDisclosure {
  last: string;
  first: string;
  prefix: string;
  suffix: string;
  filingType: string;
  stateDst: string;
  year: number;
  filingDate: string;
  docId: string;
  pdfUrl: string;
}

interface MemberDisclosures {
  bioguideId: string;
  name: string;
  state: string;
  district: string;
  filings: FinancialDisclosure[];
}

// Financial disclosures data (from House Clerk)
const disclosuresData = houseDisclosuresData as MemberDisclosures[];

// Get financial disclosures for a member by bioguide_id
export function getMemberDisclosures(bioguideId: string): FinancialDisclosure[] {
  const memberData = disclosuresData.find(d => d.bioguideId === bioguideId);
  if (!memberData) return [];
  
  // Sort by year, most recent first
  return [...memberData.filings].sort((a, b) => b.year - a.year);
}

// ==================== Alignment Score Data ====================

// Get alignment score for a member
export function getMemberAlignment(bioguideId: string): AlignmentScore | null {
  const alignment = (alignmentData as AlignmentScore[]).find(
    a => a.bioguide_id === bioguideId
  );
  return alignment || null;
}

// Get all alignment scores
export function getAllAlignmentScores(): AlignmentScore[] {
  return alignmentData as AlignmentScore[];
}

// Get alignment score ranking for a member
export function getAlignmentRanking(bioguideId: string): { rank: number; total: number } | null {
  const scores = alignmentData as AlignmentScore[];
  const index = scores.findIndex(a => a.bioguide_id === bioguideId);
  if (index === -1) return null;
  return { rank: index + 1, total: scores.length };
}

// ==================== USASpending Agency Data ====================

const usaSpendingStore = usaspendingData as USASpendingDataStore;

function toAgencySlug(department: string): string {
  return department
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getUSASpendingStore(): USASpendingDataStore {
  return usaSpendingStore;
}

export function getAgencySpendingByDepartment(department: string): AgencySpendingProfile | null {
  const slug = toAgencySlug(department);
  return usaSpendingStore.agencies?.[slug] || null;
}

export function getOfficialAgencySpending(officialId: string): AgencySpendingProfile | null {
  const mapping = usaSpendingStore.officials?.[officialId];
  if (!mapping) return null;
  return usaSpendingStore.agencies?.[mapping.agency_slug] || null;
}

// ==================== Scandals & Controversies Data ====================

import scandalsData from "../data/scandals.json";
import type { ScandalEntry } from "./types";

// Get all scandals
export function getAllScandals(): ScandalEntry[] {
  return scandalsData as ScandalEntry[];
}

// Get scandals for a specific member
export function getMemberScandals(bioguideId: string): ScandalEntry[] {
  return (scandalsData as ScandalEntry[]).filter(
    s => s.bioguide_id === bioguideId
  );
}

// Get scandal by ID
export function getScandalById(id: string): ScandalEntry | null {
  return (scandalsData as ScandalEntry[]).find(s => s.id === id) || null;
}

// ==================== Deep Dives / Investigations Data ====================

export {
  getAllDeepDives,
  getDeepDiveBySlug,
  getDeepDivesByTag,
  type DeepDive,
} from './deep-dives';
export function getAllMembers(): Member[] { return getMembers(); }
