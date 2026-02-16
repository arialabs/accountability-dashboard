import Link from "next/link";
import Image from "next/image";
import { dogeData } from "@/data/doge";
import type { Metadata } from "next";
import ExpandableStaffRoster from "@/components/ExpandableStaffRoster";

export const metadata: Metadata = {
  title: "DOGE Tracker — Department of Government Efficiency",
  description:
    "Track the impact of Elon Musk's Department of Government Efficiency (DOGE): federal workforce cuts, agency disruptions, conflicts of interest, and legal challenges.",
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    layoff: "bg-red-100 text-red-800",
    program_cut: "bg-orange-100 text-orange-800",
    agency_access: "bg-purple-100 text-purple-800",
    contract_cancel: "bg-yellow-100 text-yellow-800",
    legal: "bg-blue-100 text-blue-800",
    controversy: "bg-pink-100 text-pink-800",
    reversal: "bg-green-100 text-green-800",
  };
  return colors[category] || "bg-slate-100 text-slate-800";
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    layoff: "Layoff / Firing",
    program_cut: "Program Cut",
    agency_access: "Agency Access",
    contract_cancel: "Contract Cancel",
    legal: "Legal Challenge",
    controversy: "Controversy",
    reversal: "Reversal",
  };
  return labels[category] || category;
}

function getImpactColor(impact: string) {
  const colors: Record<string, string> = {
    critical: "bg-red-600 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
    low: "bg-slate-400 text-white",
  };
  return colors[impact] || "bg-slate-300";
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    severely_cut: "bg-red-100 text-red-800 border-red-200",
    partially_cut: "bg-orange-100 text-orange-800 border-orange-200",
    targeted: "bg-yellow-100 text-yellow-800 border-yellow-200",
    partially_restored: "bg-green-100 text-green-800 border-green-200",
  };
  return colors[status] || "bg-slate-100 text-slate-800 border-slate-200";
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    severely_cut: "Severely Cut",
    partially_cut: "Partially Cut",
    targeted: "Targeted",
    partially_restored: "Partially Restored",
  };
  return labels[status] || status;
}

function getTrendIcon(trend?: string) {
  if (trend === "up") return "📈";
  if (trend === "down") return "📉";
  return "➡️";
}

export default function DogePage() {
  const { leader, overview, keyStats, timeline, conflictsOfInterest, lawsuits, affectedAgencies } = dogeData;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 via-red-50 to-white border-b border-slate-200 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <Image
                src={leader.photoUrl}
                alt={leader.name}
                width={192}
                height={192}
                className="w-36 h-36 md:w-48 md:h-48 rounded-full object-cover shadow-2xl border-4 border-white"
              />
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                DISBANDED
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  🐕 DOGE
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  {leader.role}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  Jan — Nov 2025
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-2">
                {leader.name}
              </h1>
              <p className="text-xl text-slate-700 font-semibold mb-1">
                {leader.title} — Department of Government Efficiency
              </p>
              <p className="text-slate-500 text-sm max-w-xl">
                {leader.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats Dashboard */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Impact Dashboard</h2>
          <p className="text-slate-500 mb-8 text-sm">By the numbers — what DOGE actually accomplished vs. what it claimed</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {keyStats.map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span className="text-lg">{getTrendIcon(stat.trend)}</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-slate-900 mb-1">
                  {stat.value}
                </p>
                {stat.context && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {stat.context}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Promise vs Reality Callout */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2">
                🎯 Original Promise
              </div>
              <p className="text-3xl font-black text-red-900">{overview.originalGoal}</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
                📊 Reality Check
              </div>
              <p className="text-lg font-bold text-blue-900 mb-2">
                Claimed: {overview.claimedSavings}
              </p>
              <p className="text-sm text-blue-700">
                Independent estimate: {overview.independentEstimateOfSavings}
              </p>
              <p className="text-sm text-blue-700">
                {overview.actualSpendingChange}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Affected Agencies */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Affected Agencies</h2>
          <p className="text-slate-500 mb-8 text-sm">
            {overview.agenciesTargeted} federal agencies targeted — here are the most impacted
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {affectedAgencies.map((agency) => (
              <div
                key={agency.abbreviation}
                className={`rounded-2xl border p-6 ${getStatusColor(agency.status)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-black text-lg">{agency.abbreviation}</h3>
                    <p className="text-sm opacity-80">{agency.name}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/50">
                    {getStatusLabel(agency.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-3 text-sm font-semibold">
                  <span>👥 ~{agency.workersAffected.toLocaleString()} affected</span>
                  {agency.budgetImpact && <span>💰 {agency.budgetImpact}</span>}
                </div>
                <ul className="space-y-1">
                  {agency.keyActions.map((action, i) => (
                    <li key={i} className="text-xs flex gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Roster */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <ExpandableStaffRoster staff={dogeData.staff} />
        </div>
      </section>

      {/* Conflicts of Interest */}
      <section className="py-12 bg-red-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-2">⚠️ Conflicts of Interest</h2>
          <p className="text-slate-600 mb-8 text-sm">
            Musk led DOGE while his companies held $38B+ in government contracts and were regulated by agencies DOGE targeted
          </p>

          <div className="space-y-4">
            {conflictsOfInterest.map((conflict) => (
              <div
                key={conflict.id}
                className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{conflict.company}</h3>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          conflict.severity === "critical"
                            ? "bg-red-100 text-red-700"
                            : conflict.severity === "high"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {conflict.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {conflict.description}
                    </p>
                  </div>
                  {conflict.contractValue && (
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-xs text-slate-500">Contract Value</div>
                      <div className="font-black text-red-700">{conflict.contractValue}</div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {conflict.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-2">📅 Actions Timeline</h2>
          <p className="text-slate-500 mb-8 text-sm">
            {timeline.length} major actions tracked from establishment to disbandment
          </p>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 sm:left-4 md:left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-6">
              {timeline.map((action) => (
                <div key={action.id} className="relative pl-10 sm:pl-12 md:pl-16">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-2 sm:left-2.5 md:left-4.5 top-2 w-3 h-3 rounded-full border-2 border-white shadow ${
                      action.impact === "critical"
                        ? "bg-red-500"
                        : action.impact === "high"
                        ? "bg-orange-500"
                        : action.impact === "medium"
                        ? "bg-yellow-500"
                        : "bg-slate-400"
                    }`}
                  />

                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {formatDate(action.date)}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${getCategoryColor(
                          action.category
                        )}`}
                      >
                        {getCategoryLabel(action.category)}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${getImpactColor(
                          action.impact
                        )}`}
                      >
                        {action.impact.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-2">
                      {action.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {action.affectedAgencies.map((agency) => (
                        <span
                          key={agency}
                          className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded"
                        >
                          {agency}
                        </span>
                      ))}
                      {action.estimatedWorkersAffected && (
                        <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-semibold">
                          👥 ~{action.estimatedWorkersAffected.toLocaleString()} workers
                        </span>
                      )}
                      {action.estimatedFinancialImpact && (
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-semibold">
                          💰 {action.estimatedFinancialImpact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Legal Challenges */}
      <section className="py-12 bg-blue-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-2">⚖️ Legal Challenges</h2>
          <p className="text-slate-600 mb-8 text-sm">
            {overview.lawsuitsFiled}+ lawsuits filed, {overview.courtOrdersAgainst} court orders issued against DOGE
          </p>

          <div className="space-y-4">
            {lawsuits.map((lawsuit) => (
              <div
                key={lawsuit.id}
                className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-900">{lawsuit.title}</h3>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-3 ${
                      lawsuit.status === "active"
                        ? "bg-blue-100 text-blue-700"
                        : lawsuit.status === "ruling_issued"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {lawsuit.status === "ruling_issued" ? "Ruling Issued" : lawsuit.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-2">
                  <span>📍 {lawsuit.court}</span>
                  <span>📅 Filed {formatDate(lawsuit.filedDate)}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{lawsuit.description}</p>
                {lawsuit.outcome && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-800 font-medium">
                    ⚖️ {lawsuit.outcome}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-lg font-black text-slate-900 mb-4">📚 Data Sources</h2>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            {[
              "Associated Press",
              "Reuters",
              "The New York Times",
              "The Guardian",
              "CNBC",
              "Fortune",
              "Forbes",
              "NPR",
              "Axios",
              "Cato Institute",
              "Congress.gov",
              "ProPublica",
              "Le Monde",
              "OPB",
              "Ars Technica",
              "Newsweek",
              "American Bar Association",
              "OPM (Office of Personnel Management)",
              "CBO (Congressional Budget Office)",
            ].map((source) => (
              <span key={source} className="bg-white border border-slate-200 px-3 py-1 rounded-full">
                {source}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            All data is sourced from publicly available reporting. This page aims for factual accuracy.
            If you find an error, please{" "}
            <a
              href="https://github.com/arialabs/accountability-dashboard/issues"
              className="text-blue-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              open an issue
            </a>
            .
          </p>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <Link href="/executive" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Back to Executive Branch
          </Link>
        </div>
      </section>
    </div>
  );
}
