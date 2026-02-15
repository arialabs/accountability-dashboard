"use client";

import { useState, useEffect } from "react";
import { CongressVote } from "@/lib/congress";

interface VoteHistorySectionProps {
  bioguideId: string;
  memberName: string;
  chamber: "House" | "Senate";
}

const VOTE_STYLES = {
  Yea: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Nay: "bg-red-100 text-red-700 border-red-300",
  Present: "bg-amber-100 text-amber-700 border-amber-300",
  "Not Voting": "bg-gray-100 text-gray-500 border-gray-300",
};

const RESULT_STYLES = {
  Passed: "text-emerald-600",
  Failed: "text-red-600",
  "Agreed to": "text-emerald-600",
  Rejected: "text-red-600",
};

export default function VoteHistorySection({
  bioguideId,
  memberName,
  chamber,
}: VoteHistorySectionProps) {
  const [votes, setVotes] = useState<CongressVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(20);
  const [sortBy, setSortBy] = useState<"date" | "bill">("date");

  useEffect(() => {
    async function fetchVotes() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/congress/member-votes?bioguideId=${bioguideId}&limit=100`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch votes: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.votes) {
          setVotes(data.votes);
        } else {
          setError(data.error || "Failed to load voting history");
        }
      } catch (err) {
        console.error("Error fetching vote history:", err);
        setError("Unable to load voting history. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchVotes();
  }, [bioguideId]);

  const sortedVotes = [...votes].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return (a.bill?.number || "").localeCompare(b.bill?.number || "");
  });

  const displayedVotes = sortedVotes.slice(0, displayCount);
  const hasMore = displayCount < sortedVotes.length;

  if (loading) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">
          📜 Complete Vote History
        </h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">
          📜 Complete Vote History
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Vote history from Congress.gov is temporarily unavailable.
          </p>
        </div>
      </section>
    );
  }

  if (votes.length === 0) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">
          📜 Complete Vote History
        </h3>
        <p className="text-slate-500">
          No recent votes available for this member.
        </p>
      </section>
    );
  }

  const stats = {
    total: votes.length,
    yea: votes.filter((v) => v.memberVote === "Yea").length,
    nay: votes.filter((v) => v.memberVote === "Nay").length,
    notVoting: votes.filter((v) => v.memberVote === "Not Voting").length,
    participationRate: votes.length > 0
      ? ((votes.filter((v) => v.memberVote !== "Not Voting").length / votes.length) * 100)
      : 0,
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          📜 Complete Vote History
        </h3>
      </div>
      
      <p className="text-slate-500 mb-6">
        Recent congressional votes by {memberName.split(" ")[0]}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Total Votes
          </p>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">
            Yea
          </p>
          <p className="text-2xl font-black text-emerald-700">{stats.yea}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">
            Nay
          </p>
          <p className="text-2xl font-black text-red-700">{stats.nay}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Absent
          </p>
          <p className="text-2xl font-black text-gray-700">{stats.notVoting}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Participation
          </p>
          <p className="text-2xl font-black text-blue-700">
            {stats.participationRate.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-slate-600 font-medium">Sort by:</span>
        <button
          onClick={() => setSortBy("date")}
          className={`px-3 py-1.5 min-h-[44px] rounded-lg text-sm font-medium transition ${
            sortBy === "date"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Date
        </button>
        <button
          onClick={() => setSortBy("bill")}
          className={`px-3 py-1.5 min-h-[44px] rounded-lg text-sm font-medium transition ${
            sortBy === "bill"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Bill Number
        </button>
      </div>

      {/* Vote list */}
      <div className="space-y-3">
        {displayedVotes.map((vote, idx) => (
          <div
            key={`${vote.congress}-${vote.rollNumber}-${idx}`}
            className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-md transition-all"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 ${
                    VOTE_STYLES[vote.memberVote || "Not Voting"]
                  }`}
                >
                  {vote.memberVote || "Not Voting"}
                </span>
                {vote.bill && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                    {vote.bill.number}
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500">
                {new Date(vote.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Bill title */}
            {vote.bill ? (
              <h4 className="font-bold text-slate-900 mb-2">
                <a
                  href={vote.bill.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {vote.bill.title}
                </a>
              </h4>
            ) : (
              <h4 className="font-bold text-slate-900 mb-2">{vote.question}</h4>
            )}

            {/* Description */}
            {vote.description && (
              <p className="text-sm text-slate-600 mb-3">{vote.description}</p>
            )}

            {/* Vote totals & result */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-slate-600">
                  <span className="font-semibold text-emerald-600">
                    {vote.totals.yea} Yea
                  </span>
                  {" • "}
                  <span className="font-semibold text-red-600">
                    {vote.totals.nay} Nay
                  </span>
                </span>
              </div>
              <div className="h-4 w-px bg-slate-300"></div>
              <span
                className={`font-bold ${
                  RESULT_STYLES[vote.result] || "text-slate-600"
                }`}
              >
                {vote.result}
              </span>
              <div className="h-4 w-px bg-slate-300"></div>
              <span className="text-slate-400">
                Roll #{vote.rollNumber} • {vote.congress}th Congress
              </span>
            </div>

            {/* Link to bill */}
            {vote.bill && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <a
                  href={vote.bill.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  View full bill text on Congress.gov
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <button
          onClick={() => setDisplayCount((prev) => prev + 20)}
          className="w-full mt-6 py-3 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
        >
          Load {Math.min(20, sortedVotes.length - displayCount)} More Votes ↓
        </button>
      )}

      {!hasMore && sortedVotes.length > 20 && (
        <p className="text-center text-sm text-slate-400 mt-4">
          Showing all {sortedVotes.length} votes
        </p>
      )}
    </section>
  );
}
