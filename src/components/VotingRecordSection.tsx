"use client";

/**
 * Voting Record Section - Party loyalty, key votes, ideology
 */
import React from "react";

interface KeyVote {
  date: string;
  bill: string;
  title: string;
  vote: "Yea" | "Nay" | "Present" | "Not Voting";
  partyPosition: "Yea" | "Nay";
  aligned: boolean;
}

interface VotingRecordProps {
  partyLoyalty: number;
  ideologyScore: number | null;
  keyVotes: KeyVote[];
}

export default function VotingRecordSection({
  partyLoyalty,
  ideologyScore,
  keyVotes,
}: VotingRecordProps) {
  const getAlignmentColor = (pct: number) => {
    if (pct >= 95) return "text-emerald-600 bg-emerald-50";
    if (pct >= 85) return "text-lime-600 bg-lime-50";
    if (pct >= 75) return "text-amber-600 bg-amber-50";
    if (pct >= 65) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getIdeologyLabel = (score: number) => {
    if (score < -0.5) return "Very Liberal";
    if (score < -0.2) return "Liberal";
    if (score < 0.2) return "Moderate";
    if (score < 0.5) return "Conservative";
    return "Very Conservative";
  };

  const getIdeologyPosition = (score: number) => {
    // Convert from -1 to 1 scale to 0-100%
    return ((score + 1) / 2) * 100;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm hover:shadow-xl transition-all duration-300">
      <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
        Voting Record
      </h3>

      {/* Party Loyalty */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xl font-black text-slate-900">
              Party Loyalty
            </div>
            <div className="text-base text-slate-600 leading-relaxed">
              Votes aligned with party majority
            </div>
          </div>
          <div
            className={`px-6 py-3 rounded-xl font-mono text-4xl font-black ${getAlignmentColor(
              partyLoyalty
            )}`}
          >
            {partyLoyalty}%
          </div>
        </div>

        <div className="h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${partyLoyalty}%` }}
          />
        </div>
      </div>

      {/* Ideology Score */}
      {ideologyScore != null && (
        <div className="mb-8 pb-8 border-b border-slate-200">
          <div className="text-xl font-black text-slate-900 mb-2">
            Ideology Score
          </div>
          <div className="text-base text-slate-600 mb-6 leading-relaxed">
            Based on DW-NOMINATE analysis of voting patterns
          </div>

          <div className="relative">
            <div className="h-5 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full shadow-md" />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-3 border-slate-900 rounded-full shadow-lg"
              style={{ left: `${getIdeologyPosition(ideologyScore)}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-slate-600 mt-3">
            <span className="font-medium">Very Liberal</span>
            <span className="font-black text-slate-900">
              {getIdeologyLabel(ideologyScore)} ({ideologyScore.toFixed(2)})
            </span>
            <span className="font-medium">Very Conservative</span>
          </div>
        </div>
      )}

      {/* Key Votes */}
      <div>
        <div className="text-sm font-black uppercase tracking-wider text-slate-700 mb-5">
          Recent Key Votes
        </div>

        {keyVotes.length > 0 ? (
          <div className="space-y-4">
            {keyVotes.map((vote, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                  vote.aligned
                    ? "bg-slate-50 border-slate-200 hover:border-slate-300"
                    : "bg-amber-50 border-amber-200 hover:border-amber-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      {vote.bill}
                    </div>
                    <div className="text-sm text-slate-600 leading-relaxed">{vote.title}</div>
                  </div>
                  {!vote.aligned && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-amber-600 text-white">
                      Broke with party
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-5 text-sm">
                  <span className="text-slate-600">{vote.date}</span>
                  <span
                    className={`font-bold ${
                      vote.vote === "Yea"
                        ? "text-emerald-600"
                        : vote.vote === "Nay"
                        ? "text-red-600"
                        : "text-slate-600"
                    }`}
                  >
                    Voted: {vote.vote}
                  </span>
                  <span className="text-slate-600">
                    Party: {vote.partyPosition}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-base text-slate-400 text-center py-8 leading-relaxed">
            Key votes data coming soon...
          </div>
        )}
      </div>
    </div>
  );
}
