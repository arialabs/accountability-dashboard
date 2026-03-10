/**
 * Core TypeScript interfaces for the accountability dashboard
 * v2: Focused on transparency data, no arbitrary grades
 */

// ==================== Member Data ====================

export interface Member {
  bioguide_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  party: "D" | "R" | "I" | string;
  state: string;
  district: number | null;
  chamber: "house" | "senate";
  photo_url: string | null;
  
  // Legislative activity (Congress.gov)
  bills_sponsored: number;
  bills_cosponsored: number;
  
  // Committee assignments (Congress.gov)
  committees: Committee[];
  
  // Voting behavior (Voteview)
  party_alignment_pct: number;
  ideology_score: number | null;
  votes_cast: number;
  
  // Senate-specific fields
  senate_class?: "I" | "II" | "III" | null;
  next_election?: number | null;
}

// ==================== Committee Data ====================

export interface Committee {
  name: string;
  code: string;
  chamber: "house" | "senate" | "joint";
  rank?: number;
  is_chair: boolean;
  is_ranking_member: boolean;
  // Subcommittees
  subcommittees?: Subcommittee[];
}

export interface Subcommittee {
  name: string;
  code: string;
  rank?: number;
  is_chair: boolean;
  is_ranking_member: boolean;
}

// ==================== Campaign Finance (OpenFEC) ====================

export interface CampaignFinance {
  candidate_id: string;
  cycle: number;
  
  // Totals
  total_raised: number;
  total_spent: number;
  cash_on_hand: number;
  
  // Source breakdown
  individual_contributions: number;
  pac_contributions: number;
  party_contributions: number;
  candidate_self_funding: number;
  
  // Individual donor breakdown
  small_donors: number;        // ≤$200 (unitemized)
  large_donors: number;        // >$200 (itemized)
  
  // Percentages for quick display
  pac_percentage: number;
  small_donor_percentage: number;
  large_donor_percentage: number;
  
  // Top contributors
  top_contributors: Contributor[];
  
  // Industry breakdown
  top_industries: IndustryDonation[];
}

export interface Contributor {
  name: string;
  total: number;
  count: number;
  type: 'individual' | 'pac' | 'party' | 'committee';
  employer?: string;
  occupation?: string;
}

export interface IndustryDonation {
  industry: string;
  total: number;
  pac_amount: number;
  individual_amount: number;
}

// ==================== Red Flags (Transparency Indicators) ====================

export interface RedFlag {
  type: 'finance' | 'trading' | 'wealth' | 'voting';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  data?: Record<string, unknown>;
}

// ==================== Stock Trading ====================

export interface StockTrade {
  disclosure_date: string;
  transaction_date: string;
  ticker: string;
  company_name: string;
  asset_type: 'stock' | 'bond' | 'fund' | 'option' | 'other';
  transaction_type: 'purchase' | 'sale' | 'exchange';
  amount_range: string;  // e.g., "$15,001 - $50,000"
  
  // Parsed amounts
  amount_min?: number;
  amount_max?: number;
}

export interface TradingProfile {
  total_trades: number;
  total_value_min: number;
  total_value_max: number;
  
  // Conflict of interest analysis
  committee_related_trades: number;
  days_to_disclosure_avg: number;
  
  // Flagged trades
  flagged_trades: FlaggedTrade[];
}

export interface FlaggedTrade extends StockTrade {
  flag_reason: string;
  related_committee?: string;
  related_legislation?: string;
}

// ==================== Scandals & Controversies ====================

export type SeverityLevel = 
  | "conviction" 
  | "indictment" 
  | "criminal_investigation" 
  | "ethics_violation" 
  | "ethics_investigation" 
  | "allegation";

export interface Source {
  type: "news" | "court_doc" | "official_report" | "congressional_record" | "filing";
  title: string;
  publication: string;
  url: string;
  published_date: string;
  archived_url?: string;
  credibility_rating?: "high" | "medium";
}

export interface ScandalEntry {
  id: string;
  bioguide_id: string;
  member_name: string;
  party: "D" | "R" | "I";
  chamber: "house" | "senate" | "executive";
  state: string;
  district?: string;
  
  // Incident details
  date: string; // ISO 8601
  severity: SeverityLevel;
  category: string[];
  title: string;
  description: string;
  
  // Sources (REQUIRED)
  sources: Source[];
  
  // Metadata
  status: "ongoing" | "resolved" | "dismissed";
  outcome?: string;
  created_at: string;
  updated_at: string;
  
  // Optional extended fields
  involved_members?: string[];
}

// ==================== Wealth Tracking ====================

export interface WealthSnapshot {
  year: number;
  net_worth_min: number;
  net_worth_max: number;
  net_worth_mid: number;  // Midpoint estimate
  source: 'disclosure' | 'estimate';
}

export interface WealthProfile {
  first_year_in_office: number;
  snapshots: WealthSnapshot[];
  
  // Calculated metrics
  total_change: number;
  percent_change: number;
  annual_growth_rate: number;
  
  // Context
  median_constituent_income?: number;
  salary_total?: number;  // Total salary earned over period
}

// ==================== Voting Record ====================

export interface VoteCategory {
  category: string;  // Healthcare, Environment, Defense, etc.
  total_votes: number;
  votes_for: number;
  votes_against: number;
  abstained: number;
  
  // Notable votes
  key_votes: KeyVote[];
}

export interface KeyVote {
  date: string;
  bill_id: string;
  bill_title: string;
  plainEnglishSummary?: string;  // Short, plain English summary (1 sentence, <20 words)
  vote: 'yea' | 'nay' | 'abstain' | 'not_voting';
  bill_outcome: 'passed' | 'failed';
  
  // Context
  description?: string;
  who_benefits?: string[];  // ['corporations', 'consumers', etc.]
}

// ==================== API Types ====================

export interface FECCandidate {
  candidate_id: string;
  name: string;
  party: string;
  office: string;
  state: string;
  district?: string;
  election_years: number[];
}

export interface FECFinancialSummary {
  candidate_id: string;
  cycle: number;
  total_receipts: number;
  total_disbursements: number;
  cash_on_hand: number;
  individual_contributions: number;
  pac_contributions: number;
  party_contributions: number;
  candidate_contributions: number;
  other_receipts: number;
  individual_itemized: number;
  individual_unitemized: number;
}

export interface FECContributor {
  name: string;
  total: number;
  count: number;
  type: 'individual' | 'pac' | 'party';
}

export interface FECDonorBreakdown {
  candidate_id: string;
  cycle: number;
  pac_percentage: number;
  individual_percentage: number;
  small_donor_percentage: number;
  large_donor_percentage: number;
  top_contributors: FECContributor[];
  total_raised: number;
  pac_total: number;
  individual_total: number;
  small_donor_total: number;
  large_donor_total: number;
}

// FEC API raw response types
export interface FECApiFinancialTotals {
  cycle?: number;
  receipts?: number;
  disbursements?: number;
  cash_on_hand_end_period?: number;
  individual_contributions?: number;
  other_political_committee_contributions?: number;
  political_party_committee_contributions?: number;
  candidate_contribution?: number;
  other_receipts?: number;
  individual_itemized_contributions?: number;
  individual_unitemized_contributions?: number;
}

export interface FECApiContributor {
  contributor_name?: string;
  total?: number;
  count?: number;
  contributor_type?: string;
}

export interface FECApiScheduleAContribution {
  contributor_name?: string;
  contributor_employer?: string;
  contributor_occupation?: string;
  contribution_receipt_amount?: number;
  contribution_receipt_date?: string;
  committee?: {
    name?: string;
  };
}

// ==================== Cache & API Utilities ====================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires_at: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  cache_timestamp?: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  pagination: {
    count: number;
    page: number;
    pages: number;
    per_page: number;
  };
}

export type ApiErrorCode = 
  | 'NETWORK_ERROR'
  | 'API_KEY_MISSING'
  | 'RATE_LIMIT'
  | 'NOT_FOUND'
  | 'INVALID_REQUEST'
  | 'SERVER_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
  retry_after?: number;
}

// ==================== Supreme Court ====================

export interface KeyRuling {
  case: string;
  year: number;
  vote: "Majority" | "Dissent" | "Concurrence";
  description: string;
  url?: string;
}

export interface JusticeCareerPosition {
  role: string;
  org: string;
  years: string;
}

export interface JusticeControversy {
  title: string;
  year: number;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  source: string;
}

export interface JusticeFinancialDisclosure {
  year: number;
  url: string;
}

export interface SupremeCourtJustice {
  id: string;
  name: string;
  title: "Chief Justice" | "Associate Justice";
  appointed_by: string;
  confirmation_year: number;
  photo_url: string;
  ideology_score: number;  // Martin-Quinn score: negative = liberal, positive = conservative
  ideology_label: "Very Liberal" | "Liberal" | "Moderate" | "Conservative" | "Very Conservative";
  bio: string;
  birth_year?: number;
  home_state?: string;
  law_school?: string;
  career?: JusticeCareerPosition[];
  controversies?: JusticeControversy[];
  financial_disclosures?: JusticeFinancialDisclosure[];
  key_rulings?: KeyRuling[];
}

// ==================== Political Positions (OnTheIssues.org) ====================

export interface Position {
  topic: string;
  stance: "Strongly Supports" | "Supports" | "Neutral" | "Opposes" | "Strongly Opposes";
  intensity: number;  // 1-5 scale: 1=Strongly Opposes, 3=Neutral, 5=Strongly Supports
  quotes: string[];   // Supporting quotes and statements
  votes: string[];    // Related bill numbers (HR123, S456, etc.)
  source_url?: string;
}

export interface MemberPositions {
  bioguide_id: string;
  name: string;
  source: "ontheissues";
  source_url: string;
  last_updated: string;
  positions: Position[];
}

export interface PositionData {
  members: MemberPositions[];
  generated_at: string;
  total_members: number;
  total_positions: number;
}

// ==================== Presidential Policy Impact Tracking ====================

export type PolicyCategory = 
  | 'economy' 
  | 'healthcare' 
  | 'immigration' 
  | 'environment' 
  | 'education' 
  | 'foreign-policy' 
  | 'civil-rights' 
  | 'infrastructure';

export type ImpactGrade = 'A' | 'B' | 'C+' | 'C' | 'C-' | 'D' | 'F' | 'F-';

export interface ImpactFactors {
  economic: number;    // -50 to +50
  social: number;      // -50 to +50
  polling: number;     // -25 to +25
  expert: number;      // -25 to +25
}

export interface PolicyImpact {
  id: string;
  slug: string;
  title: string;
  category: PolicyCategory;
  subcategory?: string;
  
  // Impact scoring (0-100)
  impact_score: number;
  impact_grade: ImpactGrade;
  impact_factors: ImpactFactors;
  
  // Promise tracking
  promise_text?: string;
  promise_alignment: number;  // 0-100: how closely it matched the promise
  promise_source?: string;
  
  // Key metrics
  americans_affected: number;
  date_implemented: string;
  last_updated: string;
  
  // Summary
  summary: string;
  what_was_promised: string;
  what_actually_happened: string[];
  
  // Data sources
  economic_data?: EconomicMetric[];
  polling_data?: PollingData[];
  expert_analyses?: ExpertAnalysis[];
  
  // Timeline
  timeline?: TimelineEvent[];
  
  // Related policies
  related_policy_ids?: string[];
}

export interface EconomicMetric {
  metric: string;
  value: string;
  change: string;
  source: string;
  source_url: string;
  date: string;
}

export interface PollingData {
  pollster: string;
  date: string;
  sample_size: number;
  approve: number;
  disapprove: number;
  no_opinion: number;
  url: string;
}

export interface ExpertAnalysis {
  organization: string;
  bias: 'Non-partisan' | 'Center-Left' | 'Center-Right' | 'Conservative' | 'Progressive';
  type: 'Government' | 'Think Tank' | 'Research' | 'Academic';
  summary: string;
  methodology?: string[];
  url: string;
  date: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  source?: string;
}

export interface PolicyCategoryInfo {
  slug: PolicyCategory;
  name: string;
  icon: string;
  description: string;
  subcategories: string[];
}

export interface PolicySummary {
  total_policies: number;
  overall_impact_score: number;
  overall_grade: ImpactGrade;
  americans_affected: number;
  categories: {
    [key in PolicyCategory]?: {
      count: number;
      avg_impact_score: number;
      grade: ImpactGrade;
    };
  };
}

// ==================== Bill Tracking ====================

export type BillStatus = 
  | "introduced" 
  | "committee" 
  | "floor_vote" 
  | "passed_chamber" 
  | "passed_both" 
  | "failed";

export interface BillVote {
  id: string;
  congress: number;
  chamber: "House" | "Senate";
  rollnumber: number;
  date: string;
  title: string;
  plainEnglishSummary?: string;  // Short, plain English summary (1 sentence, <20 words)
  description: string;
  category: string;
  yea_count: number;
  nay_count: number;
  result: "Passed" | "Failed" | "Unknown";
  votes: Record<string, "Yea" | "Nay" | "Not Voting" | "Present">;
}

export interface Bill {
  bill_id: string;
  title: string;
  description: string;
  category: string;
  status: BillStatus;
  
  // Progression
  introduced_date?: string;
  latest_action_date: string;
  
  // Vote history
  votes: BillVote[];
  house_votes: BillVote[];
  senate_votes: BillVote[];
  
  // Results
  passed_house: boolean;
  passed_senate: boolean;
  final_result: "Passed" | "Failed" | "Pending";
  
  // Sponsors & supporters (from vote data)
  top_supporters: Array<{ bioguide_id: string; vote: string }>;
  top_opponents: Array<{ bioguide_id: string; vote: string }>;
}

// Deep Dive Investigations
export interface DeepDiveInvestigation {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  publishedDate: string;
  readTimeMinutes: number;
  tags: string[];
  summary: string;
  keyFindings: string[];
  sections: DeepDiveSection[];
  timeline?: DeepDiveTimelineEvent[];
  individuals?: DeepDiveIndividual[];
  financialData?: DeepDiveFinancialData[];
  sources: DeepDiveSource[];
  relatedMembers?: (string | DeepDiveRelatedMember)[];
}

export interface DeepDiveSection {
  id: string;
  title: string;
  content: string;
}

export interface DeepDiveTimelineEvent {
  date: string;
  title: string;
  description: string;
  importance?: "high" | "medium" | "low";
  type?: string;
}

export interface DeepDiveIndividual {
  name: string;
  role: string;
  party?: string;
  bioguide_id?: string;
  relevance: string;
  financialData?: DeepDiveFinancialData[];
}

export interface DeepDiveFinancialData {
  label: string;
  value: string | number;
  category?: string;
  type?: string;
  party?: string;
}

export interface DeepDiveSource {
  title: string;
  name?: string;
  url: string;
  publication?: string;
  published_date?: string;
  date?: string;
  type?: string;
  credibility_rating?: string;
}

export interface DeepDiveRelatedMember {
  bioguide_id: string;
  name: string;
  party: string;
  relevance: string;
}

// ==================== USASpending (Executive Agencies) ====================

export interface AgencyFiscalYearBudget {
  fiscal_year: number;
  total_obligations: number;
  total_outlays: number;
  total_budget_authority: number;
  yoy_change_pct: number | null;
}

export interface ProgramFundingChange {
  program_name: string;
  fiscal_year: number;
  current_amount: number;
  previous_amount: number;
  change_amount: number;
  change_pct: number | null;
}

export type AgencyAwardType = 'contract' | 'grant' | 'other';

export interface AgencyAward {
  award_id: string;
  generated_internal_id: string | null;
  recipient_name: string;
  amount: number;
  award_type: AgencyAwardType;
  award_type_label: string;
  awarding_agency: string;
  awarding_sub_agency: string | null;
  action_date: string | null;
  description: string;
  source_url: string | null;
}

export interface AgencySpendingProfile {
  agency_slug: string;
  agency_name: string;
  fiscal_year_start: number;
  fiscal_year_end: number;
  budget_totals_by_fiscal_year: AgencyFiscalYearBudget[];
  program_funding_changes: ProgramFundingChange[];
  awards: AgencyAward[];
  contracts_obligated: number;
  grants_obligated: number;
  total_awards_obligated: number;
  last_updated: string;
  source: 'usaspending.gov';
}

export interface OfficialAgencyMap {
  official_id: string;
  official_name: string;
  role: string;
  department: string;
  agency_slug: string;
}

export interface USASpendingDataStore {
  meta: {
    generated_at: string;
    source: 'usaspending.gov';
    fiscal_year_start: number;
    fiscal_year_end: number;
    total_agencies: number;
    total_officials: number;
    total_awards: number;
  };
  agencies: Record<string, AgencySpendingProfile>;
  officials: Record<string, OfficialAgencyMap>;
}
