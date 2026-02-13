"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getMembers, getPartyBreakdown, getStates, getMemberFinanceStatic } from "@/lib/data";
import { calculateGrade } from "@/lib/grading";
import RepresentativeImage from "@/components/RepresentativeImage";
import PartyLoyaltyChart from "@/components/PartyLoyaltyChart";
import IdeologySpectrumChart from "@/components/IdeologySpectrumChart";
import type { Member } from "@/lib/types";

function CongressContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const allMembers = getMembers();
  const stats = getPartyBreakdown();
  const states = getStates();
  
  // Filter state
  const [chamber, setChamber] = useState<string>("");
  const [party, setParty] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [userState, setUserState] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Load user's saved state preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userState');
      if (saved) setUserState(saved);
    }
  }, []);
  
  // Read URL params on mount
  useEffect(() => {
    const urlState = searchParams.get("state");
    const urlSearch = searchParams.get("search");
    const urlParty = searchParams.get("party");
    const urlChamber = searchParams.get("chamber");
    
    if (urlState) setState(urlState.toUpperCase());
    if (urlSearch) {
      setSearch(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    if (urlParty) setParty(urlParty);
    if (urlChamber) setChamber(urlChamber);
  }, [searchParams]);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  
  // Update URL params when filters change
  const updateURL = useCallback((filters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router, pathname]);
  
  useEffect(() => {
    updateURL({ 
      search: debouncedSearch, 
      state, 
      party, 
      chamber 
    });
  }, [debouncedSearch, state, party, chamber, updateURL]);
  
  // Find my representatives functionality
  const findMyReps = async () => {
    setLoadingLocation(true);
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        if (data.country_code === 'US' && data.region_code) {
          const detectedState = data.region_code.toUpperCase();
          setState(detectedState);
          setUserState(detectedState);
          localStorage.setItem('userState', detectedState);
        }
      }
    } catch (error) {
      console.error('Geolocation failed:', error);
    } finally {
      setLoadingLocation(false);
    }
  };
  
  // Filter members (using debounced search with district support)
  const filteredMembers = useMemo(() => {
    return allMembers.filter(m => {
      if (chamber && m.chamber !== chamber) return false;
      if (party && m.party !== party) return false;
      if (state && m.state !== state) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const district = m.district ? `${m.state}-${m.district}` : '';
        if (!m.full_name.toLowerCase().includes(q) && 
            !m.state.toLowerCase().includes(q) &&
            !district.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allMembers, chamber, party, state, debouncedSearch]);
  
  // Get user's representatives (2 senators + 1 house rep)
  const userReps = useMemo(() => {
    if (!userState) return [];
    return allMembers.filter(m => m.state === userState);
  }, [allMembers, userState]);
  
  // Dynamic stats for filtered view
  const filteredStats = useMemo(() => ({
    total: filteredMembers.length,
    democrats: filteredMembers.filter(m => m.party === "D").length,
    republicans: filteredMembers.filter(m => m.party === "R").length,
    independents: filteredMembers.filter(m => m.party === "I").length,
  }), [filteredMembers]);
  
  const isFiltered = chamber || party || state || debouncedSearch;
  
  const clearFilters = () => {
    setChamber("");
    setParty("");
    setState("");
    setSearch("");
    setDebouncedSearch("");
    updateURL({});
  };
  
  const removeFilter = (filterName: string) => {
    switch (filterName) {
      case 'chamber':
        setChamber("");
        break;
      case 'party':
        setParty("");
        break;
      case 'state':
        setState("");
        break;
      case 'search':
        setSearch("");
        setDebouncedSearch("");
        break;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-8">
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900">Congress Members</h1>
            <p className="text-lg text-slate-600 mt-4 leading-relaxed">
              {isFiltered 
                ? `Showing ${filteredStats.total} of ${stats.total} members`
                : `All ${stats.total} members of the 119th United States Congress`}
            </p>
          </div>
          
          {isFiltered && (
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors px-4 py-2 min-h-[44px]"
            >
              Clear filters ✕
            </button>
          )}
        </div>
        
        {/* Search + Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="space-y-4">
            {/* Search Input + Find My Reps Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by name, state, or district (e.g., CA-12)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-lg text-base leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[44px]"
                />
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Find My Reps Button */}
              <button
                onClick={findMyReps}
                disabled={loadingLocation}
                className="px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed min-h-[44px] whitespace-nowrap flex items-center justify-center gap-2"
              >
                {loadingLocation ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Find My Reps
                  </>
                )}
              </button>
            </div>
            
            {/* Active Filter Chips */}
            {isFiltered && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-600 font-medium">Active filters:</span>
                {debouncedSearch && (
                  <button
                    onClick={() => removeFilter('search')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 transition"
                  >
                    Search: "{debouncedSearch}"
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {state && (
                  <button
                    onClick={() => removeFilter('state')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition"
                  >
                    State: {state}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {chamber && (
                  <button
                    onClick={() => removeFilter('chamber')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition"
                  >
                    Chamber: {chamber === 'house' ? 'House' : 'Senate'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {party && (
                  <button
                    onClick={() => removeFilter('party')}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${
                      party === 'D' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                      party === 'R' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                      'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Party: {party === 'D' ? 'Democrat' : party === 'R' ? 'Republican' : 'Independent'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Party Filter Buttons */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Party</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setParty("")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition min-h-[44px] ${
                    party === "" 
                      ? "bg-slate-900 text-white" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setParty("D")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition min-h-[44px] ${
                    party === "D" 
                      ? "bg-blue-600 text-white" 
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  Democrat ({stats.democrats})
                </button>
                <button
                  onClick={() => setParty("R")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition min-h-[44px] ${
                    party === "R" 
                      ? "bg-red-600 text-white" 
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  Republican ({stats.republicans})
                </button>
                <button
                  onClick={() => setParty("I")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition min-h-[44px] ${
                    party === "I" 
                      ? "bg-purple-600 text-white" 
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  }`}
                >
                  Independent ({stats.independents})
                </button>
              </div>
            </div>

            {/* Dropdowns Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Chamber</label>
                <select 
                  value={chamber}
                  onChange={(e) => setChamber(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium text-base leading-relaxed focus:ring-2 focus:ring-blue-500 transition min-h-[44px]"
                >
                  <option value="">All Chambers</option>
                  <option value="house">House ({stats.house})</option>
                  <option value="senate">Senate ({stats.senate})</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                <select 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium text-base leading-relaxed focus:ring-2 focus:ring-blue-500 transition min-h-[44px]"
                >
                  <option value="">All States</option>
                  {states.map(s => (
                    <option key={s.abbrev} value={s.abbrev}>
                      {s.abbrev} - {s.name} ({s.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="card text-center py-6 sm:py-8">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 mb-2 sm:mb-3 tabular-nums leading-tight">{filteredStats.total}</div>
          <div className="text-slate-600 font-semibold text-xs sm:text-sm uppercase tracking-wider leading-relaxed">
            {isFiltered ? "Showing" : "Total Members"}
          </div>
        </div>
        <div className="card text-center py-6 sm:py-8">
          <div className="text-4xl sm:text-5xl font-black text-blue-600 mb-2 sm:mb-3 tabular-nums leading-tight">{filteredStats.democrats}</div>
          <div className="text-slate-600 font-semibold text-xs sm:text-sm uppercase tracking-wider leading-relaxed">Democrats</div>
        </div>
        <div className="card text-center py-6 sm:py-8">
          <div className="text-4xl sm:text-5xl font-black text-red-600 mb-2 sm:mb-3 tabular-nums leading-tight">{filteredStats.republicans}</div>
          <div className="text-slate-600 font-semibold text-xs sm:text-sm uppercase tracking-wider leading-relaxed">Republicans</div>
        </div>
        <div className="card text-center py-6 sm:py-8">
          <div className="text-4xl sm:text-5xl font-black text-purple-600 mb-2 sm:mb-3 tabular-nums leading-tight">{filteredStats.independents}</div>
          <div className="text-slate-600 font-semibold text-xs sm:text-sm uppercase tracking-wider leading-relaxed">Independents</div>
        </div>
      </div>

      {/* Data Visualizations */}
      <div className="grid lg:grid-cols-2 gap-8">
        <PartyLoyaltyChart 
          members={filteredMembers} 
          selectedParty={party as "D" | "R" | "I" | ""}
        />
        <IdeologySpectrumChart 
          members={filteredMembers}
          chamber={chamber as "house" | "senate" | ""}
        />
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-20 text-lg text-slate-500 leading-relaxed">
          No members match your filters. Try adjusting your search.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            // Get finance data and calculate grade
            const finance = getMemberFinanceStatic(member.bioguide_id);
            const grade = calculateGrade({
              pac_percentage: finance?.pac_percentage,
              large_donor_percentage: finance?.large_donor_percentage,
            });
            
            // Grade badge colors
            const gradeColors = {
              A: "bg-green-100 text-green-700 border-green-200",
              B: "bg-blue-100 text-blue-700 border-blue-200",
              C: "bg-yellow-100 text-yellow-700 border-yellow-200",
              D: "bg-orange-100 text-orange-700 border-orange-200",
              F: "bg-red-100 text-red-700 border-red-200",
            };
            
            // Check if this is user's representative
            const isUserRep = userReps.some(rep => rep.bioguide_id === member.bioguide_id);
            
            return (
            <Link
              key={member.bioguide_id}
              href={`/rep/${member.bioguide_id}`}
              className={`bg-white border rounded-xl p-6 transition-all duration-200 hover:shadow-lg cursor-pointer group relative ${
                isUserRep 
                  ? 'border-blue-400 ring-2 ring-blue-200 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* "Your Rep" Badge */}
              {isUserRep && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  YOUR REP
                </div>
              )}
              {/* Header: Photo + Name + Party + Grade */}
              <div className="flex items-start gap-4 mb-6">
                {/* Photo */}
                <RepresentativeImage
                  bioguideId={member.bioguide_id}
                  fullName={member.full_name}
                  party={member.party}
                  photoUrl={member.photo_url}
                  size="md"
                  className="flex-shrink-0"
                />
                
                {/* Name & Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold leading-tight text-slate-900 mb-1 group-hover:text-blue-600 transition truncate">
                    {member.full_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      member.party === "D" 
                        ? "bg-blue-100 text-blue-700" 
                        : member.party === "R" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {member.party === "D" ? "D" : member.party === "R" ? "R" : "I"}
                    </span>
                    <span>
                      {member.state}{member.district ? `-${member.district}` : ""}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>{member.chamber === "house" ? "House" : "Senate"}</span>
                  </div>
                </div>
                
                {/* Grade Badge */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center ${gradeColors[grade.letter]}`}>
                  <span className="text-2xl font-black">{grade.letter}</span>
                </div>
              </div>
              
              {/* Grade Breakdown Bars */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-slate-500 font-medium">Donors</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all" 
                      style={{ width: `${grade.breakdown.donorScore}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-600 font-mono">{Math.round(grade.breakdown.donorScore)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-slate-500 font-medium">Voting</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all" 
                      style={{ width: `${grade.breakdown.votingScore}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-600 font-mono">{Math.round(grade.breakdown.votingScore)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-slate-500 font-medium">Trading</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all" 
                      style={{ width: `${grade.breakdown.tradingScore}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-600 font-mono">{Math.round(grade.breakdown.tradingScore)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-slate-500 font-medium">Disclosure</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all" 
                      style={{ width: `${grade.breakdown.disclosureScore}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-600 font-mono">{Math.round(grade.breakdown.disclosureScore)}</span>
                </div>
              </div>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg py-2 px-2 text-center">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Bills</div>
                  <div className="font-mono text-lg font-bold text-slate-900">{member.bills_sponsored}</div>
                </div>
                
                <div className="bg-slate-50 rounded-lg py-2 px-2 text-center">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Votes</div>
                  <div className="font-mono text-lg font-bold text-slate-900">{member.votes_cast}</div>
                </div>
                
                <div className="bg-slate-50 rounded-lg py-2 px-2 text-center">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Cosponsor</div>
                  <div className="font-mono text-lg font-bold text-slate-900">{member.bills_cosponsored}</div>
                </div>
              </div>
              
              {/* View Details CTA */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <span className="text-sm text-blue-600 font-semibold group-hover:text-blue-700">
                  View Details →
                </span>
              </div>
            </Link>
          );
          })}
        </div>
      )}
    </div>
  );
}

export default function CongressPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-8">
          <div className="space-y-4">
            <div className="h-12 bg-slate-200 rounded-lg w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-2/3"></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex gap-4">
              <div className="h-12 bg-slate-200 rounded-lg flex-1"></div>
              <div className="h-12 bg-slate-200 rounded-lg w-32"></div>
              <div className="h-12 bg-slate-200 rounded-lg w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-8">
                <div className="h-12 bg-slate-200 rounded w-20 mx-auto mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-14 bg-slate-100 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <CongressContent />
    </Suspense>
  );
}
