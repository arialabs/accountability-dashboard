"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useLiveMembers } from "@/hooks/useLiveData";
import { getMemberFinanceStatic } from "@/lib/data";
import { isZipCode, fetchRepsByZip, type ZipRepResult } from "@/lib/zip-lookup";
import RepresentativeImage from "@/components/RepresentativeImage";
import Pagination from "@/components/Pagination";
import { ScoreLegend } from "@/components/ScoreLegend";
import MemberCard from "@/components/MemberCard";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import type { Member } from "@/lib/types";

/** Compute donor verdict for a member using the same thresholds as MemberCard */
function getDonorVerdict(bioguideId: string): "captured" | "mixed" | "focused" | null {
  const finance = getMemberFinanceStatic(bioguideId);
  if (!finance) return null;
  const pac = finance.pac_percentage ?? 0;
  const large = finance.large_donor_percentage ?? 0;
  if (pac === 0 && large === 0) return null;
  if (pac >= 60 || large >= 75) return "captured";
  if (pac >= 30 || large >= 50) return "mixed";
  return "focused";
}

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
  const [donorVerdict, setDonorVerdict] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [userState, setUserState] = useState<string | null>(null); // User's home state
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // ZIP code lookup state
  const [zipReps, setZipReps] = useState<ZipRepResult[]>([]);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipFallback, setZipFallback] = useState<string | null>(null);
  const [activeZip, setActiveZip] = useState<string | null>(null);
  
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
    const urlVerdict = searchParams.get("verdict");
    
    if (urlState) setState(urlState.toUpperCase());
    if (urlSearch) {
      setSearch(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    if (urlParty) setParty(urlParty);
    if (urlChamber) setChamber(urlChamber);
    if (urlVerdict) setDonorVerdict(urlVerdict);
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
  
  // ZIP code detection — when debounced search matches 5-digit ZIP, call API
  useEffect(() => {
    if (isZipCode(debouncedSearch)) {
      const zip = debouncedSearch.trim();
      setZipLoading(true);
      setZipFallback(null);
      setActiveZip(zip);
      fetchRepsByZip(zip).then(({ reps, fallback, message }) => {
        setZipReps(reps);
        setZipFallback(fallback ? message : null);
        setZipLoading(false);
      });
    } else {
      setZipReps([]);
      setZipFallback(null);
      setActiveZip(null);
    }
  }, [debouncedSearch]);

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
      chamber,
      verdict: donorVerdict,
    });
  }, [debouncedSearch, state, party, chamber, donorVerdict, updateURL]);
  
  // Filter members (using debounced search)
  const filteredMembers = useMemo(() => {
    return allMembers.filter(m => {
      if (chamber && m.chamber !== chamber) return false;
      if (party && m.party !== party) return false;
      if (state && m.state !== state) return false;
      if (donorVerdict) {
        const verdict = getDonorVerdict(m.bioguide_id);
        if (verdict !== donorVerdict) return false;
      }
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
  }, [allMembers, chamber, party, state, donorVerdict, debouncedSearch]);
  
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
  
  const isFiltered = chamber || party || state || donorVerdict || debouncedSearch;

  // Pre-compute verdict counts for filter chips
  const verdictCounts = useMemo(() => {
    const counts = { captured: 0, mixed: 0, focused: 0 };
    // Apply all filters EXCEPT donorVerdict so counts reflect current context
    const base = allMembers.filter(m => {
      if (chamber && m.chamber !== chamber) return false;
      if (party && m.party !== party) return false;
      if (state && m.state !== state) return false;
      return true;
    });
    base.forEach(m => {
      const v = getDonorVerdict(m.bioguide_id);
      if (v) counts[v]++;
    });
    return counts;
  }, [allMembers, chamber, party, state]);

  // Paginate filtered results
  const pagedMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMembers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMembers, currentPage]);
  
  const clearFilters = () => {
    setChamber("");
    setParty("");
    setState("");
    setDonorVerdict("");
    setSearch("");
    setDebouncedSearch("");
    updateURL({});
  };
  
  const removeFilter = (filterType: 'chamber' | 'party' | 'state' | 'search' | 'verdict') => {
    if (filterType === 'chamber') setChamber("");
    if (filterType === 'party') setParty("");
    if (filterType === 'state') setState("");
    if (filterType === 'verdict') setDonorVerdict("");
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-lg text-slate-500">Unable to load congress members. Please try again later.</p>
        <p className="text-sm text-slate-400 mt-2">{membersError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* ── Page Header — editorial style ── */}
      <div
        className="border-b border-slate-200"
        style={{ borderTop: "3px solid var(--accent)", backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="brand-flag-bar" aria-hidden="true" />
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                >
                  119th United States Congress
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  color: "var(--text-primary)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                Congress Members
              </h1>
              <p
                className="mt-3 text-base leading-relaxed"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                {isFiltered
                  ? `Showing ${filteredStats.total} of ${stats.total} members`
                  : `All ${stats.total} members tracked — voting records, campaign finance, and financial disclosures.`}
              </p>
            </div>

            <button
              onClick={handleFindMyReps}
              disabled={isLoadingLocation}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: 44 }}
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 overflow-x-hidden">
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
            {donorVerdict && (
              <button
                onClick={() => removeFilter('verdict')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  donorVerdict === 'captured' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                  donorVerdict === 'mixed'    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                               'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {donorVerdict === 'captured' ? '🚨 Donor Captured' :
                 donorVerdict === 'mixed'    ? '⚠️ Mixed Allegiance' :
                                              '✅ Constituent Focused'}
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
        
        {/* User's Representatives Alert */}
        {userState && state === userState && userRepresentatives.length > 0 && (
          <div
            className="rounded-md border p-4 section-flag-heading"
            style={{ backgroundColor: "rgb(15 118 110 / 0.04)", borderColor: "var(--accent)" }}
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex-1">
                <h3
                  className="font-semibold mb-1"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
                >
                  Your Representatives ({userState})
                </h3>
                <p
                  className="text-sm"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                >
                  Showing {userRepresentatives.length} representative{userRepresentatives.length !== 1 ? "s" : ""} from your state.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* ZIP Code Results Panel */}
        {activeZip && (
          <div
            className="rounded-md border p-5"
            style={{ backgroundColor: "#F0FDF4", borderColor: "#22C55E" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3
                className="font-semibold text-lg"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
              >
                Your Representatives — ZIP {activeZip}
              </h3>
            </div>

            {zipLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Looking up representatives...
              </div>
            )}

            {zipFallback && !zipLoading && (
              <p className="text-sm text-amber-700">{zipFallback}</p>
            )}

            {!zipLoading && !zipFallback && zipReps.length === 0 && (
              <p className="text-sm text-slate-500">No representatives found for this ZIP code.</p>
            )}

            {!zipLoading && zipReps.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {zipReps.map((rep) => {
                  const partyColor = rep.party === "D" ? "var(--democrat)" : rep.party === "R" ? "var(--republican)" : "var(--independent)";
                  const verdictStyle = rep.verdictScore === "captured"
                    ? { bg: "#FEF2F2", border: "#EF4444", text: "#B91C1C", icon: "\uD83D\uDEA8" }
                    : rep.verdictScore === "mixed"
                    ? { bg: "#FFFBEB", border: "#F59E0B", text: "#B45309", icon: "\u26A0\uFE0F" }
                    : rep.verdictScore === "focused"
                    ? { bg: "#F0FDF4", border: "#22C55E", text: "#15803D", icon: "\u2705" }
                    : null;

                  return (
                    <Link
                      key={rep.id}
                      href={`/rep/${rep.id}`}
                      className="flex items-center gap-3 bg-white rounded-md border border-slate-200 p-3 hover:border-teal-400 transition-colors"
                    >
                      {rep.photo_url && (
                        <img
                          src={rep.photo_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold text-sm truncate"
                            style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
                          >
                            {rep.name}
                          </span>
                          <span
                            className="text-xs font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0"
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              backgroundColor: rep.party === "D" ? "#EFF6FF" : rep.party === "R" ? "#FEF2F2" : "#F5F3FF",
                              color: partyColor,
                              fontSize: "0.625rem",
                            }}
                          >
                            {rep.party}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          {rep.chamber === "senate" ? "Senator" : "Representative"} · {rep.state}{rep.district ? `-${rep.district}` : ""}
                        </div>
                        {verdictStyle && (
                          <div
                            className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-sm"
                            style={{
                              backgroundColor: verdictStyle.bg,
                              color: verdictStyle.text,
                              border: `1px solid ${verdictStyle.border}`,
                              fontFamily: "'Source Sans 3', sans-serif",
                              fontSize: "0.65rem",
                            }}
                          >
                            {verdictStyle.icon} {rep.verdictLabel}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Search + Filters — editorial panel */}
        <div
          className="sticky top-16 z-10 backdrop-blur-sm border border-slate-200 rounded-md p-4 sm:p-6"
          style={{ backgroundColor: "rgb(255 255 255 / 0.96)", boxShadow: "0 4px 16px rgb(15 23 42 / 0.06)" }}
        >
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative search-wrap">
              <input
                type="text"
                placeholder="Search by name, state, or district (e.g., CA-12)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-sm text-base leading-relaxed transition min-h-[44px]"
                style={{ fontFamily: "'Source Sans 3', sans-serif", outlineColor: "var(--accent)" }}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
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

            {/* Party Filter Buttons — design-system aligned */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                Party
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { val: "", label: `All (${stats.total})`, color: "var(--text-primary)", bg: "#F1F5F9", activeBg: "#0F172A", activeText: "#FFFFFF" },
                  { val: "D", label: `Democrat (${stats.democrats})`, color: "var(--democrat)", bg: "#EFF6FF", activeBg: "var(--democrat)", activeText: "#FFFFFF" },
                  { val: "R", label: `Republican (${stats.republicans})`, color: "var(--republican)", bg: "#FEF2F2", activeBg: "var(--republican)", activeText: "#FFFFFF" },
                  { val: "I", label: `Independent (${stats.independents})`, color: "var(--independent)", bg: "#F5F3FF", activeBg: "var(--independent)", activeText: "#FFFFFF" },
                ].map((opt) => {
                  const active = party === opt.val;
                  return (
                    <button
                      key={opt.val}
                      onClick={() => setParty(opt.val)}
                      className="px-3 py-2 rounded-sm font-semibold text-xs uppercase tracking-wide transition"
                      style={{
                        fontFamily: "'Source Sans 3', sans-serif",
                        minHeight: 40,
                        backgroundColor: active ? opt.activeBg : opt.bg,
                        color: active ? opt.activeText : opt.color,
                        border: `1px solid ${active ? opt.activeBg : opt.color}44`,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Donor Verdict Filter */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                Donor Allegiance
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { val: "",         label: "All",                icon: "",   bg: "#F1F5F9", activeBg: "#0F172A", color: "var(--text-primary)",  activeText: "#FFFFFF" },
                  { val: "captured", label: `Donor Captured (${verdictCounts.captured})`,   icon: "🚨", bg: "#FEF2F2", activeBg: "#B91C1C",  color: "#B91C1C",             activeText: "#FFFFFF" },
                  { val: "mixed",    label: `Mixed Allegiance (${verdictCounts.mixed})`,    icon: "⚠️", bg: "#FFFBEB", activeBg: "#B45309",  color: "#B45309",             activeText: "#FFFFFF" },
                  { val: "focused",  label: `Constituent Focused (${verdictCounts.focused})`, icon: "✅", bg: "#F0FDF4", activeBg: "#15803D",  color: "#15803D",             activeText: "#FFFFFF" },
                ].map((opt) => {
                  const active = donorVerdict === opt.val;
                  return (
                    <button
                      key={opt.val}
                      onClick={() => setDonorVerdict(opt.val)}
                      className="px-3 py-2 rounded-sm font-semibold text-xs uppercase tracking-wide transition"
                      style={{
                        fontFamily: "'Source Sans 3', sans-serif",
                        minHeight: 40,
                        backgroundColor: active ? opt.activeBg : opt.bg,
                        color: active ? opt.activeText : opt.color,
                        border: `1px solid ${active ? opt.activeBg : opt.color}44`,
                      }}
                    >
                      {opt.icon && <span className="mr-1">{opt.icon}</span>}{opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropdowns Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label
                  htmlFor="chamber-select"
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                >
                  Chamber
                </label>
                <select
                  id="chamber-select"
                  value={chamber}
                  onChange={(e) => setChamber(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-sm bg-white font-medium text-base leading-relaxed transition min-h-[44px]"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
                >
                  <option value="">All Chambers</option>
                  <option value="house">House ({stats.house})</option>
                  <option value="senate">Senate ({stats.senate})</option>
                </select>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="state-select"
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                >
                  State
                </label>
                <select
                  id="state-select"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-sm bg-white font-medium text-base leading-relaxed transition min-h-[44px]"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)" }}
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

        {/* ── Party composition bar ── */}
        {!isFiltered && stats.total > 0 && (
          <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Party composition — 119th Congress
            </p>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div style={{ width: `${(stats.democrats / stats.total) * 100}%`, backgroundColor: "var(--democrat)" }} title={`Democrat: ${stats.democrats}`} />
              <div style={{ width: `${(stats.republicans / stats.total) * 100}%`, backgroundColor: "var(--republican)" }} title={`Republican: ${stats.republicans}`} />
              <div style={{ width: `${(stats.independents / stats.total) * 100}%`, backgroundColor: "var(--independent)" }} title={`Independent: ${stats.independents}`} />
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {[
                { label: "Democrat", count: stats.democrats, color: "var(--democrat)" },
                { label: "Republican", count: stats.republicans, color: "var(--republican)" },
                { label: "Independent", count: stats.independents, color: "var(--independent)" },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span
                    className="text-xs"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
                  >
                    {p.label}: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)", fontWeight: 700 }}>{p.count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: isFiltered ? "Showing" : "Total Members", value: filteredStats.total, color: "var(--text-primary)" },
            { label: "Democrats", value: filteredStats.democrats, color: "var(--democrat)" },
            { label: "Republicans", value: filteredStats.republicans, color: "var(--republican)" },
            { label: "Independents", value: filteredStats.independents, color: "var(--independent)" },
          ].map((s) => (
            <div key={s.label} className="rounded-md border border-slate-200 bg-white py-5 px-4 text-center">
              <div
                className="text-4xl font-bold tabular-nums mb-1"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: s.color, lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Score Legend */}
        <ScoreLegend />

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20 text-lg text-slate-500 leading-relaxed">
            No members match your filters. Try adjusting your search.
          </div>
        ) : (
          <ScrollFadeIn as="div" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" stagger staggerMs={60} direction="up" distance={24}>
            {pagedMembers.map((member) => (
              <MemberCard
                key={member.bioguide_id}
                member={member}
                userState={userState}
                currentStateFilter={state}
              />
            ))}
          </ScrollFadeIn>
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
    </div>
  );
}

export default function CongressPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
