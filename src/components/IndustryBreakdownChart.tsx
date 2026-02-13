"use client";

import { useState } from "react";
import type { IndustryDonation } from "@/lib/types";

interface IndustryBreakdownChartProps {
  industries: IndustryDonation[];
  totalRaised: number;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

// Color palette for industries
const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
];

// Simple SVG bar chart
function BarChart({ industries, totalRaised }: IndustryBreakdownChartProps) {
  const maxAmount = Math.max(...industries.map(i => i.total));
  
  return (
    <div className="space-y-3">
      {industries.map((industry, i) => {
        const percentage = totalRaised > 0 ? (industry.total / totalRaised) * 100 : 0;
        const barWidth = maxAmount > 0 ? (industry.total / maxAmount) * 100 : 0;
        
        return (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">
                {industry.industry}
              </span>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(industry.total)}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out group-hover:opacity-80"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simple SVG pie chart
function PieChart({ industries, totalRaised }: IndustryBreakdownChartProps) {
  const total = industries.reduce((sum, i) => sum + i.total, 0);
  
  // Convert to percentages for pie slices
  let cumulativePercent = 0;
  const slices = industries.map((industry, i) => {
    const percent = total > 0 ? (industry.total / total) * 100 : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    
    return {
      industry: industry.industry,
      total: industry.total,
      percent,
      startPercent,
      color: COLORS[i % COLORS.length],
    };
  });
  
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent / 100);
    const y = Math.sin(2 * Math.PI * percent / 100);
    return [x, y];
  };
  
  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-64 h-64 -rotate-90">
        {slices.map((slice, i) => {
          if (slice.percent === 0) return null;
          
          const [startX, startY] = getCoordinatesForPercent(slice.startPercent);
          const [endX, endY] = getCoordinatesForPercent(slice.startPercent + slice.percent);
          
          const largeArcFlag = slice.percent > 50 ? 1 : 0;
          
          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');
          
          return (
            <g key={i} className="group">
              <path
                d={pathData}
                fill={slice.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                stroke="white"
                strokeWidth="0.02"
              />
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm max-w-md">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-slate-700 truncate">
              {slice.industry}
            </span>
            <span className="text-slate-500 text-xs ml-auto flex-shrink-0">
              {slice.percent.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IndustryBreakdownChart({
  industries,
  totalRaised,
}: IndustryBreakdownChartProps) {
  const [viewMode, setViewMode] = useState<"pie" | "bar">("bar");
  
  if (industries.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-500">
        No industry data available
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold text-slate-900">Industry Breakdown</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("pie")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              viewMode === "pie"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            aria-label="Pie chart view"
          >
            Pie
          </button>
          <button
            onClick={() => setViewMode("bar")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              viewMode === "bar"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            aria-label="Bar chart view"
          >
            Bar
          </button>
        </div>
      </div>
      
      {viewMode === "pie" ? (
        <PieChart industries={industries} totalRaised={totalRaised} />
      ) : (
        <BarChart industries={industries} totalRaised={totalRaised} />
      )}
    </div>
  );
}
