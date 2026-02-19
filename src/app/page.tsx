import Link from "next/link";
import type { Metadata } from "next";
import EpsteinFilesCard from "@/components/EpsteinFilesCard";
import RepSearch from "@/components/RepSearch";
import { generateGovernmentOrgSchema, generateBreadcrumbSchema, structuredDataScript } from "@/lib/schema";

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
function LegislativeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 9h20L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9v10M8 9v10M12 9v10M16 9v10M20 9v10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 19h20" />
    </svg>
  );
}

function ExecutiveIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M4 21V10l8-7 8 7v11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-6h6v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4" />
    </svg>
  );
}

function JudicialIcon({ className = "w-6 h-6" }: { className?: string }) {
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
const TRENDING_SPOTLIGHT = [
  {
    party: "R",
    name: "Mitch McConnell",
    role: "Senator · Kentucky",
    headline: "Received $21.3M from financial sector PACs over career while opposing banking regulations",
    stat: "$21.3M",
    statLabel: "Financial sector PACs",
    tag: "Campaign Finance",
    tagColor: "amber",
    href: "/rep/M000355",
  },
  {
    party: "D",
    name: "Nancy Pelosi",
    role: "Representative · CA-11",
    headline: "Stock portfolio returned 65% in 2023 — outperforming 99% of hedge fund managers",
    stat: "65%",
    statLabel: "Portfolio return 2023",
    tag: "Financial Disclosure",
    tagColor: "teal",
    href: "/rep/P000197",
  },
  {
    party: "R",
    name: "Ted Cruz",
    role: "Senator · Texas",
    headline: "Voted against 87% of climate bills despite representing state with largest renewable energy sector",
    stat: "87%",
    statLabel: "Climate bills opposed",
    tag: "Voting Record",
    tagColor: "red",
    href: "/rep/C001098",
  },
];

// ── Stats Bar Data ───────────────────────────────────────────────────────────
const SITE_STATS = [
  { value: "535", label: "Members of Congress tracked" },
  { value: "26", label: "Executive branch officials" },
  { value: "9", label: "Supreme Court justices" },
  { value: "2.4M+", label: "Votes recorded" },
];

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

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-2">
            <div className="h-0.5 w-8 bg-slate-900" />
            <span
              className="text-xs font-semibold uppercase tracking-widest text-slate-500"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Rep Accountability Dashboard
            </span>
          </div>

          {/* Headline — Newsreader serif for journalistic authority */}
          <h1
            className="mb-4 text-4xl sm:text-5xl md:text-6xl leading-tight"
            style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)", fontWeight: 700 }}
          >
            <span>Accountability</span>
            <span className="block" style={{ color: "var(--accent)" }}>
              Dashboard
            </span>
          </h1>

          <p
            className="mb-8 text-lg md:text-xl max-w-2xl"
            style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)", lineHeight: 1.6 }}
          >
            Follow the money. Expose the votes. Track what politicians say vs what they actually do — using data directly from the FEC, Congress.gov, and federal financial disclosures.
          </p>

          {/* Search bar — primary action */}
          <RepSearch size="large" placeholder="Search by name, state, or ZIP code" />

          <p
            className="mt-3 text-sm"
            style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
          >
            Browse by branch below, or search directly for a representative, senator, or official.
          </p>
        </div>
      </section>

      {/* ── QUICK STATS BAR ──────────────────────────────────────────── */}
      <section className="bg-slate-900 py-5" aria-label="Site statistics">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {SITE_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-2xl md:text-3xl font-bold mb-0.5"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#5EEAD4", // teal-300
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs uppercase tracking-wide"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "#94A3B8" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING SPOTLIGHT ───────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* Section header — journalism style */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span
                className="text-xs font-semibold uppercase tracking-widest px-2"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                Trending
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <h2
              className="text-2xl md:text-3xl font-semibold text-center"
              style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
            >
              Reps in the data spotlight
            </h2>
            <p
              className="text-center mt-1 text-sm"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Officials with notable data patterns this cycle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TRENDING_SPOTLIGHT.map((item) => {
              const partyColor = item.party === "D" ? "var(--democrat)" : item.party === "R" ? "var(--republican)" : "var(--independent)";
              const partyLabel = item.party === "D" ? "Democrat" : item.party === "R" ? "Republican" : "Independent";
              const tagBg = item.tagColor === "amber" ? "#FEF3C7" : item.tagColor === "teal" ? "#CCFBF1" : "#FEE2E2";
              const tagFg = item.tagColor === "amber" ? "#92400E" : item.tagColor === "teal" ? "#134E4A" : "#991B1B";

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group block border border-slate-200 rounded-lg p-6 hover:border-slate-400 transition-all duration-200 bg-white hover:shadow-md"
                >
                  {/* Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded"
                      style={{ fontFamily: "'Source Sans 3', sans-serif", backgroundColor: tagBg, color: tagFg }}
                    >
                      {item.tag}
                    </span>
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ fontFamily: "'Source Sans 3', sans-serif", color: partyColor }}
                    >
                      {partyLabel}
                    </span>
                  </div>

                  {/* Name */}
                  <h3
                    className="text-lg font-semibold mb-0.5 group-hover:underline"
                    style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
                  >
                    {item.name}
                  </h3>
                  <p
                    className="text-xs mb-3"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                  >
                    {item.role}
                  </p>

                  {/* Stat highlight */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span
                      className="text-3xl font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}
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

                  {/* Narrative */}
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                  >
                    {item.headline}
                  </p>

                  <div
                    className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--accent)" }}
                  >
                    View full profile <ArrowRightIcon className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BRANCH NAVIGATION ────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-0.5 w-8 bg-slate-900 mb-2" />
            <h2
              className="text-2xl md:text-3xl font-semibold"
              style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
            >
              Browse by branch
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Accountability data across the entire federal government
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Legislative */}
            <Link
              href="/congress"
              className="group flex flex-col bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <LegislativeIcon className="w-5 h-5" />
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>

              <h3
                className="text-xl font-semibold mb-1"
                style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
              >
                Legislative
              </h3>
              <p
                className="text-sm mb-4 flex-1"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                Congress makes the laws. Track voting records, campaign finance, and donor influence for all 535 members.
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
                <div className="text-slate-200 self-center">|</div>
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

            {/* Executive */}
            <Link
              href="/executive"
              className="group flex flex-col bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <ExecutiveIcon className="w-5 h-5" />
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>

              <h3
                className="text-xl font-semibold mb-1"
                style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
              >
                Executive
              </h3>
              <p
                className="text-sm mb-4 flex-1"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                The President and federal agencies. Cabinet appointments, executive orders, and conflict of interest disclosures.
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

            {/* Judicial */}
            <Link
              href="/judicial"
              className="group flex flex-col bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <JudicialIcon className="w-5 h-5" />
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>

              <h3
                className="text-xl font-semibold mb-1"
                style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
              >
                Judicial
              </h3>
              <p
                className="text-sm mb-4 flex-1"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                The Supreme Court and federal judges. Financial disclosures, case history, and recusal records.
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
          </div>
        </div>
      </section>

      {/* ── DEEP DIVES ───────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-0.5 w-8 bg-slate-900 mb-2" />
            <h2
              className="text-2xl md:text-3xl font-semibold"
              style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)" }}
            >
              Deep Dives
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              In-depth investigations into major scandals and political corruption cases.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
            <EpsteinFilesCard variant="full" />
          </div>
        </div>
      </section>

      {/* ── DATA METHODOLOGY FOOTER NOTE ─────────────────────────────── */}
      <section className="py-10 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
            <div className="flex-1">
              <p
                className="text-sm font-semibold mb-1"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
              >
                Where does this data come from?
              </p>
              <p
                className="text-sm"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                All data is sourced directly from official government records: the Federal Election Commission (FEC),
                Congress.gov, Voteview, and required financial disclosures. We don&apos;t editorialize — we show you the numbers.
              </p>
            </div>
            <Link
              href="/methodology"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-semibold border border-slate-300 rounded px-4 py-2 hover:border-slate-500 transition-colors"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
            >
              Read our methodology <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
