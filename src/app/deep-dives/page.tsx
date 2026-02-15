// @ts-nocheck
export const dynamic = "force-dynamic";
import Link from "next/link";
import { getAllDeepDives } from "@/data/deep-dives";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deep Dive Investigations | Accountability Dashboard",
  description: "In-depth investigative reports exposing corruption, conflicts of interest, and systemic failures in American government.",
};

export default function DeepDivesPage() {
  const investigations = getAllDeepDives();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Deep Dive Investigations
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl">
            Comprehensive investigative reports exposing corruption, conflicts of interest, and broken promises. 
            Each investigation is thoroughly researched, fact-checked, and sourced from credible publications.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {investigations.length}
            </div>
            <div className="text-slate-300">Active Investigations</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {investigations.reduce((sum, inv) => sum + (inv.sources?.length || 0), 0)}
            </div>
            <div className="text-slate-300">Credible Sources</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {investigations.reduce((sum, inv) => sum + (inv.individuals?.length || 0), 0)}
            </div>
            <div className="text-slate-300">Officials Documented</div>
          </div>
        </div>

        {/* Investigations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {investigations.map((investigation) => (
            <Link
              key={investigation.id}
              href={`/deep-dives/${investigation.slug}`}
              className="group bg-slate-800/30 rounded-xl border border-slate-700 hover:border-blue-500 transition-all duration-300 overflow-hidden"
            >
              <div className="p-8">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(investigation.tags ?? []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {investigation.title}
                </h2>

                {/* Subtitle */}
                <p className="text-lg text-slate-400 mb-4">
                  {investigation.subtitle}
                </p>

                {/* Description */}
                <p className="text-slate-300 mb-6 line-clamp-3">
                  {investigation.description}
                </p>

                {/* Key Finding Preview */}
                {investigation.keyFindings && investigation.keyFindings.length > 0 && (
                  <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border-l-4 border-red-500">
                    <p className="text-sm text-slate-300 italic">
                      "{investigation.keyFindings[0]}"
                    </p>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>🕒 {investigation.readTimeMinutes} min read</span>
                    <span>📅 {new Date(investigation.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <span className="text-blue-400 group-hover:translate-x-1 transition-transform">
                    Read Investigation →
                  </span>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-slate-700 flex gap-6 text-sm">
                  {investigation.individuals && investigation.individuals.length > 0 && (
                    <div>
                      <span className="text-slate-400">Officials: </span>
                      <span className="text-white font-semibold">{investigation.individuals.length}</span>
                    </div>
                  )}
                  {investigation.sources && investigation.sources.length > 0 && (
                    <div>
                      <span className="text-slate-400">Sources: </span>
                      <span className="text-white font-semibold">{investigation.sources.length}</span>
                    </div>
                  )}
                  {investigation.timeline && investigation.timeline.length > 0 && (
                    <div>
                      <span className="text-slate-400">Timeline Events: </span>
                      <span className="text-white font-semibold">{investigation.timeline.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-8 border border-blue-800/50">
          <h3 className="text-2xl font-bold text-white mb-4">
            Have a tip or story lead?
          </h3>
          <p className="text-slate-300 mb-6 max-w-2xl">
            We're committed to investigating corruption and holding officials accountable. 
            If you have credible information about government misconduct, conflicts of interest, 
            or broken promises, we want to hear from you.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:tips@accountability-dashboard.com"
              className="px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
            >
              Submit a Tip
            </a>
            <Link
              href="/about"
              className="px-6 py-3 min-h-[44px] bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              About Our Research
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
