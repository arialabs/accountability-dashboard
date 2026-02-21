"use client";

import Link from "next/link";
import RepresentativeImage from "./RepresentativeImage";
import scrutinyData from "@/data/leadership-scrutiny.json";
import donorData from "@/data/leadership-donors.json";

interface BreakVote {
  vote_id: string;
  bill: string;
  title: string;
  description: string;
  category: string;
  date: string;
  leader_vote: string;
  caucus_position: string;
  caucus_yea: number;
  caucus_nay: number;
  caucus_majority_pct: number;
}

interface LeaderScrutiny {
  bioguide_id: string;
  name: string;
  party: "R" | "D";
  chamber: "house" | "senate";
  role: string;
  category_label: "majority" | "minority";
  order: number;
  total_key_votes: number;
  caucus_alignment_pct: number;
  caucus_breaks: number;
  break_votes: BreakVote[];
  category_breakdown: Record<string, { total: number; breaks: number } | undefined>;
  finance: {
    total_raised: number;
    pac_percentage: number;
    small_donor_percentage: number;
    cash_on_hand: number;
    cycle: number;
  } | null;
}

interface DonorProfile {
  bioguide_id: string;
  name: string;
  top_pac_donors: Array<{ name: string; total: number; interest_area: string }>;
  total_interest_pac_money: number;
  note: string;
}

const donors = donorData as DonorProfile[];
const donorMap = new Map(donors.map(d => [d.bioguide_id, d]));
const leaders = scrutinyData as LeaderScrutiny[];

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function AlignmentGauge({ pct, breaks, total }: { pct: number; breaks: number; total: number }) {
  const color = pct >= 98 ? "#059669" : pct >= 92 ? "#D97706" : "#DC2626";
  const label = pct >= 98 ? "Party loyalist" : pct >= 92 ? "Occasional defector" : "Frequent defector";

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-black font-mono" style={{ color }}>
          {pct.toFixed(0)}%
        </span>
        <span className="text-xs text-gray-500">caucus alignment</span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between text-[10px]">
        <span style={{ color }} className="font-semibold">{label}</span>
        <span className="text-gray-400">{breaks} breaks / {total} votes</span>
      </div>
    </div>
  );
}

function FundingBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right font-mono font-semibold" style={{ color }}>{pct.toFixed(0)}%</span>
    </div>
  );
}

function BreakVoteCard({ vote }: { vote: BreakVote }) {
  return (
    <div className="p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs">
      <div className="flex items-center justify-between mb-0.5">
        <span className="font-mono text-red-700 dark:text-red-300 font-bold">{vote.bill || "Amendment"}</span>
        <span className="text-gray-400">{formatDate(vote.date)}</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">{vote.description || vote.title}</p>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-red-600 dark:text-red-400">
          Voted {vote.leader_vote}
        </span>
        <span className="text-gray-400">vs</span>
        <span className="text-gray-600 dark:text-gray-300">
          {vote.caucus_majority_pct.toFixed(0)}% of caucus voted {vote.caucus_position}
        </span>
      </div>
    </div>
  );
}

function LeaderProfile({ leader }: { leader: LeaderScrutiny }) {
  const partyBorder = leader.party === "R" ? "border-l-red-500" : "border-l-blue-500";
  const partyText = leader.party === "R" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400";
  
  const fin = leader.finance;
  const pacColor = fin && fin.pac_percentage > 30 ? "#DC2626" : fin && fin.pac_percentage > 15 ? "#D97706" : "#059669";
  const smallDonorColor = fin && fin.small_donor_percentage > 50 ? "#059669" : fin && fin.small_donor_percentage > 20 ? "#D97706" : "#DC2626";

  const showBreaks = leader.break_votes.length > 0;

  return (
    <Link
      href={`/rep/${leader.bioguide_id}`}
      className={`group block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 border-l-4 ${partyBorder} overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5`}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <RepresentativeImage
            bioguideId={leader.bioguide_id}
            fullName={leader.name}
            party={leader.party}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base group-hover:underline text-gray-900 dark:text-white">
              {leader.name}
            </h3>
            <p className={`text-xs font-semibold ${partyText}`}>
              {leader.role}
            </p>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
            leader.category_label === "majority"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}>
            {leader.category_label}
          </span>
        </div>
      </div>

      {/* Caucus Alignment — the key scrutiny metric */}
      <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-800 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Does Their Leadership Match Their Party?
          </span>
        </div>
        <AlignmentGauge 
          pct={leader.caucus_alignment_pct} 
          breaks={leader.caucus_breaks} 
          total={leader.total_key_votes} 
        />
      </div>

      {/* Break votes — when they defected */}
      {showBreaks && (
        <div className="px-4 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">
            Broke From Party ({leader.caucus_breaks}×)
          </p>
          <div className="space-y-1.5">
            {leader.break_votes.slice(0, 2).map((v) => (
              <BreakVoteCard key={v.vote_id} vote={v} />
            ))}
            {leader.break_votes.length > 2 && (
              <p className="text-[10px] text-gray-400 text-center">
                +{leader.break_votes.length - 2} more breaks →
              </p>
            )}
          </div>
        </div>
      )}

      {/* Follow the money */}
      {fin && (
        <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-800 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Follow the Money</span>
            <span className="text-[10px] font-mono text-gray-400">{fin.cycle} cycle</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-black text-gray-900 dark:text-white font-mono">
              {formatMoney(fin.total_raised)}
            </span>
            <span className="text-xs text-gray-500">raised</span>
            {fin.cash_on_hand > 0 && (
              <span className="text-[10px] text-gray-400 ml-auto">
                {formatMoney(fin.cash_on_hand)} COH
              </span>
            )}
          </div>

          <div className="space-y-1">
            <FundingBar label="PAC Money" pct={fin.pac_percentage} color={pacColor} />
            <FundingBar label="Small Donors" pct={fin.small_donor_percentage} color={smallDonorColor} />
          </div>

          {/* Red flags */}
          {(fin.pac_percentage > 30 || fin.small_donor_percentage < 15) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {fin.pac_percentage > 30 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-semibold">
                  ⚠ {fin.pac_percentage.toFixed(0)}% PAC-funded
                </span>
              )}
              {fin.small_donor_percentage < 15 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-semibold">
                  ⚠ Only {fin.small_donor_percentage.toFixed(0)}% small donors
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Donor interests — who's paying, what do they want */}
      {(() => {
        const donorProfile = donorMap.get(leader.bioguide_id);
        const pacDonors = donorProfile?.top_pac_donors || [];
        if (pacDonors.length === 0) return null;

        // Group by interest area
        const byInterest = new Map<string, number>();
        for (const d of pacDonors) {
          const curr = byInterest.get(d.interest_area) || 0;
          byInterest.set(d.interest_area, curr + d.total);
        }
        const sortedInterests = [...byInterest.entries()].sort((a, b) => b[1] - a[1]);

        return (
          <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-800 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Who&apos;s Buying Influence?
            </p>
            {/* Interest area summary bars */}
            <div className="space-y-1.5 mb-2">
              {sortedInterests.slice(0, 4).map(([interest, total]) => {
                const maxTotal = sortedInterests[0][1];
                const pct = (total / maxTotal) * 100;
                const isHighlight = total > 100000;
                return (
                  <div key={interest} className="flex items-center gap-2 text-xs">
                    <span className={`w-24 shrink-0 truncate ${isHighlight ? "font-semibold text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
                      {interest}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isHighlight ? "#DC2626" : "#64748B",
                        }}
                      />
                    </div>
                    <span className={`w-14 text-right font-mono text-[11px] ${isHighlight ? "font-bold text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300"}`}>
                      {formatMoney(total)}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Top individual PAC donors */}
            <div className="space-y-0.5">
              {pacDonors.slice(0, 3).map((d, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 dark:text-gray-400 truncate mr-2">{d.name}</span>
                  <span className="font-mono font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                    {formatMoney(d.total)}
                  </span>
                </div>
              ))}
            </div>
            {donorProfile?.note && donorProfile.note.includes("$") && (
              <p className="text-[10px] text-red-600 dark:text-red-400 mt-2 italic">
                {donorProfile.note}
              </p>
            )}
          </div>
        );
      })()}

      {/* Footer — view full profile */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center text-xs">
        <span className="ml-auto text-gray-400 group-hover:text-gray-600 transition-colors">
          Full accountability profile →
        </span>
      </div>
    </Link>
  );
}

export default function LeadershipSpotlight() {
  const houseMajority = leaders.filter(l => l.chamber === "house" && l.category_label === "majority").sort((a, b) => a.order - b.order);
  const houseMinority = leaders.filter(l => l.chamber === "house" && l.category_label === "minority").sort((a, b) => a.order - b.order);
  const senateMajority = leaders.filter(l => l.chamber === "senate" && l.category_label === "majority").sort((a, b) => a.order - b.order);
  const senateMinority = leaders.filter(l => l.chamber === "senate" && l.category_label === "minority").sort((a, b) => a.order - b.order);

  return (
    <section>
      <div className="mb-8">
        <div className="brand-flag-bar mb-3" aria-hidden="true" />
        <h2
          className="text-2xl md:text-3xl"
          style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
        >
          Congressional Leadership Under the Microscope
        </h2>
        <p
          className="mt-2 text-sm max-w-2xl"
          style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
        >
          These 8 people set the legislative agenda for 330 million Americans.
          Are they leading their party — or their donors? We track every vote, every dollar.
        </p>
      </div>

      {/* House */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 9h20L12 3zM4 9v10M8 9v10M12 9v10M16 9v10M20 9v10M2 19h20" />
          </svg>
          <h3
            className="text-lg font-semibold"
            style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
          >
            House of Representatives
          </h3>
          <span className="text-xs text-gray-400 ml-auto">221 R – 215 D</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-3">
              Republican Majority
            </p>
            <div className="space-y-4">
              {houseMajority.map(l => <LeaderProfile key={l.bioguide_id} leader={l} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-3">
              Democratic Minority
            </p>
            <div className="space-y-4">
              {houseMinority.map(l => <LeaderProfile key={l.bioguide_id} leader={l} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Senate */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M4 21V10l8-7 8 7v11M9 21v-6h6v6" />
          </svg>
          <h3
            className="text-lg font-semibold"
            style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
          >
            Senate
          </h3>
          <span className="text-xs text-gray-400 ml-auto">53 R – 47 D</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-3">
              Republican Majority
            </p>
            <div className="space-y-4">
              {senateMajority.map(l => <LeaderProfile key={l.bioguide_id} leader={l} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-3">
              Democratic Minority
            </p>
            <div className="space-y-4">
              {senateMinority.map(l => <LeaderProfile key={l.bioguide_id} leader={l} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
