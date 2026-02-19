"use client";

import { useState } from "react";
import type { EnhancedAlignmentScore } from "@/lib/alignment-enhanced";
import { getConfidenceColor, getConfidenceDots } from "@/lib/confidence";
import ScoreBreakdownModal from "./ScoreBreakdownModal";
import { Caption } from "@/components/ui";

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
                {alignment.total_votes_analyzed < alignment.min_votes_threshold && (
                  <span className="ml-1 text-amber-600 font-medium">
                    (n={alignment.total_votes_analyzed})
                  </span>
                )}
              </p>
              
              {/* Insufficient Data Warning */}
              {alignment.insufficient_data && (
                <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs text-amber-800">
                      <strong>Insufficient Data:</strong> Only {alignment.total_votes_analyzed} vote{alignment.total_votes_analyzed === 1 ? '' : 's'} analyzed. 
                      Need at least {alignment.min_votes_threshold} for reliable scoring.
                    </div>
                  </div>
                </div>
              )}
              
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
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Score Factors
                </h4>
                <button 
                  title="The overall score combines multiple weighted factors. Recent votes are weighted more heavily than older votes."
                  className="text-slate-500 hover:text-slate-700"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
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
                <div key={index} className="bg-white rounded-lg p-2" title={factor.description}>
                  <div className="text-xs text-slate-600 mb-1 truncate flex items-center gap-1">
                    <span>{factor.name}</span>
                    {factor.dataPoints > 0 && (
                      <span className="text-xs text-slate-400 font-mono">
                        (n={factor.dataPoints})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-slate-900">
                      {factor.score}
                    </div>
                    <div className="text-xs text-slate-500">
                      ({Math.round(factor.weight * 100)}% weight)
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {factor.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-700">By Category</h4>
                <button 
                  title="Shows voting alignment by policy category. Higher percentages mean votes consistently match stated positions."
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Caption>
                  Consistency: {alignment.consistency_score}%
                </Caption>
                <button 
                  title="Consistency measures how similar voting patterns are across different categories. High consistency means predictable voting."
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            {Object.entries(alignment.category_breakdown)
              .filter(([_, data]) => data.total >= 1)
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 5)
              .map(([category, data]) => (
                <div key={category} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{category}</span>
                      <div className="flex items-center gap-1">
                        <span className={getScoreColor(data.score)}>{data.score}%</span>
                        {data.total < alignment.min_votes_threshold && (
                          <span className="text-xs text-amber-600" title="Small sample size - score may not be reliable">
                            ⚠
                          </span>
                        )}
                      </div>
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
                  <span 
                    className="text-xs text-slate-400 w-16 text-right font-mono"
                    title={`${data.aligned} aligned votes out of ${data.total} total votes`}
                  >
                    n={data.total}
                  </span>
                </div>
              ))}
            {Object.keys(alignment.category_breakdown).length === 0 && (
              <div className="text-sm text-slate-500 italic text-center py-2">
                No category data available
              </div>
            )}
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
            campaign finance influence, consistency{alignment.bipartisan_score !== null && ', and bipartisan cooperation'}.
            Recent votes are weighted more heavily than older votes.
            {alignment.insufficient_data && ' ⚠ Score has low confidence due to limited data.'}
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
