import Link from "next/link";
import type { Metadata } from "next";
import AlignmentLeaderboard from "@/components/AlignmentLeaderboard";
import EpsteinFilesCard from "@/components/EpsteinFilesCard";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://accountability-dashboard.pages.dev";

export const metadata: Metadata = {
  title: "Accountability Dashboard | Track Congressional Say vs. Do",
  description: "Tracking power. Protecting democracy. Monitor all three branches of government with transparent, publicly-sourced data. See who funds them, how they vote, and who they really represent.",
  openGraph: {
    title: "Accountability Dashboard | Track Congressional Say vs. Do",
    description: "Monitor all three branches of government with transparent data. See who funds them, how they vote, and who they really represent.",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Accountability Dashboard - Tracking power, protecting democracy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Accountability Dashboard | Track Congressional Say vs. Do",
    description: "Monitor all three branches of government with transparent data.",
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen antialiased overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32 lg:py-40">
        {/* Modern gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
          <div className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 opacity-50 blur-3xl" />
          <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 opacity-50 blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight text-slate-900 mb-8">
            Accountability
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600">
              Dashboard
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Tracking power. Protecting democracy.
          </p>
          
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Monitor all three branches of government with transparent, publicly-sourced data. 
            See who funds them, how they vote, and who they really represent.
          </p>
        </div>
      </section>

      {/* Alignment Leaderboard */}
      <AlignmentLeaderboard />

      {/* Three Branches Section */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Three Branches of Government
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Comprehensive accountability across the entire federal government.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Legislative Branch */}
            <Link 
              href="/house"
              className="group relative bg-white rounded-3xl p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 border-2 border-slate-200 hover:border-blue-400 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-indigo-500/5 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  ⚖️
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 leading-tight tracking-tight">
                  Legislative
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Congress makes the laws. Track voting records, campaign finance, and donor influence.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-black text-slate-900 tabular-nums">535</div>
                    <div className="text-sm text-slate-500 font-semibold">Members</div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all">
                    Explore
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Executive Branch */}
            <Link 
              href="/executive"
              className="group relative bg-white rounded-3xl p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 border-2 border-slate-200 hover:border-blue-400 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-indigo-500/5 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  🏛️
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 leading-tight tracking-tight">
                  Executive
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  The President and federal agencies enforce the laws. Cabinet appointments and executive orders.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-black text-slate-900 tabular-nums">26</div>
                    <div className="text-sm text-slate-500 font-semibold">Cabinet + VP</div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all">
                    Explore
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Judicial Branch */}
            <Link 
              href="/judicial"
              className="group relative bg-white rounded-3xl p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 border-2 border-slate-200 hover:border-blue-400 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-indigo-500/5 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  ⚖️
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 leading-tight tracking-tight">
                  Judicial
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  The Supreme Court and federal judges interpret the laws. Financial disclosures and case histories.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-black text-slate-900 tabular-nums">9</div>
                    <div className="text-sm text-slate-500 font-semibold">Justices</div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all">
                    Explore
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Deep Dives Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Deep Dives
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              In-depth investigations into major scandals and corruption cases.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <EpsteinFilesCard variant="full" />
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 text-center">
            Why This Matters
          </h2>
          <div className="prose prose-lg prose-slate mx-auto">
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Politicians work for the people who fund them. When 50% of a campaign comes from PACs 
              and corporate interests, whose priorities do you think get attention?
            </p>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              We believe transparency is the first step to accountability. By making campaign finance, 
              voting records, and financial data easily accessible, we empower citizens to make informed decisions.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              All data comes from official government sources: the FEC, Congress.gov, and required 
              financial disclosures. We don't editorialize — we just show you the numbers.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
            Start Exploring
          </h2>
          <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed">
            Browse all three branches of government. See who funds them, how they vote, and who they really represent.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/house"
              className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
            >
              🏛️ Congress →
            </Link>
            <Link 
              href="/executive"
              className="inline-flex items-center justify-center px-10 py-4 bg-white border-2 border-slate-900 hover:bg-slate-50 text-slate-900 font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-lg"
            >
              🏢 Executive →
            </Link>
            <Link 
              href="/judicial"
              className="inline-flex items-center justify-center px-10 py-4 bg-white border-2 border-slate-900 hover:bg-slate-50 text-slate-900 font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-lg"
            >
              ⚖️ Judicial →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
