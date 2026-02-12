"use client";

import { useState } from "react";
import type { EnhancedAlignmentScore } from "@/lib/alignment-enhanced";
import { getConfidenceColor, getConfidenceDots } from "@/lib/confidence";

interface ScoreBreakdownModalProps {
  score: EnhancedAlignmentScore;
  onClose: () => void;
}

export default function ScoreBreakdownModal({ score, onClose }: ScoreBreakdownModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                How This Score is Calculated
              </h2>
              <p className="text-blue-100 text-sm">
                Transparent breakdown of alignment scoring methodology
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {score.weighted_score}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {score.name}'s Weighted Alignment Score
              </h3>
              <p className="text-slate-600">
                Based on {score.factors.length} weighted factors analyzing voting patterns, 
                campaign finance, and consistency. Recent votes are weighted more heavily.
              </p>
              {score.insufficient_data && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-amber-800">
                      <strong>⚠ Insufficient Data:</strong> This score is based on only {score.total_votes_analyzed} vote{score.total_votes_analyzed === 1 ? '' : 's'}.
                      At least {score.min_votes_threshold} votes are needed for a reliable assessment.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confidence Level */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Data Confidence
          </h3>
          <div className={`rounded-xl border-2 p-4 ${getConfidenceColor(score.confidence.level).bg} ${getConfidenceColor(score.confidence.level).border}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`text-2xl ${getConfidenceColor(score.confidence.level).text}`}>
                  {getConfidenceDots(score.confidence.level)}
                </span>
                <div>
                  <div className={`font-bold ${getConfidenceColor(score.confidence.level).text} uppercase text-sm tracking-wide`}>
                    {score.confidence.level} Confidence
                  </div>
                  <div className="text-sm text-slate-600">
                    {score.confidence.explanation}
                  </div>
                </div>
              </div>
              <div className={`text-3xl font-bold ${getConfidenceColor(score.confidence.level).text}`}>
                {score.confidence.overall}%
              </div>
            </div>
            
            {/* Confidence breakdown */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-slate-600 mb-1">Data Points</div>
                <div className="text-lg font-bold text-slate-900">{score.confidence.dataPoints}</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-slate-600 mb-1">Recency</div>
                <div className="text-lg font-bold text-slate-900">{score.confidence.recencyScore}%</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-slate-600 mb-1">Source Coverage</div>
                <div className="text-lg font-bold text-slate-900">{score.confidence.sourceCoverage}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Factor Breakdown */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Score Breakdown by Factor
          </h3>
          <div className="space-y-4">
            {score.factors.map((factor, index) => {
              const weightPercentage = Math.round(factor.weight * 100);
              const contributionToScore = Math.round(factor.score * factor.weight);
              
              return (
                <div 
                  key={index}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-slate-900">
                          {factor.name}
                        </h4>
                        <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                          {weightPercentage}% weight
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        {factor.description}
                      </p>
                      <div className="text-xs text-slate-500">
                        Based on {factor.dataPoints} data point{factor.dataPoints !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-3xl font-bold text-slate-900 mb-1">
                        {factor.score}
                      </div>
                      <div className="text-xs text-slate-500">
                        raw score
                      </div>
                    </div>
                  </div>
                  
                  {/* Visual bar */}
                  <div className="relative">
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          factor.score >= 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                          factor.score >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                          'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-500">
                      <span>0</span>
                      <span className="font-semibold text-slate-700">
                        Contributes {contributionToScore} points to final score
                      </span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Methodology Explanation */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-3">
            Our Methodology
          </h3>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <strong>Position-to-Vote Alignment:</strong> We compare stated policy positions 
              (from campaign materials and OnTheIssues.org) with actual congressional votes 
              on related legislation. Recent votes (last 30 days) receive full weight, with 
              older votes gradually weighted less (minimum 50% for votes over 2 years old).
            </p>
            <p>
              <strong>Campaign Finance Influence:</strong> Representatives with higher percentages 
              of PAC and large donor funding may face more conflicts of interest. Small donor 
              funding suggests broader grassroots support.
            </p>
            <p>
              <strong>Voting Consistency:</strong> Measures how consistently a representative 
              votes within each policy category, indicating clarity of values.
            </p>
            {score.bipartisan_score !== null && (
              <p>
                <strong>Bipartisan Cooperation:</strong> Moderate cross-party voting (75-90% 
                party alignment) suggests independence while maintaining core principles.
              </p>
            )}
            <p>
              <strong>Sample Size:</strong> Scores based on fewer than {score.min_votes_threshold} votes 
              are flagged as having insufficient data. More data points lead to higher confidence scores.
            </p>
            <p className="pt-3 border-t border-slate-200 text-xs text-slate-500">
              <strong>Note:</strong> This scoring system is designed for transparency and 
              accountability. No scoring system is perfect, but we believe combining multiple 
              weighted factors provides a more complete picture than any single metric.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-200 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
