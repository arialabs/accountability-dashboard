import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllDeepDives, getDeepDiveBySlug } from "@/lib/data";
import type { DeepDive } from "@/lib/types";

export async function generateStaticParams() {
  const deepDives = getAllDeepDives();
  return deepDives.map((dive) => ({
    slug: dive.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dive = getDeepDiveBySlug(slug);
  
  if (!dive) {
    return {
      title: "Investigation Not Found",
    };
  }
  
  return {
    title: `${dive.title} | Investigations`,
    description: dive.subtitle,
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getPartyColor(party: string): string {
  const colors: Record<string, string> = {
    D: "text-blue-600",
    R: "text-red-600",
    I: "text-purple-600",
  };
  return colors[party] || "text-slate-600";
}

export default async function DeepDivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dive = getDeepDiveBySlug(slug);

  if (!dive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <Link 
            href="/investigations"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
          >
            ← Back to Investigations
          </Link>
          
          {/* Category Badge */}
          <div className="mb-4">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold uppercase">
              {dive.category.replace(/_/g, " ")}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
            {dive.title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-600 mb-6 leading-relaxed">
            {dive.subtitle}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span>{formatDate(dive.publishedDate)}</span>
            <span>•</span>
            <span>{dive.readTime} read</span>
            <span>•</span>
            <span>{dive.sources.length} sources</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Summary */}
        <div className="bg-slate-50 border-l-4 border-blue-600 p-6 md:p-8 mb-12 rounded-r-xl">
          <h2 className="text-lg font-black text-slate-900 mb-3 uppercase">
            Executive Summary
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            {dive.summary}
          </p>
        </div>

        {/* Key Figures */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
            Key Figures
          </h2>
          <div className="space-y-4">
            {dive.keyFigures.map((figure, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className={`text-xl font-black ${getPartyColor(figure.party)}`}>
                    {figure.name}
                  </h3>
                  <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold">
                    {figure.party}
                  </span>
                </div>
                <p className="text-slate-600 font-semibold mb-2">
                  {figure.role}
                </p>
                <p className="text-slate-700 leading-relaxed">
                  {figure.involvement}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
            Timeline
          </h2>
          <div className="relative border-l-4 border-blue-600 pl-8 space-y-8">
            {dive.timeline.map((event, idx) => (
              <div key={idx} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[42px] w-6 h-6 bg-blue-600 rounded-full border-4 border-white" />
                
                <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                  <div className="text-sm font-bold text-blue-600 mb-2">
                    {event.date}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">
                    {event.event}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg prose-slate max-w-none mb-12">
          {dive.content.map((section, idx) => (
            <div key={idx} className="mb-10">
              {section.type === "section" && (
                <>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 mt-8">
                    {section.heading}
                  </h2>
                  <div
                    className="text-slate-700 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: section.body || "" }}
                  />
                </>
              )}
              
              {section.type === "data" && section.visualization === "table" && (
                <>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 mt-8">
                    {section.heading}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100">
                        <tr>
                          {section.data && section.data.length > 0 &&
                            Object.keys(section.data[0]).map((key) => (
                              <th
                                key={key}
                                className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase"
                              >
                                {key.replace(/_/g, " ")}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {section.data?.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                            {Object.values(row).map((value, cellIdx) => (
                              <td
                                key={cellIdx}
                                className="px-6 py-4 text-slate-700"
                              >
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Impact */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 md:p-10 mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
            Impact & Consequences
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            {dive.impact}
          </p>
        </div>

        {/* Sources */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
            Sources & Citations
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Every claim in this investigation is backed by credible sources. All sources are publicly accessible.
          </p>
          <div className="space-y-4">
            {dive.sources.map((source, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200 hover:border-blue-400 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline mb-1 block"
                    >
                      {source.title}
                    </a>
                    <p className="text-slate-600 text-sm mb-1">
                      {source.publication}
                      {source.author && ` • ${source.author}`}
                      {" • "}
                      {formatDate(source.date)}
                    </p>
                    <p className="text-slate-500 text-xs break-all">
                      {source.url}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Topics */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-slate-900 mb-4 uppercase">
            Related Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {dive.relatedTopics.map((topic) => (
              <span
                key={topic}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
              >
                #{topic.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>

        {/* Back to Investigations */}
        <div className="text-center pt-8 border-t-2 border-slate-200">
          <Link
            href="/investigations"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
          >
            ← View All Investigations
          </Link>
        </div>
      </div>
    </div>
  );
}
