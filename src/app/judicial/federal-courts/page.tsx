import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Federal Court Tracking — Coming Soon",
  description: "We're building tools to monitor federal judges. Coming soon to the Accountability Dashboard.",
};

export default function FederalCourtsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-32 md:py-40">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-5xl mb-8 shadow-2xl mx-auto">
            ⚖️
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-6">
            Federal Court Tracking
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-4">
            We&apos;re building tools to monitor federal judges.
          </p>
          <p className="text-lg text-slate-500 mb-12">
            Circuit courts, district courts, appointment histories, and case analysis — coming soon.
          </p>
          <span className="inline-block bg-amber-100 text-amber-700 px-6 py-3 rounded-full font-bold text-lg mb-12">
            🔜 Coming Soon
          </span>
          <div>
            <Link
              href="/judicial"
              className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              ← Back to Judicial Branch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
