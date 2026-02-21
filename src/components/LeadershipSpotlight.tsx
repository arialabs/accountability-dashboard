"use client";

import Link from "next/link";
import RepresentativeImage from "./RepresentativeImage";
import leadershipFinanceData from "@/data/leadership-finance.json";
import { getMember, getMemberAlignment } from "@/lib/data";

interface LeaderFinance {
  bioguide_id: string;
  fec_candidate_id: string;
  name: string;
  role: string;
  party: "R" | "D";
  chamber: "house" | "senate";
  category: "majority" | "minority";
  order: number;
  cycle: number;
  total_raised: number;
  total_spent: number;
  cash_on_hand: number;
  individual_contributions: number;
  individual_itemized: number;
  individual_unitemized: number;
  pac_contributions: number;
  pac_percentage: number;
  small_donor_percentage: number;
  top_contributors: Array<{ name: string; total: number; type: string }>;
}

const leaders = leadershipFinanceData as LeaderFinance[];

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

function FundingBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="w-10 text-right font-mono font-semibold" style={{ color }}>{pct.toFixed(0)}%</span>
    </div>
  );
}

function LeaderProfile({ leader }: { leader: LeaderFinance }) {
  const member = getMember(leader.bioguide_id);
  const alignment = getMemberAlignment(leader.bioguide_id);

  const partyBorder = leader.party === "R" ? "border-l-red-500" : "border-l-blue-500";
  const partyText = leader.party === "R" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400";
  const pacColor = leader.pac_percentage > 30 ? "#DC2626" : leader.pac_percentage > 15 ? "#D97706" : "#059669";
  const smallDonorColor = leader.small_donor_percentage > 50 ? "#059669" : leader.small_donor_percentage > 20 ? "#D97706" : "#DC2626";

  // Determine if PAC-heavy
  const pacWarning = leader.pac_percentage > 30;
  const lowSmallDonor = leader.small_donor_percentage < 15;

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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {member?.state}{member?.district ? `-${member.district}` : ""} · {leader.party === "R" ? "Republican" : "Democrat"}
            </p>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
            leader.category === "majority" 
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" 
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}>
            {leader.category}
          </span>
        </div>
      </div>

      {/* Money section — the scrutiny */}
      <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-800 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Follow the Money</span>
          <span className="text-xs font-mono text-gray-500">{leader.cycle} cycle</span>
        </div>
        
        {/* Big number — total raised */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-black text-gray-900 dark:text-white font-mono">
            {formatMoney(leader.total_raised)}
          </span>
          <span className="text-xs text-gray-500">raised</span>
          {leader.cash_on_hand > 0 && (
            <span className="text-xs text-gray-400 ml-auto">
              {formatMoney(leader.cash_on_hand)} cash on hand
            </span>
          )}
        </div>

        {/* Funding source bars */}
        <div className="space-y-1.5 mb-3">
          <FundingBar label="PAC Money" pct={leader.pac_percentage} color={pacColor} />
          <FundingBar label="Small Donors" pct={leader.small_donor_percentage} color={smallDonorColor} />
          <FundingBar 
            label="Big Donors" 
            pct={100 - leader.small_donor_percentage - (leader.pac_percentage > 0 ? 0 : 0)} 
            color="#64748B" 
          />
        </div>

        {/* Red flags */}
        {(pacWarning || lowSmallDonor) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {pacWarning && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-semibold">
                ⚠ {leader.pac_percentage.toFixed(0)}% PAC-funded
              </span>
            )}
            {lowSmallDonor && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-semibold">
                ⚠ Only {leader.small_donor_percentage.toFixed(0)}% from small donors
              </span>
            )}
          </div>
        )}

        {/* Top PAC contributors */}
        {leader.top_contributors.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Top Contributors</p>
            <div className="space-y-0.5">
              {leader.top_contributors.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 truncate mr-2">{c.name}</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-gray-200 shrink-0">
                    {formatMoney(c.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Voting record teaser */}
      {(member?.party_alignment_pct || alignment) && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs">
          {member?.party_alignment_pct != null && member.party_alignment_pct > 0 && (
            <div>
              <span className="text-gray-500">Party line: </span>
              <span className="font-bold">{member.party_alignment_pct.toFixed(0)}%</span>
            </div>
          )}
          {alignment && (
            <div>
              <span className="text-gray-500">Say vs Do: </span>
              <span className={`font-bold ${alignment.alignment_score < 50 ? "text-red-600" : alignment.alignment_score < 70 ? "text-amber-600" : "text-green-600"}`}>
                {alignment.alignment_score.toFixed(0)}%
              </span>
            </div>
          )}
          {member?.bills_sponsored != null && (
            <div>
              <span className="text-gray-500">Bills: </span>
              <span className="font-bold">{member.bills_sponsored}</span>
            </div>
          )}
          <span className="ml-auto text-gray-400 group-hover:text-gray-600 transition-colors">
            Full profile →
          </span>
        </div>
      )}
    </Link>
  );
}

export default function LeadershipSpotlight() {
  const houseMajority = leaders.filter(l => l.chamber === "house" && l.category === "majority").sort((a, b) => a.order - b.order);
  const houseMinority = leaders.filter(l => l.chamber === "house" && l.category === "minority").sort((a, b) => a.order - b.order);
  const senateMajority = leaders.filter(l => l.chamber === "senate" && l.category === "majority").sort((a, b) => a.order - b.order);
  const senateMinority = leaders.filter(l => l.chamber === "senate" && l.category === "minority").sort((a, b) => a.order - b.order);

  return (
    <section>
      {/* Section header */}
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
          These are the people setting the legislative agenda for 330 million Americans.
          Who funds them? Who do they really represent? Follow the money.
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
