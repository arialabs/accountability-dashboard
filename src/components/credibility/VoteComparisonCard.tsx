"use client";

import DataSourceBadge from "./DataSourceBadge";
import { Caption } from "@/components/ui";

interface VoteComparisonProps {
  /** What they publicly stated */
  statement: {
    text: string;
    context: string; // e.g., "Campaign rally, Oct 2024"
    sourceUrl?: string;
  };
  /** How they actually voted */
  vote: {
    billTitle: string;
    billId: string;
    position: "Yea" | "Nay" | "Not Voting" | "Present";
    date: string;
    rollCallUrl?: string;
  };
  /** Does the vote align with the statement? */
  aligned: boolean;
  /** Category (e.g., Healthcare, Defense) */
  category: string;
}

export default function VoteComparisonCard({ statement, vote, aligned, category }: VoteComparisonProps) {
  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-shadow hover:shadow-md ${
      aligned ? "border-emerald-200" : "border-red-200"
    }`}>
      {/* Category header */}
      <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
        aligned ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}>
        {category} · {aligned ? "✓ Aligned" : "✗ Misaligned"}
      </div>

      {/* Side by side comparison */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {/* Statement side */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📢</span>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              They Said
            </h4>
          </div>
          <blockquote className="text-slate-700 text-sm leading-relaxed border-l-3 border-blue-300 pl-3 italic mb-3">
            "{statement.text}"
          </blockquote>
          <div className="flex items-center justify-between">
            <Caption as="p">{statement.context}</Caption>
            {statement.sourceUrl && (
              <DataSourceBadge source="ontheissues" url={statement.sourceUrl} compact />
            )}
          </div>
        </div>

        {/* Vote side */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🗳️</span>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              They Voted
            </h4>
          </div>
          <div className="mb-3">
            <p className="text-slate-700 text-sm font-medium mb-1">{vote.billTitle}</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                vote.position === "Yea"
                  ? "bg-emerald-100 text-emerald-700"
                  : vote.position === "Nay"
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {vote.position}
              </span>
              <Caption>
                {new Date(vote.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Caption>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{vote.billId}</span>
            {vote.rollCallUrl && (
              <DataSourceBadge source="congress" url={vote.rollCallUrl} compact />
            )}
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className={`px-4 py-3 text-sm font-medium ${
        aligned
          ? "bg-emerald-50 text-emerald-800"
          : "bg-red-50 text-red-800"
      }`}>
        {aligned
          ? "✓ Vote is consistent with stated position"
          : "✗ Vote contradicts stated position"
        }
      </div>
    </div>
  );
}
