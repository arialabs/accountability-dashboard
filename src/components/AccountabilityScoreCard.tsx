"use client";

import type { MultiFactorGradeResult } from "@/lib/grading-v2";

interface AccountabilityScoreCardProps {
  grade: MultiFactorGradeResult;
  memberName: string;
}

export default function AccountabilityScoreCard({ grade, memberName }: AccountabilityScoreCardProps) {
  const gradeColors = {
    A: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      badge: "bg-green-100 text-green-700 border-green-300",
      bar: "bg-green-500",
    },
    B: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-700 border-blue-300",
      bar: "bg-blue-500",
    },
    C: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      badge: "bg-yellow-100 text-yellow-700 border-yellow-300",
      bar: "bg-yellow-500",
    },
    D: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      badge: "bg-orange-100 text-orange-700 border-orange-300",
      bar: "bg-orange-500",
    },
    F: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      badge: "bg-red-100 text-red-700 border-red-300",
      bar: "bg-red-500",
    },
  };

  const colors = gradeColors[grade.letter];

  return (
    <div className={`rounded-3xl border-2 p-8 shadow-lg ${colors.bg} ${colors.border}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-1">Accountability Score</h3>
          <p className="text-sm text-slate-600">Based on 4 factors: voting, donors, trading, disclosures</p>
        </div>
        <div className={`w-20 h-20 rounded-2xl border-4 flex items-center justify-center ${colors.badge}`}>
          <span className="text-5xl font-black">{grade.letter}</span>
        </div>
      </div>

      <div className={`text-6xl font-black mb-8 tabular-nums ${colors.text}`}>
        {grade.overall}
        <span className="text-3xl text-slate-500">/100</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700">Voting Record</span>
            <span className="text-sm font-mono font-bold text-slate-900">{grade.breakdown.votingScore}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-emerald-500 h-3 rounded-full transition-all" 
              style={{ width: `${grade.breakdown.votingScore}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">Alignment with public interest on key votes</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700">Donor Influence</span>
            <span className="text-sm font-mono font-bold text-slate-900">{grade.breakdown.donorScore}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-amber-500 h-3 rounded-full transition-all" 
              style={{ width: `${grade.breakdown.donorScore}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">Less reliance on PACs and large donors is better</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700">Trading Ethics</span>
            <span className="text-sm font-mono font-bold text-slate-900">{grade.breakdown.stockScore}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-purple-500 h-3 rounded-full transition-all" 
              style={{ width: `${grade.breakdown.stockScore}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">Risk score based on suspicious trading patterns</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700">Disclosure Compliance</span>
            <span className="text-sm font-mono font-bold text-slate-900">{grade.breakdown.disclosureScore}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all" 
              style={{ width: `${grade.breakdown.disclosureScore}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">Timely filing of financial disclosures</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-300">
        <p className="text-xs text-slate-600">
          <strong>Methodology:</strong> Each factor is weighted equally (25%) and scored 0-100. 
          Higher scores indicate better accountability and transparency.
        </p>
      </div>
    </div>
  );
}
