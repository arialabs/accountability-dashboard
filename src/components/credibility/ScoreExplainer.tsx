"use client";

import { useState } from "react";
import Link from "next/link";

interface ScoreExplainerProps {
  score: number;
  statementsAnalyzed: number;
  votesAnalyzed: number;
  alignedVotes: number;
  confidence: "high" | "medium" | "low";
  lastUpdated: string;
  /** Weighted factors contributing to the score */
  factors?: Array<{
    name: string;
    score: number;
    weight: number;
  }>;
}

export default function ScoreExplainer({
  score,
  statementsAnalyzed,
  votesAnalyzed,
  alignedVotes,
  confidence,
  lastUpdated,
  factors,
}: ScoreExplainerProps) {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (s: number) => {
    if (s >= 70) return { text: "text-emerald-700", bg: "bg-emerald-100", bar: "bg-emerald-500", ring: "ring-emerald-200" };
    if (s >= 50) return { text: "text-amber-700", bg: "bg-amber-100", bar: "bg-amber-500", ring: "ring-amber-200" };
    return { text: "text-red-700", bg: "bg-red-100", bar: "bg-red-500", ring: "ring-red-200" };
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Very Consistent";
    if (s >= 60) return "Mostly Consistent";
    if (s >= 40) return "Mixed Record";
    return "Inconsistent";
  };

  const getConfidenceDots = (c: string) => {
    switch (c) {
      case "high": return "●●●";
      case "medium": return "●●○";
      case "low": return "●○○";
      default: return "○○○";
    }
  };

  const colors = getScoreColor(score);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Main score display */}
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          {/* Score circle */}
          <div className={`w-20 h-20 rounded-full ${colors.bg} ring-4 ${colors.ring} flex items-center justify-center`}>
            <span className={`text-3xl font-black ${colors.text}`}>{score}%</span>
          </div>

          <div className="flex-1">
            <div className={`text-lg font-bold ${colors.text}`}>
              {getScoreLabel(score)}
            </div>
            {/* THE key explainer line */}
            <p className="text-sm text-slate-600 mt-1">
              Compared <strong>{statementsAnalyzed} public statements</strong> against{" "}
              <strong>{votesAnalyzed} votes</strong> on related legislation.{" "}
              <strong>{alignedVotes}</strong> votes aligned.
            </p>
          </div>
        </div>

        {/* Confidence + freshness row */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-3">
            <span title={`${confidence} confidence`}>
              Confidence: <span className={confidence === "low" ? "text-amber-600" : "text-slate-700"}>{getConfidenceDots(confidence)}</span>
            </span>
            {confidence === "low" && (
              <span className="text-amber-600 font-medium">⚠ Limited data</span>
            )}
          </div>
          <span>Updated {lastUpdated}</span>
        </div>
      </div>

      {/* Expandable breakdown */}
      {factors && factors.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <span className="font-medium">
              {expanded ? "Hide score breakdown" : "How is this calculated?"}
            </span>
            <span className="text-lg">{expanded ? "−" : "+"}</span>
          </button>

          {expanded && (
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-3">
              {factors.map((factor) => {
                const contribution = Math.round(factor.score * factor.weight);
                return (
                  <div key={factor.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700 font-medium">{factor.name}</span>
                      <span className="text-slate-500">
                        {factor.score} × {Math.round(factor.weight * 100)}% = <strong className="text-slate-700">{contribution}</strong>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getScoreColor(factor.score).bar}`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-slate-200">
                <Link
                  href="/methodology"
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  Full methodology →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
