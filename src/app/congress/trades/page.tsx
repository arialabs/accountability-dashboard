"use client";

import { useState, useMemo } from "react";
import DataProvenance from "@/components/DataProvenance";
import Link from "next/link";
import tradingSummaries from "@/data/trading-summaries.json";
import { getMembers } from "@/lib/data";
import committeeConflictsData from "@/data/committee-conflicts.json";

type Chamber = "all" | "house" | "senate";
type SortField = "total_trades" | "flagged_trades" | "flag_rate" | "total_risk_score";

interface TradingSummary {
  total_trades: number;
  flagged_trades: number;
  flag_rate: number;
  total_risk_score: number;
  avg_risk_per_trade: number;
  avg_excess_return: number;
  suspicious_patterns: {
    rapid_trading?: number;
    suspicious_timing?: number;
    unusual_return?: number;
    late_disclosure?: number;
  };
  overall_suspicion_level: string;
}

interface Member {
  bioguide_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  party: string;
  state: string;
  district?: number;
  chamber: string;
  photo_url: string;
}

interface CommitteeConflict {
  conflict_sectors: string[];
  conflict_tickers: string[];
  relevant_committees: string[];
}

const memberMap = new Map<string, Member>();
for (const m of getMembers() as Member[]) {
  memberMap.set(m.bioguide_id, m);
}

const summaries = tradingSummaries as Record<string, TradingSummary>;
const committeeConflicts = committeeConflictsData as Record<string, CommitteeConflict>;

function getSuspicionColor(level: string) {
  switch (level) {
    case "high":
      return {
        bg: "bg-red-50",
        border: "border-red-300",
        text: "text-red-800",
        badge: "bg-red-100 text-red-900 border-red-300",
        dot: "bg-red-500",
      };
    case "medium":
      return {
        bg: "bg-amber-50",
        border: "border-amber-300",
        text: "text-amber-800",
        badge: "bg-amber-100 text-amber-900 border-amber-300",
        dot: "bg-amber-500",
      };
    case "low":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        badge: "bg-green-100 text-green-800 border-green-200",
        dot: "bg-green-500",
      };
    default:
      return {
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-600",
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-slate-400",
      };
  }
}

function getPartyColor(party: string) {
  switch (party) {
    case "R":
      return "text-red-600";
    case "D":
      return "text-blue-600";
    default:
      return "text-slate-600";
  }
}

function getPartyLabel(party: string) {
  switch (party) {
    case "R":
      return "Republican";
    case "D":
      return "Democrat";
    case "I":
      return "Independent";
    default:
      return party;
  }
}

export default function TradesLeaderboard() {
  const [chamber, setChamber] = useState<Chamber>("all");
  const [sortBy, setSortBy] = useState<SortField>("total_risk_score");
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const [showOnlyConflicts, setShowOnlyConflicts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const leaderboard = useMemo(() => {
    const entries = Object.entries(summaries)
      .map(([bioguideId, summary]) => {
        const member = memberMap.get(bioguideId);
        if (!member) return null;
        return { bioguideId, member, summary };
      })
      .filter(Boolean) as Array<{
      bioguideId: string;
      member: Member;
      summary: TradingSummary;
    }>;

    return entries
      .filter((e) => {
        if (chamber !== "all" && e.member.chamber !== chamber) return false;
        if (showOnlyFlagged && e.summary.overall_suspicion_level !== "high")
          return false;
        if (showOnlyConflicts && !committeeConflicts[e.bioguideId])
          return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            e.member.full_name.toLowerCase().includes(q) ||
            e.member.state.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "total_trades":
            return b.summary.total_trades - a.summary.total_trades;
          case "flagged_trades":
            return b.summary.flagged_trades - a.summary.flagged_trades;
          case "flag_rate":
            return b.summary.flag_rate - a.summary.flag_rate;
          case "total_risk_score":
          default:
            return b.summary.total_risk_score - a.summary.total_risk_score;
        }
      });
  }, [chamber, sortBy, showOnlyFlagged, showOnlyConflicts, searchQuery]);

  const stats = useMemo(() => {
    const all = Object.values(summaries);
    return {
      totalMembers: all.length,
      totalTrades: all.reduce((s, t) => s + t.total_trades, 0),
      totalFlagged: all.reduce((s, t) => s + t.flagged_trades, 0),
      highSuspicion: all.filter((t) => t.overall_suspicion_level === "high").length,
      committeeConflicts: Object.keys(committeeConflicts).length,
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/congress"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              ← Congress
            </Link>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            📊 Stock Trade Leaderboard
          </h1>
          <DataProvenance dataset="trading-summaries.json" className="mb-3" />
          <p className="text-slate-300 text-lg max-w-3xl">
            Members of Congress ranked by suspicious trading activity. STOCK Act
            requires disclosure of trades, but enforcement is inconsistent and
            penalties are minimal.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900">
                {stats.totalMembers}
              </div>
              <div className="text-sm text-slate-500">Members Trading</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900">
                {stats.totalTrades.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">Total Trades</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-red-700">
                {stats.totalFlagged.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">Flagged Trades</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-red-700">
                {stats.highSuspicion}
              </div>
              <div className="text-sm text-slate-500">High Suspicion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-orange-700">
                {stats.committeeConflicts}
              </div>
              <div className="text-sm text-slate-500">Committee Conflicts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />

          {/* Chamber Filter */}
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            {(["all", "house", "senate"] as Chamber[]).map((c) => (
              <button
                key={c}
                onClick={() => setChamber(c)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  chamber === c
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {c === "all" ? "All" : c === "house" ? "House" : "Senate"}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm bg-white"
          >
            <option value="total_risk_score">Risk Score</option>
            <option value="flagged_trades">Flagged Trades</option>
            <option value="flag_rate">Flag Rate %</option>
            <option value="total_trades">Total Trades</option>
          </select>

          {/* Flagged Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyFlagged}
              onChange={(e) => setShowOnlyFlagged(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded"
            />
            <span className="text-sm font-medium text-slate-700">
              High suspicion only
            </span>
          </label>

          {/* Committee Conflicts Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyConflicts}
              onChange={(e) => setShowOnlyConflicts(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded"
            />
            <span className="text-sm font-medium text-slate-700">
              Committee conflicts only
            </span>
          </label>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-sm text-slate-500 mb-4">
          Showing {leaderboard.length} of {stats.totalMembers} members
        </div>

        <div className="space-y-3">
          {leaderboard.map((entry, idx) => {
            const colors = getSuspicionColor(
              entry.summary.overall_suspicion_level
            );
            const conflict = committeeConflicts[entry.bioguideId] ?? null;
            const patterns = entry.summary.suspicious_patterns ?? {};
            const patternTotal =
              (patterns.rapid_trading ?? 0) +
              (patterns.suspicious_timing ?? 0) +
              (patterns.unusual_return ?? 0) +
              (patterns.late_disclosure ?? 0);

            return (
              <Link
                key={entry.bioguideId}
                href={`/rep/${entry.bioguideId}`}
                className={`block rounded-xl border-2 ${colors.border} ${colors.bg} p-4 sm:p-5 hover:shadow-md transition-shadow`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    <span className="text-2xl font-black text-slate-300 w-10 text-right">
                      {idx + 1}
                    </span>
                    <div
                      className={`w-3 h-3 rounded-full ${colors.dot} flex-shrink-0`}
                    />
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 truncate">
                        {entry.member.full_name}
                      </h3>
                      <span
                        className={`text-xs font-semibold ${getPartyColor(
                          entry.member.party
                        )}`}
                      >
                        ({entry.member.party})
                      </span>
                      <span className="text-xs text-slate-500">
                        {entry.member.state}
                        {entry.member.district
                          ? `-${entry.member.district}`
                          : ""}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">
                        {entry.member.chamber}
                      </span>
                    </div>

                    {/* Committee Conflict Badge */}
                    {conflict && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 font-semibold"
                          title={`Trades in sectors their committee oversees: ${conflict.conflict_sectors.join(", ")}`}
                        >
                          ⚠️ Committee Conflict
                        </span>
                        {conflict.conflict_sectors.map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 capitalize"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Pattern Breakdown */}
                    {patternTotal > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(patterns.rapid_trading ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            ⚡ {patterns.rapid_trading} rapid
                          </span>
                        )}
                        {(patterns.suspicious_timing ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                            ⏱️ {patterns.suspicious_timing} timing
                          </span>
                        )}
                        {(patterns.unusual_return ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                            📈 {patterns.unusual_return} returns
                          </span>
                        )}
                        {(patterns.late_disclosure ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            📝 {patterns.late_disclosure} late
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-lg font-black text-slate-900">
                        {entry.summary.total_trades}
                      </div>
                      <div className="text-xs text-slate-500">Trades</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-black text-red-700">
                        {entry.summary.flagged_trades}
                      </div>
                      <div className="text-xs text-slate-500">Flagged</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-black text-red-700">
                        {entry.summary.flag_rate}%
                      </div>
                      <div className="text-xs text-slate-500">Flag Rate</div>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${colors.badge}`}
                      >
                        {entry.summary.overall_suspicion_level.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-semibold">No members match your filters</p>
            <p className="text-sm mt-1">Try broadening your search criteria</p>
          </div>
        )}

        {/* Methodology Note */}
        <div className="mt-12 bg-slate-50 rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-2">📋 Methodology</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Suspicious trading patterns are identified by analyzing disclosure
            timing, trade frequency, returns relative to market benchmarks, and
            proximity to committee actions. &ldquo;Flagged&rdquo; trades exhibit at least
            one suspicious pattern. Risk scores aggregate pattern frequency and
            severity. Data sourced from House and Senate financial disclosures
            under the STOCK Act.
          </p>
          <p className="text-sm text-slate-500 mt-3">
            <strong>Committee conflict detection</strong> identifies members trading stocks in sectors
            directly overseen by their committee assignments (e.g., a Banking Committee member
            trading bank stocks). Committee membership data sourced from{" "}
            <a href="https://github.com/unitedstates/congress-legislators" className="underline" target="_blank" rel="noopener noreferrer">
              unitedstates/congress-legislators
            </a>.
          </p>
        </div>
      </div>
    </main>
  );
}
