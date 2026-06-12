/**
 * @module alignment-enhanced
 * @description Enhanced Alignment Scoring — Multi-Factor Module
 *
 * Wraps the base alignment score (computed by the `alignment.ts` pipeline and
 * stored in `data/alignment-scores.json`) with **additional scoring factors**
 * for a richer, more nuanced representation of how well a politician's actions
 * match the public interest.
 *
 * ## What this module adds on top of alignment.ts
 * | Factor                       | Weight | Source |
 * |------------------------------|--------|--------|
 * | Position-to-Vote Alignment   | 60–65% | alignment.ts base score |
 * | Campaign Finance Influence   | 15–20% | OpenFEC donor data |
 * | Voting Consistency           | 15%    | Category variance |
 * | Bipartisan Cooperation       | 10%    | Party-line vote %  |
 *
 * ## When to use this module
 * Use `alignment-enhanced.ts` when you need:
 * - A **composite weighted score** (`EnhancedAlignmentScore.weighted_score`)
 *   that incorporates campaign finance, consistency, and bipartisanship
 * - **Confidence metrics** (low/medium/high) with explanations shown to users
 * - **"Insufficient Data"** warnings when a member has fewer than 5 analyzed votes
 * - Per-factor breakdowns for the Score Breakdown modal UI
 * - The `EnhancedAlignmentScore` type (consumed by `AlignmentScoreCardEnhanced.tsx`,
 *   `ScoreBreakdownModal.tsx`, and `data-enhanced.ts`)
 *
 * ## When to use alignment.ts instead
 * Use `alignment.ts` (the base module) when you need:
 * - Raw position-to-vote matching logic or the `calculateMemberAlignment` function
 * - Leaderboard-style comparisons (used by `leaderboard.ts`)
 * - Simple displayed positions without finance context (`CampaignPositions.tsx`)
 *
 * ## Architecture
 * ```
 * alignment.ts          ← base scoring (raw vote matching)
 *     ↓ pre-computed to alignment-scores.json
 * AlignmentScore        ← loaded via data.ts → getMemberAlignment()
 *     ↓ passed into
 * alignment-enhanced.ts ← this file; adds finance/consistency/bipartisan factors
 *     ↓
 * EnhancedAlignmentScore ← consumed by UI components
 * ```
 *
 * The two modules are NOT duplicates — they operate at different stages of the
 * data pipeline. `alignment.ts` computes the raw vote-matching score; this
 * module enhances an already-computed score with additional context.
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

/**
 * Factor weights for the composite score. Single source of truth — the
 * methodology page renders these values, so changing them here updates the
 * public documentation automatically.
 */
export const FACTOR_WEIGHTS = {
  voting: 0.6,
  finance: 0.15,
  consistency: 0.15,
  bipartisan: 0.1,
} as const;

/** Weights used when no bipartisan voting data is available for a member. */
export const FACTOR_WEIGHTS_NO_BIPARTISAN = {
  voting: 0.65,
  finance: 0.2,
  consistency: 0.15,
} as const;

export interface EnhancedAlignmentScore extends AlignmentScore {
  // Enhanced scoring
  weighted_score: number;
  factors: ScoreFactor[];
  
  // Confidence
  confidence: ConfidenceMetrics;
  
  // Additional metrics
  consistency_score: number; // How consistent within categories
  bipartisan_score: number | null; // Cross-party cooperation (if applicable)
  
  // Edge case handling
  insufficient_data: boolean; // True if sample size too small for reliable scoring
  min_votes_threshold: number; // Minimum votes needed for reliable score
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
      weight: FACTOR_WEIGHTS.finance,
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
    weight: FACTOR_WEIGHTS.finance,
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
    weight: FACTOR_WEIGHTS.bipartisan,
    description,
    dataPoints: totalVotes,
  };
}

/**
 * Minimum votes threshold for reliable scoring
 * Below this, we show "Insufficient Data" warning
 */
const MIN_VOTES_THRESHOLD = 5;

/**
 * Calculate weighted alignment score with multiple factors
 */
export function calculateEnhancedAlignment(
  baseAlignment: AlignmentScore,
  finance?: CampaignFinance,
  partyAlignmentPct?: number,
  votesCount?: number
): EnhancedAlignmentScore {
  // Check for insufficient data
  const insufficientData = baseAlignment.total_votes_analyzed < MIN_VOTES_THRESHOLD;
  
  const factors: ScoreFactor[] = [];
  
  // Factor 1: Voting Record Alignment (primary factor)
  factors.push({
    name: 'Position-to-Vote Alignment',
    score: baseAlignment.alignment_score,
    weight: FACTOR_WEIGHTS.voting,
    description: insufficientData 
      ? `Only ${baseAlignment.total_votes_analyzed} vote${baseAlignment.total_votes_analyzed === 1 ? '' : 's'} analyzed - score may not be reliable`
      : 'How well votes match stated positions',
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
    weight: FACTOR_WEIGHTS.consistency,
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
    factors[0].weight = FACTOR_WEIGHTS_NO_BIPARTISAN.voting;
    factors[1].weight = FACTOR_WEIGHTS_NO_BIPARTISAN.finance;
    factors[2].weight = FACTOR_WEIGHTS_NO_BIPARTISAN.consistency;
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
    insufficient_data: insufficientData,
    min_votes_threshold: MIN_VOTES_THRESHOLD,
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
