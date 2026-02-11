/**
 * Leaderboard utilities for aggregating alignment scores across all members
 */

import { calculateMemberAlignment } from './alignment';
import type { MemberPositions } from './types';
import positionsData from '@/data/positions.json';
import keyVotesData from '@/data/key-votes.json';
import membersData from '@/data/members.json';

export interface LeaderboardEntry {
  bioguideId: string;
  name: string;
  party: string;
  state: string;
  chamber: 'House' | 'Senate';
  alignmentScore: number;
  positionsWithVotes: number;
  totalPositions: number;
}

export interface LeaderboardData {
  topAligned: LeaderboardEntry[];
  bottomAligned: LeaderboardEntry[];
  averageScore: number;
  totalMembers: number;
  membersWithData: number;
}

// Cache the leaderboard data
let cachedLeaderboard: LeaderboardData | null = null;

export function getLeaderboard(limit: number = 10): LeaderboardData {
  if (cachedLeaderboard) return cachedLeaderboard;
  
  const keyVotes = keyVotesData.map((v: Record<string, unknown>) => ({
    category: v.category as string,
    publicBenefit: (v.publicBenefit as string) || 'positive',
    votes: v.votes as Record<string, string>
  }));
  
  const entries: LeaderboardEntry[] = [];
  
  for (const memberPos of (positionsData as { members: Array<{
    bioguide_id: string;
    name: string;
    source: string;
    source_url: string;
    last_updated: string;
    positions: Array<{
      topic: string;
      stance: string;
      intensity: number;
      quotes: string[];
    }>;
  }> }).members) {
    // Find member details
    const member = (membersData as Array<{
      bioguide_id: string;
      full_name: string;
      party: string;
      state: string;
      chamber: string;
    }>).find(m => m.bioguide_id === memberPos.bioguide_id);
    
    if (!member || memberPos.positions.length === 0) continue;
    
    const memberPositions: MemberPositions = {
      bioguide_id: memberPos.bioguide_id,
      name: member.full_name,
      source: 'ontheissues',
      source_url: memberPos.source_url,
      last_updated: memberPos.last_updated,
      positions: memberPos.positions.map(p => ({
        ...p,
        stance: p.stance as "Strongly Supports" | "Supports" | "Neutral" | "Opposes" | "Strongly Opposes",
        votes: []
      }))
    };
    
    const alignment = calculateMemberAlignment(memberPositions, keyVotes);
    
    if (alignment.overallAlignmentScore !== null && alignment.positionsWithVotes >= 3) {
      entries.push({
        bioguideId: member.bioguide_id,
        name: member.full_name,
        party: member.party,
        state: member.state,
        chamber: member.chamber === 'senate' ? 'Senate' : 'House',
        alignmentScore: alignment.overallAlignmentScore,
        positionsWithVotes: alignment.positionsWithVotes,
        totalPositions: alignment.totalPositions
      });
    }
  }
  
  // Sort by alignment score
  entries.sort((a, b) => b.alignmentScore - a.alignmentScore);
  
  // Calculate average
  const totalScore = entries.reduce((sum, e) => sum + e.alignmentScore, 0);
  const avgScore = entries.length > 0 ? Math.round(totalScore / entries.length) : 0;
  
  cachedLeaderboard = {
    topAligned: entries.slice(0, limit),
    bottomAligned: entries.slice(-limit).reverse(),
    averageScore: avgScore,
    totalMembers: (membersData as unknown[]).length,
    membersWithData: entries.length
  };
  
  return cachedLeaderboard;
}

export function getMemberRank(bioguideId: string): { rank: number; total: number; percentile: number } | null {
  const leaderboard = getLeaderboard(1000); // Get all
  
  const allSorted = [...leaderboard.topAligned];
  const idx = allSorted.findIndex(e => e.bioguideId === bioguideId);
  
  if (idx === -1) return null;
  
  return {\n    rank: idx + 1,\n    total: allSorted.length,\n    percentile: Math.round(((allSorted.length - idx) / allSorted.length) * 100)\n  };\n}\n