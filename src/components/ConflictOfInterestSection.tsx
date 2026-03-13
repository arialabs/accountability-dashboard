"use client";

import { useState } from "react";
import type { ConflictOfInterest } from "@/lib/conflict-detector";
import { formatCurrencyShort, formatDate } from "@/lib/formatting";
import { BodyText, Caption } from "@/components/ui";

interface ConflictOfInterestSectionProps {
  conflicts: ConflictOfInterest[];
  memberName: string;
}

function ConflictCard({ conflict }: { conflict: ConflictOfInterest }) {
  const severityColors = {
    high: "bg-red-50 border-red-300",
    medium: "bg-orange-50 border-orange-300",
    low: "bg-yellow-50 border-yellow-300",
  };

  const severityBadges = {
    high: "bg-red-100 text-red-800",
    medium: "bg-orange-100 text-orange-800",
    low: "bg-yellow-100 text-yellow-800",
  };

  const severityIcons = {
    high: "🚨",
    medium: "⚠️",
    low: "⚡",
  };

  return (
    <div className={`rounded-xl border-2 p-5 ${severityColors[conflict.conflictSeverity]} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{conflict.icon}</span>
          <div>
            <h4 className="font-bold text-slate-900 text-lg">
              {conflict.industryDisplayName}
            </h4>
            <BodyText>
              {formatCurrencyShort(conflict.donationAmount)} in donations
            </BodyText>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${severityBadges[conflict.conflictSeverity]}`}>
          {severityIcons[conflict.conflictSeverity]} {conflict.conflictSeverity.toUpperCase()}
        </span>
      </div>

      <div className="bg-white rounded-lg p-4 mb-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <span className={`inline-block px-2 py-1 rounded font-mono text-xs font-bold ${
              conflict.votePosition === "Yea" 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}>
              {conflict.votePosition}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 mb-1">
              {conflict.voteBill}
            </p>
            <p className="text-sm text-slate-600 mb-2">
              {conflict.voteTitle}
            </p>
            <Caption as="p">
              {formatDate(conflict.voteDate)} • {conflict.voteCategory}
            </Caption>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">
        {conflict.explanation}
      </p>
    </div>
  );
}

export default function ConflictOfInterestSection({
  conflicts,
  memberName,
}: ConflictOfInterestSectionProps) {
  if (conflicts.length === 0) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🔎</span>
          <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Potential Conflicts of Interest
          </h3>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <p className="text-slate-700 font-semibold">
            Conflict of interest analysis is in progress for {memberName}.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            We&apos;re cross-referencing donor industries with voting records. This analysis requires thorough review before publication.
          </p>
        </div>
      </section>
    );
  }

  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const highSeverityCount = conflicts.filter(c => c.conflictSeverity === "high").length;
  const mediumSeverityCount = conflicts.filter(c => c.conflictSeverity === "medium").length;

  // Top conflict for summary lead
  const topConflict = conflicts[0];

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">⚠️</span>
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          Potential Conflicts of Interest
        </h3>
      </div>

      {/* Summary layer — always visible */}
      <p className="text-slate-600 mb-4">
        {conflicts.length} potential conflict{conflicts.length !== 1 ? "s" : ""} detected ({highSeverityCount} high severity).
      </p>

      {/* Plain-language lead for top conflict */}
      {topConflict && (
        <p className="text-slate-700 mb-4">
          Received {formatCurrencyShort(topConflict.donationAmount)} from {topConflict.industryDisplayName}, then voted {topConflict.votePosition} on {topConflict.voteTitle}.
        </p>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-slate-900">{conflicts.length}</p>
          <p className="text-sm text-slate-600 mt-1">Total Conflicts</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
          <p className="text-3xl font-black text-red-700">{highSeverityCount}</p>
          <p className="text-sm text-red-600 mt-1">High Severity</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-200">
          <p className="text-3xl font-black text-orange-700">{mediumSeverityCount}</p>
          <p className="text-sm text-orange-600 mt-1">Medium Severity</p>
        </div>
      </div>

      {/* Details toggle */}
      <button
        onClick={() => setDetailsExpanded(!detailsExpanded)}
        aria-expanded={detailsExpanded}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-4"
      >
        {detailsExpanded ? "Hide conflict details" : "Show all conflicts"}
      </button>

      {/* Detail layer — expandable */}
      {detailsExpanded && (
        <>
          {/* Conflict Cards */}
          <div className="space-y-4 mt-4">
            {conflicts.slice(0, 10).map((conflict, i) => (
              <ConflictCard key={i} conflict={conflict} />
            ))}
          </div>

          {conflicts.length > 10 && (
            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                Showing top 10 of {conflicts.length} potential conflicts
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Methodology:</strong> Conflicts are automatically detected by correlating top donor industries with votes on related legislation.
              Severity is based on donation amounts. This analysis is not exhaustive and should be used as a starting point for further investigation.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
