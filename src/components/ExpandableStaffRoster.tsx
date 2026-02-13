"use client";

import { useState } from "react";
import type { StaffMember } from "@/data/doge";

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ExpandableStaffRosterProps {
  staff: StaffMember[];
}

export default function ExpandableStaffRoster({ staff }: ExpandableStaffRosterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-xl font-black text-slate-900 mb-1">
            👥 DOGE Staff Roster
          </h3>
          <p className="text-sm text-slate-500">
            {staff.length} documented staff members — click to view details
          </p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <svg
            className={`w-6 h-6 text-slate-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="grid md:grid-cols-2 gap-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
              >
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">
                        {member.name}
                      </h4>
                      {member.age && (
                        <span className="text-xs text-slate-500">Age {member.age}</span>
                      )}
                    </div>
                    {member.conflictOfInterest && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 flex-shrink-0 ml-2">
                        ⚠️ COI
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{member.role}</p>
                </div>

                {/* Tenure */}
                <div className="mb-3 text-xs text-slate-500">
                  <span className="font-semibold">Tenure:</span>{" "}
                  {formatDate(member.tenure.start)}
                  {member.tenure.end && ` — ${formatDate(member.tenure.end)}`}
                  {!member.tenure.end && " — present"}
                </div>

                {/* Background */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Background
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {member.background}
                  </p>
                </div>

                {/* Previous Employers */}
                {member.previousEmployer && member.previousEmployer.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Previous Employers
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {member.previousEmployer.map((employer, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-0.5 rounded ${
                            employer.includes("SpaceX") ||
                            employer.includes("Tesla") ||
                            employer.includes("xAI") ||
                            employer.includes("X (")
                              ? "bg-red-50 text-red-700 font-semibold"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {employer}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notable Actions */}
                {member.notableActions && member.notableActions.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Notable Actions
                    </div>
                    <ul className="space-y-1">
                      {member.notableActions.map((action, i) => (
                        <li key={i} className="text-xs flex gap-2 text-slate-700">
                          <span className="mt-0.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Controversies */}
                {member.controversies && member.controversies.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <div className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">
                      ⚠️ Controversies
                    </div>
                    <ul className="space-y-1">
                      {member.controversies.map((controversy, i) => (
                        <li key={i} className="text-xs flex gap-2 text-red-800">
                          <span className="mt-0.5">•</span>
                          <span>{controversy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Note about "100+ members" */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <div className="text-sm font-bold text-blue-900 mb-1">
                  Note: Limited Public Documentation
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  ProPublica identified over 100 DOGE members, but most remain
                  unidentified publicly. At least 23 made cuts at agencies regulating
                  industries where they had personal financial interests. Approximately 40
                  were directly tied to Musk's companies (SpaceX, Tesla, X, xAI). This
                  roster includes only those documented in credible public reporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
