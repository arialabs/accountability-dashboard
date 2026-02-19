"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAllScandals, getMember } from "@/lib/data";
import ScandalCard from "@/components/ScandalCard";
import ScandalFilters, { type FilterState, type FilterStats } from "@/components/ScandalFilters";
import Link from "next/link";
import type { ScandalEntry, SeverityLevel } from "@/lib/types";
import EpsteinFilesCard from "@/components/EpsteinFilesCard";

export default function ScandalsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><p className="text-slate-500">Loading...</p></div>}>
      <ScandalsPageContent />
    </Suspense>
  );
}

function ScandalsPageContent() {
  const allScandals = getAllScandals();
  const searchParams = useSearchParams();
  const memberParam = searchParams.get("member");
  
  // If member param is provided, get member name for display
  const member = memberParam ? getMember(memberParam) : null;
  
  const [filters, setFilters] = useState<FilterState>({
    search: member ? member.full_name : "",
    party: "",
    severity: [],
    chamber: "",
    category: "",
    dateStart: "",
    dateEnd: "",
  });
  
  // Filter scandals based on current filters
  const filteredScandals = useMemo(() => {
    return allScandals.filter((scandal) => {
      // Search filter — prioritize member name match
      // If search looks like a person's name (matches any member), filter by member only
      // Otherwise search title + description too
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const isNameMatch = allScandals.some(s => 
          s.member_name.toLowerCase().includes(searchLower)
        );
        
        if (isNameMatch) {
          // Person search: only match on the member's name
          if (!scandal.member_name.toLowerCase().includes(searchLower)) return false;
        } else {
          // Topic search: match on title and description
          const matchesSearch = 
            scandal.title.toLowerCase().includes(searchLower) ||
            scandal.description.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }
      }
      
      // Party filter
      if (filters.party && scandal.party !== filters.party) {
        return false;
      }
      
      // Severity filter
      if (filters.severity.length > 0 && !filters.severity.includes(scandal.severity)) {
        return false;
      }
      
      // Chamber filter
      if (filters.chamber && scandal.chamber !== filters.chamber) {
        return false;
      }
      
      // Category filter
      if (filters.category && !scandal.category.includes(filters.category)) {
        return false;
      }
      
      return true;
    });
  }, [allScandals, filters]);
  
  // Group scandals by year
  const scandalsByYear = useMemo(() => {
    const grouped = new Map<number, ScandalEntry[]>();
    
    filteredScandals.forEach((scandal) => {
      const year = new Date(scandal.date).getFullYear();
      if (!grouped.has(year)) {
        grouped.set(year, []);
      }
      grouped.get(year)!.push(scandal);
    });
    
    // Sort years descending, scandals within year by date descending
    const sorted = Array.from(grouped.entries())
      .sort(([yearA], [yearB]) => yearB - yearA)
      .map(([year, scandals]) => [
        year,
        scandals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      ] as [number, ScandalEntry[]]);
    
    return sorted;
  }, [filteredScandals]);
  
  // Calculate filter statistics
  const filterStats: FilterStats = useMemo(() => {
    const stats: FilterStats = {
      total: filteredScandals.length,
      bySeverity: {
        conviction: 0,
        indictment: 0,
        criminal_investigation: 0,
        ethics_violation: 0,
        ethics_investigation: 0,
        allegation: 0,
      },
      byParty: { D: 0, R: 0, I: 0 },
      byChamber: { house: 0, senate: 0 },
    };
    
    allScandals.forEach((scandal) => {
      stats.bySeverity[scandal.severity]++;
      if (scandal.party in stats.byParty) {
        stats.byParty[scandal.party]++;
      }
      stats.byChamber[scandal.chamber]++;
    });
    
    return stats;
  }, [allScandals, filteredScandals.length]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Link 
            href="/congress"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
          >
            ← Back to Congress
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-3">
            Scandals & Controversies
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
            Verified incidents with sources. Every entry includes citations from credible news outlets, 
            court documents, or official reports. Non-partisan accountability tracking.
          </p>
        </div>
      </div>
      
      {/* Featured Deep Dive */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Featured Deep Dive</h2>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive investigations into major cases</p>
          </div>
          <EpsteinFilesCard variant="compact" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Filters */}
        <ScandalFilters 
          filters={filters}
          onFilterChange={setFilters}
          stats={filterStats}
        />
        
        {/* Timeline */}
        {scandalsByYear.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No incidents match your filters
            </h2>
            <p className="text-slate-600 mb-6">
              Try adjusting your search or clearing some filters
            </p>
            <button
              onClick={() => setFilters({
                search: "",
                party: "",
                severity: [],
                chamber: "",
                category: "",
                dateStart: "",
                dateEnd: "",
              })}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {scandalsByYear.map(([year, yearScandals]) => (
              <div key={year}>
                {/* Year Divider */}
                <div className="sticky top-0 bg-slate-100 py-3 px-4 font-black text-slate-900 text-xl z-10 rounded-lg mb-6">
                  {year}
                </div>
                
                {/* Scandals for this year */}
                <div className="space-y-6 max-w-4xl mx-auto">
                  {yearScandals.map((scandal) => (
                    <ScandalCard 
                      key={scandal.id}
                      scandal={scandal}
                      showMember={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
