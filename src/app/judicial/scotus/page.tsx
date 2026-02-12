import Link from "next/link";
import { getSupremeCourtJustices } from "@/lib/data";

export default function ScotusPage() {
  const justices = getSupremeCourtJustices();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-4xl mb-6 shadow-2xl mx-auto">
              ⚖️
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
              Supreme Court Justices
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              All nine justices of the Supreme Court of the United States, 
              with ideology scores based on Martin-Quinn analysis.
            </p>
          </div>

          {/* Ideology Scale Legend */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3 text-center">
                Ideology Spectrum
              </h3>
              <div className="relative h-8 rounded-full bg-gradient-to-r from-blue-500 via-purple-400 to-red-500">
                <div className="absolute left-0 top-9 text-xs font-medium text-slate-600">
                  Liberal
                </div>
                <div className="absolute right-0 top-9 text-xs font-medium text-slate-600">
                  Conservative
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voting Patterns Overview */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Voting Patterns
            </h2>
            <p className="text-lg text-slate-600">
              Key rulings tracked for each justice
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {justices.map((justice) => {
              const rulings = justice.key_rulings || [];
              const majority = rulings.filter(r => r.vote === "Majority").length;
              const dissent = rulings.filter(r => r.vote === "Dissent").length;
              const concurrence = rulings.filter(r => r.vote === "Concurrence").length;
              
              return (
                <div 
                  key={justice.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      {justice.name.split(' ').slice(-2).join(' ')}
                    </h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      justice.ideology_score < -1
                        ? "bg-blue-100 text-blue-800"
                        : justice.ideology_score > 1
                        ? "bg-red-100 text-red-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {justice.ideology_label}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Majority</span>
                      <span className="text-sm font-bold text-green-700">{majority}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Concurrence</span>
                      <span className="text-sm font-bold text-purple-700">{concurrence}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Dissent</span>
                      <span className="text-sm font-bold text-red-700">{dissent}</span>
                    </div>
                  </div>
                  
                  {rulings.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500">
                        {rulings.length} notable ruling{rulings.length !== 1 ? 's' : ''} tracked
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Justices Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              All Justices
            </h2>
            <p className="text-lg text-slate-600">
              Click any justice to see detailed voting history and key rulings
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {justices.map((justice) => (
              <Link
                key={justice.id}
                href={`/judicial/scotus/${justice.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Title Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      justice.title === "Chief Justice"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {justice.title}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      justice.ideology_score < -1
                        ? "bg-blue-100 text-blue-800"
                        : justice.ideology_score > 1
                        ? "bg-red-100 text-red-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {justice.ideology_label}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                    {justice.name}
                  </h3>

                  {/* Appointment Info */}
                  <div className="text-sm text-slate-600 mb-4">
                    <p>
                      Appointed by <span className="font-semibold">{justice.appointed_by}</span>
                    </p>
                    <p className="text-slate-500">
                      Confirmed {justice.confirmation_year}
                    </p>
                  </div>

                  {/* Ideology Score Visualization */}
                  <div className="relative">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-400 to-red-500 mb-2">
                      <div
                        className="absolute top-0 w-3 h-3 bg-slate-900 rounded-full border-2 border-white shadow-lg transform -translate-y-0.5"
                        style={{
                          left: `${((justice.ideology_score + 4) / 8) * 100}%`,
                          transform: "translateX(-50%) translateY(-2px)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>-4</span>
                      <span className="font-semibold text-slate-700">
                        {justice.ideology_score}
                      </span>
                      <span>+4</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Link
            href="/judicial"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            ← Back to Judicial Branch
          </Link>
        </div>
      </section>
    </div>
  );
}
