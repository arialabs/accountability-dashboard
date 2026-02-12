/**
 * TypeScript types for Executive Branch accountability tracking
 */

export interface PresidentialPromise {
  id: number;
  president: string;
  promise_text: string;
  category: string;
  subcategory?: string;
  date_made?: string; // ISO date
  source_url?: string;
  source_type?: 'campaign_speech' | 'debate' | 'interview' | 'platform' | 'rally' | 'other';
  status: 'pending' | 'in_progress' | 'achieved' | 'broken' | 'modified';
  status_updated_at?: string;
  priority?: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
}

export interface CabinetMember {
  id: string; // e.g., "secretary-of-state"
  name: string;
  position: string;
  department: string;
  appointed_date?: string;
  confirmed_date?: string;
  senate_vote?: string;
  term_end_date?: string;
  bio?: string;
  photo_url?: string;
  prior_positions?: PriorPosition[];
  net_worth?: string;
  created_at: string;
  updated_at: string;
}

export interface PriorPosition {
  title: string;
  organization: string;
  years: string;
}

export interface CabinetAction {
  id: number;
  cabinet_member_id: string;
  action_type: 'executive_order' | 'regulation' | 'speech' | 'testimony' | 'policy_decision' | 'public_statement';
  title: string;
  description?: string;
  summary?: string;
  action_date: string;
  announced_date?: string;
  source_url?: string;
  source_type?: 'federal_register' | 'news' | 'whitehouse' | 'department_website' | 'congressional_testimony';
  document_number?: string;
  impact_score?: number; // 1-10
  controversial?: boolean;
  related_promise_ids?: number[];
  created_at: string;
  updated_at: string;
}

export interface AlignmentScore {
  cabinet_member_id: string;
  promise_id: number;
  alignment_score: number; // -100 to +100
  confidence_level: 'low' | 'medium' | 'high';
  rationale?: string;
  supporting_action_ids?: number[];
  calculated_at: string;
  last_updated: string;
}

export interface CabinetMemberStats {
  cabinet_member_id: string;
  overall_alignment_score?: number;
  alignment_trend?: 'improving' | 'stable' | 'declining';
  total_actions: number;
  recent_actions_30d: number;
  executive_orders_count: number;
  public_statements_count: number;
  promises_aligned: number;
  promises_conflicted: number;
  promises_neutral: number;
  last_action_date?: string;
  updated_at: string;
}

export interface ExecutiveOrder {
  id: number;
  order_number?: number;
  title: string;
  summary?: string;
  full_text?: string;
  signed_date: string;
  president: string;
  federal_register_number?: string;
  federal_register_url?: string;
  category?: string;
  affected_departments?: string[];
  related_cabinet_members?: string[];
  related_promise_ids?: number[];
  significance?: 'major' | 'moderate' | 'minor';
  controversial?: boolean;
  created_at: string;
  updated_at: string;
}

// Extended cabinet member with alignment data for UI
export interface CabinetMemberWithAlignment extends CabinetMember {
  stats?: CabinetMemberStats;
  recent_actions?: CabinetAction[];
  alignment_scores?: AlignmentScore[];
  related_promises?: PresidentialPromise[];
}

// For displaying promise tracking
export interface PromiseWithAlignment extends PresidentialPromise {
  aligned_members?: string[]; // cabinet member IDs
  conflicted_members?: string[];
  alignment_scores?: AlignmentScore[];
}

// Utility types for API responses
export interface AlignmentDashboard {
  member: CabinetMemberWithAlignment;
  promises: PromiseWithAlignment[];
  recent_actions: CabinetAction[];
  executive_orders: ExecutiveOrder[];
}

export interface PromiseCategory {
  category: string;
  promise_count: number;
  achieved: number;
  in_progress: number;
  broken: number;
  pending: number;
}
