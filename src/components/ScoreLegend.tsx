/**
 * ScoreLegend — explains the score bars and grade badge on member cards
 * Subtle informational strip, meant to sit just above the member card grid.
 */
export function ScoreLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 py-3 px-4 bg-slate-50 rounded-lg border border-slate-200 mb-2">
      <span className="font-semibold text-slate-600 font-sans shrink-0">Score bars:</span>

      {/* Donors bar */}
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-2 bg-amber-500 rounded-sm inline-block shrink-0" />
        <span className="font-sans">
          <span className="font-medium text-slate-600">Donors</span>
          {" "}— low PAC &amp; large-donor reliance
        </span>
      </span>

      {/* Voting bar */}
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-2 bg-emerald-500 rounded-sm inline-block shrink-0" />
        <span className="font-sans">
          <span className="font-medium text-slate-600">Voting</span>
          {" "}— key-vote participation &amp; public-interest alignment
        </span>
      </span>

      {/* Trading bar */}
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-2 bg-purple-500 rounded-sm inline-block shrink-0" />
        <span className="font-sans">
          <span className="font-medium text-slate-600">Trading</span>
          {" "}— low flagged stock-trade rate
        </span>
      </span>

      {/* Disclosure bar */}
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-2 bg-blue-500 rounded-sm inline-block shrink-0" />
        <span className="font-sans">
          <span className="font-medium text-slate-600">Disclosure</span>
          {" "}— timely &amp; complete financial filings
        </span>
      </span>

      <span className="hidden sm:block text-slate-300 shrink-0">|</span>

      {/* Grade badge */}
      <span className="flex items-center gap-1.5 font-sans">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded border-2 border-green-200 bg-green-100 text-green-700 font-black text-[10px] shrink-0">A</span>
        <span>
          <span className="font-medium text-slate-600">Grade</span>
          {" "}— composite of all four scores (A → F)
        </span>
      </span>

      <span className="ml-auto font-sans text-slate-400 hidden md:block shrink-0">
        Higher scores = more accountable
      </span>
    </div>
  );
}
