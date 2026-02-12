/**
 * Enhanced Alignment Scoring with Multi-Factor Analysis
 * 
 * Combines multiple data sources for comprehensive scoring:
 * - Voting record alignment (primary)
 * - Campaign finance alignment (OpenFEC)
 * - Voting consistency
 * - Bipartisan cooperation
 */

import { calculateConfidence, type ConfidenceMetrics, type DataSource } from './confidence';
import type { AlignmentScore } from './data';
import type { CampaignFinance } from './types';

export interface ScoreFactor {
  name: string;
  score: number; // 0-100
  weight: number; // 0-1
  description: string;
  dataPoints: number;
}

export interface EnhancedAlignmentScore extends AlignmentScore {
  // Enhanced scoring
  weighted_score: number;
  factors: ScoreFactor[];
  
  // Confidence
  confidence: ConfidenceMetrics;
  
  // Additional metrics
  consistency_score: number; // How consistent within categories
  bipartisan_score: number | null; // Cross-party cooperation (if applicable)
}

/**
 * Calculate voting consistency score
 * Measures how consistent votes are within each category
 */
function calculateConsistencyScore(
  categoryBreakdown: Record<string, { aligned: number; total: number; score: number }>
): number {
  const categories = Object.values(categoryBreakdown);
  
  if (categories.length === 0) return 50; // Neutral if no data
  
  // Calculate variance in category scores
  const scores = categories.map(c => c.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to 0-100 scale (lower variance = higher consistency)
  // Standard deviation of 0 = 100, std dev of 50 = 0
  const consistencyScore = Math.max(0, 100 - (stdDev * 2));
  
  return Math.round(consistencyScore);
}

/**
 * Calculate campaign finance alignment factor
 * Scores based on donor influence vs public benefit voting
 */
function calculateFinanceAlignmentFactor(
  votingScore: number,
  finance?: CampaignFinance
): ScoreFactor {
  if (!finance) {
    return {
      name: 'Campaign Finance Influence',
      score: 50,
      weight: 0.15,
      description: 'No finance data available',
      dataPoints: 0,
    };
  }
  
  // Higher PAC % and large donor % = more potential for conflicts
  const pacInfluence = finance.pac_percentage || 0;
  const largeDonorInfluence = finance.large_donor_percentage || 0;
  
  // Small donor funding suggests less special interest influence
  const smallDonorBonus = (finance.small_donor_percentage || 0) / 2;
  
  // Calculate finance alignment score
  // Lower special interest money + high small donors = better score
  const financeScore = Math.round(
    100 - ((pacInfluence + largeDonorInfluence) / 2) + smallDonorBonus
  );
  
  const clampedScore = Math.max(0, Math.min(100, financeScore));
  
  let description = '';
  if (clampedScore >= 70) {
    description = 'Low special interest funding';
  } else if (clampedScore >= 40) {
    description = 'Moderate special interest funding';
  } else {
    description = 'High special interest funding';
  }
  
  return {
    name: 'Campaign Finance Influence',
    score: clampedScore,
    weight: 0.15,
    description,
    dataPoints: 1,
  };
}

/**
 * Calculate bipartisan cooperation score
 * Measures willingness to vote across party lines on significant bills
 */
function calculateBipartisanScore(
  partyAlignmentPct: number,
  totalVotes: number
): ScoreFactor | null {
  if (totalVotes < 10) {
    return null; // Not enough data
  }
  
  // Perfect party line voting = 100% alignment
  // Some cross-party voting = lower alignment %
  // Score: reward moderate cross-party cooperation
  
  // Optimal range: 75-90% party alignment (shows independence while maintaining values)
  let score: number;
  if (partyAlignmentPct >= 75 && partyAlignmentPct <= 90) {
    score = 100; // Sweet spot
  } else if (partyAlignmentPct > 90) {
    // Too rigid - penalize slightly
    score = 100 - ((partyAlignmentPct - 90) * 2);
  } else {
    // Below 75% - could indicate inconsistency or strong independence
    score = (partyAlignmentPct / 75) * 90; // Scale to max 90
  }
  
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  
  let description = '';
  if (partyAlignmentPct >= 95) {
    description = 'Strictly follows party line';
  } else if (partyAlignmentPct >= 85) {
    description = 'Mostly partisan with some independence';
  } else if (partyAlignmentPct >= 70) {
    description = 'Shows bipartisan cooperation';
  } else {
    description = 'Highly independent voter';
  }
  
  return {
    name: 'Bipartisan Cooperation',
    score: clampedScore,
    weight: 0.10,
    description,
    dataPoints: totalVotes,
  };
}

/**
 * Calculate weighted alignment score with multiple factors
 */
export function calculateEnhancedAlignment(
  baseAlignment: AlignmentScore,
  finance?: CampaignFinance,
  partyAlignmentPct?: number,
  votesCount?: number
): EnhancedAlignmentScore {
  const factors: ScoreFactor[] = [];
  
  // Factor 1: Voting Record Alignment (primary factor)
  factors.push({
    name: 'Position-to-Vote Alignment',
    score: baseAlignment.alignment_score,
    weight: 0.60, // 60% weight
    description: 'How well votes match stated positions',
    dataPoints: baseAlignment.total_votes_analyzed,
  });
  
  // Factor 2: Campaign Finance Influence
  const financeFactor = calculateFinanceAlignmentFactor(
    baseAlignment.alignment_score,
    finance
  );
  factors.push(financeFactor);
  
  // Factor 3: Voting Consistency
  const consistencyScore = calculateConsistencyScore(baseAlignment.category_breakdown);
  factors.push({
    name: 'Voting Consistency',
    score: consistencyScore,
    weight: 0.15,
    description: 'How consistent votes are across categories',
    dataPoints: Object.keys(baseAlignment.category_breakdown).length,
  });
  
  // Factor 4: Bipartisan Cooperation (optional)
  const bipartisanFactor = partyAlignmentPct && votesCount
    ? calculateBipartisanScore(partyAlignmentPct, votesCount)
    : null;
  
  if (bipartisanFactor) {
    factors.push(bipartisanFactor);
  } else {
    // Redistribute weight to other factors if no bipartisan data
    factors[0].weight = 0.65; // Voting alignment
    factors[1].weight = 0.20; // Finance
    factors[2].weight = 0.15; // Consistency
  }
  
  // Calculate weighted score
  const weightedScore = Math.round(
    factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0)
  );
  
  // Calculate confidence
  const dataSources: DataSource[] = [
    {
      name: 'Voting Record',
      available: true,
      dataPoints: baseAlignment.total_votes_analyzed,
      lastUpdated: new Date().toISOString().split('T')[0], // Assume recent for now
    },
    {
      name: 'Campaign Finance',
      available: !!finance,
      dataPoints: finance ? 1 : 0,
    },
    {
      name: 'Party Voting Data',
      available: !!partyAlignmentPct,
      dataPoints: votesCount || 0,
    },
  ];
  
  const confidence = calculateConfidence(
    baseAlignment.total_votes_analyzed,
    dataSources
  );
  
  return {
    ...baseAlignment,
    weighted_score: weightedScore,
    factors,
    confidence,
    consistency_score: consistencyScore,
    bipartisan_score: bipartisanFactor?.score || null,
  };
}

/**
 * Get explanation of how score is calculated
 */
export function getScoreExplanation(
  enhancedScore: EnhancedAlignmentScore
): string[] {
  const explanations: string[] = [
    `Your representative's alignment score is ${enhancedScore.weighted_score}% based on ${enhancedScore.factors.length} factors:`,
    '',
  ];
  
  enhancedScore.factors.forEach(factor => {
    const percentage = Math.round(factor.weight * 100);
    explanations.push(
      `• ${factor.name} (${percentage}% weight): ${factor.score}/100 - ${factor.description}`
    );
  });
  
  explanations.push('');
  explanations.push(
    `Confidence Level: ${enhancedScore.confidence.level.toUpperCase()} - ${enhancedScore.confidence.explanation}`
  );
  
  return explanations;
}
