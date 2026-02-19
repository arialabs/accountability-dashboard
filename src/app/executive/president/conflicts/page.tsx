"use client";

import Link from "next/link";
import { useState } from "react";
import conflictsData from "@/data/trump-conflicts.json";
import { Container } from "@/components/ui";

type Category = "all" | "foreign_payments" | "domestic_conflicts" | "family_involvement";
type Severity = "high" | "medium" | "low";

const severityConfig: Record<Severity, { label: string; color: string; bg: string; icon: string }> = {
  high: { label: "High", color: "text-red-700", bg: "bg-red-100", icon: "🔴" },
  medium: { label: "Medium", color: "text-orange-700", bg: "bg-orange-100", icon: "🟠" },
  low: { label: "Low", color: "text-yellow-700", bg: "bg-yellow-100", icon: "🟡" },
};

const categoryConfig: Record<Exclude<Category, "all">, { label: string; color: string; icon: string }> = {
  foreign_payments: { label: "Foreign Payments", color: "text-purple-700", icon: "🌍" },
  domestic_conflicts: { label: "Domestic Conflicts", color: "text-blue-700", icon: "🏛️" },
  family_involvement: { label: "Family Involvement", color: "text-green-700", icon: "👨‍👩‍👧‍👦" },
};

export default function ConflictsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const { summary, conflicts } = conflictsData;

  const filteredConflicts = selectedCategory === "all" 
    ? conflicts 
    : conflicts.filter(c => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-white border-b border-slate-200 py-16 md:py-20">
        <Container>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">💰</span>
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-700">
                Transparency Watch
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
              Emoluments & Financial Conflicts
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Tracking documented conflicts of interest, foreign payments, and emoluments clause violations during Trump's presidency
            </p>
          </div>
        </Container>
      </section>

      {/* Summary Statistics */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <Container>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 text-center">
            By The Numbers
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div className="text-4xl font-black text-slate-900 mb-1">{summary.total}</div>
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Total Documented Conflicts
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div className="text-4xl font-black text-purple-600 mb-1">{summary.foreign_payments}</div>
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Foreign Payments
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div className="text-4xl font-black text-blue-600 mb-1">{summary.domestic_conflicts}</div>
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Domestic Conflicts
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div className="text-4xl font-black text-green-600 mb-1">{summary.family_involvement}</div>
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Family Involvement
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <Container>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All ({summary.total})
            </button>
            {(Object.entries(categoryConfig) as [Exclude<Category, "all">, typeof categoryConfig[keyof typeof categoryConfig]][]).map(([cat, config]) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                <span className="opacity-60">({summary[cat]})</span>
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Conflicts List */}
      <section className="py-12">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h2 className="text-2xl font-black text-slate-900">
              {selectedCategory === "all" 
                ? "All Documented Conflicts" 
                : `${categoryConfig[selectedCategory as Exclude<Category, "all">].label}`}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(severityConfig).map(([severity, config]) => (
                <span key={severity} className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                  {config.icon} {config.label}
                </span>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            {filteredConflicts.map((conflict) => {
              const sevConfig = severityConfig[conflict.severity as Severity];
              const catConfig = categoryConfig[conflict.category as Exclude<Category, "all">];
              
              return (
                <div 
                  key={conflict.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header with badges */}
                    <div className="flex flex-wrap gap-3 items-start">
                      <div className={`px-4 py-2 rounded-xl ${sevConfig.bg} ${sevConfig.color} font-bold text-sm flex items-center gap-2 flex-shrink-0`}>
                        <span>{sevConfig.icon}</span>
                        <span>{sevConfig.label} Severity</span>
                      </div>
                      
                      <div className={`px-4 py-2 rounded-xl bg-slate-100 ${catConfig.color} font-bold text-sm flex items-center gap-2 flex-shrink-0`}>
                        <span>{catConfig.icon}</span>
                        <span>{catConfig.label}</span>
                      </div>

                      <div className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium flex-shrink-0">
                        📅 {conflict.date}
                      </div>

                      {conflict.amount && (
                        <div className="px-3 py-1 rounded bg-green-50 text-green-700 text-xs font-bold flex-shrink-0">
                          💵 {conflict.amount}
                        </div>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-black text-slate-900">
                      {conflict.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-base text-slate-700 leading-relaxed">
                      {conflict.description}
                    </p>
                    
                    {/* Entities Involved */}
                    <div className="flex flex-wrap gap-2">
                      {conflict.entities.map((entity, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold"
                        >
                          {entity}
                        </span>
                      ))}
                    </div>
                    
                    {/* Source */}
                    <div className="pt-4 border-t border-slate-200">
                      <a 
                        href={conflict.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <span>📰</span>
                        <span>Source: {conflict.source_title}</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredConflicts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No conflicts found in this category.</p>
            </div>
          )}
        </Container>
      </section>

      {/* Context Section */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <Container>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
            <h3 className="text-2xl font-black text-blue-900 mb-4">
              📜 About the Emoluments Clause
            </h3>
            <p className="text-blue-800 leading-relaxed mb-4">
              The Constitution's Foreign Emoluments Clause (Article I, Section 9, Clause 8) prohibits federal officials from receiving 
              gifts, payments, or titles from foreign governments without Congressional consent. The Domestic Emoluments Clause 
              (Article II, Section 1, Clause 7) prohibits the President from receiving compensation beyond their salary from federal or state governments.
            </p>
            <p className="text-blue-800 leading-relaxed">
              Trump was the first president in modern history to maintain ownership of active business interests while in office, 
              raising unprecedented conflict of interest concerns. These documented conflicts represent payments and benefits 
              from foreign governments, domestic government spending at his properties, and family members' financial dealings 
              that occurred during or immediately after his presidency.
            </p>
          </div>
        </Container>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white border-t border-slate-200">
        <Container className="text-center">
          <Link 
            href="/executive/president"
            className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
          >
            ← Back to President Trump
          </Link>
        </Container>
      </section>
    </div>
  );
}
