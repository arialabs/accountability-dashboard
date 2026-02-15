import Link from "next/link";
import { getSupremeCourtJustices, getIdeologyBreakdown } from "@/lib/data";

export default function JudicialBranch() {
  const justices = getSupremeCourtJustices();
  const breakdown = getIdeologyBreakdown();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-5xl mb-8 shadow-2xl mx-auto">
            ⚖️
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-slate-900 mb-6">
            Judicial Branch
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-8">
            Supreme Court Transparency & Analysis
          </p>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Track all {justices.length} Supreme Court justices with ideology scores, 
            voting patterns, and appointment histories.
          </p>
        </div>
      </section>

      {/* SCOTUS Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Current Supreme Court
            </h2>
            <p className="text-lg text-slate-600">
              Ideological breakdown of the nine justices
            </p>
          </div>

          {/* Ideology Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200 text-center">
              <div className="text-5xl font-black text-blue-700 mb-2">
                {breakdown.liberal}
              </div>
              <div className="text-lg font-bold text-blue-900">Liberal</div>
              <div className="text-sm text-blue-600 mt-1">Justices</div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-8 border border-purple-200 text-center">
              <div className="text-5xl font-black text-purple-700 mb-2">
                {breakdown.moderate}
              </div>
              <div className="text-lg font-bold text-purple-900">Moderate</div>
              <div className="text-sm text-purple-600 mt-1">Justices</div>
            </div>

            <div className="bg-red-50 rounded-2xl p-8 border border-red-200 text-center">
              <div className="text-5xl font-black text-red-700 mb-2">
                {breakdown.conservative}
              </div>
              <div className="text-lg font-bold text-red-900">Conservative</div>
              <div className="text-sm text-red-600 mt-1">Justices</div>
            </div>
          </div>

          {/* View All Justices CTA */}
          <div className="text-center">
            <Link
              href="/judicial/scotus"
              className="inline-flex items-center justify-center px-6 sm:px-10 py-4 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              View All Justices →
            </Link>
          </div>
        </div>
      </section>

      {/* What's Coming Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12 text-center">
            What We'll Track
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl mb-3">👨‍⚖️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Supreme Court</h3>
              <p className="text-slate-600">
                Track all nine justices, their voting patterns, recusal decisions, and opinion authorship.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl mb-3">⚖️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Federal Judges</h3>
              <p className="text-slate-600">
                Monitor Circuit and District Court judges, appointment histories, and case loads.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Financial Disclosures</h3>
              <p className="text-slate-600">
                Review financial holdings, gifts, travel, and potential conflicts of interest.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Case Histories</h3>
              <p className="text-slate-600">
                Analyze voting patterns, majority/dissent records, and ideological alignment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
            In the Meantime, Check Out Congress
          </h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            While we build out the Judicial Branch dashboard, explore our complete 
            Congressional accountability tracker.
          </p>
          <Link 
            href="/congress"
            className="inline-flex items-center justify-center px-6 sm:px-10 py-4 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            View Congress →
          </Link>
        </div>
      </section>
    </div>
  );
}
