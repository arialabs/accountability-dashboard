"use client";

import { useState } from "react";
import type { EnhancedAlignmentScore } from "@/lib/alignment-enhanced";
import { getConfidenceColor, getConfidenceDots } from "@/lib/confidence";
import ScoreBreakdownModal from "./ScoreBreakdownModal";

interface AlignmentScoreCardEnhancedProps {
  alignment: EnhancedAlignmentScore;
  ranking?: { rank: number; total: number } | null;
}

export default function AlignmentScoreCardEnhanced({ 
  alignment, 
  ranking 
}: AlignmentScoreCardEnhancedProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

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

  const getScoreGradient = (score: number) => {
    if (score >= 70) return "from-emerald-400 to-emerald-600";
    if (score >= 50) return "from-amber-400 to-amber-600";
    return "from-red-400 to-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Very Consistent";
    if (score >= 60) return "Mostly Consistent";
    if (score >= 40) return "Mixed Record";
    return "Inconsistent";
  };

  const confidenceColors = getConfidenceColor(alignment.confidence.level);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Alignment Score
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Multi-factor analysis of voting alignment
              </p>
            </div>
            {ranking && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                #{ranking.rank} of {ranking.total}
              </span>
            )}
          </div>

          {/* Main Score with Confidence */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getScoreGradient(alignment.weighted_score)} shadow-lg relative`}>
              <span className="text-4xl font-bold text-white">
                {alignment.weighted_score}
              </span>
              {/* Confidence indicator overlay */}
              <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md">
                <span className={`text-xs font-bold ${confidenceColors.text}`}>
                  {getConfidenceDots(alignment.confidence.level)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <p className={`font-semibold mb-1 ${getScoreColor(alignment.weighted_score)}`}>
                {getScoreLabel(alignment.weighted_score)}
              </p>
              <p className="text-sm text-slate-600 mb-2">
                {alignment.aligned_votes} of {alignment.total_votes_analyzed} votes aligned
              </p>
              
              {/* Confidence badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${confidenceColors.bg} ${confidenceColors.border} ${confidenceColors.text}`}>
                <span>{getConfidenceDots(alignment.confidence.level)}</span>
                <span className="uppercase tracking-wide">
                  {alignment.confidence.level} confidence
                </span>
              </div>
            </div>
          </div>

          {/* Quick Factor Preview */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900">
                Score Factors
              </h4>
              <button
                onClick={() => setShowBreakdown(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Full Breakdown
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {alignment.factors.slice(0, 4).map((factor, index) => (
                <div key={index} className="bg-white rounded-lg p-2">
                  <div className="text-xs text-slate-600 mb-1 truncate" title={factor.name}>
                    {factor.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-slate-900">
                      {factor.score}
                    </div>
                    <div className="text-xs text-slate-500">
                      ({Math.round(factor.weight * 100)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700">By Category</h4>
              <span className="text-xs text-slate-500">
                Consistency: {alignment.consistency_score}%
              </span>
            </div>
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
                        className={`h-full rounded-full transition-all bg-gradient-to-r ${
                          data.score >= 70 ? "from-emerald-400 to-emerald-600" :
                          data.score >= 50 ? "from-amber-400 to-amber-600" : 
                          "from-red-400 to-red-600"
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

          {/* Additional Metrics */}
          {alignment.bipartisan_score !== null && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Bipartisan Cooperation</span>
                <span className={`text-sm font-semibold ${getScoreColor(alignment.bipartisan_score)}`}>
                  {alignment.bipartisan_score}%
                </span>
              </div>
            </div>
          )}

          {/* Misalignments Toggle */}
          {alignment.notable_misalignments.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 hover:text-slate-900"
            >
              <span>View notable misalignments ({alignment.notable_misalignments.length})</span>
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
            {alignment.notable_misalignments.map((m, i) => (
              <div key={i} className="bg-white rounded-lg p-3 text-sm">
                <p className="font-medium text-slate-900 mb-1">{m.topic}</p>
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
            ))}
          </div>
        )}

        {/* How is this calculated? */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
          <button
            onClick={() => setShowBreakdown(true)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How is this score calculated?
          </button>
          <p className="text-xs text-slate-500 mt-2">
            Score combines {alignment.factors.length} weighted factors: voting record alignment,
            campaign finance influence, consistency, {alignment.bipartisan_score !== null && 'and bipartisan cooperation'}.
          </p>
        </div>
      </div>

      {/* Breakdown Modal */}
      {showBreakdown && (
        <ScoreBreakdownModal
          score={alignment}
          onClose={() => setShowBreakdown(false)}
        />
      )}
    </>
  );
}
