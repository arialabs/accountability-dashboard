"use client";

import { getRevolvingDoorLabel } from "@/lib/revolving-door";
import type { RevolvingDoorEntry, RevolvingDoorType } from "@/lib/revolving-door";

const bgColors: Record<RevolvingDoorType, string> = {
  industry_insider: "bg-red-50 border-red-300 text-red-900",
  ideological_conflict: "bg-red-50 border-red-300 text-red-900",
  lobbying_door: "bg-amber-50 border-amber-300 text-amber-900",
  public_service: "bg-green-50 border-green-300 text-green-900",
};

const summaryColors: Record<RevolvingDoorType, string> = {
  industry_insider: "text-red-800",
  ideological_conflict: "text-red-800",
  lobbying_door: "text-amber-800",
  public_service: "text-green-800",
};

interface VerdictBannerProps {
  entry: RevolvingDoorEntry | null;
  expandTargetId?: string;
}

export function VerdictBanner({ entry, expandTargetId }: VerdictBannerProps) {
  if (!entry) return null;

  const colors = bgColors[entry.type];
  const summaryColor = summaryColors[entry.type];
  const label = getRevolvingDoorLabel(entry.type);

  const scrollToTarget = () => {
    if (!expandTargetId) return;
    const el = document.getElementById(expandTargetId);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`rounded-2xl border-2 p-6 md:p-8 ${colors}`}>
      <h2 className="text-xl md:text-2xl font-black mb-1">
        Who Does This Official Serve?
      </h2>
      <span className="inline-block text-sm font-bold uppercase tracking-wider mb-3 opacity-80">
        {label}
      </span>
      <div className="mb-2">
        <span className="text-sm font-semibold uppercase tracking-wider opacity-70">Prior Industry: </span>
        <span className="font-semibold">{entry.prior_industry}</span>
      </div>
      <p className={`text-base leading-relaxed ${summaryColor}`}>
        {entry.summary}
      </p>
      {expandTargetId && (
        <button
          onClick={scrollToTarget}
          className="mt-4 text-sm font-semibold underline underline-offset-2 hover:opacity-80"
        >
          See full analysis
        </button>
      )}
    </div>
  );
}
