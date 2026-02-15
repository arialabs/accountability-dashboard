"use client";

import { useState } from "react";
import type { AlignmentScore } from "@/lib/data";
import AlignmentTooltip from "./AlignmentTooltip";
import AlignmentLegend from "./AlignmentLegend";

interface AlignmentScoreCardProps {
  alignment: AlignmentScore | null;
  ranking?: { rank: number; total: number } | null;
}

export default function AlignmentScoreCard({ alignment, ranking }: AlignmentScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!alignment || alignment.total_votes_analyzed < 3) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Position-to-Vote Alignment
        </h3>
        <p className="text-slate-500 text-sm">
          Not enough data to calculate alignment score. This requires at least 3 votes
          that can be mapped to stated positions.
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-emerald-100";
    if (score >= 50) return "bg-amber-100";
    return "bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Very Consistent";
    if (score >= 60) return "Mostly Consistent";
    if (score >= 40) return "Mixed Record";
    return "Inconsistent";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">
                Position-to-Vote Alignment
              </h3>
              <AlignmentTooltip averageScore={54} extended />
            </div>
            <p className="text-slate-500 text-sm mt-1">
              How often votes match stated positions
            </p>
          </div>
          {ranking && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              #{ranking.rank} of {ranking.total}
            </span>
          )}
        </div>

        {/* Main Score */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreBg(alignment.alignment_score)}`}>
            <span className={`text-3xl font-bold ${getScoreColor(alignment.alignment_score)}`}>
              {alignment.alignment_score}%
            </span>
          </div>
          <div>
            <p className={`font-semibold ${getScoreColor(alignment.alignment_score)}`}>
              {getScoreLabel(alignment.alignment_score)}
            </p>
            <p className="text-sm text-slate-500">
              {alignment.aligned_votes} of {alignment.total_votes_analyzed} votes aligned
            </p>
          </div>
        </div>

        {/* Legend */}
        <AlignmentLegend compact className="mb-4" />

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">By Category</h4>
          {Object.entries(alignment.category_breakdown)
            .filter(([_, data]) => data.total >= 2)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5)
            .map(([category, data]) => (
              <div key={category} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{category}</span>
                    <span className={getScoreColor(data.score)}>{data.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        data.score >= 70 ? "bg-emerald-500" :
                        data.score >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-12 text-right">
                  {data.aligned}/{data.total}
                </span>
              </div>
            ))}
        </div>

        {/* Misalignments Toggle */}
        {alignment.notable_misalignments.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 hover:text-slate-900"
          >
            <span>View notable misalignments</span>
            <span className="text-lg">{showDetails ? "−" : "+"}</span>
          </button>
        )}
      </div>

      {/* Misalignment Details */}
      {showDetails && alignment.notable_misalignments.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            Votes That Differed From Stated Positions
          </h4>
          {alignment.notable_misalignments.map((m, i) => {
            // Generate plain English summary for misalignment
            const plainEnglish = `Supports ${m.stated_stance.toLowerCase()} but voted ${m.actual_vote} on ${m.topic.toLowerCase()}`;
            
            return (
              <div key={i} className="bg-white rounded-lg p-3 text-sm">
                <p className="font-medium text-slate-900 mb-2">{plainEnglish}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    Says: {m.stated_stance}
                  </span>
                  <span className={`px-2 py-0.5 rounded ${
                    m.actual_vote === "Yea" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                    Voted: {m.actual_vote}
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    Expected: {m.expected_vote}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Methodology Note */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-3">
        <p className="text-xs text-slate-500">
          Alignment calculated by mapping stated positions (from OnTheIssues) to relevant
          key votes. A higher score means votes more consistently match stated beliefs.
        </p>
      </div>
    </div>
  );
}
