/**
 * Enhanced data utilities that integrate multi-factor alignment scoring
 */

import { calculateEnhancedAlignment, type EnhancedAlignmentScore } from './alignment-enhanced';
import { getMember, getMemberAlignment, getMemberFinanceStatic } from './data';
import type { AlignmentScore } from './data';

/**
 * Get enhanced alignment score for a member
 * Combines base alignment with finance data and party metrics
 */
export function getMemberAlignmentEnhanced(bioguideId: string): EnhancedAlignmentScore | null {
  const baseAlignment = getMemberAlignment(bioguideId);
  if (!baseAlignment) return null;
  
  const member = getMember(bioguideId);
  const finance = getMemberFinanceStatic(bioguideId);
  
  return calculateEnhancedAlignment(
    baseAlignment,
    finance || undefined,
    member?.party_alignment_pct,
    member?.votes_cast
  );
}

/**
 * Get all enhanced alignment scores
 */
export async function getAllAlignmentScoresEnhanced(): Promise<EnhancedAlignmentScore[]> {
  const { getAllAlignmentScores } = await import('./data');
  const baseScores = getAllAlignmentScores();
  
  return baseScores.map(score => {
    const member = getMember(score.bioguide_id);
    const finance = getMemberFinanceStatic(score.bioguide_id);
    
    return calculateEnhancedAlignment(
      score,
      finance || undefined,
      member?.party_alignment_pct,
      member?.votes_cast
    );
  });
}

/**
 * Get enhanced alignment ranking for a member
 */
export function getAlignmentRankingEnhanced(bioguideId: string): { rank: number; total: number } | null {
  const { getAllAlignmentScores } = require('./data');
  const baseScores = getAllAlignmentScores();
  
  // Calculate enhanced scores for all members
  const enhancedScores = baseScores.map((score: AlignmentScore) => {
    const member = getMember(score.bioguide_id);
    const finance = getMemberFinanceStatic(score.bioguide_id);
    
    return calculateEnhancedAlignment(
      score,
      finance || undefined,
      member?.party_alignment_pct,
      member?.votes_cast
    );
  });
  
  // Sort by weighted score
  enhancedScores.sort((a, b) => b.weighted_score - a.weighted_score);
  
  const index = enhancedScores.findIndex(s => s.bioguide_id === bioguideId);
  if (index === -1) return null;
  
  return { rank: index + 1, total: enhancedScores.length };
}
