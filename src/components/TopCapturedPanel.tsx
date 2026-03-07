"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import topCapturedData from "@/data/top-captured.json";

type CapturedEntry = {
  bioguide_id: string;
  name: string;
  role: string;
  party: string;
  state: string;
  chamber: string;
  district: number | null;
  pac_percentage: number;
  large_donor_percentage: number;
  total_raised: number;
  scandals: number;
};

const ALL_CAPTURED = topCapturedData as CapturedEntry[];

// State full name → abbreviation
const STATE_TO_ABBREV: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
  "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
  "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
  "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
  "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
  "District of Columbia": "DC",
};

function getStateAbbrev(state: string): string {
  return STATE_TO_ABBREV[state] || state.substring(0, 2).toUpperCase();
}

export default function TopCapturedPanel() {
  const [userState, setUserState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // IP-based state detection via ipapi.co (free, no key)
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(data => {
        if (data.region) setUserState(data.region);
      })
      .catch(() => {/* silently fail */})
      .finally(() => setLoading(false));
  }, []);

  // Build sorted list: user's state's highest-PAC rep floated to top
  const TOP_N = 10;
  let displayList = [...ALL_CAPTURED];

  let userStateEntry: CapturedEntry | null = null;
  if (userState) {
    userStateEntry = displayList.find(e => e.state === userState) ?? null;
    if (userStateEntry) {
      // Remove from natural position, will be shown separately at top
      displayList = displayList.filter(e => e.bioguide_id !== userStateEntry!.bioguide_id);
    }
  }
  // Take remaining top entries (up to 10 total including userState if shown)
  const remaining = displayList.slice(0, userStateEntry ? TOP_N - 1 : TOP_N);

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden" style={{ backgroundColor: "#FAFAFA" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}
          >
            Top 10 · Most PAC-Captured
          </p>
          <p
            className="text-[11px] mt-0.5"
            style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
          >
            Non-leadership members taking the most corporate money
          </p>
        </div>
        <Link
          href="/congress"
          className="text-xs font-semibold shrink-0 flex items-center gap-1"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}
        >
          All 535 →
        </Link>
      </div>

      {/* User state callout */}
      {!loading && userStateEntry && (
        <div
          className="px-4 py-2.5 border-b border-slate-200"
          style={{ backgroundColor: "#FFF8F0" }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "#B45309" }}
          >
            📍 Most captured in {userStateEntry.state}
          </p>
          <CapturedRow entry={userStateEntry} rank={null} isHighlighted />
        </div>
      )}

      {/* Main list */}
      <div className="divide-y divide-slate-100">
        {remaining.map((entry, idx) => (
          <CapturedRow key={entry.bioguide_id} entry={entry} rank={idx + 1} />
        ))}
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 border-t border-slate-100">
        <p
          className="text-[10px]"
          style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
        >
          Source: FEC 2022 cycle · Leadership excluded · Click any rep to see full profile
        </p>
      </div>
    </div>
  );
}

function CapturedRow({
  entry,
  rank,
  isHighlighted = false,
}: {
  entry: CapturedEntry;
  rank: number | null;
  isHighlighted?: boolean;
}) {
  const stateAbbrev = getStateAbbrev(entry.state);
  const partyColor = entry.party === "R" ? "#B91C1C" : entry.party === "D" ? "#1D4ED8" : "#6B7280";
  const barWidth = Math.min(100, Math.round(entry.pac_percentage));

  const verdict =
    entry.pac_percentage >= 60
      ? { label: "VERY HIGH", color: "#7F1D1D", bg: "#FEE2E2" }
      : entry.pac_percentage >= 40
      ? { label: "HIGH PAC", color: "#B91C1C", bg: "#FEF2F2" }
      : { label: "MED PAC", color: "#B45309", bg: "#FFFBEB" };

  return (
    <Link
      href={`/rep/${entry.bioguide_id}`}
      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group ${isHighlighted ? "bg-orange-50/40" : ""}`}
    >
      {/* Rank */}
      <span
        className="w-5 text-center text-xs font-bold tabular-nums shrink-0"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}
      >
        {rank ?? "★"}
      </span>

      {/* Party stripe */}
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: partyColor }}
      />

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span
            className="text-sm font-semibold group-hover:underline truncate"
            style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-primary)" }}
          >
            {entry.name}
          </span>
          <span
            className="text-[10px] shrink-0"
            style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
          >
            ({entry.party}-{stateAbbrev})
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-slate-100 max-w-[100px]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${barWidth}%`, backgroundColor: verdict.color }}
            />
          </div>
          <span
            className="text-[10px] font-mono shrink-0"
            style={{ color: "var(--text-secondary)" }}
          >
            {entry.pac_percentage.toFixed(1)}% PAC
          </span>
        </div>
      </div>

      {/* Badge */}
      <span
        className="shrink-0 px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase"
        style={{ backgroundColor: verdict.bg, color: verdict.color }}
      >
        {verdict.label}
      </span>
    </Link>
  );
}
