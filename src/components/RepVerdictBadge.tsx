/**
 * RepVerdictBadge — compact "Who does this rep serve?" badge for the header section.
 *
 * Answers the core question immediately, above the fold, without requiring scroll.
 * Based on PAC funding percentage from campaign finance data.
 */

type Verdict = "captured" | "mixed" | "constituent";

interface RepVerdictBadgeProps {
  /** PAC funding as a percentage (0–100), or null if unavailable */
  pacPct: number | null;
  /** High-severity conflict count from donor-vote conflict detection */
  highConflicts?: number;
  /** Total conflict count */
  totalConflicts?: number;
  className?: string;
}

function computeVerdict(
  pacPct: number | null,
  highConflicts: number,
  totalConflicts: number
): Verdict | null {
  if (pacPct === null && highConflicts === 0) return null;
  const pct = pacPct ?? 0;
  if (highConflicts >= 2 || pct >= 60) return "captured";
  if (highConflicts >= 1 || totalConflicts >= 2 || pct >= 30) return "mixed";
  return "constituent";
}

const VERDICT_STYLES: Record<
  Verdict,
  { bg: string; text: string; border: string; dot: string; label: string; icon: string }
> = {
  captured: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-300",
    dot: "bg-red-500",
    label: "DONOR CAPTURED",
    icon: "🚨",
  },
  mixed: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    dot: "bg-amber-400",
    label: "MIXED ALLEGIANCE",
    icon: "⚠️",
  },
  constituent: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-300",
    dot: "bg-green-500",
    label: "CONSTITUENT FOCUSED",
    icon: "✅",
  },
};

/**
 * Compact verdict badge intended for the hero/header of a rep profile page.
 * Renders nothing if no data is available.
 */
export function RepVerdictBadge({
  pacPct,
  highConflicts = 0,
  totalConflicts = 0,
  className = "",
}: RepVerdictBadgeProps) {
  const verdict = computeVerdict(pacPct, highConflicts, totalConflicts);
  if (!verdict) return null;

  const { bg, text, border, dot, label, icon } = VERDICT_STYLES[verdict];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-semibold text-sm ${bg} ${text} ${border} ${className}`}
      title="Accountability verdict based on campaign finance and donor-vote conflict analysis"
    >
      <span aria-hidden="true">{icon}</span>
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dot} opacity-50`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dot}`} />
      </span>
      <span className="tracking-wide">{label}</span>
      {pacPct !== null && pacPct > 0 && (
        <span className="opacity-70 font-normal">· {pacPct.toFixed(0)}% PAC</span>
      )}
    </div>
  );
}

export { computeVerdict };
export type { Verdict };
