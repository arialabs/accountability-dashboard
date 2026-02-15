"use client";

import { useState, useMemo } from "react";
import { 
  calculateVoteBasedScores, 
  analyzeContradiction,
  type CategoryVoteScore,
  type ContradictionAnalysis,
  type VotingRecordSummary 
} from "@/lib/vote-based-scoring";

export interface Position {
  topic: string;
  stance: string;
  intensity: number;
  quotes: string[];
}

interface MemberData {
  bioguide_id: string;
  name: string;
  positions: Position[];
}

interface KeyVote {
  id: string;
  bill: string;
  title: string;
  category: string;
  date: string;
  description: string;
  votes: Record<string, string>;
  yea_count: number;
  nay_count: number;
}

interface VoteBasedPositionsProps {
  bioguideId: string;
  positionsData: { members: MemberData[] };
  keyVotesData: KeyVote[];
  allMembers: Array<{ bioguide_id: string; party: string }>;
}

// Map position topics to vote categories
const TOPIC_TO_CATEGORY: Record<string, string> = {
  'Expand ObamaCare': 'Healthcare',
  'Privatize Social Security': 'Healthcare',
  'Pathway to citizenship for illegal aliens': 'Immigration',
  'Fight EPA regulatory over-reach': 'Climate & Environment',
  'Prioritize green energy': 'Climate & Environment',
  'Higher taxes on the wealthy': 'Economy & Taxes',
  'Support & expand free trade': 'Economy & Taxes',
  'Stimulus better than market-led recovery': 'Economy & Taxes',
  'Vouchers for school choice': 'Education',
  'Abortion is a woman\'s unrestricted right': 'Healthcare',
  'Comfortable with same-sex marriage': 'Voting Rights',
  'Make voter registration easier': 'Voting Rights',
  'Expand the military': 'National Security',
  'Avoid foreign entanglements': 'National Security',
  'Absolute right to gun ownership': 'Other',
  'Marijuana is a gateway drug': 'Healthcare',
};

function getCategoryForTopic(topic: string): string {
  // Direct mapping
  if (TOPIC_TO_CATEGORY[topic]) {
    return TOPIC_TO_CATEGORY[topic];
  }
  
  // Fuzzy match
  const lower = topic.toLowerCase();
  if (lower.includes('healthcare') || lower.includes('medicaid') || lower.includes('medicare') || lower.includes('obamacare')) {
    return 'Healthcare';
  }
  if (lower.includes('immigration') || lower.includes('border')) {
    return 'Immigration';
  }
  if (lower.includes('climate') || lower.includes('environment') || lower.includes('epa')) {
    return 'Climate & Environment';
  }
  if (lower.includes('tax') || lower.includes('economy') || lower.includes('spending')) {
    return 'Economy & Taxes';
  }
  if (lower.includes('education') || lower.includes('school')) {
    return 'Education';
  }
  if (lower.includes('military') || lower.includes('defense') || lower.includes('security')) {
    return 'National Security';
  }
  if (lower.includes('voting') || lower.includes('election')) {
    return 'Voting Rights';
  }
  
  return 'Other';
}

// Voting score bar with direction indicator
function VotingScoreBar({ score, direction, showLabel = true }: { 
  score: number; 
  direction: 'progressive' | 'conservative' | 'mixed';
  showLabel?: boolean;
}) {
  // Invert display score for conservative direction
  const displayScore = direction === 'conservative' ? 100 - score : score;
  
  let barColor, bgColor, textColor, label;
  
  if (direction === 'progressive') {
    barColor = 'bg-blue-600';
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-700';
    label = 'Progressive';
  } else if (direction === 'conservative') {
    barColor = 'bg-red-600';
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
    label = 'Conservative';
  } else {
    barColor = 'bg-purple-600';
    bgColor = 'bg-purple-100';
    textColor = 'text-purple-700';
    label = 'Mixed';
  }
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-bold ${textColor}`}>{displayScore}%</span>
        {showLabel && <span className={`text-xs ${textColor}`}>{label}</span>}
      </div>
      <div className={`w-full h-3 ${bgColor} rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${displayScore}%` }}
        />
      </div>
    </div>
  );
}

// Contradiction badge
function ContradictionBadge({ contradiction }: { contradiction: ContradictionAnalysis }) {
  if (!contradiction.isContradiction) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">Aligned</span>
      </div>
    );
  }
  
  let bgColor, textColor, borderColor, icon;
  
  if (contradiction.contradictionSeverity === 'severe') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    borderColor = 'border-red-300';
    icon = '⚠️';
  } else if (contradiction.contradictionSeverity === 'moderate') {
    bgColor = 'bg-orange-100';
    textColor = 'text-orange-800';
    borderColor = 'border-orange-300';
    icon = '⚡';
  } else {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    borderColor = 'border-yellow-300';
    icon = '⚠';
  }
  
  return (
    <div className={`${bgColor} ${textColor} border ${borderColor} rounded-xl p-3 text-sm`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1">
          <p className="font-bold mb-1">Says vs Does</p>
          <p className="text-xs leading-relaxed">{contradiction.message}</p>
        </div>
      </div>
    </div>
  );
}

// Category section showing VOTES first, positions second
function CategorySection({
  category,
  votingScore,
  positions,
  contradictions,
}: {
  category: string;
  votingScore: CategoryVoteScore | null;
  positions: Position[];
  contradictions: ContradictionAnalysis[];
}) {
  const [expanded, setExpanded] = useState(false);
  
  if (!votingScore && positions.length === 0) return null;
  
  const hasContradiction = contradictions.some(c => c.isContradiction);
  
  return (
    <div className="border-2 border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {category}
            {hasContradiction && (
              <span className="ml-2 text-red-600 text-sm">⚠️ Contradiction</span>
            )}
          </h3>
          {votingScore && (
            <span className="text-xs text-slate-500">
              {votingScore.totalVotes} votes analyzed
            </span>
          )}
        </div>
        
        {/* PRIMARY: Voting Record */}
        {votingScore && votingScore.totalVotes > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                📊 Voting Record (Ground Truth)
              </p>
            </div>
            <VotingScoreBar 
              score={votingScore.score} 
              direction={votingScore.direction}
            />
            <div className="mt-2 flex gap-4 text-xs text-slate-600">
              <span>✓ {votingScore.votesFor} supporting votes</span>
              <span>✗ {votingScore.votesAgainst} opposing votes</span>
              {votingScore.abstentions > 0 && (
                <span>− {votingScore.abstentions} abstentions</span>
              )}
            </div>
          </div>
        )}
        
        {/* SECONDARY: Stated Positions */}
        {positions.length > 0 && (
          <div className={votingScore ? 'pt-4 border-t border-slate-200' : ''}>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
              💬 Stated Position
            </p>
            <div className="space-y-2">
              {positions.map((pos, idx) => {
                const contradiction = contradictions.find(c => 
                  c.statedStance === pos.stance && c.category === category
                );
                
                const stanceColor = pos.stance.toLowerCase().includes('support') 
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : pos.stance.toLowerCase().includes('oppose')
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200';
                
                return (
                  <div key={idx}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${stanceColor}`}>
                        {pos.stance}
                      </span>
                      <span className="text-xs text-slate-500">
                        on: {pos.topic}
                      </span>
                    </div>
                    {contradiction && (
                      <div className="mt-2">
                        <ContradictionBadge contradiction={contradiction} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Expandable quotes */}
      {positions.some(p => p.quotes && p.quotes.length > 0) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors"
        >
          {expanded ? 'Hide' : 'Show'} Quotes
          <svg 
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
          {positions.map((pos, idx) => 
            pos.quotes && pos.quotes.length > 0 ? (
              <div key={idx}>
                <p className="text-xs font-bold text-slate-600 mb-2">{pos.topic}:</p>
                <ul className="space-y-1">
                  {pos.quotes.filter(q => q.trim()).map((quote, qIdx) => (
                    <li key={qIdx} className="text-xs text-slate-600 pl-3 border-l-2 border-blue-300">
                      {quote}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

export default function VoteBasedPositions({
  bioguideId,
  positionsData,
  keyVotesData,
  allMembers,
}: VoteBasedPositionsProps) {
  const memberData = positionsData.members.find(m => m.bioguide_id === bioguideId);
  
  // Calculate vote-based scores
  const votingRecord = useMemo(() => 
    calculateVoteBasedScores(bioguideId, keyVotesData, allMembers),
    [bioguideId, keyVotesData, allMembers]
  );
  
  // Map positions to categories and analyze contradictions
  const categoryData = useMemo(() => {
    const data: Record<string, {
      positions: Position[];
      votingScore: CategoryVoteScore | null;
      contradictions: ContradictionAnalysis[];
    }> = {};
    
    // Initialize with voting categories
    for (const [category, score] of Object.entries(votingRecord.categoryScores)) {
      data[category] = {
        positions: [],
        votingScore: score,
        contradictions: [],
      };
    }
    
    // Add positions and calculate contradictions
    if (memberData) {
      for (const position of memberData.positions) {
        const category = getCategoryForTopic(position.topic);
        
        if (!data[category]) {
          data[category] = {
            positions: [],
            votingScore: null,
            contradictions: [],
          };
        }
        
        data[category].positions.push(position);
        
        // Analyze contradiction if we have voting data
        if (data[category].votingScore) {
          const contradiction = analyzeContradiction(
            position.stance,
            position.intensity,
            data[category].votingScore!.score,
            data[category].votingScore!.direction,
            category
          );
          data[category].contradictions.push(contradiction);
        }
      }
    }
    
    return data;
  }, [memberData, votingRecord]);
  
  const sortedCategories = Object.entries(categoryData).sort((a, b) => {
    // Sort by: 1) has contradictions, 2) total votes, 3) alphabetical
    const aHasContradiction = a[1].contradictions.some(c => c.isContradiction);
    const bHasContradiction = b[1].contradictions.some(c => c.isContradiction);
    
    if (aHasContradiction && !bHasContradiction) return -1;
    if (!aHasContradiction && bHasContradiction) return 1;
    
    const aVotes = a[1].votingScore?.totalVotes || 0;
    const bVotes = b[1].votingScore?.totalVotes || 0;
    
    if (aVotes !== bVotes) return bVotes - aVotes;
    
    return a[0].localeCompare(b[0]);
  });
  
  const totalContradictions = Object.values(categoryData)
    .flatMap(c => c.contradictions)
    .filter(c => c.isContradiction).length;
  
  // Determine member's party for score display
  const member = allMembers.find(m => m.bioguide_id === bioguideId);
  const memberParty = member?.party || 'Unknown';
  
  // For Republicans, show conservative score (inverted); for Democrats, show progressive score
  const displayScore = memberParty === 'R' 
    ? 100 - votingRecord.overallProgressiveScore 
    : votingRecord.overallProgressiveScore;
  const scoreLabel = memberParty === 'R' ? 'Conservative' : 'Progressive';
  const scoreColor = memberParty === 'R' ? 'text-red-600' : 'text-blue-600';
  
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
          Policy Positions: Says vs Does
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Comparing stated campaign positions to actual voting records
        </p>
        
        {/* Summary Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Voting Record Score:</span>
            <span className={`font-bold ${scoreColor}`}>{displayScore}% {scoreLabel}</span>
          </div>
          {totalContradictions > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold">⚠️ {totalContradictions} contradictions found</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {sortedCategories.map(([category, data]) => (
          <CategorySection
            key={category}
            category={category}
            votingScore={data.votingScore}
            positions={data.positions}
            contradictions={data.contradictions}
          />
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-200 text-xs text-slate-500">
        <p className="font-semibold mb-1">📊 Methodology</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Voting scores calculated from actual congressional votes</li>
          <li>Progressive direction determined by party voting patterns</li>
          <li>Contradictions flagged when voting record differs from stated positions</li>
          <li>Data sources: Congress.gov (votes), OnTheIssues.org (positions)</li>
        </ul>
      </div>
    </div>
  );
}
