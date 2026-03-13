"use client";

import { useState } from "react";
import { formatCurrencyShort } from "@/lib/formatting";

interface BudgetImpact {
  eo_number: string;
  title: string;
  cost_estimate_usd: number;
  savings_estimate_usd: number;
  time_horizon: string;
  confidence: "low" | "medium" | "high";
  source: string;
  methodology: string;
  per_taxpayer_usd: number;
}

interface BudgetImpactCardProps {
  impact: BudgetImpact;
  compact?: boolean;
}

const CONFIDENCE_STYLES = {
  high: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  low: "bg-red-100 text-red-800 border-red-300",
};

export default function BudgetImpactCard({ impact, compact = false }: BudgetImpactCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isCost = impact.cost_estimate_usd > impact.savings_estimate_usd;
  const primaryAmount = isCost ? impact.cost_estimate_usd : impact.savings_estimate_usd;
  const secondaryAmount = isCost ? impact.savings_estimate_usd : impact.cost_estimate_usd;
  const netAmount = impact.savings_estimate_usd - impact.cost_estimate_usd;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isCost ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}
        title={`${isCost ? "Cost" : "Savings"}: ${formatCurrencyShort(primaryAmount)} (${impact.time_horizon})`}
      >
        {isCost ? "💸" : "💰"} {formatCurrencyShort(primaryAmount)}
      </span>
    );
  }

  return (
    <div
      className={`rounded-lg border px-3 py-2 mt-2 ${
        isCost
          ? "bg-red-50 border-red-200"
          : "bg-green-50 border-green-200"
      }`}
      onClick={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold">
          {isCost ? "💸" : "💰"}{" "}
          <span className={isCost ? "text-red-700" : "text-green-700"}>
            {isCost ? "Est. Cost: " : "Est. Savings: "}
            {formatCurrencyShort(primaryAmount)}
          </span>
        </span>
        {secondaryAmount > 0 && (
          <span className="text-xs text-slate-500">
            ({isCost ? "saves" : "costs"} {formatCurrencyShort(secondaryAmount)})
          </span>
        )}
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${CONFIDENCE_STYLES[impact.confidence]}`}>
          {impact.confidence} confidence
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          {impact.time_horizon}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-1">
        <span className="text-xs text-slate-600">
          Per taxpayer:{" "}
          <span className={`font-bold ${impact.per_taxpayer_usd > 0 ? "text-red-600" : "text-green-600"}`}>
            {impact.per_taxpayer_usd > 0 ? "+" : ""}${Math.abs(impact.per_taxpayer_usd).toFixed(2)}
          </span>
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide budget impact methodology" : "Show budget impact methodology"}
          className="text-[11px] text-slate-500 hover:text-slate-700 underline decoration-dotted transition-colors"
        >
          {expanded ? "Hide methodology ▴" : "How was this calculated? ▾"}
        </button>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
          <p className="text-xs text-slate-600 leading-relaxed">
            {impact.methodology}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Source: {impact.source}
          </p>
          {netAmount !== 0 && (
            <p className="text-xs font-semibold">
              Net impact:{" "}
              <span className={netAmount > 0 ? "text-green-700" : "text-red-700"}>
                {netAmount > 0 ? "saves " : "costs "}
                {formatCurrencyShort(Math.abs(netAmount))}
              </span>
              {" "}over {impact.time_horizon}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
