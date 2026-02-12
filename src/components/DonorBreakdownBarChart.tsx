"use client";

import type { CampaignFinance } from "@/lib/types";

interface DonorBreakdownBarChartProps {
  finance: CampaignFinance;
}

/**
 * Horizontal stacked bar chart showing donor breakdown
 * Alternative to pie chart for comparing multiple members
 */
export default function DonorBreakdownBarChart({ finance }: DonorBreakdownBarChartProps) {
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };
  
  const segments = [
    {
      label: "Small Donors",
      percentage: finance.small_donor_percentage,
      amount: finance.small_donors,
      color: "bg-green-500",
      textColor: "text-green-700",
    },
    {
      label: "Large Donors",
      percentage: finance.large_donor_percentage,
      amount: finance.large_donors,
      color: "bg-orange-500",
      textColor: "text-orange-700",
    },
    {
      label: "PACs",
      percentage: finance.pac_percentage,
      amount: finance.pac_contributions,
      color: "bg-red-500",
      textColor: "text-red-700",
    },
    {
      label: "Other",
      percentage: Math.max(0, 100 - finance.small_donor_percentage - finance.large_donor_percentage - finance.pac_percentage),
      amount: finance.total_raised - finance.small_donors - finance.large_donors - finance.pac_contributions,
      color: "bg-slate-400",
      textColor: "text-slate-700",
    },
  ].filter(s => s.percentage > 0);
  
  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="relative h-16 bg-slate-100 rounded-xl overflow-hidden flex">
        {segments.map((segment, i) => {
          const width = segment.percentage;
          return (
            <div
              key={i}
              className={`${segment.color} flex items-center justify-center text-white font-bold text-sm transition-all hover:opacity-80 cursor-help`}
              style={{ width: `${width}%` }}
              title={`${segment.label}: ${width.toFixed(1)}% (${formatCurrency(segment.amount)})`}
            >
              {width > 10 && (
                <span>{width.toFixed(0)}%</span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend with amounts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {segments.map((segment, i) => (
          <div key={i} className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 ${segment.color} rounded`}></div>
              <span className="text-xs font-semibold text-slate-600">
                {segment.label}
              </span>
            </div>
            <div className={`font-mono font-bold text-lg ${segment.textColor}`}>
              {segment.percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {formatCurrency(segment.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
