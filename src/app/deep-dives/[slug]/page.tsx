import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllDeepDives, getDeepDiveBySlug } from "@/data/deep-dives";
import type { Metadata } from "next";
// Content rendered as paragraphs (no markdown dependency needed)

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getAllDeepDives().map((investigation) => ({
    slug: investigation.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const investigation = getDeepDiveBySlug(params.slug);

  if (!investigation) {
    return {
      title: "Investigation Not Found | Accountability Dashboard",
    };
  }

  return {
    title: `${investigation.title} | Deep Dive Investigations`,
    description: investigation.description,
  };
}

export default function DeepDiveInvestigationPage({ params }: Props) {
  const investigation = getDeepDiveBySlug(params.slug);

  if (!investigation) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link
            href="/deep-dives"
            className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2 transition-colors"
          >
            ← Back to Investigations
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {investigation.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            {investigation.title}
          </h1>
          <p className="text-2xl text-slate-300 mb-6">
            {investigation.subtitle}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <span>📅 {new Date(investigation.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>🕒 {investigation.readTimeMinutes} min read</span>
            {investigation.sources && (
              <span>📚 {investigation.sources.length} sources</span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Summary */}
        <div className="bg-slate-800/30 rounded-xl p-8 mb-12 border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-white mb-4">Executive Summary</h2>
          <div className="text-slate-200 whitespace-pre-line leading-relaxed">
            {investigation.summary}
          </div>
        </div>

        {/* Key Findings */}
        {investigation.keyFindings && investigation.keyFindings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Key Findings</h2>
            <ul className="space-y-4">
              {investigation.keyFindings.map((finding, idx) => (
                <li
                  key={idx}
                  className="bg-slate-800/30 rounded-lg p-6 border-l-4 border-yellow-500 text-slate-200"
                >
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timeline */}
        {investigation.timeline && investigation.timeline.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Timeline</h2>
            <div className="space-y-6">
              {investigation.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        event.importance === "high"
                          ? "bg-red-500"
                          : event.importance === "medium"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                    />
                    {idx < investigation.timeline!.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-700 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="text-sm text-slate-400 mb-1">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-slate-300">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Sections */}
        {investigation.sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-slate-700">
              {section.title}
            </h2>
            <div className="prose prose-invert prose-slate max-w-none">
              {section.content.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="text-slate-200 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        {/* Financial Data */}
        {investigation.financialData && investigation.financialData.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">By the Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investigation.financialData.map((data, idx) => (
                <div
                  key={idx}
                  className={`bg-slate-800/30 rounded-xl p-6 border-l-4 ${
                    data.party === "D"
                      ? "border-blue-500"
                      : data.party === "R"
                      ? "border-red-500"
                      : "border-purple-500"
                  }`}
                >
                  <div className="text-3xl font-bold text-white mb-2">
                    {typeof data.value === "number" && data.value > 1000000
                      ? `$${(data.value / 1000000).toFixed(1)}M`
                      : typeof data.value === "number" && data.value > 1000
                      ? `$${(data.value / 1000).toFixed(0)}K`
                      : typeof data.value === "number" && data.category?.toLowerCase().includes("percentage")
                      ? `${data.value}%`
                      : String(data.value)}
                  </div>
                  <div className="text-sm text-slate-300 font-semibold mb-1">
                    {data.label}
                  </div>
                  {data.category && (
                    <div className="text-xs text-slate-400">{data.category}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individuals Documented */}
        {investigation.individuals && investigation.individuals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Officials Documented</h2>
            <div className="space-y-6">
              {investigation.individuals.map((person, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/30 rounded-xl p-6 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {person.bioguide_id ? (
                          <Link
                            href={`/rep/${person.bioguide_id}`}
                            className="hover:text-blue-400 transition-colors"
                          >
                            {person.name} →
                          </Link>
                        ) : (
                          person.name
                        )}
                      </h3>
                      <p className="text-sm text-slate-400">{person.role}</p>
                    </div>
                    {person.party && (
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          person.party === "D"
                            ? "bg-blue-600"
                            : person.party === "R"
                            ? "bg-red-600"
                            : "bg-purple-600"
                        } text-white`}
                      >
                        {person.party}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200 mb-4">{person.relevance}</p>
                  {person.financialData && person.financialData.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {person.financialData.map((fin, finIdx) => (
                        <div key={finIdx} className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-lg font-bold text-white">
                            {typeof fin.value === 'number'
                              ? (fin.value >= 1000000
                                  ? `$${(fin.value / 1000000).toFixed(1)}M`
                                  : `$${(fin.value / 1000).toFixed(0)}K`)
                              : fin.value}
                          </div>
                          <div className="text-xs text-slate-400">{fin.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {investigation.sources && investigation.sources.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Sources & Citations</h2>
            <div className="space-y-4">
              {investigation.sources.map((source, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/30 rounded-lg p-5 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white flex-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors"
                      >
                        {source.title}
                      </a>
                    </h3>
                    {source.credibility_rating === "high" && (
                      <span className="ml-4 px-2 py-1 bg-green-900/30 text-green-400 text-xs font-semibold rounded border border-green-700">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400 mb-1">
                    {source.publication}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(source.published_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    {" • "}
                    {source.type === "news"
                      ? "News Article"
                      : source.type === "official_report"
                      ? "Official Report"
                      : source.type === "court_doc"
                      ? "Court Document"
                      : source.type === "congressional_record"
                      ? "Congressional Record"
                      : "Filing"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="border-t border-slate-700 pt-8">
          <Link
            href="/deep-dives"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            ← View All Investigations
          </Link>
        </div>
      </div>
    </div>
  );
}
