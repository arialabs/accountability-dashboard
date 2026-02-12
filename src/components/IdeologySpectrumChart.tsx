"use client";

import { useMemo, useState } from "react";
import type { Member } from "@/lib/types";
import Link from "next/link";

interface IdeologySpectrumChartProps {
  members: Member[];
  chamber?: "house" | "senate" | "";
}

/**
 * Visual spectrum showing members' ideological positions
 * Uses DW-NOMINATE scores: negative = liberal, positive = conservative
 */
export default function IdeologySpectrumChart({ members, chamber }: IdeologySpectrumChartProps) {
  const [hoveredMember, setHoveredMember] = useState<Member | null>(null);
  
  const spectrum = useMemo(() => {
    // Filter by chamber if specified
    const filtered = chamber 
      ? members.filter(m => m.chamber === chamber)
      : members;
    
    // Only include members with ideology scores
    const withScores = filtered.filter(m => m.ideology_score !== null && m.ideology_score !== undefined);
    
    if (withScores.length === 0) return { members: [], minScore: -1, maxScore: 1 };
    
    // Find min/max scores for scaling
    const scores = withScores.map(m => m.ideology_score!);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    
    // Sort by ideology score
    const sorted = [...withScores].sort((a, b) => a.ideology_score! - b.ideology_score!);
    
    return { members: sorted, minScore, maxScore };
  }, [members, chamber]);
  
  const getPositionPercent = (score: number) => {
    const range = spectrum.maxScore - spectrum.minScore;
    if (range === 0) return 50;
    return ((score - spectrum.minScore) / range) * 100;
  };
  
  const getIdeologyLabel = (score: number) => {
    if (score < -0.5) return "Very Liberal";
    if (score < -0.2) return "Liberal";
    if (score < 0.2) return "Moderate";
    if (score < 0.5) return "Conservative";
    return "Very Conservative";
  };
  
  if (spectrum.members.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">
          🎯 Ideology Spectrum
        </h3>
        <p className="text-slate-500">
          Ideology data not available for these members.
        </p>
      </div>
    );
  }
  
  // Group members by position for compact display
  const BUCKETS = 20;
  const bucketedMembers = useMemo(() => {
    const buckets: Member[][] = Array(BUCKETS).fill(null).map(() => []);
    spectrum.members.forEach(member => {
      const pos = getPositionPercent(member.ideology_score!);
      const bucketIdx = Math.min(Math.floor((pos / 100) * BUCKETS), BUCKETS - 1);
      buckets[bucketIdx].push(member);
    });
    return buckets;
  }, [spectrum.members]);
  
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">
        🎯 Ideology Spectrum
      </h3>
      <p className="text-slate-500 mb-6">
        {chamber === "house" ? "House" : chamber === "senate" ? "Senate" : "Congress"} members on the liberal-conservative scale
      </p>
      
      {/* Spectrum visualization */}
      <div className="relative mb-8">
        {/* Gradient bar */}
        <div className="h-16 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 via-purple-300 to-red-500 relative">
          {/* Member dots */}
          {spectrum.members.map((member, i) => {
            const pos = getPositionPercent(member.ideology_score!);
            const partyColor = member.party === "D" 
              ? "bg-blue-700 border-blue-900" 
              : member.party === "R"
              ? "bg-red-700 border-red-900"
              : "bg-purple-700 border-purple-900";
            
            return (
              <Link
                key={member.bioguide_id}
                href={`/rep/${member.bioguide_id}`}
                className={`absolute w-3 h-3 ${partyColor} border-2 rounded-full cursor-pointer hover:scale-150 transition-transform z-10`}
                style={{ 
                  left: `${pos}%`, 
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseEnter={() => setHoveredMember(member)}
                onMouseLeave={() => setHoveredMember(null)}
                title={`${member.full_name} (${member.party}) - ${getIdeologyLabel(member.ideology_score!)}`}
              />
            );
          })}
        </div>
        
        {/* Labels */}
        <div className="flex justify-between mt-2 text-sm font-semibold">
          <span className="text-blue-700">Liberal</span>
          <span className="text-purple-700">Moderate</span>
          <span className="text-red-700">Conservative</span>
        </div>
        
        {/* Hover tooltip */}
        {hoveredMember && (
          <div className="mt-4 bg-slate-900 text-white p-4 rounded-xl">
            <div className="font-bold text-lg mb-1">{hoveredMember.full_name}</div>
            <div className="text-sm text-slate-300 mb-2">
              {hoveredMember.party === "D" ? "Democrat" : hoveredMember.party === "R" ? "Republican" : "Independent"} • {hoveredMember.state}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Ideology:</span>
              <span className="font-mono font-bold">
                {hoveredMember.ideology_score!.toFixed(3)}
              </span>
              <span className="text-sm text-slate-300">
                ({getIdeologyLabel(hoveredMember.ideology_score!)})
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Distribution by party */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { party: "D", label: "Democrats", color: "bg-blue-500" },
          { party: "R", label: "Republicans", color: "bg-red-500" },
          { party: "I", label: "Independents", color: "bg-purple-500" },
        ].map(({ party, label, color }) => {
          const partyMembers = spectrum.members.filter(m => m.party === party);
          if (partyMembers.length === 0) return null;
          
          const avgScore = partyMembers.reduce((sum, m) => sum + m.ideology_score!, 0) / partyMembers.length;
          
          return (
            <div key={party} className="bg-slate-50 rounded-xl p-4 text-center">
              <div className={`w-12 h-12 ${color} rounded-full mx-auto mb-3 flex items-center justify-center text-white font-black text-xl`}>
                {party}
              </div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                {label}
              </div>
              <div className="font-mono text-2xl font-black text-slate-900 mb-1">
                {avgScore.toFixed(3)}
              </div>
              <div className="text-xs text-slate-500">
                {getIdeologyLabel(avgScore)}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                ({partyMembers.length} members)
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-xs text-slate-400">
        <p>
          💡 <strong>Ideology scores</strong> use DW-NOMINATE scaling based on voting patterns. 
          Negative scores indicate liberal positions, positive scores indicate conservative positions.
          The scale roughly ranges from -1 (very liberal) to +1 (very conservative).
        </p>
      </div>
    </div>
  );
}
