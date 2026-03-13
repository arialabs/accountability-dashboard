import { getMemberScandals } from "@/lib/data";
import ScandalCard from "./ScandalCard";
import Link from "next/link";
import ScandalsDetailToggle from "./ScandalsDetailToggle";

interface ScandalsSectionProps {
  bioguideId: string;
  memberName: string;
  maxVisible?: number;
}

export default function ScandalsSection({
  bioguideId,
  memberName,
  maxVisible = 3
}: ScandalsSectionProps) {
  const scandals = getMemberScandals(bioguideId);
  const hasMore = scandals.length > maxVisible;

  // Most severe scandal for summary (sorted by severity weight)
  const severityWeight: Record<string, number> = {
    conviction: 6,
    indictment: 5,
    criminal_investigation: 4,
    ethics_violation: 3,
    ethics_investigation: 2,
    allegation: 1,
  };
  const sortedScandals = [...scandals].sort(
    (a, b) => (severityWeight[b.severity] ?? 0) - (severityWeight[a.severity] ?? 0)
  );
  const topScandal = sortedScandals[0] ?? null;

  return (
    <section className="mt-12" aria-label="Scandals and controversies">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2 flex items-center gap-2">
          ⚠️ Scandals & Controversies
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Verified incidents with sources
        </p>
      </div>

      {/* Content */}
      {scandals.length === 0 ? (
        // Clean record message
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">✓</div>
          <h3 className="text-xl font-bold text-green-900 mb-2">
            No verified incidents on record
          </h3>
          <p className="text-green-700 leading-relaxed max-w-2xl mx-auto">
            This member has no documented scandals, ethics violations, or investigations
            meeting our sourcing requirements.
          </p>
        </div>
      ) : (
        <div>
          {/* Summary layer — always visible */}
          <p className="text-slate-700 mb-3">
            {scandals.length} verified incident{scandals.length !== 1 ? "s" : ""} on record.
          </p>

          {/* Top scandal summary */}
          {topScandal && (
            <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-800 mb-1">
                {topScandal.title}
              </p>
              <p className="text-sm text-slate-600 line-clamp-2">
                {topScandal.description}
              </p>
            </div>
          )}

          {/* Detail layer — expandable via client component */}
          <ScandalsDetailToggle
            scandals={scandals}
            maxVisible={maxVisible}
            bioguideId={bioguideId}
          />
        </div>
      )}
    </section>
  );
}
