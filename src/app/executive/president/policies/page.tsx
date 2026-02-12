"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { getPolicies, getPolicySummary, POLICY_CATEGORIES, formatNumber } from "@/lib/policy-data";
import ImpactBadge from "@/components/ImpactBadge";
import type { PolicyCategory } from "@/lib/types";

export default function PoliciesPage() {
  const policies = getPolicies();
  const summary = getPolicySummary();
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [impactFilter, setImpactFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("impact");
  
  // Filtered and sorted policies
  const filteredPolicies = useMemo(() => {
    let filtered = [...policies];
    
    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    // Impact filter
    if (impactFilter === "positive") {
      filtered = filtered.filter(p => p.impact_score >= 60);
    } else if (impactFilter === "neutral") {
      filtered = filtered.filter(p => p.impact_score >= 40 && p.impact_score < 60);
    } else if (impactFilter === "negative") {
      filtered = filtered.filter(p => p.impact_score < 40);
    }
    
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    
    // Sort
    if (sortBy === "impact") {
      filtered.sort((a, b) => b.impact_score - a.impact_score);
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());
    } else if (sortBy === "affected") {
      filtered.sort((a, b) => b.americans_affected - a.americans_affected);
    }
    
    return filtered;
  }, [policies, categoryFilter, impactFilter, searchQuery, sortBy]);
  
  const clearFilters = () => {
    setCategoryFilter("");
    setImpactFilter("");
    setSearchQuery("");
    setSortBy("impact");
  };
  
  const isFiltered = categoryFilter || impactFilter || searchQuery || sortBy !== "impact";
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Link 
            href="/executive/president"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
          >
            ← Back to President
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
            Presidential Policy Impact Tracker
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
            Track the real-world impact of presidential policies on Americans. 
            Rated by measurable outcomes, not political rhetoric.
          </p>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Overall Impact Score
              </div>
              <div className="flex items-center gap-3">
                <ImpactBadge score={summary.overall_impact_score} size="lg" />
                <div className="text-sm text-slate-600">
                  {summary.overall_impact_score >= 60 ? 'Positive' : 
                   summary.overall_impact_score >= 50 ? 'Mixed' : 'Negative'} impact
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Policies Tracked
              </div>
              <div className="text-4xl font-black text-slate-900">
                {summary.total_policies}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Americans Affected
              </div>
              <div className="text-4xl font-black text-slate-900">
                {formatNumber(summary.americans_affected)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      <section className="py-12 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8">
            Impact by Category
          </h2>
          
          <div className="space-y-4">
            {Object.entries(summary.categories).map(([categoryKey, stats]) => {
              const category = POLICY_CATEGORIES[categoryKey as PolicyCategory];
              return (
                <div 
                  key={categoryKey}
                  className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <h3 className="font-bold text-slate-900">{category.name}</h3>
                        <p className="text-sm text-slate-600">{stats.count} {stats.count === 1 ? 'policy' : 'policies'}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              stats.avg_impact_score >= 70 ? 'bg-green-500' :
                              stats.avg_impact_score >= 60 ? 'bg-yellow-500' :
                              stats.avg_impact_score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${stats.avg_impact_score}%` }}
                          />
                        </div>
                        <ImpactBadge score={stats.avg_impact_score} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="space-y-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              
              {/* Category Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <select 
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {Object.entries(POLICY_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                
                <select 
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={impactFilter}
                  onChange={(e) => setImpactFilter(e.target.value)}
                >
                  <option value="">Impact Range</option>
                  <option value="positive">Positive Impact (60+)</option>
                  <option value="neutral">Neutral (40-59)</option>
                  <option value="negative">Negative Impact (&lt;40)</option>
                </select>
                
                <select 
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="impact">Sort by Impact</option>
                  <option value="recent">Most Recent</option>
                  <option value="affected">People Affected</option>
                </select>
                
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {isFiltered && (
            <div className="mt-4 text-sm text-slate-600">
              Showing {filteredPolicies.length} of {policies.length} policies
            </div>
          )}
        </div>
      </section>

      {/* Policy List */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="space-y-6">
            {filteredPolicies.map((policy) => {
              const category = POLICY_CATEGORIES[policy.category];
              const daysAgo = Math.floor(
                (Date.now() - new Date(policy.last_updated).getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <Link 
                  key={policy.id}
                  href={`/executive/president/policies/${policy.slug}`}
                  className="block bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Category & Date */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {category.icon} {category.name}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Updated {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                    {policy.title}
                  </h3>
                  
                  {/* Impact Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <ImpactBadge score={policy.impact_score} size="lg" />
                    <div className="text-sm text-slate-600">
                      {policy.impact_score >= 60 ? '✓ Positive' : 
                       policy.impact_score >= 50 ? '⚠️ Mixed' : '✗ Negative'} impact on Americans
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <p className="text-slate-700 mb-4">
                    {policy.summary}
                  </p>
                  
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-sm">
                      <div className="text-slate-500">Americans Affected</div>
                      <div className="font-semibold text-slate-900">
                        {formatNumber(policy.americans_affected)}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-slate-500">Promise Alignment</div>
                      <div className="font-semibold text-slate-900">
                        {policy.promise_alignment}%
                      </div>
                    </div>
                  </div>
                  
                  {/* View Link */}
                  <div className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View full analysis →
                  </div>
                </Link>
              );
            })}
          </div>
          
          {filteredPolicies.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No policies found</h3>
              <p className="text-slate-600">Try adjusting your filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <Link 
            href="/executive/president"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to President Overview
          </Link>
        </div>
      </section>
    </div>
  );
}
