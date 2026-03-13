"use client";

import { useState, useMemo } from "react";
import VoteModal from "./VoteModal";
import { billToCongressGovUrl, rollCallUrl } from "@/lib/bill-urls";

interface KeyVote {
  id: string;
  congress: number;
  chamber: "House" | "Senate";
  rollnumber: number;
  date: string;
  bill: string;
  title: string;
  description: string;
  category: string;
  yea_count: number;
  nay_count: number;
  result: string;
  votes: Record<string, string>;
  summary?: string;
  beneficiaries?: Array<{
    group: string;
    impact: "benefits" | "harms" | "mixed";
  }>;
  publicBenefit?: "positive" | "negative" | "mixed";
  party_breakdown?: {
    dem_yea: number;
    dem_nay: number;
    rep_yea: number;
    rep_nay: number;
    other_yea: number;
    other_nay: number;
  };
}

interface MemberVotingRecordProps {
  bioguideId: string;
  icpsrId?: string;
  memberParty?: string;
  memberName: string;
  chamber: "House" | "Senate";
  keyVotes: KeyVote[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Healthcare": "bg-red-100 text-red-700",
  "Climate & Environment": "bg-green-100 text-green-700",
  "Voting Rights": "bg-purple-100 text-purple-700",
  "Immigration": "bg-orange-100 text-orange-700",
  "Economy & Taxes": "bg-blue-100 text-blue-700",
  "Civil Rights": "bg-pink-100 text-pink-700",
  "National Security": "bg-slate-100 text-slate-700",
  "Government Ethics": "bg-yellow-100 text-yellow-700",
  "Other": "bg-gray-100 text-gray-700",
};

const VOTE_STYLES = {
  Yea: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Nay: "bg-red-100 text-red-700 border-red-200",
  "Not Voting": "bg-gray-100 text-gray-500 border-gray-200",
};

export function MemberVotingRecord({
  bioguideId,
  icpsrId,
  memberParty,
  memberName,
  chamber,
  keyVotes
}: MemberVotingRecordProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expanded, setExpanded] = useState(false);
  const [selectedVote, setSelectedVote] = useState<KeyVote | null>(null);
  
  // Filter votes for this chamber and where this member has a vote record
  const memberVotes = useMemo(() => {
    const voteKey = icpsrId || bioguideId;
    return keyVotes
      .filter(v => v.chamber === chamber && v.votes[voteKey])
      .map(v => ({
        ...v,
        memberVote: v.votes[voteKey] as "Yea" | "Nay" | "Not Voting",
      }));
  }, [keyVotes, chamber, bioguideId, icpsrId]);
  
  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(memberVotes.map(v => v.category));
    return ["All", ...Array.from(cats).sort()];
  }, [memberVotes]);
  
  // Filter by category
  const filteredVotes = useMemo(() => {
    if (selectedCategory === "All") return memberVotes;
    return memberVotes.filter(v => v.category === selectedCategory);
  }, [memberVotes, selectedCategory]);
  
  // Calculate voting stats
  const stats = useMemo(() => {
    const yeas = memberVotes.filter(v => v.memberVote === "Yea").length;
    const nays = memberVotes.filter(v => v.memberVote === "Nay").length;
    const notVoting = memberVotes.filter(v => v.memberVote === "Not Voting").length;
    const total = memberVotes.length;
    const participationRate = total > 0 ? ((yeas + nays) / total * 100) : 0;

    let breaksWithParty = 0;
    let scorableVotes = 0;
    if (memberParty) {
      for (const v of memberVotes) {
        if (!v.party_breakdown) continue;
        if (v.memberVote !== "Yea" && v.memberVote !== "Nay") continue;
        const pb = v.party_breakdown;
        const partyYea = memberParty === "D" ? pb.dem_yea : memberParty === "R" ? pb.rep_yea : pb.other_yea;
        const partyNay = memberParty === "D" ? pb.dem_nay : memberParty === "R" ? pb.rep_nay : pb.other_nay;
        if (partyYea === 0 && partyNay === 0) continue;
        const partyMajority = partyYea > partyNay ? "Yea" : "Nay";
        scorableVotes++;
        if (v.memberVote !== partyMajority) breaksWithParty++;
      }
    }
    const breaksPct = scorableVotes > 0 ? Math.round((breaksWithParty / scorableVotes) * 100) : null;

    return { yeas, nays, notVoting, total, participationRate, breaksPct };
  }, [memberVotes, memberParty]);
  
  const displayVotes = expanded ? filteredVotes : filteredVotes.slice(0, 5);
  
  if (memberVotes.length === 0) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">
          🗳️ Key Vote Record
        </h3>
        <p className="text-slate-500">
          No key vote records available for this member yet.
        </p>
      </section>
    );
  }
  
  return (
    <>
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">
          🗳️ Key Vote Record
        </h3>
        {/* Summary layer — plain-language overview, always visible */}
        <p className="text-slate-600 mb-4">
          Voted on {stats.total} key issue{stats.total !== 1 ? "s" : ""}: {stats.yeas} Yea, {stats.nays} Nay{stats.notVoting > 0 ? `, ${stats.notVoting} absent` : ""}.
        </p>
        <p className="text-slate-500 mb-6">
          How {memberName.split(" ")[0]} voted on important legislation
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Key Votes</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Yea</p>
            <p className="text-2xl font-black text-emerald-700">{stats.yeas}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">Nay</p>
            <p className="text-2xl font-black text-red-700">{stats.nays}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Participation</p>
            <p className="text-2xl font-black text-blue-700">{stats.participationRate.toFixed(0)}%</p>
          </div>
          {stats.breaksPct !== null && (
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Breaks w/ Party</p>
              <p className="text-2xl font-black text-slate-700">{stats.breaksPct}%</p>
            </div>
          )}
        </div>
        
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-label={`Filter by ${cat} category`}
              aria-pressed={selectedCategory === cat}
              className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Vote list */}
        <div className="space-y-3">
          {displayVotes.map((vote) => (
            <div
              key={vote.id}
              onClick={() => setSelectedVote(vote)}
              className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${VOTE_STYLES[vote.memberVote]}`}>
                    {vote.memberVote}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${CATEGORY_COLORS[vote.category] || CATEGORY_COLORS.Other}`}>
                    {vote.category}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(vote.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              
              {/* Description first for plain-language readability */}
              {vote.description && (
                <p className="text-sm text-slate-700 mb-2">
                  {vote.description}
                </p>
              )}

              <h4 className="font-semibold text-slate-900 mb-1">
                {vote.title || "Vote"}
              </h4>
              {vote.bill && (() => {
                const billUrl = billToCongressGovUrl(vote.bill, vote.congress);
                return billUrl ? (
                  <a href={billUrl} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-blue-500 hover:text-blue-700 hover:underline mb-1 inline-block"
                     onClick={(e) => e.stopPropagation()}>
                    {vote.bill}
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 mb-1">{vote.bill}</p>
                );
              })()}

              {/* Who Benefits indicator */}
              {vote.publicBenefit && vote.publicBenefit !== "mixed" && (
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mb-2 ${
                  vote.publicBenefit === "positive"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}>
                  {vote.publicBenefit === "positive" ? "👍" : "👎"}
                  {vote.publicBenefit === "positive" 
                    ? "Benefits working people" 
                    : "Benefits special interests"}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span>Result: {vote.yea_count} Yea - {vote.nay_count} Nay</span>
                <a href={rollCallUrl(vote.chamber, vote.rollnumber, vote.date, vote.congress)}
                   target="_blank" rel="noopener noreferrer"
                   className="text-blue-500 hover:text-blue-700 hover:underline"
                   aria-label={`Roll #${vote.rollnumber}`}
                   onClick={(e) => e.stopPropagation()}>
                  Roll #{vote.rollnumber}
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {/* Show more */}
        {filteredVotes.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? "Show fewer votes" : `Show ${filteredVotes.length - 5} more votes`}
            className="w-full mt-4 py-3 min-h-[44px] text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded
              ? "Show Less ↑"
              : `Show ${filteredVotes.length - 5} More Votes ↓`
            }
          </button>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100">
          <a
            href={`https://www.congress.gov/member/${bioguideId}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Full voting record on Congress.gov"
            className="text-sm text-slate-500 hover:text-blue-600 hover:underline transition-colors"
          >
            Full voting record on Congress.gov →
          </a>
        </div>
      </section>

      {/* Vote Modal */}
      <VoteModal vote={selectedVote} onClose={() => setSelectedVote(null)} />
    </>
  );
}

export default MemberVotingRecord;
