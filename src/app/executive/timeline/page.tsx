"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import actionsData from "@/data/executive-actions.json";
import type { ExecutiveAction, ActionType, DepartmentName } from "@/types/executive";
import { formatCurrency } from "@/lib/executive-data";
import { formatNumber } from "@/lib/formatting";
import { Container } from "@/components/ui";

const actionTypeLabels: Record<string, string> = {
  executive_order: "📜 Executive Order",
  memorandum: "📋 Memorandum",
  proclamation: "📢 Proclamation",
  budget_proposal: "💰 Budget Proposal",
  budget_cut: "✂️ Budget Cut",
  layoff: "👔 Layoff",
  hiring_freeze: "🧊 Hiring Freeze",
  program_elimination: "🗑️ Program Elimination",
  program_expansion: "📈 Program Expansion",
  policy_reversal: "🔄 Policy Reversal",
  regulatory_action: "⚖️ Regulatory Action",
  appointment: "👤 Appointment",
  firing: "🔥 Firing",
  speech: "🎤 Speech",
  statement: "💬 Statement",
};

const actionTypeColors: Record<string, string> = {
  executive_order: "bg-blue-100 text-blue-800 border-blue-200",
  budget_cut: "bg-red-100 text-red-800 border-red-200",
  budget_proposal: "bg-green-100 text-green-800 border-green-200",
  layoff: "bg-orange-100 text-orange-800 border-orange-200",
  program_elimination: "bg-red-100 text-red-800 border-red-200",
  program_expansion: "bg-green-100 text-green-800 border-green-200",
  policy_reversal: "bg-purple-100 text-purple-800 border-purple-200",
  regulatory_action: "bg-amber-100 text-amber-800 border-amber-200",
  hiring_freeze: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function TimelinePage() {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "impact">("newest");

  // Only show actions backed by at least one verifiable source. Entries whose
  // citations are placeholders (example.com) are hidden until re-sourced.
  const actions = (actionsData.actions as ExecutiveAction[]).filter(action => {
    const sources = (action as { sources?: Array<{ url?: string }> }).sources ?? [];
    return sources.some(s => s.url && !s.url.includes("example.com"));
  });

  // Get unique departments and types
  const departments = useMemo(() => {
    const depts = new Set(actions.map(a => a.department));
    return Array.from(depts).sort();
  }, [actions]);

  const actionTypes = useMemo(() => {
    const types = new Set(actions.map(a => a.type));
    return Array.from(types).sort();
  }, [actions]);

  // Filter and sort actions
  const filteredActions = useMemo(() => {
    let filtered = actions.filter(action => {
      const matchesDepartment = 
        selectedDepartments.length === 0 || selectedDepartments.includes(action.department);
      
      const matchesType = 
        selectedTypes.length === 0 || selectedTypes.includes(action.type);
      
      const matchesSearch = 
        searchQuery === "" ||
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.official_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesDepartment && matchesType && matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "impact":
          return (b.americans_affected || 0) - (a.americans_affected || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [actions, selectedDepartments, selectedTypes, searchQuery, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalActions = filteredActions.length;
    const totalAffected = filteredActions.reduce((sum, a) => sum + (a.americans_affected || 0), 0);
    const totalBudgetImpact = filteredActions.reduce((sum, a) => sum + (a.budget_impact || 0), 0);
    const budgetCuts = filteredActions.filter(a => (a.budget_impact || 0) < 0).length;

    return {
      totalActions,
      totalAffected,
      totalBudgetImpact,
      budgetCuts,
    };
  }, [filteredActions]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // formatNumber imported from @/lib/formatting

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white border-b border-slate-200 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
              Executive Actions Timeline
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Track executive orders, policy changes, budget decisions, and regulatory actions across all cabinet departments.
            </p>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-3xl font-black text-slate-900">{stats.totalActions}</div>
                <div className="text-sm text-slate-600">Total Actions</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-3xl font-black text-blue-600">{formatNumber(stats.totalAffected)}</div>
                <div className="text-sm text-slate-600">Americans Affected</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className={`text-3xl font-black ${stats.totalBudgetImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(stats.totalBudgetImpact))}
                </div>
                <div className="text-sm text-slate-600">Budget Impact</div>
              </div>
              <div className="bg-white rounded-xl border border-red-200 p-4">
                <div className="text-3xl font-black text-red-600">{stats.budgetCuts}</div>
                <div className="text-sm text-slate-600">Budget Cuts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest" | "impact")}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="impact">Most Impactful</option>
            </select>
          </div>

          {/* Department Filters */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Filter by Department:</h3>
            <div className="flex flex-wrap gap-2">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => toggleDepartment(dept)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                    selectedDepartments.includes(dept)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filters */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Filter by Type:</h3>
            <div className="flex flex-wrap gap-2">
              {actionTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                    selectedTypes.includes(type)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {actionTypeLabels[type] || type}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Info */}
          {(selectedDepartments.length > 0 || selectedTypes.length > 0 || searchQuery) && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-sm text-blue-800">
                Showing {filteredActions.length} of {actions.length} actions
              </span>
              <button
                onClick={() => {
                  setSelectedDepartments([]);
                  setSelectedTypes([]);
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

      {/* Timeline */}
      <section className="py-12">
        <Container>
          {actions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">
                No verified executive actions to display yet.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Actions appear here once they are backed by verifiable public sources.
              </p>
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No actions found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedDepartments([]);
                  setSelectedTypes([]);
                  setSearchQuery("");
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>

              {/* Timeline Items */}
              <div className="space-y-8">
                {filteredActions.map((action, idx) => {
                  const typeColor = actionTypeColors[action.type] || "bg-slate-100 text-slate-800 border-slate-200";
                  
                  return (
                    <div key={action.id} className="relative pl-20">
                      {/* Timeline Dot */}
                      <div className="absolute left-6 top-0 w-5 h-5 rounded-full bg-white border-4 border-blue-500"></div>

                      {/* Content Card */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${typeColor}`}>
                                {actionTypeLabels[action.type] || action.type}
                              </span>
                              <span className="text-sm text-slate-500">{formatDate(action.date)}</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">
                              {action.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span>👤 {action.official_name}</span>
                              <span>•</span>
                              <span>{action.department}</span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-700 mb-4 leading-relaxed">
                          {action.description}
                        </p>

                        {/* Impact Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                          {action.americans_affected && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="text-sm text-blue-600 font-semibold">Americans Affected</div>
                              <div className="text-xl font-black text-blue-900">
                                {formatNumber(action.americans_affected)}
                              </div>
                            </div>
                          )}
                          {action.budget_impact && (
                            <div className={`rounded-lg p-3 ${action.budget_impact >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                              <div className={`text-sm font-semibold ${action.budget_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Budget Impact
                              </div>
                              <div className={`text-xl font-black ${action.budget_impact >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                                {action.budget_impact >= 0 ? '+' : ''}{formatCurrency(action.budget_impact)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Affected Groups */}
                        {action.affected_groups && action.affected_groups.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Affected Groups:</h4>
                            <div className="flex flex-wrap gap-2">
                              {action.affected_groups.map((group, idx) => (
                                <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-medium border border-orange-200">
                                  {group}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Beneficiaries */}
                        {action.beneficiaries && action.beneficiaries.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Beneficiaries:</h4>
                            <div className="flex flex-wrap gap-2">
                              {action.beneficiaries.map((group, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">
                                  {group}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Container>
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
