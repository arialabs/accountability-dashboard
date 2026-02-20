"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getMemberFinanceStatic } from "@/lib/data";
import { calculateGrade } from "@/lib/grading";
import { useLiveMembers } from "@/hooks/useLiveData";
import RepresentativeImage from "@/components/RepresentativeImage";
import Pagination from "@/components/Pagination";
import { ScoreLegend } from "@/components/ScoreLegend";
import type { Member } from "@/lib/types";

const ITEMS_PER_PAGE = 24;

// Helper to get user's state from IP geolocation
async function getUserStateFromIP(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) return null;
    const data = await response.json();
    return data.region_code || null; // Returns 2-letter state code
  } catch (error) {
    return null;
  }
}

// Helper to normalize search for district matching
function normalizeDistrict(input: string): { state: string; district: number } | null {
  // Match patterns like "CA-12", "CA12", "CA 12"
  const match = input.match(/^([A-Z]{2})[-\s]?(\d+)$/i);
  if (match) {
    return {
      state: match[1].toUpperCase(),
      district: parseInt(match[2], 10)
    };
  }
  return null;
}

function CongressContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { members: allMembers, stats, states, loading: membersLoading, error: membersError } = useLiveMembers();
  
  // Filter state
  const [chamber, setChamber] = useState<string>("");
  const [party, setParty] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [userState, setUserState] = useState<string | null>(null); // User's home state
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Load user's preferred state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('userHomeState');
    if (savedState) {
      setUserState(savedState);
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

  // Current page from URL (reset to 1 on filter change)
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  
  // Update URL params when filters change (always resets to page 1)
  const updateURL = useCallback((filters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    // Strip page param so we go back to page 1 on any filter change
    params.delete("page");
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
  
  // Filter members (using debounced search)
  const filteredMembers = useMemo(() => {
    return allMembers.filter(m => {
      if (chamber && m.chamber !== chamber) return false;
      if (party && m.party !== party) return false;
      if (state && m.state !== state) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        
        // Check for district search (e.g., "CA-12")
        const districtMatch = normalizeDistrict(debouncedSearch);
        if (districtMatch) {
          return m.state === districtMatch.state && m.district === districtMatch.district;
        }
        
        // Regular name/state search
        if (!m.full_name.toLowerCase().includes(q) && 
            !m.state.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allMembers, chamber, party, state, debouncedSearch]);
  
  // Get user's representatives (senators + house member)
  const userRepresentatives = useMemo(() => {
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

  // Paginate filtered results
  const pagedMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMembers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMembers, currentPage]);
  
  const clearFilters = () => {
    setChamber("");
    setParty("");
    setState("");
    setSearch("");
    setDebouncedSearch("");
    updateURL({});
  };
  
  const removeFilter = (filterType: 'chamber' | 'party' | 'state' | 'search') => {
    if (filterType === 'chamber') setChamber("");
    if (filterType === 'party') setParty("");
    if (filterType === 'state') setState("");
    if (filterType === 'search') {
      setSearch("");
      setDebouncedSearch("");
    }
  };
  
  // Find My Representatives handler
  const handleFindMyReps = async () => {
    setIsLoadingLocation(true);
    try {
      const detectedState = await getUserStateFromIP();
      if (detectedState) {
        setUserState(detectedState);
        localStorage.setItem('userHomeState', detectedState);
        setState(detectedState); // Auto-filter to user's state
      } else {
        alert('Could not detect your location. Please select your state manually.');
      }
    } catch (error) {
      alert('Could not detect your location. Please select your state manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };
  
  if (membersLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-8">
          <div className="space-y-4">
            <div className="h-12 bg-slate-200 rounded-lg w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-2/3"></div>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center">
        <p className="text-lg text-slate-500">Unable to load congress members. Please try again later.</p>
        <p className="text-sm text-slate-400 mt-2">{membersError}</p>
      </div>
    );
  }

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
          
          <button 
            onClick={handleFindMyReps}
            disabled={isLoadingLocation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isLoadingLocation ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Detecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Find My Reps</span>
              </>
            )}
          </button>
        </div>
        
        {/* Active Filter Chips */}
        {isFiltered && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-slate-600">Active filters:</span>
            {chamber && (
              <button
                onClick={() => removeFilter('chamber')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 transition"
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${
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
            {state && (
              <button
                onClick={() => removeFilter('state')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-200 transition"
              >
                State: {state}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {debouncedSearch && (
              <button
                onClick={() => removeFilter('search')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-200 transition"
              >
                Search: "{debouncedSearch}"
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors px-2"
            >
              Clear all
            </button>
          </div>
        )}
        
        {/* User's Representatives Alert (when "Find My Reps" is used) */}
        {userState && state === userState && userRepresentatives.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Your Representatives ({userState})</h3>
                <p className="text-sm text-blue-700">
                  Showing {userRepresentatives.length} representative{userRepresentatives.length !== 1 ? 's' : ''} from your state. 
                  Your cards are highlighted below.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Search + Filters */}
        <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
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
                <label htmlFor="chamber-select" className="block text-sm font-semibold text-slate-700 mb-2">Chamber</label>
                <select 
                  id="chamber-select"
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
                <label htmlFor="state-select" className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                <select 
                  id="state-select"
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

      {/* Score Legend */}
      <ScoreLegend />

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-20 text-lg text-slate-500 leading-relaxed">
          No members match your filters. Try adjusting your search.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagedMembers.map((member) => {
            // Get finance data and calculate grade
            const finance = getMemberFinanceStatic(member.bioguide_id);
            const grade = calculateGrade({
              pac_percentage: finance?.pac_percentage,
              large_donor_percentage: finance?.large_donor_percentage,
            });
            
            // Check if this is user's representative
            const isUserRep = userState === member.state;
            
            // Grade badge colors
            const gradeColors = {
              A: "bg-green-100 text-green-700 border-green-200",
              B: "bg-blue-100 text-blue-700 border-blue-200",
              C: "bg-yellow-100 text-yellow-700 border-yellow-200",
              D: "bg-orange-100 text-orange-700 border-orange-200",
              F: "bg-red-100 text-red-700 border-red-200",
            };
            
            return (
            <Link
              key={member.bioguide_id}
              href={`/rep/${member.bioguide_id}`}
              className={`bg-white border rounded-xl p-6 transition-all duration-200 hover:shadow-lg cursor-pointer group ${
                isUserRep && state === userState
                  ? 'border-blue-400 ring-2 ring-blue-200 bg-blue-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* User Rep Badge */}
              {isUserRep && state === userState && (
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Your Representative
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      member.chamber === "house" 
                        ? "bg-slate-100 text-slate-700" 
                        : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {member.chamber === "house" ? "H" : "S"}
                    </span>
                    <span>
                      {member.state}{member.district ? `-${member.district}` : ""}
                    </span>
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

      {/* Pagination */}
      {filteredMembers.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredMembers.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
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
