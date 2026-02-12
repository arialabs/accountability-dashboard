import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupremeCourtJustice, getSupremeCourtJustices } from "@/lib/data";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const justices = getSupremeCourtJustices();
  return justices.map((justice) => ({
    id: justice.id,
  }));
}

export default async function JusticePage({ params }: PageProps) {
  const justice = getSupremeCourtJustice(params.id);

  if (!justice) {
    notFound();
  }

  // Calculate position on ideology scale (-4 to +4)
  const ideologyPosition = ((justice.ideology_score + 4) / 8) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                justice.title === "Chief Justice"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {justice.title}
              </span>
              <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                justice.ideology_score < -1
                  ? "bg-blue-100 text-blue-800"
                  : justice.ideology_score > 1
                  ? "bg-red-100 text-red-800"
                  : "bg-purple-100 text-purple-800"
              }`}>
                {justice.ideology_label}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-6">
              {justice.name}
            </h1>

            <div className="text-lg text-slate-600 space-y-1">
              <p>
                Appointed by <span className="font-semibold text-slate-900">{justice.appointed_by}</span>
              </p>
              <p className="text-slate-500">
                Confirmed in {justice.confirmation_year}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-12">
          {/* Biography */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Biography</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              {justice.bio}
            </p>
          </div>

          {/* Ideology Analysis */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              Ideology Score
            </h2>

            <div className="space-y-6">
              {/* Score Display */}
              <div className="text-center">
                <div className="text-6xl font-black text-slate-900 mb-2">
                  {justice.ideology_score}
                </div>
                <p className="text-lg font-semibold text-slate-600">
                  {justice.ideology_label}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Based on Martin-Quinn Score Analysis
                </p>
              </div>

              {/* Visual Scale */}
              <div className="relative py-8">
                <div className="h-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-400 to-red-500 mb-4">
                  <div
                    className="absolute top-0 w-6 h-6 bg-slate-900 rounded-full border-4 border-white shadow-xl"
                    style={{
                      left: `${ideologyPosition}%`,
                      transform: "translateX(-50%) translateY(-4px)",
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-600 mt-2">
                  <div className="text-left">
                    <div className="font-bold text-blue-600">-4</div>
                    <div className="text-xs">Very Liberal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">0</div>
                    <div className="text-xs">Moderate</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">+4</div>
                    <div className="text-xs">Very Conservative</div>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-2">
                  About Martin-Quinn Scores
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Martin-Quinn scores measure judicial ideology based on voting patterns. 
                  Negative scores indicate liberal voting patterns, while positive scores 
                  indicate conservative patterns. The scale typically ranges from -4 to +4.
                </p>
              </div>
            </div>
          </div>

          {/* Key Facts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Years on Court
              </h3>
              <p className="text-2xl font-black text-slate-900">
                {new Date().getFullYear() - justice.confirmation_year}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Since {justice.confirmation_year}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl mb-3">👔</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Appointed By
              </h3>
              <p className="text-lg font-semibold text-slate-900">
                {justice.appointed_by}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {justice.confirmation_year}
              </p>
            </div>
          </div>

          {/* Key Rulings */}
          {justice.key_rulings && justice.key_rulings.length > 0 && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6">
                Notable Rulings
              </h2>
              
              <div className="space-y-6">
                {justice.key_rulings.map((ruling, index) => (
                  <div 
                    key={index}
                    className="border-l-4 pl-6 py-2"
                    style={{
                      borderColor: 
                        ruling.vote === "Majority" ? "#10b981" :
                        ruling.vote === "Dissent" ? "#ef4444" :
                        "#8b5cf6"
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {ruling.case}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {ruling.year}
                        </p>
                      </div>
                      <span 
                        className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
                        style={{
                          backgroundColor: 
                            ruling.vote === "Majority" ? "#d1fae5" :
                            ruling.vote === "Dissent" ? "#fee2e2" :
                            "#ede9fe",
                          color:
                            ruling.vote === "Majority" ? "#065f46" :
                            ruling.vote === "Dissent" ? "#991b1b" :
                            "#5b21b6"
                        }}
                      >
                        {ruling.vote}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-2">
                      {ruling.description}
                    </p>
                    {ruling.url && (
                      <a 
                        href={ruling.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                      >
                        Read Opinion
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link
              href="/judicial/scotus"
              className="inline-flex items-center text-slate-600 hover:text-slate-900 font-semibold transition-colors"
            >
              ← All Justices
            </Link>
            <Link
              href="/judicial"
              className="inline-flex items-center text-slate-600 hover:text-slate-900 font-semibold transition-colors"
            >
              Judicial Branch →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
