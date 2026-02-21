"use client";

import Link from "next/link";
import RepresentativeImage from "./RepresentativeImage";
import { CONGRESSIONAL_LEADERSHIP, type LeadershipRole } from "@/lib/leadership";
import { getMember, getMemberFinanceStatic, getMemberAlignment } from "@/lib/data";

interface LeaderCardData extends LeadershipRole {
  partyAlignment?: number;
  alignmentScore?: number;
  totalRaised?: number;
  pacPercentage?: number;
}

function enrichLeader(leader: LeadershipRole): LeaderCardData {
  const member = getMember(leader.bioguide_id);
  const finance = getMemberFinanceStatic(leader.bioguide_id);
  const alignment = getMemberAlignment(leader.bioguide_id);
  
  return {
    ...leader,
    partyAlignment: member?.party_alignment_pct,
    alignmentScore: alignment?.alignment_score,
    totalRaised: finance?.total_raised,
    pacPercentage: finance?.pac_percentage,
  };
}

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

function LeaderCard({ leader }: { leader: LeaderCardData }) {
  const partyColor = leader.party === "R" 
    ? "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20" 
    : "border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20";
  
  const partyBadge = leader.party === "R"
    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";

  const roleBadge = leader.category === "majority"
    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return (
    <Link
      href={`/rep/${leader.bioguide_id}`}
      className={`group block rounded-xl border ${partyColor} p-4 transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      <div className="flex items-start gap-3">
        <RepresentativeImage
          bioguideId={leader.bioguide_id}
          fullName={leader.name}
          party={leader.party}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm group-hover:underline">
              {leader.name}
            </h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${partyBadge}`}>
              {leader.party}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {leader.role}
          </p>
          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded mt-1 font-medium ${roleBadge}`}>
            {leader.category === "majority" ? "MAJORITY" : "MINORITY"}
          </span>
        </div>
      </div>

      {/* Key stats — "show who they actually represent" */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {leader.totalRaised != null && (
          <div className="rounded-lg bg-white/60 dark:bg-gray-900/40 p-1.5">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {formatMoney(leader.totalRaised)}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Raised</p>
          </div>
        )}
        {leader.pacPercentage != null && (
          <div className="rounded-lg bg-white/60 dark:bg-gray-900/40 p-1.5">
            <p className={`text-xs font-bold ${leader.pacPercentage > 50 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}>
              {leader.pacPercentage.toFixed(0)}%
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">PAC $</p>
          </div>
        )}
        {leader.alignmentScore != null && (
          <div className="rounded-lg bg-white/60 dark:bg-gray-900/40 p-1.5">
            <p className={`text-xs font-bold ${leader.alignmentScore < 50 ? "text-red-600 dark:text-red-400" : leader.alignmentScore < 70 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
              {leader.alignmentScore.toFixed(0)}%
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Say vs Do</p>
          </div>
        )}
        {leader.partyAlignment != null && leader.alignmentScore == null && (
          <div className="rounded-lg bg-white/60 dark:bg-gray-900/40 p-1.5">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {leader.partyAlignment.toFixed(0)}%
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Party Line</p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function LeadershipSpotlight() {
  const houseMajority = CONGRESSIONAL_LEADERSHIP
    .filter((l) => l.chamber === "house" && l.category === "majority")
    .sort((a, b) => a.order - b.order)
    .map(enrichLeader);

  const houseMinority = CONGRESSIONAL_LEADERSHIP
    .filter((l) => l.chamber === "house" && l.category === "minority")
    .sort((a, b) => a.order - b.order)
    .map(enrichLeader);

  const senateMajority = CONGRESSIONAL_LEADERSHIP
    .filter((l) => l.chamber === "senate" && l.category === "majority")
    .sort((a, b) => a.order - b.order)
    .map(enrichLeader);

  const senateMinority = CONGRESSIONAL_LEADERSHIP
    .filter((l) => l.chamber === "senate" && l.category === "minority")
    .sort((a, b) => a.order - b.order)
    .map(enrichLeader);

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
          <svg className="w-5 h-5 text-amber-700 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Congressional Leadership
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Who&apos;s calling the shots — and who&apos;s funding them
          </p>
        </div>
      </div>

      {/* House */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 9h20L12 3zM4 9v10M8 9v10M12 9v10M16 9v10M20 9v10M2 19h20" />
          </svg>
          House of Representatives
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 uppercase tracking-wider">
              Republican Majority
            </p>
            <div className="space-y-3">
              {houseMajority.map((l) => (
                <LeaderCard key={l.bioguide_id} leader={l} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">
              Democratic Minority
            </p>
            <div className="space-y-3">
              {houseMinority.map((l) => (
                <LeaderCard key={l.bioguide_id} leader={l} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Senate */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M4 21V10l8-7 8 7v11M9 21v-6h6v6" />
          </svg>
          Senate
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 uppercase tracking-wider">
              Republican Majority
            </p>
            <div className="space-y-3">
              {senateMajority.map((l) => (
                <LeaderCard key={l.bioguide_id} leader={l} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">
              Democratic Minority
            </p>
            <div className="space-y-3">
              {senateMinority.map((l) => (
                <LeaderCard key={l.bioguide_id} leader={l} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
