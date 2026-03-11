"use client";

import { formatCurrencyShort } from "@/lib/formatting";

interface AffectedProgram {
  program_name: string;
  agency: string;
  annual_budget_usd: number;
  status: "eliminated" | "reduced" | "expanded" | "at_risk";
  eo_numbers: string[];
  description: string;
  affected_beneficiaries_count: number;
  cabinet_ids?: string[];
}

interface AffectedProgramsListProps {
  programs: AffectedProgram[];
  maxItems?: number;
}

const STATUS_CONFIG = {
  eliminated: { icon: "🔴", label: "Eliminated", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  reduced: { icon: "🟡", label: "Under Review", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  expanded: { icon: "🟢", label: "Expanded", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  at_risk: { icon: "🟠", label: "At Risk", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
};

function formatBeneficiaries(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return count.toLocaleString();
}

export default function AffectedProgramsList({ programs, maxItems }: AffectedProgramsListProps) {
  const items = maxItems ? programs.slice(0, maxItems) : programs;

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
        Programs Affected ({programs.length})
      </h3>
      <div className="space-y-1.5">
        {items.map((program) => {
          const config = STATUS_CONFIG[program.status];
          return (
            <div
              key={program.program_name}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${config.bg}`}
            >
              <span className="text-sm flex-shrink-0 mt-0.5">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">
                    {program.program_name}
                  </span>
                  {program.annual_budget_usd > 0 && (
                    <span className="text-xs font-mono text-slate-500">
                      ({formatCurrencyShort(program.annual_budget_usd)}/yr)
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5 line-clamp-2">
                  {program.description}
                </p>
                {program.affected_beneficiaries_count > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatBeneficiaries(program.affected_beneficiaries_count)} people affected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {maxItems && programs.length > maxItems && (
        <p className="text-xs text-slate-500">
          +{programs.length - maxItems} more programs affected
        </p>
      )}
    </div>
  );
}
