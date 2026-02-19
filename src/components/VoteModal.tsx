"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import membersData from "@/data/members.json";
import { BodyText, Caption } from "@/components/ui";

interface BeneficiaryImpact {
  group: string;
  impact: "benefits" | "harms" | "mixed";
}

interface VoteDetails {
  id: string;
  congress: number;
  chamber: "House" | "Senate";
  rollnumber: number;
  date: string;
  bill: string;
  title: string;
  plainEnglishSummary?: string;  // Plain English bill summary
  description: string;
  category: string;
  yea_count: number;
  nay_count: number;
  result: "Passed" | "Failed" | "Unknown";
  summary?: string;
  beneficiaries?: BeneficiaryImpact[];
  publicBenefit?: "positive" | "negative" | "mixed";
  party_breakdown?: {
    dem_yea: number;
    dem_nay: number;
    rep_yea: number;
    rep_nay: number;
    other_yea: number;
    other_nay: number;
  };
  votes?: Record<string, string>;
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
}

const GROUP_LABELS: Record<string, string> = {
  corporations: "Corporations",
  wealthy: "Wealthy Individuals",
  middle_class: "Middle Class",
  working_class: "Working Class",
  low_income: "Low Income Families",
  workers: "Workers & Unions",
  consumers: "Consumers",
  environment: "Environment",
  military_defense: "Military & Defense",
  healthcare_industry: "Healthcare Industry",
  fossil_fuel_industry: "Fossil Fuel Industry",
  wall_street: "Wall Street",
  seniors: "Seniors",
  students: "Students",
  veterans: "Veterans",
  immigrants: "Immigrants",
  general_public: "General Public",
};

const IMPACT_STYLES = {
  benefits: "bg-emerald-100 text-emerald-700 border-emerald-200",
  harms: "bg-red-100 text-red-700 border-red-200",
  mixed: "bg-amber-100 text-amber-700 border-amber-200",
};

interface VoteModalProps {
  vote: VoteDetails | null;
  onClose: () => void;
}

const RESULT_STYLES = {
  Passed: "bg-emerald-100 text-emerald-700",
  Failed: "bg-red-100 text-red-700",
  Unknown: "bg-gray-100 text-gray-600",
};

const PARTY_COLORS: Record<string, string> = {
  D: "text-blue-600",
  R: "text-red-600",
  I: "text-purple-600",
};

export default function VoteModal({ vote, onClose }: VoteModalProps) {
  const [showRollCall, setShowRollCall] = useState(false);
  const [rollCallSearch, setRollCallSearch] = useState("");
  const [rollCallTab, setRollCallTab] = useState<"yea" | "nay">("yea");

  // Load members data
  const members = useMemo(() => {
    return membersData as Member[];
  }, []);

  // Parse roll call votes
  const rollCallVotes = useMemo(() => {
    if (!vote?.votes) return { yea: [], nay: [], notVoting: [] };

    const yea: Member[] = [];
    const nay: Member[] = [];
    const notVoting: Member[] = [];

    Object.entries(vote.votes).forEach(([bioguideId, voteValue]) => {
      const member = members.find(m => m.bioguide_id === bioguideId);
      if (!member) return;

      if (voteValue === "Yea") {
        yea.push(member);
      } else if (voteValue === "Nay") {
        nay.push(member);
      } else {
        notVoting.push(member);
      }
    });

    // Sort by party, then last name
    const sortMembers = (a: Member, b: Member) => {
      if (a.party !== b.party) return a.party.localeCompare(b.party);
      return a.last_name.localeCompare(b.last_name);
    };

    return {
      yea: yea.sort(sortMembers),
      nay: nay.sort(sortMembers),
      notVoting: notVoting.sort(sortMembers),
    };
  }, [vote, members]);

  // Filter roll call by search
  const filteredRollCall = useMemo(() => {
    if (!rollCallSearch) return rollCallVotes;

    const searchLower = rollCallSearch.toLowerCase();
    const filterList = (list: Member[]) =>
      list.filter(
        m =>
          m.full_name.toLowerCase().includes(searchLower) ||
          m.state.toLowerCase().includes(searchLower) ||
          m.party.toLowerCase().includes(searchLower)
      );

    return {
      yea: filterList(rollCallVotes.yea),
      nay: filterList(rollCallVotes.nay),
      notVoting: filterList(rollCallVotes.notVoting),
    };
  }, [rollCallVotes, rollCallSearch]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (vote) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [vote, onClose]);

  if (!vote) return null;

  const totalVotes = vote.yea_count + vote.nay_count;
  const yeaPercent = totalVotes > 0 ? (vote.yea_count / totalVotes) * 100 : 0;
  const nayPercent = totalVotes > 0 ? (vote.nay_count / totalVotes) * 100 : 0;

  const MemberListItem = ({ member }: { member: Member }) => {
    const repUrl = `/rep/${member.bioguide_id}`;
    const displayState = member.chamber === "house" && member.district
      ? `${member.state}-${member.district}`
      : member.state;

    return (
      <Link
        href={repUrl}
        className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors group"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${PARTY_COLORS[member.party] || "text-slate-600"}`}>
            ({member.party})
          </span>
          <span className="text-slate-900 group-hover:text-blue-600 group-hover:underline">
            {member.full_name}
          </span>
        </div>
        <Caption>{displayState}</Caption>
      </Link>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {vote.bill && <span className="text-blue-600">{vote.bill}: </span>}
              {vote.plainEnglishSummary || vote.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${RESULT_STYLES[vote.result]}`}>
                {vote.result}
              </span>
              <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                {vote.chamber}
              </span>
              <span className="px-2 py-1 rounded-lg text-xs text-slate-500">
                {new Date(vote.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Show legislative title as expandable if we have plain English summary */}
          {vote.plainEnglishSummary && vote.title && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Legislative Title
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{vote.title}</p>
            </div>
          )}

          {/* Description */}
          {vote.description && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-2">
                What This Vote Was About
              </h3>
              <p className="text-slate-700 leading-relaxed">{vote.description}</p>
            </div>
          )}

          {/* Plain English Summary (AI-generated fallback) */}
          {!vote.plainEnglishSummary && vote.summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-blue-700 mb-2">
                📋 Plain English Summary
              </h3>
              <p className="text-slate-700 leading-relaxed">{vote.summary}</p>
            </div>
          )}

          {/* Beneficiaries */}
          {vote.beneficiaries && vote.beneficiaries.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">
                👥 Who This Affects
              </h3>

              {/* Overall Impact Badge */}
              {vote.publicBenefit && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-4 ${
                  vote.publicBenefit === "positive"
                    ? "bg-emerald-100 text-emerald-700"
                    : vote.publicBenefit === "negative"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {vote.publicBenefit === "positive" && "👍 Generally Benefits Public"}
                  {vote.publicBenefit === "negative" && "👎 Generally Benefits Special Interests"}
                  {vote.publicBenefit === "mixed" && "⚖️ Mixed Impact"}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {vote.beneficiaries.map((b, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${IMPACT_STYLES[b.impact]}`}
                  >
                    <span className="text-lg">
                      {b.impact === "benefits" ? "✓" : b.impact === "harms" ? "✗" : "~"}
                    </span>
                    <span className="font-medium">
                      {GROUP_LABELS[b.group] || b.group}
                    </span>
                    <span className="text-xs opacity-70">
                      ({b.impact})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vote Breakdown */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">
              Vote Breakdown
            </h3>

            {/* Overall Vote Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-emerald-600">Yea: {vote.yea_count}</span>
                <span className="text-red-600">Nay: {vote.nay_count}</span>
              </div>
              <div className="h-8 rounded-lg overflow-hidden flex">
                <div
                  className="bg-emerald-500 flex items-center justify-center text-white text-sm font-bold transition-all"
                  style={{ width: `${yeaPercent}%` }}
                >
                  {yeaPercent > 15 && `${yeaPercent.toFixed(0)}%`}
                </div>
                <div
                  className="bg-red-500 flex items-center justify-center text-white text-sm font-bold transition-all"
                  style={{ width: `${nayPercent}%` }}
                >
                  {nayPercent > 15 && `${nayPercent.toFixed(0)}%`}
                </div>
              </div>
            </div>

            {/* Party Breakdown */}
            {vote.party_breakdown && (
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-blue-700">Democrats</span>
                    <BodyText as="span">
                      {vote.party_breakdown.dem_yea + vote.party_breakdown.dem_nay} total
                    </BodyText>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-emerald-600">✓ {vote.party_breakdown.dem_yea} Yea</span>
                    <span className="text-red-600">✗ {vote.party_breakdown.dem_nay} Nay</span>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-red-700">Republicans</span>
                    <BodyText as="span">
                      {vote.party_breakdown.rep_yea + vote.party_breakdown.rep_nay} total
                    </BodyText>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-emerald-600">✓ {vote.party_breakdown.rep_yea} Yea</span>
                    <span className="text-red-600">✗ {vote.party_breakdown.rep_nay} Nay</span>
                  </div>
                </div>

                {(vote.party_breakdown.other_yea > 0 || vote.party_breakdown.other_nay > 0) && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-700">Independent/Other</span>
                      <BodyText as="span">
                        {vote.party_breakdown.other_yea + vote.party_breakdown.other_nay} total
                      </BodyText>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-emerald-600">✓ {vote.party_breakdown.other_yea} Yea</span>
                      <span className="text-red-600">✗ {vote.party_breakdown.other_nay} Nay</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Roll Call Section */}
          {vote.votes && (
            <div className="border-t border-slate-200 pt-6">
              <button
                onClick={() => setShowRollCall(!showRollCall)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="font-semibold text-slate-900">
                  📋 View Roll Call
                </span>
                <svg
                  className={`w-5 h-5 text-slate-500 transition-transform ${showRollCall ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showRollCall && (
                <div className="mt-4 space-y-4">
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search by name, state, or party..."
                    value={rollCallSearch}
                    onChange={(e) => setRollCallSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Tabs */}
                  <div className="flex gap-2 border-b border-slate-200">
                    <button
                      onClick={() => setRollCallTab("yea")}
                      className={`px-4 py-2 text-sm font-semibold transition-colors ${
                        rollCallTab === "yea"
                          ? "border-b-2 border-emerald-500 text-emerald-600"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Yea ({filteredRollCall.yea.length})
                    </button>
                    <button
                      onClick={() => setRollCallTab("nay")}
                      className={`px-4 py-2 text-sm font-semibold transition-colors ${
                        rollCallTab === "nay"
                          ? "border-b-2 border-red-500 text-red-600"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Nay ({filteredRollCall.nay.length})
                    </button>
                  </div>

                  {/* Member List */}
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {rollCallTab === "yea" && filteredRollCall.yea.map(member => (
                      <MemberListItem key={member.bioguide_id} member={member} />
                    ))}
                    {rollCallTab === "nay" && filteredRollCall.nay.map(member => (
                      <MemberListItem key={member.bioguide_id} member={member} />
                    ))}
                    {((rollCallTab === "yea" && filteredRollCall.yea.length === 0) ||
                      (rollCallTab === "nay" && filteredRollCall.nay.length === 0)) && (
                      <p className="text-center text-slate-500 py-4">No members found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Roll Call Number */}
          <div className="text-xs text-slate-400 pt-4 border-t border-slate-200">
            Roll Call #{vote.rollnumber} • {vote.congress}th Congress
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
