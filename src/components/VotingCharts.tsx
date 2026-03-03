"use client";

import React from "react";
import { Member } from "@/lib/data";

interface VotingChartsProps {
  member: Member;
}

/**
 * Party Alignment Donut Chart
 * Shows percentage of votes with party vs against
 */
function PartyAlignmentChart({ pct, party }: { pct: number; party: string }) {
  const circumference = 2 * Math.PI * 40; // radius = 40
  const partyDash = (pct / 100) * circumference;
  const againstDash = circumference - partyDash;
  
  const partyColor = party === "D" ? "#3B82F6" : party === "R" ? "#EF4444" : "#8B5CF6";
  const againstColor = "#374151";

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={againstColor}
          strokeWidth="12"
        />
        {/* Party alignment arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={partyColor}
          strokeWidth="12"
          strokeDasharray={`${partyDash} ${againstDash}`}
          strokeDashoffset={circumference / 4} // Start from top
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        {/* Center text */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-lg font-bold"
          fontSize="18"
        >
          {pct}%
        </text>
      </svg>
      <div className="flex gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: partyColor }}
          />
          With party
        </span>
        <span className="flex items-center gap-1">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: againstColor }}
          />
          Against
        </span>
      </div>
    </div>
  );
}

/**
 * Ideology Spectrum Chart
 * Shows position on liberal-conservative scale (-1 to +1)
 */
function IdeologyChart({ score, party }: { score: number | null; party: string }) {
  if (score === null) {
    return (
      <div className="text-center py-4 text-slate-500 text-sm">
        Ideology score not available
      </div>
    );
  }

  // Score ranges from -1 (most liberal) to +1 (most conservative)
  // Convert to percentage position (0% = far left, 100% = far right)
  const position = ((score + 1) / 2) * 100;
  const partyColor = party === "D" ? "#3B82F6" : party === "R" ? "#EF4444" : "#8B5CF6";

  return (
    <div className="w-full">
      {/* Labels */}
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span>Liberal</span>
        <span>Moderate</span>
        <span>Conservative</span>
      </div>
      
      {/* Spectrum bar */}
      <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 via-purple-500 to-red-600">
        {/* Position marker */}
        <div 
          className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-500"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        />
        {/* Marker dot */}
        <div 
          className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-500"
          style={{ 
            left: `${position}%`, 
            transform: "translate(-50%, -50%)",
            backgroundColor: partyColor 
          }}
        />
      </div>
      
      {/* Score value */}
      <div className="text-center mt-2 text-sm">
        <span className="text-slate-400">DW-NOMINATE Score: </span>
        <span className="font-mono font-bold">{score.toFixed(3)}</span>
      </div>
    </div>
  );
}

/**
 * Voting Activity Bar
 * Compares member's votes cast to chamber average
 */
function VotingActivityChart({ votesCast, chamber }: { votesCast: number; chamber: "house" | "senate" }) {
  // Typical range for 119th Congress (early session)
  const maxVotes = chamber === "senate" ? 50 : 80;
  const avgVotes = chamber === "senate" ? 25 : 40;
  
  const memberPct = Math.min((votesCast / maxVotes) * 100, 100);
  const avgPct = (avgVotes / maxVotes) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span>Votes Cast</span>
        <span>{votesCast} votes</span>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
          style={{ width: `${memberPct}%` }}
        />
        {/* Average marker */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-yellow-400"
          style={{ left: `${avgPct}%` }}
          title="Chamber average"
        />
      </div>
      
      <div className="flex justify-between text-xs mt-1">
        <span className="text-slate-500">0</span>
        <span className="text-yellow-400/70">avg: ~{avgVotes}</span>
        <span className="text-slate-500">{maxVotes}+</span>
      </div>
    </div>
  );
}

/**
 * Main VotingCharts component
 * Combines all voting visualizations for a member
 */
export default function VotingCharts({ member }: VotingChartsProps) {
  return (
    <div className="chart-container space-y-6">
      {/* Party Alignment */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Party Alignment</h3>
        <PartyAlignmentChart pct={member.party_alignment_pct} party={member.party} />
        <p className="text-xs text-slate-500 text-center mt-2">
          Based on {member.votes_cast} roll call votes in 119th Congress
        </p>
      </div>

      {/* Ideology Spectrum */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Ideology Spectrum</h3>
        <IdeologyChart score={member.ideology_score} party={member.party} />
        <p className="text-xs text-slate-500 text-center mt-2">
          DW-NOMINATE score from Voteview.com
        </p>
      </div>

      {/* Voting Activity */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Voting Activity</h3>
        <VotingActivityChart votesCast={member.votes_cast} chamber={member.chamber} />
      </div>
    </div>
  );
}
