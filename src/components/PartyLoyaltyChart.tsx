"use client";

import { useMemo } from "react";
import type { Member } from "@/lib/types";

interface PartyLoyaltyChartProps {
  members: Member[];
  selectedParty?: "D" | "R" | "I" | "";
}

/**
 * Histogram showing distribution of party loyalty percentages
 * Shows how often members vote with their party
 */
export default function PartyLoyaltyChart({ members, selectedParty }: PartyLoyaltyChartProps) {
  const buckets = useMemo(() => {
    // Filter by party if selected
    const filtered = selectedParty 
      ? members.filter(m => m.party === selectedParty)
      : members;
    
    // Create 10% buckets (0-10, 10-20, ..., 90-100)
    const ranges = [
      { min: 0, max: 50, label: "<50%" },
      { min: 50, max: 60, label: "50-60%" },
      { min: 60, max: 70, label: "60-70%" },
      { min: 70, max: 80, label: "70-80%" },
      { min: 80, max: 85, label: "80-85%" },
      { min: 85, max: 90, label: "85-90%" },
      { min: 90, max: 95, label: "90-95%" },
      { min: 95, max: 100, label: "95-100%" },
    ];
    
    const bucketCounts = ranges.map(range => {
      const count = filtered.filter(m => 
        m.party_loyalty_pct >= range.min && m.party_loyalty_pct < range.max
      ).length;
      return { ...range, count };
    });
    
    const maxCount = Math.max(...bucketCounts.map(b => b.count), 1);
    
    return { buckets: bucketCounts, maxCount, total: filtered.length };
  }, [members, selectedParty]);
  
  const partyColor = selectedParty === "D" 
    ? "bg-blue-500" 
    : selectedParty === "R" 
    ? "bg-red-500" 
    : "bg-purple-500";
  
  const partyName = selectedParty === "D" 
    ? "Democrats" 
    : selectedParty === "R" 
    ? "Republicans" 
    : selectedParty === "I"
    ? "Independents"
    : "All Members";
  
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">
        📊 Party Loyalty Distribution
      </h3>
      <p className="text-slate-500 mb-6">
        How often {partyName.toLowerCase()} vote with their party
      </p>
      
      {/* Chart */}
      <div className="space-y-3 mb-6">
        {buckets.buckets.map((bucket, i) => {
          const widthPct = (bucket.count / buckets.maxCount) * 100;
          
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-20 text-sm font-mono text-slate-600 text-right">
                {bucket.label}
              </div>
              <div className="flex-1 relative">
                <div className="bg-slate-100 rounded-full h-8 overflow-hidden">
                  <div 
                    className={`${selectedParty ? partyColor : "bg-slate-600"} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                    style={{ width: `${widthPct}%` }}
                  >
                    {bucket.count > 0 && (
                      <span className="text-white text-sm font-bold">
                        {bucket.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-16 text-sm font-mono text-slate-400 text-right">
                {buckets.total > 0 ? ((bucket.count / buckets.total) * 100).toFixed(0) : 0}%
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary Stats */}
      <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-sm text-slate-500 font-semibold uppercase tracking-wide mb-1">
            Avg Loyalty
          </div>
          <div className="text-3xl font-black text-slate-900">
            {members.length > 0 
              ? (members.reduce((sum, m) => sum + (m.party_loyalty_pct || 0), 0) / members.length).toFixed(1)
              : 0}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-slate-500 font-semibold uppercase tracking-wide mb-1">
            Members
          </div>
          <div className="text-3xl font-black text-slate-900">
            {buckets.total}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-slate-400">
        <p>
          💡 <strong>Party loyalty</strong> measures how often a member votes with the majority of their party.
          High loyalty (&gt;95%) may indicate strong party discipline or alignment. Low loyalty may indicate independence or bipartisan voting.
        </p>
      </div>
    </div>
  );
}
