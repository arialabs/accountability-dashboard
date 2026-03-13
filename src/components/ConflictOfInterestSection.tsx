"use client";

import { useState } from "react";
import type { ConflictOfInterest } from "@/lib/conflict-detector";
import type { BillSummary } from "@/lib/types";
import { formatCurrencyShort, formatDate } from "@/lib/formatting";
import { billToCongressGovUrl } from "@/lib/bill-urls";

interface ConflictOfInterestSectionProps {
  conflicts: ConflictOfInterest[];
  memberName: string;
  billSummaries?: Record<string, BillSummary>;
}

interface IndustryGroup {
  industry: string;
  displayName: string;
  icon: string;
  donationAmount: number;
  highestSeverity: "high" | "medium" | "low";
  votes: ConflictOfInterest[];
}

function groupByIndustry(conflicts: ConflictOfInterest[]): IndustryGroup[] {
  const map = new Map<string, IndustryGroup>();
  const severityRank = { high: 3, medium: 2, low: 1 };

  for (const c of conflicts) {
    const existing = map.get(c.industry);
    if (existing) {
      existing.votes.push(c);
      if (severityRank[c.conflictSeverity] > severityRank[existing.highestSeverity]) {
        existing.highestSeverity = c.conflictSeverity;
      }
    } else {
      map.set(c.industry, {
        industry: c.industry,
        displayName: c.industryDisplayName,
        icon: c.icon,
        donationAmount: c.donationAmount,
        highestSeverity: c.conflictSeverity,
        votes: [c],
      });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => severityRank[b.highestSeverity] - severityRank[a.highestSeverity] || b.donationAmount - a.donationAmount
  );
}

function IndustryConflictCard({ group, billSummaries }: { group: IndustryGroup; billSummaries: Record<string, BillSummary> }) {
  const [expanded, setExpanded] = useState(false);
  const severityColors = {
    high: "bg-red-50 border-red-300",
    medium: "bg-orange-50 border-orange-300",
    low: "bg-yellow-50 border-yellow-300",
  };

  return (
    <div className={`rounded-xl border-2 p-5 ${severityColors[group.highestSeverity]} transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{group.icon}</span>
          <div>
            <h4 className="font-bold text-slate-900 text-lg">
              {group.displayName}
            </h4>
            <p className="text-sm text-slate-600">
              {formatCurrencyShort(group.donationAmount)} in donations → {group.votes.length} related vote{group.votes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Top 2 votes always visible */}
      <div className="space-y-2">
        {group.votes.slice(0, expanded ? undefined : 2).map((conflict, i) => {
          const billUrl = billToCongressGovUrl(conflict.voteBill, 119);
          return (
            <div key={i} className="bg-white rounded-lg p-3 flex items-start gap-3">
              <span className={`shrink-0 inline-block px-2 py-0.5 rounded font-mono text-xs font-bold mt-0.5 ${
                conflict.votePosition === "Yea"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {conflict.votePosition}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900">
                  Voted <strong>{conflict.votePosition}</strong> on{" "}
                  {billUrl ? (
                    <a href={billUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                      {conflict.voteBill}
                    </a>
                  ) : (
                    <span className="font-medium">{conflict.voteBill}</span>
                  )}
                  {" — "}{conflict.voteTitle}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDate(conflict.voteDate)}</p>
                {(() => {
                  const summary = billSummaries[conflict.voteBill];
                  if (!summary?.crs_summary) {
                    const fallbackUrl = summary?.url || billUrl || "#";
                    return (
                      <p className="text-xs text-slate-400 mt-1">
                        No summary available —{" "}
                        <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          view bill on Congress.gov →
                        </a>
                      </p>
                    );
                  }
                  return (
                    <div className="mt-1.5 space-y-1">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{summary.crs_summary}</p>
                      {summary.benefits && (
                        <p className="text-xs">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-medium">Benefits:</span>{" "}
                          <span className="text-slate-600">{summary.benefits.join(", ")}</span>
                        </p>
                      )}
                      {summary.harms && (
                        <p className="text-xs">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-medium">Harms:</span>{" "}
                          <span className="text-slate-600">{summary.harms.join(", ")}</span>
                        </p>
                      )}
                      {summary.ai_analyzed && (
                        <p className="text-[10px] text-slate-400 italic">AI analysis of CRS summary</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {group.votes.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          {expanded ? "Show less" : `+ ${group.votes.length - 2} more votes`}
        </button>
      )}
    </div>
  );
}

export default function ConflictOfInterestSection({
  conflicts,
  memberName,
  billSummaries = {},
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
  const groups = groupByIndustry(conflicts);

  // Top conflict for the summary narrative
  const topGroup = groups[0];

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">⚠️</span>
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          Potential Conflicts of Interest
        </h3>
      </div>

      {/* Summary — plain language, always visible */}
      <p className="text-slate-700 mb-4">
        {groups.length} donor industr{groups.length !== 1 ? "ies" : "y"} overlap with {memberName}&apos;s voting record across {conflicts.length} vote{conflicts.length !== 1 ? "s" : ""}.
      </p>

      {/* Top conflict narrative */}
      {topGroup && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-800">
            <span className="font-bold">{topGroup.displayName}</span> donated{" "}
            <span className="font-bold">{formatCurrencyShort(topGroup.donationAmount)}</span>,
            then {memberName.split(" ")[0]} voted in alignment with that industry on{" "}
            <span className="font-bold">{topGroup.votes.length} key bill{topGroup.votes.length !== 1 ? "s" : ""}</span>.
          </p>
        </div>
      )}

      {/* Industry group cards — first 2 always visible */}
      <div className="space-y-4">
        {groups.slice(0, detailsExpanded ? undefined : 2).map((group) => (
          <IndustryConflictCard key={group.industry} group={group} billSummaries={billSummaries} />
        ))}
      </div>

      {groups.length > 2 && (
        <button
          onClick={() => setDetailsExpanded(!detailsExpanded)}
          aria-expanded={detailsExpanded}
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {detailsExpanded ? "Show fewer" : `Show all ${groups.length} industries`}
        </button>
      )}

      {/* Methodology */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Conflicts detected by cross-referencing top donor industries (FEC data) with votes on related legislation (Congress.gov).
          Severity based on donation amounts. Not exhaustive — use as a starting point.
        </p>
      </div>
    </section>
  );
}
