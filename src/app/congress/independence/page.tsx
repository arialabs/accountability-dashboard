import Link from "next/link";
import type { Metadata } from "next";
import RepresentativeImage from "@/components/RepresentativeImage";
import { getMembers } from "@/lib/data";
import { generateBreadcrumbSchema, structuredDataScript } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Party Independence Tracker | Who Breaks Ranks in Congress?",
  description:
    "See which members of Congress vote against their own party most often — and who votes the party line 100% of the time. Based on key congressional votes from the 119th Congress.",
  openGraph: {
    title: "Party Independence Tracker | Rep Accountability Dashboard",
    description:
      "Which senators and representatives actually vote their conscience — and which are pure party-line votes? Ranked by independence score.",
    type: "website",
  },
};

type MemberWithLoyalty = {
  bioguide_id: string;
  full_name: string;
  party: string;
  state: string;
  district: number | null;
  chamber: string;
  photo_url: string | null;
  party_alignment_pct: number;
  votes_cast: number;
  independence_score: number;
};

function partyLabel(party: string): string {
  if (party === "D") return "Democrat";
  if (party === "R") return "Republican";
  return "Independent";
}

function partyColor(party: string): string {
  if (party === "D") return "var(--democrat)";
  if (party === "R") return "var(--republican)";
  return "var(--independent)";
}

function independenceLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 20)
    return { label: "Highly Independent", color: "#15803D", bg: "#F0FDF4" };
  if (score >= 10)
    return { label: "Somewhat Independent", color: "#B45309", bg: "#FFFBEB" };
  if (score >= 5)
    return { label: "Occasional Dissenter", color: "#1D4ED8", bg: "#EFF6FF" };
  if (score >= 1)
    return { label: "Rarely Breaks Ranks", color: "#6B7280", bg: "#F9FAFB" };
  return { label: "Party-Line Vote", color: "#B91C1C", bg: "#FEF2F2" };
}

const MIN_VOTES = 10; // require at least 10 votes for meaningful loyalty score

export default function IndependencePage() {
  const rawMembers = getMembers();

  // Filter to members with meaningful loyalty data (votes_cast ≥ MIN_VOTES)
  // party_alignment_pct defaults to 0 when no data — exclude those via votes_cast check
  const members: MemberWithLoyalty[] = rawMembers
    .filter((m) => m.votes_cast >= MIN_VOTES)
    .map((m) => ({
      bioguide_id: m.bioguide_id,
      full_name: m.full_name,
      party: m.party,
      state: m.state,
      district: m.district,
      chamber: m.chamber,
      photo_url: m.photo_url,
      party_alignment_pct: m.party_alignment_pct,
      votes_cast: m.votes_cast,
      independence_score: parseFloat((100 - m.party_alignment_pct).toFixed(1)),
    }))
    .sort((a, b) => b.independence_score - a.independence_score);

  const totalTracked = members.length;
  const avgLoyalty =
    members.reduce((sum, m) => sum + m.party_alignment_pct, 0) / members.length;
  const highlyIndependent = members.filter((m) => m.independence_score >= 10).length;
  const purePartyLine = members.filter((m) => m.independence_score === 0).length;

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Congress", url: "/congress" },
    { name: "Independence Tracker", url: "/congress/independence" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={structuredDataScript(breadcrumb)} />
      <main>
        {/* ── Page Header ── */}
        <section
          className="section-shell border-b border-slate-200"
          style={{ backgroundColor: "#FAFAFA" }}
        >
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs mb-6" aria-label="Breadcrumb">
              <Link
                href="/"
                className="hover:underline"
                style={{ color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif" }}
              >
                Home
              </Link>
              <span style={{ color: "var(--text-secondary)" }}>›</span>
              <Link
                href="/congress"
                className="hover:underline"
                style={{ color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif" }}
              >
                Congress
              </Link>
              <span style={{ color: "var(--text-secondary)" }}>›</span>
              <span style={{ color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
                Independence Tracker
              </span>
            </nav>

            <div className="section-header">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
              >
                Legislative Branch · 119th Congress
              </p>
              <h1
                className="text-3xl md:text-4xl font-bold leading-tight mb-3"
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                Party Independence Tracker
              </h1>
              <p
                className="text-base leading-relaxed mb-0"
                style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
              >
                Who votes their conscience — and who follows the party whip? Ranked by how often
                each member breaks from their own party on key votes. Higher score = more
                independent.
              </p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                {
                  value: totalTracked.toString(),
                  label: "Members tracked",
                  sub: `${MIN_VOTES}+ votes minimum`,
                },
                {
                  value: `${avgLoyalty.toFixed(0)}%`,
                  label: "Avg party loyalty",
                  sub: "Across all members",
                },
                {
                  value: highlyIndependent.toString(),
                  label: "Highly independent",
                  sub: "10%+ break rate",
                },
                {
                  value: purePartyLine.toString(),
                  label: "100% party-line",
                  sub: "Zero breaks recorded",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md border border-slate-200 bg-white p-4"
                >
                  <div
                    className="text-2xl font-bold mb-0.5"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "var(--text-primary)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-primary)" }}
                  >
                    {stat.label}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
                  >
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Leaderboard ── */}
        <section className="section-shell">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Most independent top 10 */}
            <div className="mb-12">
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                Most Independent Members
              </h2>
              <p
                className="text-sm mb-6"
                style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
              >
                These members break with their own party most frequently on key votes.
              </p>
              <div className="space-y-3">
                {members.slice(0, 20).map((member, idx) => {
                  const badge = independenceLabel(member.independence_score);
                  const pColor = partyColor(member.party);
                  const chamberLabel =
                    member.chamber === "senate" ? "Senator" : "Rep.";
                  const district =
                    member.chamber === "house" && member.district
                      ? `-${member.district}`
                      : "";

                  return (
                    <Link
                      key={member.bioguide_id}
                      href={`/rep/${member.bioguide_id}`}
                      className="group flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 hover:border-slate-400 hover:shadow-sm transition-all"
                    >
                      {/* Rank */}
                      <div
                        className="w-8 text-center text-sm font-bold flex-shrink-0"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: "var(--text-secondary)",
                        }}
                      >
                        #{idx + 1}
                      </div>

                      {/* Photo */}
                      <RepresentativeImage
                        bioguideId={member.bioguide_id}
                        fullName={member.full_name}
                        party={member.party}
                        photoUrl={member.photo_url}
                        size="sm"
                        className="flex-shrink-0"
                      />

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span
                            className="text-base font-bold group-hover:underline truncate"
                            style={{
                              fontFamily: "'Newsreader', Georgia, serif",
                              color: "var(--text-primary)",
                            }}
                          >
                            {member.full_name}
                          </span>
                          <span
                            className="badge text-xs"
                            style={{
                              color: pColor,
                              backgroundColor: `${pColor}18`,
                              border: `1px solid ${pColor}44`,
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {partyLabel(member.party)}
                          </span>
                        </div>
                        <div
                          className="text-xs"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {chamberLabel} · {member.state}
                          {district} · {member.votes_cast} key votes tracked
                        </div>
                      </div>

                      {/* Independence score */}
                      <div className="flex-shrink-0 text-right">
                        <div
                          className="text-xl font-bold mb-0.5"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: badge.color,
                          }}
                        >
                          {member.independence_score.toFixed(1)}%
                        </div>
                        <div
                          className="text-xs rounded px-2 py-0.5 font-medium"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: badge.color,
                            backgroundColor: badge.bg,
                          }}
                        >
                          {badge.label}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom 10 — most party-line */}
            <div>
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                Most Party-Line Members
              </h2>
              <p
                className="text-sm mb-6"
                style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)" }}
              >
                These members vote with their party 100% of the time on tracked key votes — zero
                independent breaks recorded.
              </p>
              <div className="space-y-3">
                {[...members]
                  .reverse()
                  .slice(0, 10)
                  .map((member, idx) => {
                    const badge = independenceLabel(member.independence_score);
                    const pColor = partyColor(member.party);
                    const chamberLabel =
                      member.chamber === "senate" ? "Senator" : "Rep.";
                    const district =
                      member.chamber === "house" && member.district
                        ? `-${member.district}`
                        : "";

                    return (
                      <Link
                        key={member.bioguide_id}
                        href={`/rep/${member.bioguide_id}`}
                        className="group flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 hover:border-slate-400 hover:shadow-sm transition-all"
                      >
                        {/* Rank indicator */}
                        <div
                          className="w-8 text-center flex-shrink-0"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "var(--text-secondary)",
                            fontSize: "0.7rem",
                          }}
                        >
                          100%
                        </div>

                        {/* Photo */}
                        <RepresentativeImage
                          bioguideId={member.bioguide_id}
                          fullName={member.full_name}
                          party={member.party}
                          photoUrl={member.photo_url}
                          size="sm"
                          className="flex-shrink-0"
                        />

                        {/* Name + meta */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span
                              className="text-base font-bold group-hover:underline truncate"
                              style={{
                                fontFamily: "'Newsreader', Georgia, serif",
                                color: "var(--text-primary)",
                              }}
                            >
                              {member.full_name}
                            </span>
                            <span
                              className="badge text-xs"
                              style={{
                                color: pColor,
                                backgroundColor: `${pColor}18`,
                                border: `1px solid ${pColor}44`,
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {partyLabel(member.party)}
                            </span>
                          </div>
                          <div
                            className="text-xs"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {chamberLabel} · {member.state}
                            {district} · {member.votes_cast} key votes tracked
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex-shrink-0 text-right">
                          <div
                            className="text-xl font-bold mb-0.5"
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              color: badge.color,
                            }}
                          >
                            {member.independence_score.toFixed(1)}%
                          </div>
                          <div
                            className="text-xs rounded px-2 py-0.5 font-medium"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              color: badge.color,
                              backgroundColor: badge.bg,
                            }}
                          >
                            {badge.label}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* Methodology note */}
            <div
              className="mt-12 rounded-md border border-slate-200 bg-slate-50 p-5"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <h3
                className="text-sm font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                📊 How Independence Score is Calculated
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Independence Score = 100% − Party Loyalty %. Party loyalty measures what
                percentage of tracked key votes a member voted in line with their party&apos;s
                majority position. Only members with at least {MIN_VOTES} tracked key votes are
                included. Data sourced from Voteview and Congress.gov for the 119th Congress.
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                <strong>Note:</strong> Independence is not inherently good or bad — a member may
                break with their party to vote more conservatively or more progressively. View
                individual profiles to understand the substance of each break.
              </p>
              <div className="mt-3">
                <Link
                  href="/methodology"
                  className="text-sm font-medium hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Full methodology →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
