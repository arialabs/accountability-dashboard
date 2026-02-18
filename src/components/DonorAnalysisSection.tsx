"use client";

import { useState } from "react";
import type { CampaignFinance, Contributor } from "@/lib/types";
import DonorBreakdownBarChart from "./DonorBreakdownBarChart";
import { formatCurrencyShort, formatPercent } from "@/lib/formatting";

interface DonorAnalysisSectionProps {
  finance: CampaignFinance | null;
}

// Tooltip component for inline explanations
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block ml-1">
      <button
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-slate-400 hover:text-blue-600 transition-colors align-middle"
        aria-label="More information"
      >
        <svg className="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      {show && (
        <div className="absolute left-0 top-6 z-10 w-72 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl">
          <p className="leading-relaxed">{text}</p>
          <div className="absolute -top-1 left-2 w-2 h-2 bg-slate-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}

// Simple SVG pie chart
function DonorPieChart({ 
  pacPct, 
  largeDonorPct, 
  smallDonorPct,
  otherPct,
}: { 
  pacPct: number; 
  largeDonorPct: number; 
  smallDonorPct: number;
  otherPct: number;
}) {
  // Convert percentages to cumulative angles
  const total = pacPct + largeDonorPct + smallDonorPct + otherPct;
  const normalize = (pct: number) => (pct / total) * 100;
  
  const segments = [
    { pct: normalize(pacPct), color: "#ef4444", label: "PACs" },           // red
    { pct: normalize(largeDonorPct), color: "#f97316", label: "Large Donors" }, // orange  
    { pct: normalize(smallDonorPct), color: "#22c55e", label: "Small Donors" }, // green
    { pct: normalize(otherPct), color: "#94a3b8", label: "Other" },        // slate
  ].filter(s => s.pct > 0);
  
  let cumulativePercent = 0;
  
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };
  
  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="-1 -1 2 2" className="w-48 h-48 -rotate-90">
        {segments.map((segment, i) => {
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent / 100);
          cumulativePercent += segment.pct;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent / 100);
          
          const largeArcFlag = segment.pct > 50 ? 1 : 0;
          
          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');
          
          return (
            <path 
              key={i} 
              d={pathData} 
              fill={segment.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-slate-600">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContributorRow({ contributor, rank }: { contributor: Contributor; rank: number }) {
  const typeColors = {
    pac: "bg-red-100 text-red-700",
    individual: "bg-blue-100 text-blue-700",
    party: "bg-purple-100 text-purple-700",
    committee: "bg-orange-100 text-orange-700",
  };
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-slate-400 font-mono text-sm w-6">{rank}.</span>
        <div>
          <p className="font-semibold text-slate-900">{contributor.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[contributor.type]}`}>
            {contributor.type.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono font-bold text-slate-900">{formatCurrencyShort(contributor.total)}</p>
        <p className="text-xs text-slate-500">{contributor.count} contribution{contributor.count !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

export default function DonorAnalysisSection({ finance }: DonorAnalysisSectionProps) {
  const [showPacTooltip, setShowPacTooltip] = useState(false);
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");
  
  if (!finance) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6">
          💰 Campaign Finance
        </h3>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800">
            Campaign finance data not yet available for this representative.
          </p>
          <p className="text-amber-600 text-sm mt-2">
            Data is fetched from the Federal Election Commission (FEC) and updated regularly.
          </p>
        </div>
      </section>
    );
  }
  
  const otherPct = 100 - finance.pac_percentage - finance.large_donor_percentage - finance.small_donor_percentage;
  
  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
      <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">
        💰 Campaign Finance
      </h3>
      <p className="text-slate-500 mb-8">
        {finance.cycle} Election Cycle • Source: Federal Election Commission
      </p>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Raised</p>
          <p className="font-mono text-2xl font-black text-slate-900">{formatCurrencyShort(finance.total_raised)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Spent</p>
          <p className="font-mono text-2xl font-black text-slate-900">{formatCurrencyShort(finance.total_spent)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Cash on Hand</p>
          <p className="font-mono text-2xl font-black text-slate-900">{formatCurrencyShort(finance.cash_on_hand)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Self-Funded</p>
          <p className="font-mono text-2xl font-black text-slate-900">{formatCurrencyShort(finance.candidate_self_funding)}</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-10">
        {/* Pie Chart & Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-900">Funding Sources</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setChartView("pie")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  chartView === "pie"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                aria-label="Pie chart view"
              >
                Pie
              </button>
              <button
                onClick={() => setChartView("bar")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  chartView === "bar"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                aria-label="Bar chart view"
              >
                Bar
              </button>
            </div>
          </div>
          
          {chartView === "pie" ? (
            <DonorPieChart 
              pacPct={finance.pac_percentage}
              largeDonorPct={finance.large_donor_percentage}
              smallDonorPct={finance.small_donor_percentage}
              otherPct={otherPct}
            />
          ) : (
            <DonorBreakdownBarChart finance={finance} />
          )}
          
          {/* Percentage breakdown */}
          <div className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
              <span className="text-slate-600 flex items-center text-sm sm:text-base">
                PAC Contributions
                <InfoTooltip text="Political Action Committees pool money from corporations, unions, or interest groups to donate to campaigns. High PAC funding may indicate special interest influence." />
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-red-600">{formatPercent(finance.pac_percentage)}</span>
                <span className="text-slate-400 text-sm">({formatCurrencyShort(finance.pac_contributions)})</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
              <span className="text-slate-600 text-sm sm:text-base">Large Individual Donors (&gt;$200)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-orange-600">{formatPercent(finance.large_donor_percentage)}</span>
                <span className="text-slate-400 text-sm">({formatCurrencyShort(finance.large_donors)})</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
              <span className="text-slate-600 text-sm sm:text-base">Small Individual Donors (≤$200)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-green-600">{formatPercent(finance.small_donor_percentage)}</span>
                <span className="text-slate-400 text-sm">({formatCurrencyShort(finance.small_donors)})</span>
              </div>
            </div>
          </div>
          
          {/* Grassroots indicator */}
          {finance.small_donor_percentage >= 30 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                ✓ <strong>Strong grassroots support</strong> — {formatPercent(finance.small_donor_percentage)} from small donors
              </p>
            </div>
          )}
          
          {finance.pac_percentage >= 50 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">
                ⚠️ <strong>Heavily PAC-funded</strong> — {formatPercent(finance.pac_percentage)} from political action committees
              </p>
            </div>
          )}
        </div>
        
        {/* Top Contributors */}
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-6">Top Contributors</h4>
          
          {finance.top_contributors && finance.top_contributors.length > 0 ? (
            <div className="bg-slate-50 rounded-xl p-4">
              {finance.top_contributors.slice(0, 10).map((contributor, i) => (
                <ContributorRow key={i} contributor={contributor} rank={i + 1} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-500">
              Detailed contributor data not available
            </div>
          )}
          
          <p className="text-xs text-slate-400 mt-4">
            Note: Contributions from individuals are attributed to their employer/organization when available.
          </p>
        </div>
      </div>
      
      {/* Industry Breakdown (if available) */}
      {finance.top_industries && finance.top_industries.length > 0 && (
        <div className="mt-10 pt-8 border-t border-slate-200">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Top Industries</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {finance.top_industries.slice(0, 5).map((industry, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="font-semibold text-slate-900 text-sm mb-1">{industry.industry}</p>
                <p className="font-mono font-bold text-lg">{formatCurrencyShort(industry.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
