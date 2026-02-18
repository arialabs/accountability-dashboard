"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getAllOfficials } from "@/lib/executive-data";
import { analyzeOfficialConflicts, scoreConflictRisk, groupConflictsByCategory, filterBySeverity, type DetectedConflict } from "@/lib/executive-conflicts";
import type { ConflictSeverity } from "@/types/executive";
import ConflictBadge from "@/components/ConflictBadge";

const categoryLabels: Record<string, string> = {
  financial: "💰 Financial",
  political: "🎯 Political",
  corporate: "🏢 Corporate",
  foreign_influence: "🌍 Foreign Influence",
  personal_conduct: "👤 Personal Conduct",
  qualifications: "📋 Qualifications",
  independence: "⚖️ Independence",
  corruption: "🚨 Corruption",
  ideology: "💭 Ideology",
  public_health: "🏥 Public Health",
  labor: "👷 Labor",
  policy: "📜 Policy",
};

export default function ConflictsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<ConflictSeverity | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedOfficial, setSelectedOfficial] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const officials = getAllOfficials();

  // Analyze all conflicts
  const allConflicts = useMemo(() => {
    return officials.flatMap(official => 
      analyzeOfficialConflicts(official)
    );
  }, [officials]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allConflicts.map(c => c.category));
    return Array.from(cats).sort();
  }, [allConflicts]);

  // Filter conflicts
  const filteredConflicts = useMemo(() => {
    let filtered = allConflicts;

    // Filter by severity
    if (selectedSeverity !== "all") {
      filtered = filterBySeverity(filtered, selectedSeverity);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filter by official
    if (selectedOfficial !== "all") {
      filtered = filtered.filter(c => c.official_id === selectedOfficial);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.official_name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allConflicts, selectedSeverity, selectedCategory, selectedOfficial, searchQuery]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalConflicts = allConflicts.length;
    const criticalConflicts = allConflicts.filter(c => c.severity === "critical").length;
    const highConflicts = allConflicts.filter(c => c.severity === "high").length;
    const officialsWithConflicts = new Set(allConflicts.map(c => c.official_id)).size;

    return {
      totalConflicts,
      criticalConflicts,
      highConflicts,
      officialsWithConflicts,
    };
  }, [allConflicts]);

  // Group by severity for display
  const groupedBySeverity = useMemo(() => {
    return {
      critical: filteredConflicts.filter(c => c.severity === "critical"),
      high: filteredConflicts.filter(c => c.severity === "high"),
      medium: filteredConflicts.filter(c => c.severity === "medium"),
      low: filteredConflicts.filter(c => c.severity === "low"),
    };
  }, [filteredConflicts]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-red-50 to-white border-b border-slate-200 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
              ⚠️ Conflict of Interest Detector
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Automatically cross-reference financial disclosures with government contracts, policy decisions, and regulatory actions to identify potential conflicts.
            </p>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-3xl font-black text-slate-900">{stats.totalConflicts}</div>
                <div className="text-sm text-slate-600">Total Conflicts</div>
              </div>
              <div className="bg-white rounded-xl border border-red-200 p-4">
                <div className="text-3xl font-black text-red-600">{stats.criticalConflicts}</div>
                <div className="text-sm text-slate-600">Critical Issues</div>
              </div>
              <div className="bg-white rounded-xl border border-orange-200 p-4">
                <div className="text-3xl font-black text-orange-600">{stats.highConflicts}</div>
                <div className="text-sm text-slate-600">High Severity</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-3xl font-black text-slate-900">{stats.officialsWithConflicts}</div>
                <div className="text-sm text-slate-600">Officials Affected</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search conflicts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as ConflictSeverity | "all")}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High & Above</option>
              <option value="medium">Medium & Above</option>
              <option value="low">All Levels</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryLabels[cat] || cat}</option>
              ))}
            </select>

            <select
              value={selectedOfficial}
              onChange={(e) => setSelectedOfficial(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Officials</option>
              {officials.map(official => (
                <option key={official.id} value={official.id}>{official.name}</option>
              ))}
            </select>
          </div>

          {/* Active filters indicator */}
          {(selectedSeverity !== "all" || selectedCategory !== "all" || selectedOfficial !== "all" || searchQuery) && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-sm text-blue-800">
                Showing {filteredConflicts.length} of {allConflicts.length} conflicts
              </span>
              <button
                onClick={() => {
                  setSelectedSeverity("all");
                  setSelectedCategory("all");
                  setSelectedOfficial("all");
                  setSearchQuery("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Conflicts by Severity */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {filteredConflicts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No conflicts found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedSeverity("all");
                  setSelectedCategory("all");
                  setSelectedOfficial("all");
                  setSearchQuery("");
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Critical Conflicts */}
              {groupedBySeverity.critical.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <ConflictBadge severity="critical" />
                    <h2 className="text-2xl font-black text-slate-900">
                      Critical Conflicts ({groupedBySeverity.critical.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {groupedBySeverity.critical.map(conflict => (
                      <ConflictCard key={conflict.id} conflict={conflict} />
                    ))}
                  </div>
                </div>
              )}

              {/* High Conflicts */}
              {groupedBySeverity.high.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <ConflictBadge severity="high" />
                    <h2 className="text-2xl font-black text-slate-900">
                      High Severity Conflicts ({groupedBySeverity.high.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {groupedBySeverity.high.map(conflict => (
                      <ConflictCard key={conflict.id} conflict={conflict} />
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Conflicts */}
              {groupedBySeverity.medium.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <ConflictBadge severity="medium" />
                    <h2 className="text-2xl font-black text-slate-900">
                      Medium Severity Conflicts ({groupedBySeverity.medium.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {groupedBySeverity.medium.map(conflict => (
                      <ConflictCard key={conflict.id} conflict={conflict} />
                    ))}
                  </div>
                </div>
              )}

              {/* Low Conflicts */}
              {groupedBySeverity.low.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <ConflictBadge severity="low" />
                    <h2 className="text-2xl font-black text-slate-900">
                      Low Severity Conflicts ({groupedBySeverity.low.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {groupedBySeverity.low.map(conflict => (
                      <ConflictCard key={conflict.id} conflict={conflict} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">
            How Conflict Detection Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="font-bold text-slate-900 mb-2">Financial Disclosures</h3>
              <p className="text-sm text-slate-600">
                Parse official financial disclosure forms to identify assets, investments, and business relationships.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold text-slate-900 mb-2">Cross-Reference</h3>
              <p className="text-sm text-slate-600">
                Match holdings against policy decisions, contracts awarded, and regulatory actions overseen.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="font-bold text-slate-900 mb-2">Flag Conflicts</h3>
              <p className="text-sm text-slate-600">
                Detect overlaps and assess severity based on financial amounts and policy impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <Link 
            href="/executive"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Executive Branch
          </Link>
        </div>
      </section>
    </div>
  );
}

function ConflictCard({ conflict }: { conflict: DetectedConflict }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-red-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <ConflictBadge severity={conflict.severity} />
            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
              {categoryLabels[conflict.category] || conflict.category}
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            {conflict.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <Link 
              href={`/executive/cabinet/${conflict.official_id}`}
              className="font-semibold hover:text-blue-600"
            >
              {conflict.official_name}
            </Link>
            <span>•</span>
            <span>{conflict.department}</span>
          </div>
        </div>
      </div>

      <p className="text-slate-700 mb-4 leading-relaxed">
        {conflict.description}
      </p>

      {/* Evidence */}
      {conflict.evidence && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Evidence:</h4>
          <div className="space-y-2 text-sm text-slate-600">
            {conflict.evidence.financial && (
              <div>
                <span className="font-medium">Financial: </span>
                {conflict.evidence.financial}
              </div>
            )}
            {conflict.evidence.action && (
              <div>
                <span className="font-medium">Action: </span>
                {conflict.evidence.action}
              </div>
            )}
            {conflict.evidence.overlap && (
              <div>
                <span className="font-medium">Connection: </span>
                {conflict.evidence.overlap}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
