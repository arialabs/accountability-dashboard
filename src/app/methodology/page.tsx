import type { Metadata } from "next";
import Link from "next/link";
import DataSourceBadge from "@/components/credibility/DataSourceBadge";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How we calculate alignment scores — our data sources, scoring methodology, and known limitations.",
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link href="/" className="text-blue-300 hover:text-blue-200 text-sm font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Our Methodology
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Full transparency on how we score politicians. Every number on this site
            is traceable to a public data source.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
            <span>Scoring v1.2</span>
            <span>·</span>
            <span>Last updated: February 13, 2026</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="prose prose-slate prose-lg max-w-none">

          {/* Data Sources */}
          <section className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-6">📊 Data Sources</h2>
            <p>Every data point on this site comes from official, public sources:</p>

            <div className="not-prose grid gap-4 mt-6">
              {[
                {
                  source: "congress" as const,
                  name: "Congress.gov API",
                  description: "Official voting records, bill text, roll call votes, and member information. Maintained by the Library of Congress.",
                  url: "https://api.congress.gov",
                },
                {
                  source: "openfec" as const,
                  name: "Federal Election Commission (OpenFEC)",
                  description: "Campaign finance data including donor contributions, PAC funding, and expenditure reports.",
                  url: "https://api.open.fec.gov",
                },
                {
                  source: "ontheissues" as const,
                  name: "OnTheIssues.org",
                  description: "Non-partisan compilation of politicians' stated positions from speeches, interviews, campaign materials, and debate transcripts.",
                  url: "https://www.ontheissues.org",
                },
              ].map((item) => (
                <div key={item.name} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <DataSourceBadge source={item.source} url={item.url} />
                  </div>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Alignment Scoring */}
          <section className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-6">🎯 Alignment Score</h2>

            <p>
              The alignment score measures how often a politician's <strong>votes</strong> match
              their <strong>publicly stated positions</strong>. It's not a measure of whether we
              agree with them — it's a measure of whether <em>they</em> agree with themselves.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">How It Works</h3>

            <ol className="space-y-4">
              <li>
                <strong>Gather stated positions:</strong> We collect public statements from campaign
                materials, interviews, and voting guides (primarily via OnTheIssues.org).
              </li>
              <li>
                <strong>Map to votes:</strong> For each position, we identify related congressional
                votes using bill categorization and keyword matching.
              </li>
              <li>
                <strong>Compare:</strong> Did their vote align with what they said? Each mapped
                vote-to-position pair is scored as aligned or misaligned.
              </li>
              <li>
                <strong>Weight by recency:</strong> Recent votes (last 30 days) get full weight.
                Older votes decay to a minimum of 50% weight after 2 years.
              </li>
              <li>
                <strong>Calculate:</strong> Final score = weighted aligned votes ÷ total weighted votes × 100.
              </li>
            </ol>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Weighted Factors</h3>

            {/* Mobile: Card layout, Desktop: Table */}
            <div className="not-prose bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Factor</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Weight</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-900">Position-to-Vote Alignment</td>
                      <td className="px-4 py-3 text-slate-600">50%</td>
                      <td className="px-4 py-3 text-slate-600">Core metric: do votes match stated positions?</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-900">Voting Consistency</td>
                      <td className="px-4 py-3 text-slate-600">20%</td>
                      <td className="px-4 py-3 text-slate-600">Consistency within policy categories over time</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-900">Campaign Finance Independence</td>
                      <td className="px-4 py-3 text-slate-600">15%</td>
                      <td className="px-4 py-3 text-slate-600">Higher small-donor % = higher score</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-900">Bipartisan Cooperation</td>
                      <td className="px-4 py-3 text-slate-600">15%</td>
                      <td className="px-4 py-3 text-slate-600">Moderate cross-party voting suggests independence</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Card Layout */}
              <div className="md:hidden divide-y divide-slate-200">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Position-to-Vote Alignment</span>
                    <span className="text-lg font-black text-blue-600">50%</span>
                  </div>
                  <p className="text-sm text-slate-600">Core metric: do votes match stated positions?</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Voting Consistency</span>
                    <span className="text-lg font-black text-blue-600">20%</span>
                  </div>
                  <p className="text-sm text-slate-600">Consistency within policy categories over time</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Campaign Finance Independence</span>
                    <span className="text-lg font-black text-blue-600">15%</span>
                  </div>
                  <p className="text-sm text-slate-600">Higher small-donor % = higher score</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Bipartisan Cooperation</span>
                    <span className="text-lg font-black text-blue-600">15%</span>
                  </div>
                  <p className="text-sm text-slate-600">Moderate cross-party voting suggests independence</p>
                </div>
              </div>
            </div>
          </section>

          {/* Confidence Scoring */}
          <section className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-6">🔍 Confidence Levels</h2>

            <p>Not all scores are equally reliable. We show confidence levels so you know when to trust a number:</p>

            <div className="not-prose space-y-3 mt-6">
              {[
                { level: "High", dots: "●●●", color: "bg-emerald-50 border-emerald-200", desc: "15+ mapped votes, recent data, multiple source types" },
                { level: "Medium", dots: "●●○", color: "bg-amber-50 border-amber-200", desc: "5-14 mapped votes, or data older than 6 months" },
                { level: "Low", dots: "●○○", color: "bg-red-50 border-red-200", desc: "3-4 mapped votes, limited position data, or stale sources" },
              ].map((c) => (
                <div key={c.level} className={`rounded-xl border-2 p-4 ${c.color}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-mono">{c.dots}</span>
                    <div>
                      <span className="font-bold text-slate-900">{c.level} Confidence</span>
                      <span className="text-sm text-slate-600 ml-2">— {c.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Plain English Summaries */}
          <section className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-6">📝 Plain English Bill Summaries</h2>

            <p>
              Legislative titles are intentionally confusing. Bills like "A joint resolution providing for
              congressional disapproval under chapter 8 of title 5, United States Code, of the rule
              submitted by the EPA..." are impossible for normal people to understand.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Our Solution</h3>

            <p>
              We translate every bill into plain English. Instead of the legal jargon above,
              you'll see: <strong>"Voted to block EPA environmental regulations."</strong>
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Guidelines</h3>

            <ul className="space-y-3">
              <li>
                <strong>Short:</strong> One sentence, under 20 words
              </li>
              <li>
                <strong>Neutral:</strong> Factual description without partisan spin
              </li>
              <li>
                <strong>Actionable:</strong> Focuses on what the bill actually does, not political theater
              </li>
              <li>
                <strong>Transparent:</strong> Legislative title is always available as expandable detail
              </li>
            </ul>

            <div className="not-prose bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-6">
              <h4 className="font-bold text-blue-900 mb-3">Example Translations</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Legislative Title</p>
                  <p className="text-sm text-slate-600 mb-2">
                    "H.R. 1234: An Act to amend the Internal Revenue Code of 1986 to provide for
                    tax-preferred savings accounts for education expenses..."
                  </p>
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Plain English</p>
                  <p className="text-sm font-medium text-slate-900">
                    "Created tax-free education savings accounts"
                  </p>
                </div>

                <div className="pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Legislative Title</p>
                  <p className="text-sm text-slate-600 mb-2">
                    "S. 567: A bill to provide for reconciliation pursuant to titles II and V of the
                    concurrent resolution on the budget for fiscal year 2026..."
                  </p>
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Plain English</p>
                  <p className="text-sm font-medium text-slate-900">
                    "Raised the debt ceiling through 2026"
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Limitations */}
          <section className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-6">⚠️ Known Limitations</h2>

            <ul className="space-y-3">
              <li><strong>Position data gaps:</strong> Not all politicians have comprehensive position records. Newer members may have fewer data points.</li>
              <li><strong>Vote categorization:</strong> Mapping votes to policy positions involves judgment calls. Bills often span multiple categories.</li>
              <li><strong>Nuance:</strong> A "Nay" vote on a bill doesn't always mean opposition to the bill's goal — it may reflect disagreement with specific provisions or amendments.</li>
              <li><strong>Missing context:</strong> We can't capture behind-the-scenes negotiations, strategic votes, or party-whip dynamics.</li>
              <li><strong>Data freshness:</strong> There may be a 24-48 hour delay between votes and our data update.</li>
            </ul>
          </section>

          {/* Changelog */}
          <section className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-6">📝 Scoring Changelog</h2>

            <div className="not-prose space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold text-slate-900">v1.3</span>
                  <span className="text-xs text-slate-500">February 15, 2026</span>
                </div>
                <p className="text-sm text-slate-600">
                  Added plain English bill summaries for all votes. Added "How is this scored?"
                  tooltips and color legend to all alignment scores. Enhanced misalignment
                  descriptions with plain English explanations.
                </p>
              </div>
              <div className="border-l-4 border-slate-300 pl-4 py-2">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold text-slate-900">v1.2</span>
                  <span className="text-xs text-slate-500">February 13, 2026</span>
                </div>
                <p className="text-sm text-slate-600">
                  Added confidence scoring, data source badges, and this methodology page.
                  Introduced weighted factor breakdown on individual rep pages.
                </p>
              </div>
              <div className="border-l-4 border-slate-300 pl-4 py-2">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold text-slate-900">v1.1</span>
                  <span className="text-xs text-slate-500">January 2026</span>
                </div>
                <p className="text-sm text-slate-600">
                  Added time-decay weighting for votes. Recent votes now count more heavily.
                  Added campaign finance independence factor.
                </p>
              </div>
              <div className="border-l-4 border-slate-300 pl-4 py-2">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold text-slate-900">v1.0</span>
                  <span className="text-xs text-slate-500">December 2025</span>
                </div>
                <p className="text-sm text-slate-600">
                  Initial scoring: simple position-to-vote alignment percentage.
                </p>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-3">Disagree? Help Us Improve.</h2>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
              Our methodology is open source. If you spot an error, have a suggestion,
              or want to contribute, we'd love to hear from you.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="https://github.com/arialabs/accountability-dashboard/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                File an Issue
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
