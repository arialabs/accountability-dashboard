"use client";

/**
 * Committee Memberships Component
 */
import React from "react";

interface Committee {
  name: string;
  role: "Chair" | "Ranking Member" | "Member" | "Vice Chair";
  subcommittees?: string[];
}

interface CommitteeMembershipsProps {
  committees: Committee[];
}

export default function CommitteeMemberships({
  committees,
}: CommitteeMembershipsProps) {
  // Hide entirely when no data — don't show a "coming soon" placeholder
  if (committees.length === 0) {
    return null;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Chair":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Ranking Member":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Vice Chair":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const isLeadership = (role: string) =>
    ["Chair", "Ranking Member", "Vice Chair"].includes(role);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
      <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
        Committee Memberships
      </h3>

      {committees.length > 0 ? (
        <div className="space-y-4">
          {committees.map((committee, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                isLeadership(committee.role)
                  ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-bold text-slate-900 mb-1 text-base leading-relaxed">
                    {committee.name}
                  </div>
                  {committee.subcommittees &&
                    committee.subcommittees.length > 0 && (
                      <div className="text-sm text-slate-600 space-y-1 mt-3">
                        <div className="font-bold">Subcommittees:</div>
                        <ul className="list-disc list-inside pl-2 space-y-1">
                          {committee.subcommittees.map((sub, subIdx) => (
                            <li key={subIdx} className="leading-relaxed">{sub}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
                <span
                  className={`px-3 py-1.5 rounded-lg border-2 text-xs font-black ${getRoleBadge(
                    committee.role
                  )}`}
                >
                  {committee.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-base text-slate-400 text-center py-8 leading-relaxed">
          Committee information coming soon...
        </div>
      )}
    </div>
  );
}
