"use client";

import { useState } from "react";
import type { ConflictCallout } from "@/lib/conflict-callouts";
import { formatDate } from "@/lib/formatting";

interface ConflictCalloutProps {
  callouts: ConflictCallout[];
  memberName: string;
}

// ─── Single callout card ──────────────────────────────────────────────────────

function CalloutCard({ callout }: { callout: ConflictCallout }) {
  const [expanded, setExpanded] = useState(false);

  const severityStyles = {
    high: {
      wrapper: "border-red-400 bg-red-50",
      badge: "bg-red-600 text-white",
      icon: "🚨",
      label: "HIGH",
      voteChip: "bg-red-100 text-red-800 border border-red-300",
      expandBtn: "text-red-700 hover:text-red-900",
    },
    medium: {
      wrapper: "border-orange-400 bg-orange-50",
      badge: "bg-orange-500 text-white",
      icon: "⚠️",
      label: "MEDIUM",
      voteChip: "bg-orange-100 text-orange-800 border border-orange-300",
      expandBtn: "text-orange-700 hover:text-orange-900",
    },
    low: {
      wrapper: "border-yellow-400 bg-yellow-50",
      badge: "bg-yellow-500 text-white",
      icon: "⚡",
      label: "LOW",
      voteChip: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      expandBtn: "text-yellow-700 hover:text-yellow-900",
    },
  };

  const s = severityStyles[callout.severity];

  return (
    <div
      className={`rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200 hover:shadow-md ${s.wrapper}`}
      role="alert"
      aria-label={`Conflict alert: ${callout.narrative}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Industry icon */}
        <div className="flex-shrink-0 text-2xl sm:text-3xl mt-0.5 select-none" aria-hidden="true">
          {callout.industryIcon}
        </div>

        {/* Narrative text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {callout.narrative}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tracking-wide ${s.badge}`}
            >
              {s.icon} {s.label}
            </span>
            <span className="text-xs text-slate-500">
              {callout.voteCount === 1 ? "1 vote" : `${callout.voteCount} votes`} on record
            </span>
          </div>
        </div>
      </div>

      {/* Expand / collapse supporting votes */}
      {callout.votes.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className={`text-xs font-semibold underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded ${s.expandBtn}`}
            aria-expanded={expanded}
          >
            {expanded ? "▲ Hide supporting votes" : `▼ Show ${callout.votes.length} supporting vote${callout.votes.length === 1 ? "" : "s"}`}
          </button>

          {expanded && (
            <ul className="mt-3 space-y-2" role="list">
              {callout.votes.map((v, i) => (
                <li key={i} className="bg-white rounded-xl p-3 shadow-sm border border-white/80">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        v.vote === "Yea"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {v.vote}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{v.bill}</span>
                    <span className="text-xs text-slate-400 ml-auto">{formatDate(v.date)}</span>
                  </div>
                  {v.description ? (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {v.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600">{v.title}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section container ────────────────────────────────────────────────────────

export default function ConflictCalloutSection({
  callouts,
  memberName,
}: ConflictCalloutProps) {
  if (callouts.length === 0) return null;

  const highCount = callouts.filter((c) => c.severity === "high").length;
  const mediumCount = callouts.filter((c) => c.severity === "medium").length;

  return (
    <section
      aria-labelledby="conflict-callout-heading"
      className="bg-white rounded-3xl border-2 border-red-200 shadow-md p-6 sm:p-8"
    >
      {/* Section header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" aria-hidden="true">🚩</span>
            <h3
              id="conflict-callout-heading"
              className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900"
            >
              Conflict Alerts
            </h3>
          </div>
          <p className="text-sm text-slate-600 max-w-prose">
            Instances where {memberName}&apos;s votes appear to benefit top campaign donors —
            the &ldquo;say one thing, do another&rdquo; pattern.
          </p>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {highCount > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
              🚨 {highCount} high
            </span>
          )}
          {mediumCount > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">
              ⚠️ {mediumCount} medium
            </span>
          )}
        </div>
      </div>

      {/* Callout cards */}
      <div className="space-y-4">
        {callouts.map((callout) => (
          <CalloutCard key={callout.id} callout={callout} />
        ))}
      </div>

      {/* Methodology note */}
      <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>How this works:</strong> Conflict Alerts are generated by cross-referencing
          campaign contribution data with key vote records. Severity is based on donation size
          ($100K+ = high). This is algorithmic analysis — not a determination of wrongdoing.{" "}
          <a href="/methodology" className="text-teal-600 hover:underline">
            Learn more →
          </a>
        </p>
      </div>
    </section>
  );
}
