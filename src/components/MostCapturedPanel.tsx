"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type CapturedMember = {
  bioguide_id: string;
  name: string;
  party: "R" | "D" | "I";
  state: string;
  district: string | null;
  chamber: string;
  pac_percentage: number;
  total_raised: number;
  top_pac_sector: string;
};

function pacVerdict(pct: number) {
  if (pct >= 50) return { label: "HIGH PAC", color: "#B91C1C", bg: "#FEF2F2" };
  if (pct >= 40) return { label: "MED PAC", color: "#B45309", bg: "#FFFBEB" };
  return { label: "LOW PAC", color: "#15803D", bg: "#F0FDF4" };
}

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/** Compute which member is "most captured" per state */
function getMostCapturedByState(members: CapturedMember[]): Record<string, string> {
  const best: Record<string, CapturedMember> = {};
  for (const m of members) {
    if (!best[m.state] || m.pac_percentage > best[m.state].pac_percentage) {
      best[m.state] = m;
    }
  }
  const result: Record<string, string> = {};
  for (const [state, m] of Object.entries(best)) {
    result[state] = m.bioguide_id;
  }
  return result;
}

export default function MostCapturedPanel({ members }: { members: CapturedMember[] }) {
  const [userState, setUserState] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data?.region) setUserState(data.region);
      })
      .catch(() => {
        // Geolocation failed — graceful fallback, no state highlighting
      });
    return () => controller.abort();
  }, []);

  const mostCapturedByState = getMostCapturedByState(members);

  return (
    <div>
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}
          >
            Top 10 Most Captured
          </p>
          <p
            className="text-[10px] mt-0.5"
            style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
          >
            Non-leadership reps with highest PAC funding
          </p>
        </div>
        <Link
          href="/congress"
          className="text-xs font-semibold flex items-center gap-1"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}
        >
          All 535
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {userState && (
        <div
          className="px-4 py-2 text-xs border-b border-slate-100"
          style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#EFF6FF", color: "#1E40AF" }}
        >
          Showing results for <span className="font-semibold">{userState}</span> — your state reps are highlighted
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {members.map((member, idx) => {
          const verdict = pacVerdict(member.pac_percentage);
          const barWidth = Math.min(100, Math.round((member.pac_percentage / 70) * 100));
          const isUserState = userState !== null && member.state === userState;
          const isMostCapturedInState = mostCapturedByState[member.state] === member.bioguide_id;

          return (
            <Link
              key={member.bioguide_id}
              href={`/rep/${member.bioguide_id}`}
              className={`flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group ${
                isUserState ? "ring-2 ring-inset ring-blue-300 bg-blue-50/30" : ""
              }`}
            >
              <span
                className="w-5 text-center text-xs font-bold tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}
              >
                {idx + 1}
              </span>
              <div
                className="w-1 self-stretch rounded-full"
                style={{ backgroundColor: member.party === "R" ? "#B91C1C" : member.party === "D" ? "#1D4ED8" : "#6B7280" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-sm font-semibold group-hover:underline truncate"
                    style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-primary)" }}
                  >
                    {member.name}
                  </span>
                  <span
                    className="text-[10px] shrink-0"
                    style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
                  >
                    ({member.party}-{member.district || member.state})
                  </span>
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase shrink-0"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      backgroundColor: member.party === "R" ? "#FEF2F2" : member.party === "D" ? "#EFF6FF" : "#F3F4F6",
                      color: member.party === "R" ? "#B91C1C" : member.party === "D" ? "#1D4ED8" : "#6B7280",
                    }}
                  >
                    {member.party === "R" ? "GOP" : member.party === "D" ? "DEM" : "IND"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-slate-100 max-w-[120px]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${barWidth}%`, backgroundColor: verdict.color }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {member.pac_percentage.toFixed(1)}% PAC
                  </span>
                  <span
                    className="text-[10px] hidden sm:inline"
                    style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
                  >
                    · {formatMoney(member.total_raised)} raised
                  </span>
                </div>
                {isMostCapturedInState && (
                  <span
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold"
                    style={{ fontFamily: "'Inter', sans-serif", color: "#D97706" }}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Most captured in {member.state}
                  </span>
                )}
              </div>
              <span
                className="shrink-0 px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase"
                style={{ backgroundColor: verdict.bg, color: verdict.color }}
              >
                {verdict.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
