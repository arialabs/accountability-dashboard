"use client";

import type { ConflictOfInterest } from "@/lib/conflict-detector";
import type { CampaignFinance } from "@/lib/types";

interface DonorCaptureScoreProps {
  conflicts: ConflictOfInterest[];
  finance: CampaignFinance | null;
  memberName: string;
}

type CaptureVerdict = "captured" | "mixed" | "independent";

function computeVerdict(
  conflicts: ConflictOfInterest[],
  finance: CampaignFinance | null
): { verdict: CaptureVerdict; highConflicts: number; pacPct: number; smallDonorPct: number } {
  const highConflicts = conflicts.filter((c) => c.conflictSeverity === "high").length;
  const totalConflicts = conflicts.length;
  const pacPct = finance?.pac_percentage ?? 0;
  const smallDonorPct = finance?.small_donor_percentage ?? 0;

  let verdict: CaptureVerdict;
  if (highConflicts >= 2 || pacPct >= 60) {
    verdict = "captured";
  } else if (highConflicts >= 1 || totalConflicts >= 2 || pacPct >= 30) {
    verdict = "mixed";
  } else {
    verdict = "independent";
  }

  return { verdict, highConflicts, pacPct, smallDonorPct };
}

const VERDICT_CONFIG: Record<
  CaptureVerdict,
  {
    label: string;
    icon: string;
    bgClass: string;
    borderClass: string;
    badgeBg: string;
    badgeText: string;
    dotClass: string;
    description: (name: string, highConflicts: number, pacPct: number) => string;
  }
> = {
  captured: {
    label: "DONOR CAPTURED",
    icon: "🚨",
    bgClass: "bg-red-50",
    borderClass: "border-red-300",
    badgeBg: "bg-red-600",
    badgeText: "text-white",
    dotClass: "bg-red-500",
    description: (name, highConflicts, pacPct) =>
      `${name}'s voting record shows ${highConflicts} high-severity conflict${highConflicts !== 1 ? "s" : ""} where votes aligned with top donor industries${pacPct > 0 ? `, with ${pacPct.toFixed(0)}% of funding from PACs` : ""}.`,
  },
  mixed: {
    label: "MIXED ALLEGIANCE",
    icon: "⚠️",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-300",
    badgeBg: "bg-amber-500",
    badgeText: "text-white",
    dotClass: "bg-amber-400",
    description: (name, highConflicts, pacPct) =>
      `${name} shows some conflicts between donor interests and votes${pacPct > 0 ? ` and receives ${pacPct.toFixed(0)}% of funding from PACs` : ""}. The full picture is mixed.`,
  },
  independent: {
    label: "CONSTITUENT FOCUSED",
    icon: "✅",
    bgClass: "bg-green-50",
    borderClass: "border-green-300",
    badgeBg: "bg-green-600",
    badgeText: "text-white",
    dotClass: "bg-green-500",
    description: (name, _highConflicts, pacPct) =>
      `${name}'s available data shows no detected conflicts between donor interests and votes${pacPct > 0 ? `, with relatively low PAC reliance (${pacPct.toFixed(0)}%)` : ""}.`,
  },
};

export default function DonorCaptureScore({
  conflicts,
  finance,
  memberName,
}: DonorCaptureScoreProps) {
  // Only render if we have some data to base the score on
  const hasConflictData = conflicts.length > 0;
  const hasFinanceData = finance !== null && (finance.pac_percentage > 0 || finance.small_donor_percentage > 0);

  if (!hasConflictData && !hasFinanceData) {
    return null;
  }

  const { verdict, highConflicts, pacPct, smallDonorPct } = computeVerdict(conflicts, finance);
  const cfg = VERDICT_CONFIG[verdict];
  const totalConflicts = conflicts.length;

  return (
    <section
      className={`rounded-3xl border-2 p-6 ${cfg.bgClass} ${cfg.borderClass} shadow-sm transition-all duration-300 hover:shadow-lg`}
      aria-label="Donor Capture Score"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-hidden="true">
            {cfg.icon}
          </span>
          <div>
            <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              Who Do They Work For?
            </p>
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wide ${cfg.badgeBg} ${cfg.badgeText}`}
            >
              <span
                className={`w-2 h-2 rounded-full bg-white opacity-80 inline-block`}
              />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Data pills */}
        <div className="flex flex-wrap gap-2">
          {hasConflictData && (
            <div className="bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  highConflicts >= 2
                    ? "bg-red-500"
                    : highConflicts === 1
                    ? "bg-amber-400"
                    : "bg-slate-300"
                }`}
              />
              {totalConflicts} conflict{totalConflicts !== 1 ? "s" : ""} detected
              {highConflicts > 0 && (
                <span className="text-red-600">({highConflicts} high severity)</span>
              )}
            </div>
          )}
          {pacPct > 0 && (
            <div className="bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  pacPct >= 60 ? "bg-red-500" : pacPct >= 30 ? "bg-amber-400" : "bg-green-400"
                }`}
              />
              {pacPct.toFixed(0)}% PAC funding
            </div>
          )}
          {smallDonorPct > 0 && (
            <div className="bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              {smallDonorPct.toFixed(0)}% small donors
            </div>
          )}
        </div>
      </div>

      {/* Plain-language summary */}
      <p className="text-sm text-slate-700 leading-relaxed">
        {cfg.description(memberName, highConflicts, pacPct)}
      </p>

      {/* Methodology note */}
      <p className="text-xs text-slate-400 mt-3 font-mono">
        Based on FEC filings and cross-referencing donor industries with congressional votes.{" "}
        <a href="/methodology" className="underline hover:text-slate-600 transition-colors">
          Methodology →
        </a>
      </p>
    </section>
  );
}
