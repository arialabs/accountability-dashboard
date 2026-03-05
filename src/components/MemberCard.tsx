import Link from "next/link";
import RepresentativeImage from "@/components/RepresentativeImage";
import VotingSparkline from "@/components/VotingSparkline";
import { getMemberFinanceStatic } from "@/lib/data";
import { calculateGrade } from "@/lib/grading";
import type { Member } from "@/lib/types";

interface MemberCardProps {
  member: Member;
  userState: string | null;
  currentStateFilter: string;
}

/** Returns CSS variable name for the party color */
function partyVar(party: string) {
  if (party === "D") return "var(--democrat)";
  if (party === "R") return "var(--republican)";
  return "var(--independent)";
}

function partyLabel(party: string) {
  if (party === "D") return "Democrat";
  if (party === "R") return "Republican";
  return "Independent";
}

const GRADE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: "#F0FDF4", border: "#22C55E", text: "#15803D" },
  B: { bg: "#EFF6FF", border: "#3B82F6", text: "#1D4ED8" },
  C: { bg: "#FEFCE8", border: "#EAB308", text: "#A16207" },
  D: { bg: "#FFF7ED", border: "#F97316", text: "#C2410C" },
  F: { bg: "#FEF2F2", border: "#EF4444", text: "#B91C1C" },
};

export default function MemberCard({ member, userState, currentStateFilter }: MemberCardProps) {
  const finance = getMemberFinanceStatic(member.bioguide_id);
  const grade = calculateGrade({
    pac_percentage: finance?.pac_percentage,
    large_donor_percentage: finance?.large_donor_percentage,
  });
  const isUserRep = userState === member.state;
  const pColor = partyVar(member.party);
  const gs = GRADE_STYLES[grade.letter] ?? GRADE_STYLES.C;

  return (
    <Link
      href={`/rep/${member.bioguide_id}`}
      className="group block rounded-md overflow-hidden spotlight-card doc-corner-fold relative"
      style={{
        border: isUserRep && currentStateFilter === userState
          ? `1px solid #93C5FD`
          : "1px solid #E2E8F0",
        boxShadow: isUserRep && currentStateFilter === userState
          ? "0 0 0 3px #BFDBFE"
          : undefined,
      }}
    >
      {/* Party-colored top accent bar */}
      <div style={{ height: "3px", backgroundColor: pColor, width: "100%" }} />

      {/* Party-colored left flag */}
      <div
        style={{
          position: "absolute",
          top: 3,
          left: 0,
          width: "3px",
          bottom: 0,
          backgroundColor: pColor,
          opacity: 0.35,
        }}
        aria-hidden="true"
      />

      <div className="bg-white p-5">
        {/* "Your Rep" label */}
        {isUserRep && currentStateFilter === userState && (
          <div
            className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--accent)" }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Your Representative
          </div>
        )}

        {/* Header row: photo + name + grade */}
        <div className="flex items-start gap-4 mb-4">
          <RepresentativeImage
            bioguideId={member.bioguide_id}
            fullName={member.full_name}
            party={member.party}
            photoUrl={member.photo_url}
            size="md"
            className="flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-bold leading-tight mb-0.5 truncate group-hover:underline"
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {member.full_name}
            </h3>

            {/* Party + Chamber + State */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span
                className="badge"
                style={{
                  color: pColor,
                  backgroundColor: `${pColor}18`,
                  border: `1px solid ${pColor}44`,
                }}
              >
                {partyLabel(member.party)}
              </span>
              <span className="badge badge-ind" style={{ color: "var(--text-secondary)", background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                {member.chamber === "house" ? "House" : "Senate"}
              </span>
              <span
                className="text-xs"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}
              >
                {member.state}{member.district ? `-${member.district}` : ""}
              </span>
            </div>
          </div>

          {/* Grade badge */}
          <div
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-sm border-2 font-black text-xl"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: gs.bg,
              borderColor: gs.border,
              color: gs.text,
            }}
          >
            {grade.letter}
          </div>
        </div>

        {/* Donor Verdict Badge */}
        {(() => {
          if (!finance) return null;
          const pac = finance.pac_percentage ?? 0;
          const large = finance.large_donor_percentage ?? 0;
          if (pac === 0 && large === 0) return null;

          let label: string;
          let icon: string;
          let bg: string;
          let color: string;
          let border: string;

          if (pac >= 60 || large >= 75) {
            label = "DONOR CAPTURED";
            icon = "🚨";
            bg = "#FEF2F2";
            color = "#B91C1C";
            border = "#EF4444";
          } else if (pac >= 30 || large >= 50) {
            label = "MIXED ALLEGIANCE";
            icon = "⚠️";
            bg = "#FFFBEB";
            color = "#B45309";
            border = "#F59E0B";
          } else {
            label = "CONSTITUENT FOCUSED";
            icon = "✅";
            bg = "#F0FDF4";
            color = "#15803D";
            border = "#22C55E";
          }

          return (
            <div
              className="mb-3 flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider w-fit"
              style={{
                background: bg,
                color,
                border: `1px solid ${border}`,
                fontFamily: "'Source Sans 3', sans-serif",
              }}
              title={`Donor capture assessment based on PAC funding (${pac.toFixed(0)}% PAC) and large-donor reliance (${large.toFixed(0)}% large donors)`}
            >
              <span role="img" aria-label={label}>{icon}</span>
              {label}
            </div>
          );
        })()}

        {/* Grade breakdown bars */}
        <div className="mb-4 space-y-1.5">
          {[
            { label: "Donors", value: grade.breakdown.donorScore, color: "#D97706" },
            { label: "Voting", value: grade.breakdown.votingScore, color: "#0F766E" },
            { label: "Trading", value: grade.breakdown.tradingScore, color: "#7C3AED" },
          ].map((bar) => (
            <div key={bar.label} className="flex items-center gap-2">
              <span
                className="w-14 text-xs flex-shrink-0"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                {bar.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(4, bar.value)}%`, backgroundColor: bar.color }}
                />
              </div>
              <span
                className="w-8 text-right text-xs tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}
              >
                {Math.round(bar.value)}
              </span>
            </div>
          ))}
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Bills", value: member.bills_sponsored },
            { label: "Votes", value: member.votes_cast },
            { label: "Cospon", value: member.bills_cosponsored },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-sm py-2 px-2 text-center"
              style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                {m.label}
              </div>
              <div
                className="text-base font-bold tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}
              >
                {m.value ?? "—"}
              </div>
            </div>
          ))}
        </div>

        {/* Voting trend sparkline */}
        <div className="pt-3 border-t border-slate-100">
          <div
            className="flex items-center justify-between mb-1"
          >
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Voting trend
            </span>
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}
            >
              119th Congress
            </span>
          </div>
          <VotingSparkline
            bioguideId={member.bioguide_id}
            votesCast={member.votes_cast ?? 0}
            party={member.party}
            width={220}
            height={40}
            className="w-full"
          />
        </div>

        {/* CTA */}
        <div
          className="mt-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide group-hover:gap-2 transition-all"
          style={{ fontFamily: "'Source Sans 3', sans-serif", color: pColor }}
        >
          View full profile
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
