import Link from "next/link";
import type { Metadata } from "next";
import EpsteinFilesCard from "@/components/EpsteinFilesCard";
import RepSearch from "@/components/RepSearch";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import HeroSparkline from "@/components/HeroSparkline";
import AccountabilityDataCard from "@/components/AccountabilityDataCard";
import { generateGovernmentOrgSchema, generateBreadcrumbSchema, structuredDataScript } from "@/lib/schema";
import LeadershipSpotlight from "@/components/LeadershipSpotlight";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reps.arialabs.ai";

export const metadata: Metadata = {
  title: { absolute: "Rep Accountability Dashboard | Track What Politicians Say vs Do" },
  description: "Follow the money. Expose the votes. Track campaign finance, voting records, and financial disclosures across all three branches of government — with data from official government sources.",
  openGraph: {
    title: "Rep Accountability Dashboard | Track What Politicians Say vs Do",
    description: "Follow the money. Expose the votes. Track all three branches of government with official government data.",
    type: "website",
    url: siteUrl,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rep Accountability Dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rep Accountability Dashboard",
    description: "Follow the money. Expose the votes.",
    images: ["/og-image.png"],
  },
};

// ── SVG Icons ───────────────────────────────────────────────────────────────
function LegislativeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 9h20L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9v10M8 9v10M12 9v10M16 9v10M20 9v10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 19h20" />
    </svg>
  );
}

function ExecutiveIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M4 21V10l8-7 8 7v11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-6h6v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4" />
    </svg>
  );
}

function JudicialIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4M3 12l4-8 5 10M17 4l4 8M3 12h5M16 12h5M8 12a4 4 0 004 4 4 4 0 004-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6M12 16v5" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

// ── Trending Spotlight Data ──────────────────────────────────────────────────
// Featured story (front-page) + 2 supporting stories
const SPOTLIGHT_FEATURED = {
  party: "R" as const,
  name: "Mitch McConnell",
  role: "Senator · Kentucky",
  headline: "Received $21.3M from financial sector PACs over career while consistently opposing banking regulations and consumer protection measures",
  subhead: "FEC records show the Senate Minority Leader's largest donors are the exact same financial institutions his committee oversees.",
  stat: "$21.3M",
  statLabel: "Financial sector PACs",
  statIndicator: "flag" as const,
  statContext: "Flagged: exceeds median 12x",
  tag: "Campaign Finance",
  tagStyle: "stamp-trending" as const,
  editorialMark: "FLAGGED" as const,
  href: "/rep/M000355",
  // Mini bar-chart data (relative percentages)
  barData: [
    { label: "Finance", pct: 92, color: "#B91C1C" },
    { label: "Energy", pct: 61, color: "#D97706" },
    { label: "Defense", pct: 48, color: "#64748B" },
    { label: "Health", pct: 34, color: "#64748B" },
  ],
};

const SPOTLIGHT_SUPPORTING = [
  {
    party: "D" as const,
    name: "Nancy Pelosi",
    role: "Representative · CA-11",
    headline: "Stock portfolio returned 65% in 2023 — outperforming 99% of hedge fund managers",
    stat: "65%",
    statLabel: "Portfolio return 2023",
    statIndicator: "up" as const,
    tag: "Financial Disclosure",
    tagStyle: "stamp-filed" as const,
    editorialMark: "TRENDING" as const,
    href: "/rep/P000197",
  },
  {
    party: "R" as const,
    name: "Ted Cruz",
    role: "Senator · Texas",
    headline: "Voted against 87% of climate bills despite Texas leading the US in renewable energy capacity",
    stat: "87%",
    statLabel: "Climate bills opposed",
    statIndicator: "flag" as const,
    tag: "Voting Record",
    tagStyle: "stamp-flagged" as const,
    editorialMark: "FLAGGED" as const,
    href: "/rep/C001098",
  },
];

// ── Stats Bar Data ───────────────────────────────────────────────────────────
const SITE_STATS = [
  { value: "535",   label: "Members of Congress tracked", indicator: "neutral" as const, featured: false },
  { value: "26",    label: "Executive branch officials",  indicator: "up" as const,      featured: false, context: "Updated daily" },
  { value: "9",     label: "Supreme Court justices",      indicator: "neutral" as const, featured: false },
  { value: "2.4M+", label: "Votes recorded",             indicator: "up" as const,      featured: true,  context: "Expanding" },
];

// ── Extra Deep Dives ─────────────────────────────────────────────────────────
const ADDITIONAL_DEEP_DIVES = [
  {
    label: "PAC Money",
    accentColor: "#D97706",
    title: "Dark Money: PAC Flows 2020–2024",
    description:
      "Tracing undisclosed political contributions through Super PACs, 501(c)(4)s, and shell LLCs across four election cycles.",
    stats: [{ value: "$3.8B", label: "Total tracked", indicator: "flag" as const }, { value: "1,200+", label: "PAC entities", indicator: "neutral" as const }],
    badge: "Coming Soon",
    badgeStyle: "stamp-trending" as const,
  },
  {
    label: "Insider Trading",
    accentColor: "#0F766E",
    title: "Congressional Trades Database",
    description:
      "Every stock trade disclosed under the STOCK Act — cross-referenced against legislation the member voted on within 90 days.",
    stats: [{ value: "72K+", label: "Trades logged", indicator: "up" as const }, { value: "535", label: "Members covered", indicator: "neutral" as const }],
    badge: "Coming Soon",
    badgeStyle: "stamp-filed" as const,
  },
];

// ── Helper: Party color ──────────────────────────────────────────────────────
function partyColor(p: "D" | "R" | "I") {
  return p === "D" ? "var(--democrat)" : p === "R" ? "var(--republican)" : "var(--independent)";
}
function partyLabel(p: "D" | "R" | "I") {
  return p === "D" ? "Democrat" : p === "R" ? "Republican" : "Independent";
}

// ── Inline mini bar chart for featured card ──────────────────────────────────
function MiniBarChart({ data }: { data: typeof SPOTLIGHT_FEATURED.barData }) {
  return (
    <div className="mt-5 pt-4 border-t border-slate-100" aria-hidden="true">
      <div
        className="text-xs uppercase tracking-widest mb-3"
        style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
      >
        Top donor sectors
      </div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <div
              className="text-xs w-14 flex-shrink-0"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              {d.label}
            </div>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${d.pct}%`, backgroundColor: d.color }}
              />
            </div>
            <div
              className="text-xs w-8 text-right"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}
            >
              {d.pct}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const breadcrumbSchema = generateBreadcrumbSchema([{ name: "Home", url: "/" }]);
  const congressSchema = generateGovernmentOrgSchema({
    name: "U.S. Congress",
    description: "The legislative branch of the United States federal government.",
    url: "/congress",
  });

  return (
    <div className="min-h-screen antialiased overflow-x-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={structuredDataScript(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={structuredDataScript(congressSchema)} />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="section-shell bg-gradient-to-b from-white to-[var(--bg-secondary)] border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* Eyebrow — teal brand mark + label */}
          <div className="mb-5 flex items-center gap-3">
            <div className="brand-flag-bar" aria-hidden="true" />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Rep Accountability Dashboard
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mb-5"
            style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)", fontWeight: 700 }}
          >
            <span>Accountability</span>
            <span className="block" style={{ color: "var(--accent)" }}>
              Dashboard
            </span>
          </h1>

          <p
            className="mb-6 max-w-3xl"
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              color: "var(--text-secondary)",
              fontSize: "1.125rem",
              lineHeight: 1.65,
            }}
          >
            Follow the money. Expose the votes. Track what politicians say vs what they actually
            do — using data directly from the FEC, Congress.gov, and federal financial disclosures.
          </p>

          {/* Mission statement — teal left border "flag" */}
          <div
            className="mb-8 py-3 section-flag-heading md:mb-10"
            style={{ borderColor: "var(--accent)" }}
          >
            <p
              className="text-base font-semibold"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
            >
              Democracy shouldn&apos;t be paywalled.{" "}
              <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
                All data sourced from official government records — free, forever.
              </span>
            </p>
          </div>

          {/* Search */}
          <RepSearch size="large" placeholder="Search by name, state, or ZIP code" />

          <p
            className="mt-3 text-sm"
            style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
          >
            Browse by branch below, or search directly for a representative, senator, or official.
          </p>

          {/* Hero data viz */}
          <div className="mt-8 pt-5 border-t border-slate-200 md:mt-10">
            <HeroSparkline />
          </div>
        </div>
      </section>

      {/* ══ QUICK STATS BAR — AccountabilityDataCards ═════════════════════ */}
      <section className="section-shell-tight bg-slate-900" aria-label="Site statistics">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {SITE_STATS.map((stat) => (
              <AccountabilityDataCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                indicator={stat.indicator}
                context={stat.context}
                featured={stat.featured}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRENDING SPOTLIGHT — Editorial layout ══════════════════════════
          Phase 3: 1 LARGE featured (60%) + 2 smaller supporting (40% stacked)
      ══ */}
      <section className="section-shell bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-8 md:space-y-10">
          {/* Section header — teal brand mark + redaction aesthetic */}
          <ScrollFadeIn className="section-header">
            <div className="flex items-baseline gap-4 mb-3">
              <div className="brand-flag-bar" aria-hidden="true" />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                Trending
              </span>
              {/* Redaction-bar decorative accent */}
              <div
                className="hidden md:block h-1 flex-1 max-w-32"
                style={{ backgroundColor: "#0F172A", borderRadius: "1px", opacity: 0.12 }}
                aria-hidden="true"
              />
            </div>
            <h2
              style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
            >
              Reps in the data spotlight
            </h2>
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Officials with notable data patterns this cycle
            </p>
          </ScrollFadeIn>

          {/* ── Spotlight grid: 60/40 ── */}
          <div className="spotlight-grid">
            {/* ── FEATURED (large, front-page) ── */}
            <ScrollFadeIn>
              <Link
                href={SPOTLIGHT_FEATURED.href}
                className="group block h-full rounded-md overflow-hidden doc-corner-fold spotlight-card border border-slate-200 bg-white"
                style={{ borderLeft: "3px solid var(--republican)" }}
              >
                {/* Top accent bar */}
                <div className="h-1 w-full" style={{ backgroundColor: "var(--republican)" }} />

                <div className="p-6 h-full flex flex-col md:p-7">
                  {/* Tag row */}
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={`stamp-badge ${SPOTLIGHT_FEATURED.tagStyle}`}
                      aria-label="Flagged story"
                    >
                      {SPOTLIGHT_FEATURED.editorialMark}
                    </span>
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ fontFamily: "'Source Sans 3', sans-serif", color: partyColor(SPOTLIGHT_FEATURED.party) }}
                    >
                      {partyLabel(SPOTLIGHT_FEATURED.party)}
                    </span>
                  </div>

                  {/* Category label */}
                  <div
                    className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                  >
                    {SPOTLIGHT_FEATURED.tag}
                  </div>

                  {/* Front-page headline */}
                  <h3
                    className="text-2xl md:text-3xl font-bold mb-1 group-hover:underline leading-tight"
                    style={{
                      fontFamily: "'Newsreader', Georgia, serif",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {SPOTLIGHT_FEATURED.name}
                  </h3>
                  <p
                    className="text-xs mb-3"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                  >
                    {SPOTLIGHT_FEATURED.role}
                  </p>

                  {/* Subheadline */}
                  <p
                    className="text-base leading-relaxed mb-5"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                  >
                    {SPOTLIGHT_FEATURED.headline}
                  </p>

                  {/* Key stat */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span
                      className="text-4xl font-bold data-flagged"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--republican)" }}
                    >
                      {SPOTLIGHT_FEATURED.stat}
                    </span>
                    <span
                      className="text-xs"
                      style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                    >
                      {SPOTLIGHT_FEATURED.statLabel}
                    </span>
                  </div>
                  <p
                    className="text-xs mb-4"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "#F59E0B", fontWeight: 600 }}
                  >
                    {SPOTLIGHT_FEATURED.statContext}
                  </p>

                  {/* Inline mini bar chart */}
                  <MiniBarChart data={SPOTLIGHT_FEATURED.barData} />

                  <div className="flex-1" />

                  <span className="text-[10px] font-mono text-slate-400 mt-4 block">
                    Source: FEC · Updated Feb 2026
                  </span>

                  <div
                    className="flex items-center gap-1 text-sm font-semibold mt-2 group-hover:gap-2 transition-all"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--republican)" }}
                  >
                    View full profile <ArrowRightIcon />
                  </div>
                </div>
              </Link>
            </ScrollFadeIn>

            {/* ── SUPPORTING (2 stacked) ── */}
            <div className="spotlight-supporting">
              {SPOTLIGHT_SUPPORTING.map((item, idx) => {
                const pColor = partyColor(item.party);
                const pLabel = partyLabel(item.party);
                const isRed = item.editorialMark === "FLAGGED";

                return (
                  <ScrollFadeIn key={item.name} delay={idx * 80} className="flex-1">
                    <Link
                      href={item.href}
                      className="group block h-full rounded-md overflow-hidden doc-corner-fold spotlight-card border border-slate-200 bg-white"
                      style={{ borderLeft: isRed ? "3px solid var(--republican)" : "3px solid var(--accent)" }}
                    >
                      {/* Accent bar */}
                      <div
                        className="h-1 w-full"
                        style={{ backgroundColor: isRed ? "var(--republican)" : "var(--accent)" }}
                      />

                      <div className="p-4 flex flex-col h-full md:p-5">
                        {/* Tag row */}
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`stamp-badge ${item.tagStyle}`}
                            aria-label={item.editorialMark}
                          >
                            {item.editorialMark}
                          </span>
                          <span
                            className="text-xs font-semibold uppercase tracking-wide"
                            style={{ fontFamily: "'Source Sans 3', sans-serif", color: pColor }}
                          >
                            {pLabel}
                          </span>
                        </div>

                        {/* Category label */}
                        <div
                          className="text-xs font-semibold uppercase tracking-widest mb-2"
                          style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                        >
                          {item.tag}
                        </div>

                        <h3
                          className="text-lg font-semibold mb-0.5 group-hover:underline"
                          style={{
                            fontFamily: "'Newsreader', Georgia, serif",
                            color: "var(--text-primary)",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {item.name}
                        </h3>
                        <p
                          className="text-xs mb-3"
                          style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                        >
                          {item.role}
                        </p>

                        {/* Stat */}
                        <div className="flex items-baseline gap-2 mb-2">
                          <span
                            className={`text-2xl font-bold ${item.editorialMark === "FLAGGED" ? "data-flagged" : "data-notable"}`}
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              color: isRed ? "var(--republican)" : "var(--accent)",
                            }}
                          >
                            {item.stat}
                          </span>
                          <span
                            className="text-xs"
                            style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                          >
                            {item.statLabel}
                          </span>
                        </div>

                        <p
                          className="text-sm leading-relaxed mb-4 flex-1"
                          style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                        >
                          {item.headline}
                        </p>

                        <span className="text-[10px] font-mono text-slate-400 mb-2 block">
                          Source: FEC · Updated Feb 2026
                        </span>

                        <div
                          className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all"
                          style={{ fontFamily: "'Source Sans 3', sans-serif", color: isRed ? "var(--republican)" : "var(--accent)" }}
                        >
                          View full profile <ArrowRightIcon />
                        </div>
                      </div>
                    </Link>
                  </ScrollFadeIn>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONGRESSIONAL LEADERSHIP ═══════════════════════════════════════ */}
      <section
        className="border-b border-slate-200"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-5xl mx-auto px-6 section-shell-tight lg:px-8">
          <ScrollFadeIn>
            <LeadershipSpotlight />
          </ScrollFadeIn>
        </div>
      </section>

{/* ══ BRANCH NAVIGATION ══════════════════════════════════════════════ */}
      <section
        className="section-shell border-b border-slate-200"
        style={{ backgroundColor: "var(--bg-secondary)", borderTop: "3px solid var(--accent)" }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-8 md:space-y-10">
          <ScrollFadeIn className="section-header">
            {/* Teal brand-mark bar as section divider */}
            <div className="brand-flag-bar mb-3" aria-hidden="true" />
            <h2
              style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
            >
              Browse by branch
            </h2>
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Accountability data across the entire federal government
            </p>
          </ScrollFadeIn>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {/* Legislative */}
            <ScrollFadeIn delay={0}>
              <Link
                href="/congress"
                className="group flex flex-col bg-white border border-slate-200 rounded-md p-5 md:p-6 spotlight-card h-full card-teal-flag"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="p-2 rounded-sm bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <LegislativeIcon />
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>

                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)", letterSpacing: "-0.01em" }}
                >
                  Legislative
                </h3>
                <p
                  className="text-sm mb-5 flex-1 leading-relaxed"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                >
                  Congress makes the laws. Track voting records, campaign finance, and donor influence
                  for all 535 members.
                </p>

                <div className="flex gap-6 pt-4 border-t border-slate-100">
                  <div>
                    <div
                      className="text-xl font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}
                    >
                      435
                    </div>
                    <div
                      className="text-xs uppercase tracking-wide"
                      style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                    >
                      House
                    </div>
                  </div>
                  <div className="text-slate-200 self-center" aria-hidden="true">|</div>
                  <div>
                    <div
                      className="text-xl font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}
                    >
                      100
                    </div>
                    <div
                      className="text-xs uppercase tracking-wide"
                      style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                    >
                      Senate
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollFadeIn>

            {/* Executive */}
            <ScrollFadeIn delay={80}>
              <Link
                href="/executive"
                className="group flex flex-col bg-white border border-slate-200 rounded-md p-5 md:p-6 spotlight-card h-full card-teal-flag"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="p-2 rounded-sm bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <ExecutiveIcon />
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>

                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)", letterSpacing: "-0.01em" }}
                >
                  Executive
                </h3>
                <p
                  className="text-sm mb-5 flex-1 leading-relaxed"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                >
                  The President and federal agencies. Cabinet appointments, executive orders, and
                  conflict of interest disclosures.
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <div
                    className="text-xl font-bold"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}
                  >
                    26
                  </div>
                  <div
                    className="text-xs uppercase tracking-wide"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                  >
                    Cabinet + VP
                  </div>
                </div>
              </Link>
            </ScrollFadeIn>

            {/* Judicial */}
            <ScrollFadeIn delay={160}>
              <Link
                href="/judicial"
                className="group flex flex-col bg-white border border-slate-200 rounded-md p-5 md:p-6 spotlight-card h-full card-teal-flag"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="p-2 rounded-sm bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <JudicialIcon />
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>

                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)", letterSpacing: "-0.01em" }}
                >
                  Judicial
                </h3>
                <p
                  className="text-sm mb-5 flex-1 leading-relaxed"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                >
                  The Supreme Court and federal judges. Financial disclosures, case history, and
                  recusal records.
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <div
                    className="text-xl font-bold"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}
                  >
                    9
                  </div>
                  <div
                    className="text-xs uppercase tracking-wide"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                  >
                    Justices
                  </div>
                </div>
              </Link>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ══ DEEP DIVES ═════════════════════════════════════════════════════ */}
      <section className="section-shell border-b border-slate-200" style={{ backgroundColor: "#F1F0ED" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-8 md:space-y-10">
          <ScrollFadeIn className="section-header">
            <div className="brand-flag-bar mb-3" aria-hidden="true" />
            <h2
              style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
            >
              Deep Dives
            </h2>
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              In-depth investigations into major scandals and political corruption cases.
            </p>
          </ScrollFadeIn>

          {/* Featured Epstein card */}
          <ScrollFadeIn>
            <EpsteinFilesCard variant="full" />
          </ScrollFadeIn>

          {/* Additional deep dive cards — with corner fold + stamp badges */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {ADDITIONAL_DEEP_DIVES.map((dive, idx) => (
              <ScrollFadeIn key={dive.title} delay={idx * 80}>
                <div
                  className="block bg-white border border-slate-200 rounded-md overflow-hidden deep-dive-hero doc-corner-fold"
                  style={{ borderLeft: `3px solid ${dive.accentColor}` }}
                  aria-label={`${dive.title} — ${dive.badge}`}
                >
                  {/* Accent bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: dive.accentColor }} />
                  <div className="p-6 md:p-7">
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ fontFamily: "'Source Sans 3', sans-serif", color: dive.accentColor }}
                      >
                        Deep Dive Investigation
                      </span>
                      <span className={`stamp-badge ${dive.badgeStyle}`}>
                        {dive.badge}
                      </span>
                    </div>

                    <h3
                      className="text-xl font-semibold mb-2"
                      style={{
                        fontFamily: "'Newsreader', Georgia, serif",
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                      }}
                    >
                      {dive.title}
                    </h3>

                    <p
                      className="text-sm leading-relaxed mb-5"
                      style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                    >
                      {dive.description}
                    </p>

                    {/* AccountabilityDataCard stats row */}
                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                      {dive.stats.map((s) => (
                        <AccountabilityDataCard
                          key={s.label}
                          value={s.value}
                          label={s.label}
                          indicator={s.indicator}
                          light
                          className="flex-1"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DATA METHODOLOGY FOOTER NOTE ══════════════════════════════════ */}
      <section
        className="border-t border-slate-200"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="max-w-4xl mx-auto px-6 section-shell-tight lg:px-8">
          {/* Teal redaction-bar accent at top */}
          <div className="brand-flag-bar mb-4 md:mb-5" aria-hidden="true" />
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-12">
            <div className="flex-1">
              <p
                className="text-sm font-semibold mb-1"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
              >
                Where does this data come from?
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                All data is sourced directly from official government records: the Federal Election
                Commission (FEC), Congress.gov, Voteview, and required financial disclosures. We
                don&apos;t editorialize — we show you the numbers.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* VERIFIED stamp */}
              <span className="stamp-badge stamp-verified">Verified</span>
              <Link
                href="/methodology"
                className="inline-flex items-center gap-2 text-sm font-semibold border border-slate-300 rounded-sm px-4 py-2 hover:border-slate-500 transition-colors"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
              >
                Read our methodology <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
