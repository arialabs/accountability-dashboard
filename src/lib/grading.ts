/**
 * Grading module for member accountability scoring
 * 
 * Calculates an overall grade (0-100) based on four configurable factors:
 * - Donor influence (default 25%)
 * - Voting accountability (default 25%)
 * - Trading ethics (default 25%)
 * - Disclosure compliance (default 25%)
 */

export interface VotingRecord {
  key_votes_participated: number;
  key_votes_total: number;
  votes_with_party: number;
  votes_against_public_interest: number;
}

export interface TradingSummary {
  total_trades: number;
  flagged_trades: number;
  flag_rate: number;
  total_risk_score: number;
  avg_risk_per_trade: number;
  overall_suspicion_level: 'none' | 'low' | 'medium' | 'high';
}

export interface DisclosureCompliance {
  filings_count: number;
  expected_filings: number;
  late_filings: number;
  missing_filings: number;
}

export interface MemberData {
  pac_percentage?: number | null;
  large_donor_percentage?: number | null;
  voting_record?: VotingRecord;
  trading_summary?: TradingSummary;
  disclosure_compliance?: DisclosureCompliance;
}

export interface GradeWeights {
  donor: number;
  voting: number;
  trading: number;
  disclosure: number;
}

export interface GradeExplanation {
  donor: string;
  voting: string;
  trading: string;
  disclosure: string;
}

export interface GradeResult {
  overall: number;
  letter: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    donorScore: number;
    votingScore: number;
    tradingScore: number;
    disclosureScore: number;
  };
  explanation: GradeExplanation;
}

/**
 * Default weights for each accountability factor (equal weighting)
 */
export const DEFAULT_WEIGHTS: GradeWeights = {
  donor: 0.25,
  voting: 0.25,
  trading: 0.25,
  disclosure: 0.25,
};

/**
 * Calculate the donor influence score (0-100, higher is better)
 * Formula: 100 - average of PAC percentage and large donor percentage
 * 
 * Rationale: High reliance on PAC money and large donors suggests
 * greater vulnerability to special interest influence.
 */
function calculateDonorScore(data: MemberData): number {
  const pac = data.pac_percentage ?? 0;
  const largeDonor = data.large_donor_percentage ?? 0;
  
  const averageDonorInfluence = (pac + largeDonor) / 2;
  return Math.max(0, Math.min(100, 100 - averageDonorInfluence));
}

/**
 * Generate explanation for donor score
 */
function explainDonorScore(data: MemberData, score: number): string {
  const pac = data.pac_percentage ?? 0;
  const largeDonor = data.large_donor_percentage ?? 0;
  
  if (score >= 90) {
    return `Excellent funding transparency with ${pac.toFixed(1)}% from PACs and ${largeDonor.toFixed(1)}% from large donors.`;
  } else if (score >= 70) {
    return `Moderate reliance on special interests: ${pac.toFixed(1)}% PAC funding, ${largeDonor.toFixed(1)}% large donors.`;
  } else {
    return `High dependence on special interests: ${pac.toFixed(1)}% from PACs and ${largeDonor.toFixed(1)}% from large donors.`;
  }
}

/**
 * Calculate voting accountability score (0-100, higher is better)
 * Factors:
 * - Participation in key votes (40%)
 * - Party loyalty/consistency (10%)
 * - Votes against public interest (50% - heavily weighted penalty)
 * 
 * Rationale: Members should show up for important votes, maintain
 * consistent positions, and prioritize public interest over special interests.
 * Public interest alignment is weighted highest as it's the most critical factor.
 */
function calculateVotingScore(data: MemberData): number {
  if (!data.voting_record) {
    return 70; // Neutral default when data unavailable
  }
  
  const { key_votes_participated, key_votes_total, votes_with_party, votes_against_public_interest } = data.voting_record;
  
  // Participation rate (0-100)
  const participationRate = key_votes_total > 0 
    ? (key_votes_participated / key_votes_total) * 100 
    : 100;
  
  // Party loyalty rate (0-100)
  const partyLoyaltyRate = key_votes_participated > 0
    ? (votes_with_party / key_votes_participated) * 100
    : 100;
  
  // Public interest alignment (inverse of votes against public interest)
  // Apply heavy penalty for votes against public interest
  const publicInterestRate = key_votes_participated > 0
    ? (1 - (votes_against_public_interest / key_votes_participated)) * 100
    : 100;
  
  // Weighted score: participation 40%, loyalty 10%, public interest 50%
  const score = (participationRate * 0.4) + (partyLoyaltyRate * 0.1) + (publicInterestRate * 0.5);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate explanation for voting score
 */
function explainVotingScore(data: MemberData, score: number): string {
  if (!data.voting_record) {
    return 'Voting record data not yet available.';
  }
  
  const { key_votes_participated, key_votes_total, votes_against_public_interest } = data.voting_record;
  const participationRate = (key_votes_total > 0 ? (key_votes_participated / key_votes_total) * 100 : 0).toFixed(1);
  
  if (score >= 90) {
    return `Strong voting record: ${participationRate}% participation in key votes with consistent alignment.`;
  } else if (score >= 70) {
    return `Moderate voting accountability: ${participationRate}% participation with ${votes_against_public_interest} votes against public interest.`;
  } else {
    return `Concerning voting pattern: ${participationRate}% participation with ${votes_against_public_interest} votes benefiting special interests.`;
  }
}

/**
 * Calculate trading ethics score (0-100, higher is better)
 * Factors:
 * - Flag rate (percentage of suspicious trades): 50% weight
 * - Average risk per trade: 30% weight
 * - Overall suspicion level: 20% weight
 * 
 * Rationale: High flag rates and risk scores indicate potential
 * insider trading or conflicts of interest.
 */
function calculateTradingScore(data: MemberData): number {
  if (!data.trading_summary) {
    return 70; // Neutral default when data unavailable
  }
  
  const { total_trades, flag_rate, avg_risk_per_trade, overall_suspicion_level } = data.trading_summary;
  
  // No trades = perfect score
  if (total_trades === 0) {
    return 100;
  }
  
  // Flag rate score (inverted: lower flag rate = higher score)
  // 0% flags = 100, 100% flags = 0
  const flagScore = 100 - flag_rate;
  
  // Risk score (inverted and normalized)
  // Assuming avg_risk_per_trade ranges from 0-5
  // 0 risk = 100, 5 risk = 0
  const riskScore = Math.max(0, 100 - (avg_risk_per_trade * 20));
  
  // Suspicion level score
  const suspicionScore = {
    'none': 100,
    'low': 80,
    'medium': 50,
    'high': 20,
  }[overall_suspicion_level] ?? 70;
  
  // Weighted combination
  const score = (flagScore * 0.5) + (riskScore * 0.3) + (suspicionScore * 0.2);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate explanation for trading score
 */
function explainTradingScore(data: MemberData, score: number): string {
  if (!data.trading_summary) {
    return 'Stock trading data not yet available.';
  }
  
  const { total_trades, flagged_trades, flag_rate, overall_suspicion_level } = data.trading_summary;
  
  if (total_trades === 0) {
    return 'No stock trades reported - excellent ethics compliance.';
  }
  
  if (score >= 75) {
    return `Low trading concerns: ${flagged_trades}/${total_trades} trades flagged (${flag_rate.toFixed(1)}%).`;
  } else if (score >= 50) {
    return `Moderate trading concerns: ${flagged_trades}/${total_trades} trades flagged (${flag_rate.toFixed(1)}%) with ${overall_suspicion_level} suspicious activity level.`;
  } else {
    return `Serious trading ethics concerns: ${flagged_trades}/${total_trades} trades flagged (${flag_rate.toFixed(1)}%) with ${overall_suspicion_level} suspicious activity level.`;
  }
}

/**
 * Calculate disclosure compliance score (0-100, higher is better)
 * Factors:
 * - Filing completeness (met expected count): 40% weight
 * - Late filing penalty: 40% weight
 * - Missing filing penalty: 20% weight (severe)
 * 
 * Rationale: Timely and complete financial disclosures are essential
 * for transparency and public accountability.
 */
function calculateDisclosureScore(data: MemberData): number {
  if (!data.disclosure_compliance) {
    return 70; // Neutral default when data unavailable
  }
  
  const { filings_count, expected_filings, late_filings, missing_filings } = data.disclosure_compliance;
  
  // Perfect case: all filings submitted, none late, none missing
  if (filings_count === expected_filings && late_filings === 0 && missing_filings === 0) {
    return 100;
  }
  
  // Completeness score
  const completenessRate = expected_filings > 0
    ? (filings_count / expected_filings) * 100
    : 100;
  
  // Late filing penalty (inverted)
  const lateRate = filings_count > 0
    ? (late_filings / filings_count) * 100
    : 0;
  const timelinessScore = 100 - lateRate;
  
  // Missing filing penalty (severe)
  const missingRate = expected_filings > 0
    ? (missing_filings / expected_filings) * 100
    : 0;
  const missingPenalty = missingRate * 2; // Double penalty for missing filings
  
  // Weighted combination
  const score = (completenessRate * 0.4) + (timelinessScore * 0.4) - (missingPenalty * 0.2);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate explanation for disclosure score
 */
function explainDisclosureScore(data: MemberData, score: number): string {
  if (!data.disclosure_compliance) {
    return 'Financial disclosure data not yet available.';
  }
  
  const { filings_count, expected_filings, late_filings, missing_filings } = data.disclosure_compliance;
  
  if (score >= 90) {
    return `Excellent disclosure compliance: ${filings_count}/${expected_filings} filings completed on time.`;
  } else if (score >= 70) {
    return `Moderate compliance: ${filings_count}/${expected_filings} filings, ${late_filings} late.`;
  } else {
    return `Poor disclosure compliance: ${missing_filings} missing filings, ${late_filings} late out of ${expected_filings} expected.`;
  }
}

/**
 * Convert numeric score to letter grade
 */
function getLetterGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Validate that weights sum to 1.0 (with tolerance for floating point)
 */
function validateWeights(weights: GradeWeights): void {
  const sum = weights.donor + weights.voting + weights.trading + weights.disclosure;
  const tolerance = 0.0001;
  
  if (Math.abs(sum - 1.0) > tolerance) {
    throw new Error(`Weights must sum to 1.0 (got ${sum.toFixed(4)})`);
  }
}

/**
 * Calculate overall accountability grade for a member
 * 
 * @param data - Member data including all accountability metrics
 * @param weights - Optional custom weights for each factor (must sum to 1.0)
 * @returns Grade result with overall score, letter grade, breakdown, and explanations
 */
export function calculateGrade(data: MemberData, weights: GradeWeights = DEFAULT_WEIGHTS): GradeResult {
  // Validate weights
  validateWeights(weights);
  
  // Calculate individual scores
  const donorScore = calculateDonorScore(data);
  const votingScore = calculateVotingScore(data);
  const tradingScore = calculateTradingScore(data);
  const disclosureScore = calculateDisclosureScore(data);
  
  // Calculate weighted overall score
  const overall = 
    (donorScore * weights.donor) +
    (votingScore * weights.voting) +
    (tradingScore * weights.trading) +
    (disclosureScore * weights.disclosure);
  
  // Generate explanations
  const explanation: GradeExplanation = {
    donor: explainDonorScore(data, donorScore),
    voting: explainVotingScore(data, votingScore),
    trading: explainTradingScore(data, tradingScore),
    disclosure: explainDisclosureScore(data, disclosureScore),
  };
  
  return {
    overall: Math.round(overall * 10) / 10, // Round to 1 decimal
    letter: getLetterGrade(overall),
    breakdown: {
      donorScore: Math.round(donorScore * 10) / 10,
      votingScore: Math.round(votingScore * 10) / 10,
      tradingScore: Math.round(tradingScore * 10) / 10,
      disclosureScore: Math.round(disclosureScore * 10) / 10,
    },
    explanation,
  };
}

/**
 * Get color styling for a grade (for UI display)
 * 
 * @param letter - Letter grade (A-F)
 * @returns Tailwind color class
 */
export function getGradeColor(letter: 'A' | 'B' | 'C' | 'D' | 'F'): string {
  switch (letter) {
    case 'A':
      return 'text-green-600';
    case 'B':
      return 'text-blue-600';
    case 'C':
      return 'text-yellow-600';
    case 'D':
      return 'text-orange-600';
    case 'F':
      return 'text-red-600';
  }
}
