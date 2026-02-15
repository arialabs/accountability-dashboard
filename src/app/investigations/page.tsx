// @ts-nocheck
import Link from "next/link";
import { getAllDeepDives } from "@/lib/data";
import type { DeepDive } from "@/lib/types";

export const metadata = {
  title: "Investigations | Accountability Dashboard",
  description: "In-depth investigations into corruption, conflicts of interest, and broken promises in government.",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    insider_trading: "bg-red-100 text-red-800",
    judicial_ethics: "bg-purple-100 text-purple-800",
    stock_trading: "bg-orange-100 text-orange-800",
    corruption: "bg-pink-100 text-pink-800",
    lobbying: "bg-blue-100 text-blue-800",
  };
  return colors[category] || "bg-slate-100 text-slate-800";
}

export default function InvestigationsPage() {
  const deepDives = getAllDeepDives();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4">
            Deep Dive Investigations
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl">
            In-depth investigations into corruption, conflicts of interest, and broken promises. 
            Every claim is sourced. Every fact is verified. This is accountability journalism.
          </p>
        </div>
      </div>

      {/* Investigations Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="space-y-8">
          {deepDives.map((dive: DeepDive) => (
            <Link
              key={dive.id}
              href={`/investigations/${dive.slug}`}
              className="block bg-white rounded-2xl shadow-lg border-2 border-slate-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl overflow-hidden group"
            >
              <div className="p-8 md:p-10">
                {/* Category & Read Time */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCategoryColor(dive.category)}`}>
                    {dive.category.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className="text-slate-500 text-sm">
                    {dive.readTime} read
                  </span>
                  <span className="text-slate-400 text-sm">
                    •
                  </span>
                  <span className="text-slate-500 text-sm">
                    {formatDate(dive.publishedDate)}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                  {dive.title}
                </h2>
                <p className="text-xl text-slate-600 mb-4 leading-relaxed">
                  {dive.subtitle}
                </p>

                {/* Summary */}
                <p className="text-slate-700 leading-relaxed mb-6">
                  {dive.summary}
                </p>

                {/* Key Figures */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">
                    Key Figures
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dive.keyFigures.slice(0, 4).map((figure, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold"
                      >
                        {figure.name}
                      </span>
                    ))}
                    {dive.keyFigures.length > 4 && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-sm">
                        +{dive.keyFigures.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Read More */}
                <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all">
                  Read Full Investigation
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            See Something Wrong?
          </h2>
          <p className="text-lg md:text-xl mb-6 opacity-90 max-w-2xl mx-auto">
            These investigations rely on public records and credible journalism. 
            If you spot an error or have evidence we should review, let us know.
          </p>
          <a
            href="mailto:accountability@arialabs.ai"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
