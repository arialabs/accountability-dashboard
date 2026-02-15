// @ts-nocheck
/**
 * Executive Branch Official Types
 * Comprehensive data model for tracking cabinet members, agency heads, and executive officials
 */

// ==================== Core Executive Official Types ====================

export type OfficialRole = 
  | "president"
  | "vice_president"
  | "cabinet_secretary"
  | "agency_head"
  | "special_position"
  | "advisor";

export type DepartmentName =
  | "Department of State"
  | "Department of Defense"
  | "Department of Justice"
  | "Department of the Treasury"
  | "Department of Health and Human Services"
  | "Department of Homeland Security"
  | "Department of the Interior"
  | "Department of Agriculture"
  | "Department of Commerce"
  | "Department of Labor"
  | "Department of Transportation"
  | "Department of Energy"
  | "Department of Education"
  | "Department of Veterans Affairs"
  | "Department of Housing and Urban Development"
  | "Environmental Protection Agency"
  | "Office of Management and Budget"
  | "DOGE"
  | "White House Staff"
  | "Other";

export interface ExecutiveOfficial {
  id: string;
  name: string;
  role: string;
  official_role: OfficialRole;
  department: DepartmentName;
  photo_url: string;
  
  // Appointment details
  appointed_date: string;
  confirmation_vote?: string;
  tenure_start: string;
  tenure_end?: string;
  
  // Background
  bio: string;
  prior_positions: Position[];
  education?: Education[];
  
  // Financial
  net_worth: string;
  financial_disclosures: FinancialDisclosure[];
  
  // Conflicts & controversies
  conflicts_of_interest: ConflictOfInterest[];
  controversies?: Controversy[];
  
  // Policy positions
  policy_positions: PolicyPosition[];
  
  // Activity metrics
  actions_count?: number;
  budget_impact?: number;
  approval_rating?: number;
}

export interface Position {
  title: string;
  organization: string;
  years: string;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  year?: number;
}

export interface FinancialDisclosure {
  year: number;
  filing_date: string;
  net_worth_min: number;
  net_worth_max: number;
  assets: Asset[];
  liabilities?: Liability[];
  income_sources?: IncomeSource[];
  url: string;
}

export interface Asset {
  description: string;
  type: "stock" | "bond" | "real_estate" | "business" | "other";
  value_min: number;
  value_max: number;
  income?: number;
}

export interface Liability {
  description: string;
  creditor: string;
  amount_min: number;
  amount_max: number;
}

export interface IncomeSource {
  source: string;
  type: string;
  amount_min: number;
  amount_max: number;
}

// ==================== Conflicts of Interest ====================

export type ConflictSeverity = "low" | "medium" | "high" | "critical";

export type ConflictCategory =
  | "financial"
  | "political"
  | "corporate"
  | "foreign_influence"
  | "personal_conduct"
  | "qualifications"
  | "independence"
  | "corruption"
  | "ideology"
  | "public_health"
  | "labor"
  | "policy";

export interface ConflictOfInterest {
  description: string;
  severity: ConflictSeverity;
  category: ConflictCategory;
  evidence?: Evidence[];
  status?: "alleged" | "confirmed" | "under_investigation" | "resolved";
}

export interface Evidence {
  type: "document" | "news" | "filing" | "testimony" | "video";
  description: string;
  url: string;
  date: string;
  source: string;
}

// ==================== Controversies & Scandals ====================

export interface Controversy {
  id: string;
  title: string;
  description: string;
  date: string;
  severity: ConflictSeverity;
  category: string[];
  status: "ongoing" | "resolved" | "dismissed";
  outcome?: string;
  sources: Source[];
}

export interface Source {
  type: "news" | "court_doc" | "official_report" | "congressional_record" | "filing";
  title: string;
  publication: string;
  url: string;
  published_date: string;
  archived_url?: string;
  credibility_rating?: "high" | "medium" | "low";
}

// ==================== Policy Positions ====================

export interface PolicyPosition {
  topic: string;
  stance: string;
  evidence?: string[];
  sources?: Source[];
}

// ==================== Executive Actions ====================

export type ActionType =
  | "executive_order"
  | "memorandum"
  | "proclamation"
  | "budget_proposal"
  | "budget_cut"
  | "layoff"
  | "hiring_freeze"
  | "program_elimination"
  | "program_expansion"
  | "policy_reversal"
  | "regulatory_action"
  | "appointment"
  | "firing"
  | "speech"
  | "statement";

export interface ExecutiveAction {
  id: string;
  official_id: string;
  official_name: string;
  department: DepartmentName;
  
  // Action details
  type: ActionType;
  title: string;
  description: string;
  date: string;
  
  // Impact
  impact_category: string[];
  americans_affected?: number;
  budget_impact?: number;
  
  // Details
  document_url?: string;
  federal_register_url?: string;
  summary: string;
  
  // Analysis
  beneficiaries?: string[];
  affected_groups?: string[];
  related_promise?: string;
  
  // Metadata
  sources: Source[];
  created_at: string;
  updated_at: string;
}

// ==================== Timeline ====================

export interface TimelineEvent {
  id: string;
  date: string;
  type: ActionType;
  title: string;
  description: string;
  official_id: string;
  official_name: string;
  department: DepartmentName;
  impact_score?: number;
  sources?: Source[];
}

export interface Timeline {
  events: TimelineEvent[];
  filters: {
    departments?: DepartmentName[];
    action_types?: ActionType[];
    date_range?: {
      start: string;
      end: string;
    };
  };
}

// ==================== Financial Impact ====================

export interface BudgetImpact {
  action_id: string;
  fiscal_year: number;
  
  // Amounts (in dollars)
  estimated_cost?: number;
  estimated_savings?: number;
  net_impact: number;
  
  // Breakdown
  affected_programs: AffectedProgram[];
  
  // Analysis
  methodology: string;
  assumptions: string[];
  sources: Source[];
  confidence_level: "low" | "medium" | "high";
}

export interface AffectedProgram {
  name: string;
  agency: string;
  current_funding: number;
  proposed_funding: number;
  change_amount: number;
  change_percent: number;
  beneficiaries_affected: number;
  beneficiary_demographics?: string[];
}

// ==================== Approval & Sentiment ====================

export interface ApprovalRating {
  official_id: string;
  date: string;
  approve: number;
  disapprove: number;
  no_opinion: number;
  sample_size: number;
  pollster: string;
  url: string;
}

export interface SentimentData {
  official_id: string;
  date: string;
  source: "news" | "social_media" | "polling";
  sentiment: "positive" | "negative" | "neutral";
  score: number; // -100 to +100
  sample_size?: number;
  topics?: string[];
}

// ==================== Dashboard Metrics ====================

export interface OfficialMetrics {
  official_id: string;
  
  // Activity
  total_actions: number;
  actions_by_type: Record<ActionType, number>;
  recent_actions: ExecutiveAction[];
  
  // Financial impact
  total_budget_impact: number;
  total_cost: number;
  total_savings: number;
  affected_programs_count: number;
  
  // Public sentiment
  current_approval?: number;
  approval_trend: "up" | "down" | "stable";
  approval_history: ApprovalRating[];
  
  // Conflicts
  conflict_count: number;
  conflicts_by_severity: Record<ConflictSeverity, number>;
  
  // Controversies
  controversy_count: number;
  active_controversies: number;
}

export interface DepartmentMetrics {
  department: DepartmentName;
  
  // Officials
  officials: ExecutiveOfficial[];
  
  // Activity
  total_actions: number;
  recent_actions: ExecutiveAction[];
  
  // Financial
  budget_impact: number;
  affected_programs: AffectedProgram[];
  
  // Personnel
  employees_affected?: number;
  layoffs?: number;
  hiring_freezes?: boolean;
}

// ==================== API & Data Fetching ====================

export interface ExecutiveDataResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  cache_timestamp?: number;
}

export interface PaginatedExecutiveResponse<T> {
  results: T[];
  pagination: {
    count: number;
    page: number;
    pages: number;
    per_page: number;
  };
}

// ==================== Filter & Search ====================

export interface ExecutiveFilters {
  departments?: DepartmentName[];
  roles?: OfficialRole[];
  conflict_severity?: ConflictSeverity[];
  has_conflicts?: boolean;
  approval_rating_min?: number;
  approval_rating_max?: number;
  tenure_status?: "current" | "former" | "all";
  search?: string;
}

export interface ActionFilters {
  types?: ActionType[];
  departments?: DepartmentName[];
  officials?: string[];
  date_start?: string;
  date_end?: string;
  min_impact?: number;
  categories?: string[];
}
