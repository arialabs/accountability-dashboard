/**
 * CareerTimeline — Visual career path from private sector to government role.
 * Color-coded by revolving door risk level to show the path that led here.
 */

import type { RevolvingDoorEntry, RevolvingDoorType } from "@/lib/revolving-door";

interface Position {
  title: string;
  organization: string;
  years: string;
}

interface CareerTimelineProps {
  priorPositions: Position[];
  currentRole: string;
  currentDepartment: string;
  rdEntry: RevolvingDoorEntry | null;
}

function getNodeColor(type: RevolvingDoorType | null, isFirst: boolean): {
  ring: string;
  dot: string;
  card: string;
  title: string;
  org: string;
  year: string;
} {
  // The most recent prior position gets the risk-coded color
  if (isFirst) {
    switch (type) {
      case "industry_insider":
        return {
          ring: "ring-red-400",
          dot: "bg-red-500",
          card: "bg-red-50 border-red-200",
          title: "text-red-900",
          org: "text-red-700",
          year: "text-red-500",
        };
      case "ideological_conflict":
        return {
          ring: "ring-orange-400",
          dot: "bg-orange-500",
          card: "bg-orange-50 border-orange-200",
          title: "text-orange-900",
          org: "text-orange-700",
          year: "text-orange-500",
        };
      case "lobbying_door":
        return {
          ring: "ring-amber-400",
          dot: "bg-amber-500",
          card: "bg-amber-50 border-amber-200",
          title: "text-amber-900",
          org: "text-amber-700",
          year: "text-amber-500",
        };
      default:
        return {
          ring: "ring-green-400",
          dot: "bg-green-500",
          card: "bg-green-50 border-green-200",
          title: "text-green-900",
          org: "text-green-700",
          year: "text-green-500",
        };
    }
  }
  // Older positions are neutral
  return {
    ring: "ring-slate-300",
    dot: "bg-slate-400",
    card: "bg-slate-50 border-slate-200",
    title: "text-slate-800",
    org: "text-slate-600",
    year: "text-slate-400",
  };
}

function getRiskLabel(type: RevolvingDoorType | null): { text: string; className: string } | null {
  switch (type) {
    case "industry_insider":
      return {
        text: "🔄 Revolving Door",
        className: "bg-red-100 text-red-800 border-red-300",
      };
    case "ideological_conflict":
      return {
        text: "⚔️ Mission Conflict",
        className: "bg-orange-100 text-orange-800 border-orange-300",
      };
    case "lobbying_door":
      return {
        text: "🎭 Lobbying Door",
        className: "bg-amber-100 text-amber-800 border-amber-300",
      };
    case "public_service":
      return {
        text: "🏛️ Public Service",
        className: "bg-green-100 text-green-800 border-green-300",
      };
    default:
      return null;
  }
}

export function CareerTimeline({
  priorPositions,
  currentRole,
  currentDepartment,
  rdEntry,
}: CareerTimelineProps) {
  const riskLabel = getRiskLabel(rdEntry?.type ?? null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black text-slate-900">Career Path</h2>
        {riskLabel && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold ${riskLabel.className}`}
          >
            {riskLabel.text}
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs">
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          Direct revolving door
        </span>
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          Lobbying / Media background
        </span>
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          Career public servant
        </span>
      </div>

      <div className="relative">
        {/* Vertical spine */}
        <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-slate-200" aria-hidden="true" />

        <div className="space-y-4">
          {/* Prior positions — oldest last, most recent first */}
          {priorPositions.map((position, idx) => {
            const isFirst = idx === 0; // most recent prior role
            const colors = getNodeColor(rdEntry?.type ?? null, isFirst);
            return (
              <div key={idx} className="relative flex items-start gap-5">
                {/* Timeline node */}
                <div
                  className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ring-2 ${colors.ring} ${colors.dot} flex items-center justify-center mt-1`}
                  aria-hidden="true"
                >
                  {isFirst && rdEntry?.type && rdEntry.type !== "public_service" ? (
                    <span className="text-white text-xs font-black">!</span>
                  ) : (
                    <span className="text-white text-xs">•</span>
                  )}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 rounded-xl border p-4 ${colors.card}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-bold ${colors.title}`}>{position.title}</h3>
                      <p className={`text-sm ${colors.org}`}>{position.organization}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white border ${colors.year} whitespace-nowrap`}
                    >
                      {position.years}
                    </span>
                  </div>
                  {isFirst && rdEntry && rdEntry.type !== "public_service" && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 italic">
                      {rdEntry.summary}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Arrow between prior and current */}
          <div className="relative flex items-center gap-5 py-1">
            <div className="relative z-10 flex-shrink-0 w-8 h-8 flex items-center justify-center mt-1" aria-hidden="true">
              <svg className="text-slate-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Now Serving As
            </span>
          </div>

          {/* Current government role — always navy/civic */}
          <div className="relative flex items-start gap-5">
            <div
              className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full ring-2 ring-blue-500 bg-blue-600 flex items-center justify-center mt-1"
              aria-hidden="true"
            >
              <span className="text-white text-xs">🏛</span>
            </div>
            <div className="flex-1 rounded-xl border-2 border-blue-300 bg-blue-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-blue-900">{currentRole}</h3>
                  <p className="text-sm text-blue-700">{currentDepartment}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-blue-200 text-blue-600 whitespace-nowrap">
                  2025–Present
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
