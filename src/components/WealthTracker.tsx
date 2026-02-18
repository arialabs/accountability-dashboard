"use client";

import { useMemo } from "react";
import { formatCurrencyShort } from "@/lib/formatting";

interface AssetRange {
  min: number;
  max: number;
}

interface FinancialDisclosure {
  bioguide_id: string;
  name: string;
  year: number;
  filing_date: string;
  chamber: "House" | "Senate";
  assets: Array<{
    description: string;
    type: string;
    valueRange: AssetRange;
    incomeType: string | null;
    incomeRange: AssetRange | null;
  }>;
  liabilities: Array<{
    description: string;
    type: string;
    valueRange: AssetRange;
  }>;
  estimated_net_worth: AssetRange;
}

interface WealthTrackerProps {
  disclosures: FinancialDisclosure[];
  memberName: string;
}

function formatRange(range: AssetRange): string {
  if (range.min === range.max) {
    return formatCurrencyShort(range.min);
  }
  return `${formatCurrencyShort(range.min)} - ${formatCurrencyShort(range.max)}`;
}

export function WealthTracker({ disclosures, memberName }: WealthTrackerProps) {
  // Sort by year descending
  const sorted = useMemo(() => 
    [...disclosures].sort((a, b) => b.year - a.year),
    [disclosures]
  );

  // Calculate wealth change if we have multiple years
  const wealthChange = useMemo(() => {
    if (sorted.length < 2) return null;
    
    const latest = sorted[0];
    const earliest = sorted[sorted.length - 1];
    
    const latestMid = (latest.estimated_net_worth.min + latest.estimated_net_worth.max) / 2;
    const earliestMid = (earliest.estimated_net_worth.min + earliest.estimated_net_worth.max) / 2;
    
    const change = latestMid - earliestMid;
    const pctChange = earliestMid > 0 ? (change / earliestMid) * 100 : 0;
    
    return {
      amount: change,
      percentage: pctChange,
      years: latest.year - earliest.year,
    };
  }, [sorted]);

  // Group assets by type for latest disclosure
  const assetsByType = useMemo(() => {
    if (sorted.length === 0) return {};
    
    const latest = sorted[0];
    const grouped: Record<string, { count: number; totalMin: number; totalMax: number }> = {};
    
    for (const asset of latest.assets) {
      if (!grouped[asset.type]) {
        grouped[asset.type] = { count: 0, totalMin: 0, totalMax: 0 };
      }
      grouped[asset.type].count++;
      grouped[asset.type].totalMin += asset.valueRange.min;
      grouped[asset.type].totalMax += asset.valueRange.max;
    }
    
    return grouped;
  }, [sorted]);

  if (disclosures.length === 0) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">
          💵 Wealth Tracking
        </h3>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800">
            Financial disclosure data not yet available for {memberName}.
          </p>
          <p className="text-amber-600 text-sm mt-2">
            Data is extracted from official congressional financial disclosures.
          </p>
        </div>
      </section>
    );
  }

  const latest = sorted[0];

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
      <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">
        💵 Wealth Tracking
      </h3>
      <p className="text-slate-500 mb-6">
        Based on {sorted.length} year{sorted.length !== 1 ? "s" : ""} of financial disclosures
      </p>

      {/* Net Worth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Est. Net Worth ({latest.year})
          </p>
          <p className="text-2xl font-black text-slate-900">
            {formatRange(latest.estimated_net_worth)}
          </p>
        </div>
        
        {wealthChange && (
          <>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Change ({wealthChange.years}yr)
              </p>
              <p className={`text-2xl font-black ${wealthChange.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {wealthChange.amount >= 0 ? "+" : ""}{formatCurrencyShort(wealthChange.amount)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                % Change
              </p>
              <p className={`text-2xl font-black ${wealthChange.percentage >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {wealthChange.percentage >= 0 ? "+" : ""}{wealthChange.percentage.toFixed(1)}%
              </p>
            </div>
          </>
        )}
      </div>

      {/* Asset Breakdown */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-slate-900 mb-4">Asset Breakdown</h4>
        <div className="space-y-3">
          {Object.entries(assetsByType)
            .sort((a, b) => b[1].totalMax - a[1].totalMax)
            .map(([type, data]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="font-semibold text-slate-900">{type}</span>
                  <span className="text-sm text-slate-500 ml-2">({data.count} holding{data.count !== 1 ? "s" : ""})</span>
                </div>
                <span className="font-mono text-slate-700">
                  {formatRange({ min: data.totalMin, max: data.totalMax })}
                </span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Year-by-Year History */}
      {sorted.length > 1 && (
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-4">Filing History</h4>
          <div className="space-y-2">
            {sorted.map((disclosure) => (
              <div 
                key={disclosure.year}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
              >
                <div>
                  <span className="font-semibold text-slate-900">{disclosure.year}</span>
                  <span className="text-sm text-slate-500 ml-2">
                    ({disclosure.assets.length} assets reported)
                  </span>
                </div>
                <span className="font-mono text-slate-700">
                  {formatRange(disclosure.estimated_net_worth)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Source */}
      <p className="text-xs text-slate-400 mt-6 text-center">
        Data from official congressional financial disclosures. 
        Values shown as ranges per disclosure requirements.
      </p>
    </section>
  );
}

export default WealthTracker;
