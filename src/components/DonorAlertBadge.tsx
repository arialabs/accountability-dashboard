"use client";

import Link from "next/link";
import type { EODonorTag } from "@/lib/eo-donor-benefits";
import { formatDonorAmount } from "@/lib/eo-donor-benefits";

interface DonorAlertBadgeProps {
  tag: EODonorTag;
  compact?: boolean;
}

const SEVERITY_STYLES = {
  high: {
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "bg-red-600 text-white",
    text: "text-red-800",
    dot: "bg-red-500",
    label: "DONOR ALERT",
  },
  medium: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    badge: "bg-amber-500 text-white",
    text: "text-amber-800",
    dot: "bg-amber-400",
    label: "DONOR LINK",
  },
  low: {
    bg: "bg-slate-100",
    border: "border-slate-300",
    badge: "bg-slate-500 text-white",
    text: "text-slate-700",
    dot: "bg-slate-400",
    label: "DONOR LINK",
  },
};

export default function DonorAlertBadge({ tag, compact = false }: DonorAlertBadgeProps) {
  const style = SEVERITY_STYLES[tag.severity];
  const topBenefit = tag.benefits[0];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.badge}`}
        title={`${topBenefit.industry} contributed ${formatDonorAmount(topBenefit.amount)} in 2024 cycle`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
        {style.label}
      </span>
    );
  }

  return (
    <div
      className={`mt-2 rounded-lg border ${style.border} ${style.bg} px-3 py-2`}
      onClick={(e) => e.preventDefault()}
    >
      <div className="flex items-start gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${style.badge}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
          {style.label}
        </span>
        <p className={`text-xs ${style.text} leading-snug`}>
          Benefits{" "}
          {tag.benefits.map((b, i) => (
            <span key={b.industry}>
              {i > 0 && (i === tag.benefits.length - 1 ? " & " : ", ")}
              <span className="font-bold">
                {b.icon} {b.industry}
              </span>
              {" "}
              <span className="opacity-75">({formatDonorAmount(b.amount)} in 2024)</span>
            </span>
          ))}
        </p>
      </div>
      {topBenefit.cabinetLink && (
        <div className="mt-1.5">
          <Link
            href={topBenefit.cabinetLink}
            className={`text-[11px] font-semibold ${style.text} underline decoration-dotted hover:decoration-solid transition-all`}
            onClick={(e) => e.stopPropagation()}
          >
            See conflicts: {topBenefit.cabinetName} →
          </Link>
        </div>
      )}
      <div className="mt-1 text-[10px] text-slate-400 font-mono">
        Source: {topBenefit.source} filings
      </div>
    </div>
  );
}
