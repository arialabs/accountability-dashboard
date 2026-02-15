"use client";

import { useState } from "react";
import Image from "next/image";
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getInitialsColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-cyan-500",
    "bg-teal-500",
    "bg-green-500",
    "bg-amber-500",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

interface StaffCardProps {
  member: StaffMember;
}

function StaffCard({ member }: StaffCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors text-left"
      >
        {/* Photo or Initials Avatar */}
        <div className="flex-shrink-0">
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={member.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-full ${getInitialsColor(
                member.name
              )} flex items-center justify-center text-white font-bold text-lg shadow-md`}
            >
              {getInitials(member.name)}
            </div>
          )}
        </div>

        {/* Header Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h4 className="font-bold text-lg text-slate-900 break-words">
                {member.name}
              </h4>
              {member.age && (
                <span className="text-xs text-slate-500">Age {member.age}</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {member.conflictOfInterest && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                  ⚠️ COI
                </span>
              )}
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${
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
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">{member.role}</p>
          <div className="text-xs text-slate-500">
            {formatDate(member.tenure.start)}
            {member.tenure.end && ` — ${formatDate(member.tenure.end)}`}
            {!member.tenure.end && " — present"}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-200 p-5 bg-slate-50 space-y-4">
          {/* Background */}
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Background
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {member.background}
            </p>
          </div>

          {/* Previous Employers */}
          {member.previousEmployer && member.previousEmployer.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Previous Employers
              </div>
              <div className="flex flex-wrap gap-2">
                {member.previousEmployer.map((employer, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-1 rounded ${
                      employer.includes("SpaceX") ||
                      employer.includes("Tesla") ||
                      employer.includes("xAI") ||
                      employer.includes("X (")
                        ? "bg-red-50 text-red-700 font-semibold border border-red-200"
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
            <div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Notable Actions
              </div>
              <ul className="space-y-1.5">
                {member.notableActions.map((action, i) => (
                  <li key={i} className="text-sm flex gap-2 text-slate-700">
                    <span className="mt-1 text-slate-400">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Controversies */}
          {member.controversies && member.controversies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>⚠️</span> Controversies
              </div>
              <ul className="space-y-1.5">
                {member.controversies.map((controversy, i) => (
                  <li key={i} className="text-sm flex gap-2 text-red-800">
                    <span className="mt-1 text-red-400">•</span>
                    <span>{controversy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {member.sources && member.sources.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">
                Sources:
              </div>
              <div className="flex flex-wrap gap-1">
                {member.sources.slice(0, 3).map((source, i) => {
                  const domain = new URL(source).hostname.replace("www.", "");
                  return (
                    <a
                      key={i}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      {domain}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ExpandableStaffRosterProps {
  staff: StaffMember[];
}

export default function ExpandableStaffRoster({ staff }: ExpandableStaffRosterProps) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900 mb-2">
          👥 DOGE Staff Roster
        </h3>
        <p className="text-sm text-slate-500">
          {staff.length} documented staff members — click each card to view full details
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {staff.map((member) => (
          <StaffCard key={member.id} member={member} />
        ))}
      </div>

      {/* Note about "100+ members" */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📝</span>
          <div>
            <div className="text-sm font-bold text-blue-900 mb-2">
              Note: Limited Public Documentation
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">
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
  );
}
