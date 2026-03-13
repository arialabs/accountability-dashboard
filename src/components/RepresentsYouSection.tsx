import type { ConstituentAlignmentResult } from "@/lib/constituent-alignment";
import { billToCongressGovUrl } from "@/lib/bill-urls";

interface RepresentsYouSectionProps {
  alignment: ConstituentAlignmentResult;
  memberName: string;
}

export default function RepresentsYouSection({
  alignment,
  memberName,
}: RepresentsYouSectionProps) {
  // Only show policies where we found actual votes
  const scoredPolicies = alignment.policies.filter(
    (p) => p.aligned !== null && p.votesFound.length > 0
  );

  if (scoredPolicies.length === 0) return null;

  const score = alignment.overallScore;

  // Color based on alignment
  const getScoreColor = (pct: number) => {
    if (pct >= 70) return "text-emerald-700";
    if (pct >= 40) return "text-amber-700";
    return "text-red-700";
  };

  const getBarColor = (pct: number) => {
    if (pct >= 70) return "bg-emerald-500";
    if (pct >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const getBarBg = (pct: number) => {
    if (pct >= 70) return "bg-emerald-100";
    if (pct >= 40) return "bg-amber-100";
    return "bg-red-100";
  };

  const getVerdict = (pct: number) => {
    if (pct >= 70) return "Votes with constituents";
    if (pct >= 40) return "Mixed record";
    return "Votes against constituents";
  };

  const firstName = memberName.split(" ")[0];

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">
        Represents You?
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        How {firstName}&apos;s votes compare to what {alignment.state} constituents actually want
      </p>

      {/* Overall Score */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <span className={`text-5xl font-black tabular-nums ${getScoreColor(score)}`}>
            {score}%
          </span>
          <span className={`text-sm font-bold uppercase tracking-wide ${getScoreColor(score)}`}>
            {getVerdict(score)}
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${getBarBg(score)}`}>
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getBarColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          Based on {alignment.totalVotesScored} scored vote{alignment.totalVotesScored !== 1 ? "s" : ""} across {scoredPolicies.length} policy area{scoredPolicies.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Per-policy breakdown */}
      <div className="space-y-4">
        {scoredPolicies.map((policy) => (
          <div key={policy.policyKey} className="border border-slate-100 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">
                    {policy.aligned ? "✅" : "❌"}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {policy.label}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 ml-7">
                  {policy.stateSupport}% of {alignment.state} residents support this
                  <span className="text-slate-300 mx-1">•</span>
                  {policy.source}
                </p>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${
                  policy.aligned
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {policy.aligned ? "Aligned" : "Misaligned"}
              </span>
            </div>

            {/* Individual votes within this policy */}
            <div className="ml-7 space-y-1.5">
              {policy.votesFound.map((vote) => (
                <div
                  key={vote.voteId}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      vote.aligned
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                    aria-label={vote.aligned ? "Aligned" : "Misaligned"}
                  >
                    {vote.aligned ? "✓" : "✗"}
                  </span>
                  <span className="text-slate-700">
                    <span className="font-medium">
                    {(() => {
                      const url = billToCongressGovUrl(vote.bill, 119);
                      return url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {vote.shortLabel}
                        </a>
                      ) : (
                        vote.shortLabel
                      );
                    })()}
                  </span>
                    <span className="text-slate-400 mx-1">—</span>
                    Voted {vote.memberVote}
                    {!vote.aligned && (
                      <span className="text-slate-400">
                        {" "}(constituents wanted {vote.proConstituentVote})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Methodology note */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Constituent preferences from nationally representative polls (Gallup, KFF, Yale PCCC, Pew Research).
          State-level estimates use MRP modeling. Alignment scored on substantive Yea/Nay votes only.
        </p>
      </div>
    </section>
  );
}
