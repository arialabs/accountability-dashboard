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
// Sourced from leadership-scrutiny.json + leadership-donors.json (FEC data)
// Featured: Tom Emmer — House Majority Whip, top PAC donors are the industries he regulates
// Supporting: John Thune (most caucus breaks) + Katherine Clark (highest PAC%)
const SPOTLIGHT_FEATURED = {
  party: "R" as const,
  name: "Tom Emmer",
  role: "House Majority Whip · MN-6",
  headline: "Raised $6.8M while Banking, Telecom, and Defense PACs dominate his donor list — the same industries his caucus oversees",
  subhead: "FEC records show Emmer's top donors are American Bankers Association, Comcast, and Raytheon PACs. He has voted with his party 100% of the time.",
  stat: "$6.8M",
  statLabel: "Total raised (2024 cycle)",
  statIndicator: "flag" as const,
  statContext: "Flagged: 19.4% PAC-funded",
  tag: "Campaign Finance",
  tagStyle: "stamp-trending" as const,
  editorialMark: "FLAGGED" as const,
  href: "/rep/E000294",
  // Mini bar-chart: top donor sectors (relative to largest)
  barData: [
    { label: "Banking", pct: 100, color: "#B91C1C" },
    { label: "Telecom",  pct: 89,  color: "#D97706" },
    { label: "Defense",  pct: 65,  color: "#64748B" },
    { label: "Alcohol",  pct: 58,  color: "#64748B" },
    { label: "Real Est", pct: 57,  color: "#64748B" },
  ],
};

const SPOTLIGHT_SUPPORTING = [
  {
    party: "R" as const,
    name: "John Thune",
    role: "Senate Majority Leader · SD",
    headline: "Broke from his own party 9 times in 189 votes — more than any other congressional leader in our dataset",
    stat: "9",
    statLabel: "Caucus breaks recorded",
    statIndicator: "flag" as const,
    tag: "Voting Record",
    tagStyle: "stamp-flagged" as const,
    editorialMark: "FLAGGED" as const,
    href: "/rep/T000250",
  },
  {
    party: "D" as const,
    name: "Katherine Clark",
    role: "House Minority Whip · MA-5",
    headline: "40.7% of her $2.7M raised came from PACs — the highest PAC-funded rate among all House and Senate leaders tracked",
    stat: "40.7%",
    statLabel: "PAC-funded share",
    statIndicator: "flag" as const,
    tag: "Campaign Finance",
    tagStyle: "stamp-trending" as const,
    editorialMark: "FLAGGED" as const,
    href: "/rep/C001101",
  },
];

// ── Stats Bar Data ───────────────────────────────────────────────────────────
const SITE_STATS = [
  { value: "535",   label: "Members of Congress tracked", indicator: "neutral" as const, featured: false },
  { value: "26",    label: "Executive branch officials",  indicator: "up" as const,      featured: false, context: "Updated daily" },
  { value: "9",     label: "Supreme Court justices",      indicator: "neutral" as const, featured: false },
  { value: "2.4M+", label: "Votes recorded",             indicator: "up" as const,      featured: true,  context: "Expanding" },
];

const TRUST_SIGNALS = [
  "Official government data only",
  "Methodology fully public",
  "Coverage across all 3 branches",
];

const SEARCH_SHORTCUTS = [
  { href: "/house", label: "Browse House" },
  { href: "/senate", label: "Browse Senate" },
  { href: "/executive", label: "Browse Executive" },
];

const FIND_REP_STEPS = [
  {
    title: "Start with a name, state, or ZIP",
    detail: "Search routes you to matching members and officials across branches.",
  },
  {
    title: "Open the profile",
    detail: "See campaign money, voting behavior, stock trades, and disclosures in one place.",
  },
  {
    title: "Compare claims to actions",
    detail: "Data cards and trend lines show where rhetoric and record diverge.",
  },
];

const DATA_INSIGHTS = [
  {
    title: "Money and donors",
    description: "FEC campaign finance records linked to donor sectors and contribution patterns.",
    metric: "Millions of donations indexed",
  },
  {
    title: "Votes and policy outcomes",
    description: "Congress votes connected to bill topics so users can track consistency over time.",
    metric: "2.4M+ vote records tracked",
  },
  {
    title: "Disclosures and conflicts",
    description: "Financial disclosures and trade filings surfaced alongside committee oversight roles.",
    metric: "Cross-branch conflict signals",
  },
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
      <section className="section-shell hero-surface border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="hero-search-grid">
            <div className="hero-search-panel order-1 md:order-2">
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                Find a representative first
              </span>
              <h2
                className="mt-2 text-3xl md:text-4xl"
                style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
              >
                Search any rep, senator, or official
              </h2>
              <p
                className="mt-3 text-base leading-relaxed"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                Start with a name, state, or ZIP and jump straight to complete accountability records.
              </p>
              <div className="mt-4">
                <RepSearch size="large" placeholder="Search by name, state, or ZIP code" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SEARCH_SHORTCUTS.map((shortcut) => (
                  <Link
                    key={shortcut.href}
                    href={shortcut.href}
                    className="inline-flex items-center rounded-sm border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:border-slate-500"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    {shortcut.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="order-2 md:order-1">
              <div className="mb-4 flex items-center gap-3 md:mb-5">
                <div className="brand-flag-bar" aria-hidden="true" />
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                >
                  Rep Accountability Dashboard
                </span>
              </div>

              <h1
                className="mb-5"
                style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)", fontWeight: 700 }}
              >
                <span className="hero-line-1">They work for you.</span>
                <span className="hero-line-2" style={{ color: "var(--accent)" }}>
                  Prove it.
                </span>
              </h1>

              <p
                className="mb-5 md:mb-6"
                style={{
                  fontFamily: "'Source Sans 3', sans-serif",
                  color: "var(--text-secondary)",
                  fontSize: "1.125rem",
                  lineHeight: 1.65,
                }}
              >
                Follow the money. Expose the votes. Track what politicians say vs what they actually
                do with data from the FEC, Congress.gov, and federal financial disclosures.
              </p>

              <div
                className="mb-6 py-3 section-flag-heading md:mb-8"
                style={{ borderColor: "var(--accent)" }}
              >
                <p
                  className="text-base font-semibold"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
                >
                  Democracy shouldn&apos;t be paywalled.{" "}
                  <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
                    All data sourced from official government records and available free.
                  </span>
                </p>
              </div>

              <div className="hero-trust-grid">
                {TRUST_SIGNALS.map((signal) => (
                  <span key={signal} className="trust-pill">
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
            {FIND_REP_STEPS.map((step, index) => (
              <div key={step.title} className="rounded-md border border-slate-200 bg-white/90 p-4">
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}
                >
                  Step {index + 1}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
                >
                  {step.title}
                </p>
                <p
                  className="mt-1 text-sm leading-relaxed"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                >
                  {step.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200 md:mt-8">
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Live activity snapshot
            </p>
            <HeroSparkline />
          </div>
        </div>
      </section>

      {/* ══ QUICK STATS BAR — AccountabilityDataCards ═════════════════════ */}
      <section className="section-shell-tight bg-slate-900" aria-label="Site statistics">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "#94A3B8" }}
            >
              Coverage at a glance
            </p>
            <Link
              href="/methodology"
              className="text-xs font-semibold uppercase tracking-wide hover:underline"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "#5EEAD4" }}
            >
              Data sources and methods
            </Link>
          </div>
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

      <section className="section-shell border-b border-slate-200" style={{ backgroundColor: "#F8FAFC" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-8 md:space-y-10">
          <ScrollFadeIn className="section-header">
            <div className="brand-flag-bar mb-3" aria-hidden="true" />
            <h2 style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}>
              Data-driven insights
            </h2>
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Each profile combines primary government datasets so users can evaluate behavior, not headlines.
            </p>
          </ScrollFadeIn>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {DATA_INSIGHTS.map((insight, idx) => (
              <ScrollFadeIn key={insight.title} delay={idx * 80}>
                <article className="h-full rounded-md border border-slate-200 bg-white p-5 md:p-6">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}
                  >
                    {insight.metric}
                  </p>
                  <h3
                    className="mt-3 text-xl"
                    style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
                  >
                    {insight.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                  >
                    {insight.description}
                  </p>
                </article>
              </ScrollFadeIn>
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
              The data doesn&apos;t lie.
            </h2>
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Officials with patterns their press releases won&apos;t mention — sourced from FEC records, financial disclosures, and congressional votes.
            </p>
            <Link href="/congress" className="section-cta-link">
              View full watchlist <ArrowRightIcon />
            </Link>
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

                  {/* Subheadline — elevated to editorial pull-quote weight */}
                  <p
                    className="text-lg md:text-xl leading-snug mb-5 font-semibold"
                    style={{
                      fontFamily: "'Newsreader', Georgia, serif",
                      color: "var(--text-primary)",
                      fontStyle: "italic",
                    }}
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
                  <p className="text-xs mb-4">
                    <span className="flag-pin">{SPOTLIGHT_FEATURED.statContext}</span>
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
            <Link href="/about" className="section-cta-link">
              See how coverage works <ArrowRightIcon />
            </Link>
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

                <span className="card-cta">
                  Explore legislative records <ArrowRightIcon />
                </span>

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

                <span className="card-cta">
                  Explore executive records <ArrowRightIcon />
                </span>

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

                <span className="card-cta">
                  Explore judicial records <ArrowRightIcon />
                </span>

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
            <Link href="/deep-dives" className="section-cta-link">
              Browse all investigations <ArrowRightIcon />
            </Link>
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
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="trust-pill">Congress.gov</span>
                <span className="trust-pill">OpenFEC</span>
                <span className="trust-pill">Financial disclosures</span>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-2 flex-shrink-0 sm:flex-row sm:items-center">
              {/* VERIFIED stamp */}
              <span className="stamp-badge stamp-verified self-start">Verified</span>
              <Link
                href="/methodology"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold border border-slate-300 rounded-sm px-4 py-2 hover:border-slate-500 transition-colors"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
              >
                Read our methodology <ArrowRightIcon />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold border border-slate-300 rounded-sm px-4 py-2 hover:border-slate-500 transition-colors"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
              >
                About the project <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
