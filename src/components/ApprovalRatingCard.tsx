import approvalData from "@/data/trump-approval.json";
import { Caption } from "@/components/ui";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NetSparkline({ history }: { history: { net: number; date: string }[] }) {
  const points = history.slice(0, 30).toReversed();
  if (points.length < 2) return null;

  const nets = points.map((p) => p.net);
  const minNet = Math.min(...nets);
  const maxNet = Math.max(...nets);
  const range = maxNet - minNet || 1;

  const w = 120;
  const h = 32;
  const pad = 2;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - 2 * pad);
    const y = pad + (1 - (p.net - minNet) / range) * (h - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="inline-block"
      aria-label={`Net approval sparkline from ${nets[0].toFixed(1)} to ${nets[nets.length - 1].toFixed(1)}`}
    >
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STALE_AFTER_DAYS = 14;

export default function ApprovalRatingCard() {
  const { current, history, source, last_updated } = approvalData;
  const isNegative = current.net < 0;

  const approveWidth = `${current.approve}%`;
  const disapproveWidth = `${current.disapprove}%`;

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(last_updated).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isStale = Number.isFinite(daysSinceUpdate) && daysSinceUpdate > STALE_AFTER_DAYS;

  // Approve + disapprove rarely sum to 100 — the remainder is undecided/unsure.
  const undecided = Math.max(0, 100 - current.approve - current.disapprove);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Presidential Approval
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">
              National polling average
            </p>
          </div>
          <NetSparkline history={history} />
        </div>

        {/* Big net number */}
        <div className="flex items-baseline gap-2 mb-4">
          <span
            className={`text-4xl font-bold tabular-nums ${
              isNegative ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {isNegative ? "▼" : "▲"}{" "}
            {current.net > 0 ? "+" : ""}
            {current.net.toFixed(1)}
          </span>
          <span className="text-sm text-slate-500">net approval</span>
        </div>

        {/* Approve / Disapprove bars */}
        <div className="space-y-2">
          {/* Approve */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 w-24">Approve</span>
            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: approveWidth }}
              />
            </div>
            <span className="text-sm font-semibold text-emerald-700 w-14 text-right tabular-nums">
              {current.approve.toFixed(1)}%
            </span>
          </div>

          {/* Disapprove */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 w-24">Disapprove</span>
            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: disapproveWidth }}
              />
            </div>
            <span className="text-sm font-semibold text-red-700 w-14 text-right tabular-nums">
              {current.disapprove.toFixed(1)}%
            </span>
          </div>

          {/* Undecided remainder, so the segments account for 100% */}
          {undecided > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 w-24">Unsure</span>
              <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-300 rounded-full transition-all"
                  style={{ width: `${undecided}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-500 w-14 text-right tabular-nums">
                {undecided.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Staleness warning */}
      {isStale && (
        <div className="bg-amber-50 border-t border-amber-200 px-6 py-2">
          <Caption as="p" className="text-amber-700">
            ⚠️ This data was last updated {daysSinceUpdate} days ago and may be outdated.
          </Caption>
        </div>
      )}

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
        <Caption as="p">
          Source: {source} · As of {formatDate(current.date)}
        </Caption>
        <Caption as="p" className="text-slate-400">
          Last updated {formatDate(last_updated.slice(0, 10))}
        </Caption>
      </div>
    </div>
  );
}
