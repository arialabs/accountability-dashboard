/**
 * Position-to-Vote Alignment Calculator
 * 
 * Maps politician's stated positions (from OnTheIssues) to their actual votes
 * and calculates alignment scores with time-decay weighting for recent votes.
 * 
 * NOTE: This is the base alignment calculator.
 * See alignment-enhanced.ts for multi-factor analysis that builds upon this.
 */

import type { Position, MemberPositions } from './types';

/**
 * Calculate time-decay weight for a vote
 * Recent votes get higher weight than older votes
 * @param voteDate ISO date string (YYYY-MM-DD)
 * @returns weight between 0.5 and 1.0
 */
function calculateTimeWeight(voteDate?: string): number {
  if (!voteDate) return 0.8; // Default weight if date unknown
  
  const now = new Date();
  const vote = new Date(voteDate);
  const daysSince = (now.getTime() - vote.getTime()) / (1000 * 60 * 60 * 24);
  
  // Votes in last 30 days: full weight (1.0)
  if (daysSince <= 30) return 1.0;
  
  // Votes 30-180 days: linear decay to 0.9
  if (daysSince <= 180) return 1.0 - ((daysSince - 30) / 150) * 0.1;
  
  // Votes 180-365 days: linear decay to 0.7
  if (daysSince <= 365) return 0.9 - ((daysSince - 180) / 185) * 0.2;
  
  // Votes 1-2 years: 0.6
  if (daysSince <= 730) return 0.6;
  
  // Votes older than 2 years: 0.5 (minimum weight)
  return 0.5;
}

// Map position topics to vote categories
const TOPIC_TO_CATEGORY: Record<string, string[]> = {
  // Healthcare
  'Expand ObamaCare': ['Healthcare'],
  'Privatize Social Security': ['Economy & Taxes', 'Healthcare'],
  
  // Immigration
  'Pathway to citizenship for illegal aliens': ['Immigration'],
  
  // Environment
  'Fight EPA regulatory over-reach': ['Climate & Environment'],
  'Prioritize green energy': ['Climate & Environment'],
  
  // Economy
  'Higher taxes on the wealthy': ['Economy & Taxes'],
  'Support & expand free trade': ['Economy & Taxes'],
  'Stimulus better than market-led recovery': ['Economy & Taxes'],
  'Vouchers for school choice': ['Economy & Taxes'],
  
  // Civil Rights & Social
  'Abortion is a woman\'s unrestricted right': ['Healthcare', 'Voting Rights'],
  'Legally require hiring women & minorities': ['Voting Rights', 'Government Ethics'],
  'Comfortable with same-sex marriage': ['Voting Rights'],
  'Make voter registration easier': ['Voting Rights'],
  
  // Defense & Foreign Policy
  'Expand the military': ['National Security'],
  'Avoid foreign entanglements': ['National Security'],
  'Support American Exceptionalism': ['National Security'],
  
  // Other
  'Keep God in the public sphere': ['Other'],
  'Absolute right to gun ownership': ['Other'],
  'Stricter punishment reduces crime': ['Other'],
  'Marijuana is a gateway drug': ['Healthcare', 'Other'],
};

// Determine if a vote position aligns with a stated stance
export function isVoteAligned(
  statedStance: string,
  votePosition: 'Yea' | 'Nay' | 'Not Voting' | string,
  publicBenefit: string
): boolean | null {
  if (votePosition === 'Not Voting') return null;
  
  const isProgressive = statedStance.toLowerCase().includes('supports') || 
                        statedStance.toLowerCase().includes('favors');
  const isConservative = statedStance.toLowerCase().includes('opposes');
  
  const votedYea = votePosition === 'Yea';
  const billIsProgressive = publicBenefit === 'positive';
  
  if (isProgressive) {
    return votedYea === billIsProgressive;
  } else if (isConservative) {
    return votedYea !== billIsProgressive;
  }
  
  return null; // Neutral stance or unclear
}

// Get relevant vote categories for a position topic
export function getRelevantCategories(topic: string): string[] {
  // Direct match
  if (TOPIC_TO_CATEGORY[topic]) {
    return TOPIC_TO_CATEGORY[topic];
  }
  
  // Fuzzy match by keywords
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('healthcare') || topicLower.includes('obamacare') || topicLower.includes('medicaid') || topicLower.includes('medicare')) {
    return ['Healthcare'];
  }
  if (topicLower.includes('immigration') || topicLower.includes('border') || topicLower.includes('citizenship')) {
    return ['Immigration'];
  }
  if (topicLower.includes('climate') || topicLower.includes('environment') || topicLower.includes('epa') || topicLower.includes('energy')) {
    return ['Climate & Environment'];
  }
  if (topicLower.includes('tax') || topicLower.includes('economy') || topicLower.includes('spending') || topicLower.includes('trade')) {
    return ['Economy & Taxes'];
  }
  if (topicLower.includes('military') || topicLower.includes('defense') || topicLower.includes('war') || topicLower.includes('security')) {
    return ['National Security'];
  }
  if (topicLower.includes('voting') || topicLower.includes('rights') || topicLower.includes('marriage')) {
    return ['Voting Rights'];
  }
  if (topicLower.includes('ethics') || topicLower.includes('corruption')) {
    return ['Government Ethics'];
  }
  
  return ['Other'];
}

export interface VoteWithWeight {
  vote: {
    category: string;
    publicBenefit: string;
    votes: Record<string, string>;
    date?: string; // ISO date string
  };
  alignment: boolean | null;
  weight: number; // Time-decay weight (0-1)
}

export interface AlignmentResult {
  position: Position;
  relevantVotes: number;
  alignedVotes: number;
  opposedVotes: number;
  alignmentScore: number | null; // 0-100 or null if no relevant votes
  weightedScore: number | null; // Score with time-decay weighting
}

export interface MemberAlignmentSummary {
  bioguideId: string;
  totalPositions: number;
  positionsWithVotes: number;
  overallAlignmentScore: number | null;
  categoryScores: Record<string, number>;
  results: AlignmentResult[];
}

// Calculate alignment for a single member
export function calculateMemberAlignment(
  memberPositions: MemberPositions,
  keyVotes: Array<{
    category: string;
    publicBenefit: string;
    votes: Record<string, string>;
    date?: string; // ISO date
  }>
): MemberAlignmentSummary {
  const bioguideId = memberPositions.bioguide_id;
  const results: AlignmentResult[] = [];
  const categoryAligned: Record<string, number[]> = {};
  const categoryWeightedAligned: Record<string, { weightedSum: number; totalWeight: number }> = {};
  
  for (const position of memberPositions.positions) {
    const relevantCategories = getRelevantCategories(position.topic);
    
    // Find votes in relevant categories
    const relevantVotesList = keyVotes.filter(v => 
      relevantCategories.includes(v.category) && 
      v.votes[bioguideId]
    );
    
    let aligned = 0;
    let opposed = 0;
    let weightedAlignedSum = 0;
    let totalWeight = 0;
    
    for (const vote of relevantVotesList) {
      const memberVote = vote.votes[bioguideId];
      const alignment = isVoteAligned(position.stance, memberVote, vote.publicBenefit);
      const weight = calculateTimeWeight(vote.date);
      
      if (alignment === true) {
        aligned++;
        weightedAlignedSum += weight;
      } else if (alignment === false) {
        opposed++;
      }
      
      if (alignment !== null) {
        totalWeight += weight;
      }
    }
    
    const totalRelevant = aligned + opposed;
    const score = totalRelevant > 0 ? Math.round((aligned / totalRelevant) * 100) : null;
    const weightedScore = totalWeight > 0 ? Math.round((weightedAlignedSum / totalWeight) * 100) : null;
    
    results.push({
      position,
      relevantVotes: relevantVotesList.length,
      alignedVotes: aligned,
      opposedVotes: opposed,
      alignmentScore: score,
      weightedScore,
    });
    
    // Track by category
    for (const cat of relevantCategories) {
      if (!categoryAligned[cat]) {
        categoryAligned[cat] = [];
        categoryWeightedAligned[cat] = { weightedSum: 0, totalWeight: 0 };
      }
      if (score !== null) categoryAligned[cat].push(score);
      if (weightedScore !== null) {
        categoryWeightedAligned[cat].weightedSum += weightedAlignedSum;
        categoryWeightedAligned[cat].totalWeight += totalWeight;
      }
    }
  }
  
  // Calculate overall score (use weighted score if available)
  const scoresWithData = results.filter(r => r.alignmentScore !== null);
  const overallScore = scoresWithData.length > 0
    ? Math.round(scoresWithData.reduce((sum, r) => sum + (r.alignmentScore || 0), 0) / scoresWithData.length)
    : null;
  
  // Calculate overall weighted score
  const totalWeightedSum = results.reduce((sum, r) => {
    if (r.weightedScore !== null && r.opposedVotes + r.alignedVotes > 0) {
      return sum + (r.weightedScore * (r.opposedVotes + r.alignedVotes));
    }
    return sum;
  }, 0);
  const totalVotesWithScores = results.reduce((sum, r) => {
    return sum + (r.alignedVotes + r.opposedVotes);
  }, 0);
  const overallWeightedScore = totalVotesWithScores > 0 
    ? Math.round(totalWeightedSum / totalVotesWithScores)
    : null;
  
  // Calculate category scores
  const categoryScores: Record<string, number> = {};
  for (const [cat, scores] of Object.entries(categoryAligned)) {
    if (scores.length > 0) {
      categoryScores[cat] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
  }
  
  return {
    bioguideId,
    totalPositions: memberPositions.positions.length,
    positionsWithVotes: scoresWithData.length,
    overallAlignmentScore: overallWeightedScore ?? overallScore, // Prefer weighted
    categoryScores,
    results,
  };
}
