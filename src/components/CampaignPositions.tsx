"use client";

import { useState, useMemo } from "react";
import { calculateMemberAlignment, type AlignmentResult, type MemberAlignmentSummary } from "@/lib/alignment";
import type { MemberPositions } from "@/lib/types";
import { BodyText, Caption } from "@/components/ui";

export interface Position {
  topic: string;
  stance: string;
  intensity: number;
  quotes: string[];
  votes?: unknown[];
}

interface MemberData {
  bioguide_id: string;
  name: string;
  source: string;
  source_url: string;
  last_updated: string;
  positions: Position[];
}

interface KeyVote {
  category: string;
  publicBenefit: string;
  votes: Record<string, string>;
}

interface CampaignPositionsProps {
  bioguideId: string;
  positionsData?: { members: MemberData[] };
  keyVotesData?: KeyVote[];
}

// Categorize positions by topic keywords
function categorizePosition(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('abortion') || topicLower.includes('marriage') || topicLower.includes('gay') || topicLower.includes('gender')) {
    return 'Social Issues';
  }
  if (topicLower.includes('tax') || topicLower.includes('spending') || topicLower.includes('stimulus') || topicLower.includes('economy')) {
    return 'Economic Policy';
  }
  if (topicLower.includes('healthcare') || topicLower.includes('obamacare') || topicLower.includes('medicaid') || topicLower.includes('medicare')) {
    return 'Healthcare';
  }
  if (topicLower.includes('security') || topicLower.includes('social security') || topicLower.includes('privatize')) {
    return 'Social Security';
  }
  if (topicLower.includes('education') || topicLower.includes('school') || topicLower.includes('voucher')) {
    return 'Education';
  }
  if (topicLower.includes('environment') || topicLower.includes('epa') || topicLower.includes('climate') || topicLower.includes('energy')) {
    return 'Environment & Energy';
  }
  if (topicLower.includes('immigration') || topicLower.includes('border') || topicLower.includes('pathway to citizenship')) {
    return 'Immigration';
  }
  if (topicLower.includes('gun') || topicLower.includes('second amendment') || topicLower.includes('firearm')) {
    return 'Gun Rights';
  }
  if (topicLower.includes('foreign') || topicLower.includes('military') || topicLower.includes('defense') || topicLower.includes('war')) {
    return 'Foreign Policy & Defense';
  }
  if (topicLower.includes('drug') || topicLower.includes('marijuana') || topicLower.includes('legalize')) {
    return 'Drug Policy';
  }
  if (topicLower.includes('god') || topicLower.includes('religion') || topicLower.includes('faith')) {
    return 'Religion & Values';
  }
  if (topicLower.includes('hiring') || topicLower.includes('minorities') || topicLower.includes('affirmative')) {
    return 'Civil Rights';
  }
  
  return 'Other Issues';
}

// Get color based on stance
function getStanceColor(stance: string): { bg: string; text: string; border: string } {
  const stanceLower = stance.toLowerCase();
  
  if (stanceLower.includes('strongly supports') || stanceLower.includes('strongly favors')) {
    return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
  }
  if (stanceLower.includes('supports') || stanceLower.includes('favors')) {
    return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
  }
  if (stanceLower.includes('strongly opposes')) {
    return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
  }
  if (stanceLower.includes('opposes')) {
    return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
  }
  if (stanceLower.includes('neutral') || stanceLower.includes('mixed')) {
    return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
  
  return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
}

// Intensity indicator (1-5 scale)
function IntensityIndicator({ intensity }: { intensity: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((level) => (
        <div
          key={level}
          className={`w-2 h-4 rounded-sm ${
            level <= intensity ? 'bg-blue-600' : 'bg-slate-200'
          }`}
          title={`Intensity: ${intensity}/5`}
        />
      ))}
    </div>
  );
}

// Alignment score badge
function AlignmentBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500">
        No votes
      </span>
    );
  }
  
  let bgColor, textColor;
  if (score >= 75) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-700';
  } else if (score >= 50) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
  } else {
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
  }
  
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${bgColor} ${textColor}`}>
      {score}% aligned
    </span>
  );
}

// Individual position card with alignment
function PositionCard({ position, alignment }: { position: Position; alignment?: AlignmentResult }) {
  const [expanded, setExpanded] = useState(false);
  const colors = getStanceColor(position.stance);
  const hasQuotes = position.quotes && position.quotes.length > 0 && position.quotes.some(q => q.trim());

  return (
    <div className={`border-2 ${colors.border} ${colors.bg} rounded-xl p-4 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-bold text-slate-900 text-sm flex-1 leading-relaxed">
          {position.topic}
        </h4>
        <IntensityIndicator intensity={position.intensity} />
      </div>
      
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
          {position.stance}
        </span>
        
        {alignment && (
          <div className="flex items-center gap-2">
            <AlignmentBadge score={alignment.alignmentScore} />
            {alignment.relevantVotes > 0 && (
              <Caption>
                ({alignment.alignedVotes}/{alignment.relevantVotes} votes)
              </Caption>
            )}
          </div>
        )}
        
        {hasQuotes && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
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
      </div>
      
      {expanded && hasQuotes && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Quotes & Statements:</p>
          <ul className="space-y-2">
            {position.quotes
              .filter(q => q.trim())
              .map((quote, idx) => (
                <li key={idx} className="text-sm text-slate-700 pl-3 border-l-2 border-blue-300 leading-relaxed">
                  {quote}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Category section with alignment
function CategorySection({ 
  category, 
  positions, 
  alignmentResults,
  defaultExpanded = false 
}: { 
  category: string; 
  positions: Position[];
  alignmentResults?: AlignmentResult[];
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  // Map positions to their alignment results
  const getAlignment = (position: Position) => {
    return alignmentResults?.find(r => r.position.topic === position.topic);
  };

  return (
    <div className="border-b border-slate-200 pb-6 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
          {category}
          <span className="ml-2 text-sm font-normal text-slate-500">({positions.length})</span>
        </h3>
        <svg 
          className={`w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-all ${expanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positions.map((position, idx) => (
            <PositionCard 
              key={idx} 
              position={position} 
              alignment={getAlignment(position)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Overall alignment score display
function OverallAlignmentScore({ summary }: { summary: MemberAlignmentSummary | null }) {
  if (!summary || summary.overallAlignmentScore === null) {
    return null;
  }
  
  const score = summary.overallAlignmentScore;
  let bgColor, textColor, label;
  
  if (score >= 75) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-700';
    label = 'High Alignment';
  } else if (score >= 50) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
    label = 'Moderate Alignment';
  } else {
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
    label = 'Low Alignment';
  }
  
  return (
    <div className={`${bgColor} rounded-xl p-4 mb-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
          <p className="text-xs text-slate-600 mt-1">
            Comparing stated positions to actual voting record
          </p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-black ${textColor}`}>{score}%</p>
          <Caption as="p">
            {summary.positionsWithVotes} of {summary.totalPositions} positions have votes
          </Caption>
        </div>
      </div>
      
      {/* Category breakdown */}
      {Object.keys(summary.categoryScores).length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-700 mb-2">By Category:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.categoryScores).map(([cat, catScore]) => (
              <span 
                key={cat} 
                className={`px-2 py-1 rounded text-xs font-medium ${
                  catScore >= 75 ? 'bg-green-50 text-green-700' :
                  catScore >= 50 ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}
              >
                {cat}: {catScore}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignPositions({ bioguideId, positionsData, keyVotesData }: CampaignPositionsProps) {
  // Load positions data - either from prop or from file
  const data = positionsData || require('@/data/positions.json');
  const memberData = data.members.find((m: MemberData) => m.bioguide_id === bioguideId);
  
  // Load key votes data - either from prop or from file
  const keyVotes: KeyVote[] = useMemo(() => {
    if (keyVotesData) return keyVotesData;
    try {
      const votesData = require('@/data/key-votes.json');
      return votesData.map((v: { category: string; publicBenefit: string; votes: Record<string, string> }) => ({
        category: v.category,
        publicBenefit: v.publicBenefit || 'positive', // Use actual publicBenefit field
        votes: v.votes
      }));
    } catch {
      return [];
    }
  }, [keyVotesData]);
  
  // Calculate alignment
  const alignmentSummary = useMemo(() => {
    if (!memberData || keyVotes.length === 0) return null;
    
    const memberPositions: MemberPositions = {
      bioguide_id: memberData.bioguide_id,
      name: memberData.name,
      source: 'ontheissues',
      source_url: memberData.source_url,
      last_updated: memberData.last_updated,
      positions: memberData.positions.map((p: Position) => ({
        ...p,
        stance: p.stance as "Strongly Supports" | "Supports" | "Neutral" | "Opposes" | "Strongly Opposes",
        votes: []
      }))
    };
    
    return calculateMemberAlignment(memberPositions, keyVotes);
  }, [memberData, keyVotes]);
  
  if (!memberData || !memberData.positions || memberData.positions.length === 0) {
    return null;
  }

  // Group positions by category
  const positionsByCategory = memberData.positions.reduce((acc: Record<string, Position[]>, position: Position) => {
    const category = categorizePosition(position.topic);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(position);
    return acc;
  }, {});

  // Sort categories by number of positions (descending)
  const sortedCategories = Object.entries(positionsByCategory) as [string, Position[]][];
  sortedCategories.sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
          Campaign Positions
        </h2>
        <BodyText>
          {memberData.name}&apos;s stated positions on key issues from campaign and public statements
        </BodyText>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>📊 {memberData.positions.length} positions tracked</span>
          <span>•</span>
          <span>Source: OnTheIssues.org</span>
        </div>
      </div>
      
      {/* Overall alignment score */}
      <OverallAlignmentScore summary={alignmentSummary} />

      <div className="space-y-6">
        {sortedCategories.map(([category, positions], idx) => (
          <CategorySection
            key={category}
            category={category}
            positions={positions}
            alignmentResults={alignmentSummary?.results}
            defaultExpanded={idx === 0} // First category expanded by default
          />
        ))}
      </div>

      {memberData.source_url && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <a
            href={memberData.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline inline-flex items-center gap-1"
          >
            View full profile on OnTheIssues.org
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
