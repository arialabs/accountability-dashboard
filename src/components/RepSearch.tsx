'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isZipCode, fetchRepsByZip, enrichRepsWithVerdicts, type EnrichedRep } from '@/lib/find-reps';
import { RepVerdictBadge } from '@/components/RepVerdictBadge';
import financeData from '@/data/finance.json';

// Notable reps for autocomplete suggestions — party + photo
const NOTABLE_REPS = [
  { name: "Nancy Pelosi",            role: "Representative · CA-11",  party: "D", state: "CA", id: "P000197", photo: "/photos/P000197.jpg" },
  { name: "Mitch McConnell",         role: "Senator · Kentucky",       party: "R", state: "KY", id: "M000355", photo: "/photos/M000355.jpg" },
  { name: "Chuck Schumer",           role: "Senator · New York",       party: "D", state: "NY", id: "S000148", photo: "/photos/S000148.jpg" },
  { name: "Mike Johnson",            role: "Representative · LA-4",    party: "R", state: "LA", id: "J000299", photo: "/photos/J000299.jpg" },
  { name: "Bernie Sanders",          role: "Senator · Vermont",        party: "I", state: "VT", id: "S000033", photo: "/photos/S000033.jpg" },
  { name: "Alexandria Ocasio-Cortez",role: "Representative · NY-14",   party: "D", state: "NY", id: "O000172", photo: "/photos/O000172.jpg" },
  { name: "Ted Cruz",                role: "Senator · Texas",          party: "R", state: "TX", id: "C001098", photo: "/photos/C001098.jpg" },
  { name: "Elizabeth Warren",        role: "Senator · Massachusetts",  party: "D", state: "MA", id: "W000817", photo: "/photos/W000817.jpg" },
  { name: "Marco Rubio",             role: "Senator · Florida",        party: "R", state: "FL", id: "R000595", photo: "/photos/R000595.jpg" },
  { name: "Rand Paul",               role: "Senator · Kentucky",       party: "R", state: "KY", id: "P000603", photo: "/photos/P000603.jpg" },
];

const PARTY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  D: { bg: '#EFF6FF', text: '#1D4ED8', label: 'D' },
  R: { bg: '#FEF2F2', text: '#DC2626', label: 'R' },
  I: { bg: '#F5F3FF', text: '#7C3AED', label: 'I' },
};

function SearchIcon({ size = 'default' }: { size?: 'default' | 'large' }) {
  const cls = size === 'large' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-t-transparent" />
      <span className="ml-2 text-sm text-slate-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        Looking up your reps…
      </span>
    </div>
  );
}

interface RepSearchProps {
  placeholder?: string;
  className?: string;
  size?: 'default' | 'large';
}

// Cast the imported finance JSON to a workable type
const financeMap = financeData as Record<string, { pac_percentage: number }>;

export default function RepSearch({
  placeholder = "Search by name, state, or ZIP code",
  className = "",
  size = 'default',
}: RepSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof NOTABLE_REPS>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // ZIP lookup state
  const [zipLoading, setZipLoading] = useState(false);
  const [zipReps, setZipReps] = useState<EnrichedRep[] | null>(null);
  const [zipState, setZipState] = useState<string | null>(null);
  const [zipError, setZipError] = useState(false);
  const [lastSearchedZip, setLastSearchedZip] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Dismiss ZIP panel
  const clearZipResults = useCallback(() => {
    setZipReps(null);
    setZipState(null);
    setZipError(false);
    setLastSearchedZip(null);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      setIsSearching(true);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        if (isZipCode(query)) {
          // ZIP mode — clear name suggestions
          setSuggestions([]);
          setIsSearching(false);
        } else {
          const q = query.toLowerCase();
          setSuggestions(
            NOTABLE_REPS.filter(r =>
              r.name.toLowerCase().includes(q) ||
              r.role.toLowerCase().includes(q) ||
              r.state.toLowerCase().includes(q)
            ).slice(0, 5)
          );
          setIsSearching(false);
          // Clear ZIP results if user switched to name search
          if (zipReps !== null) clearZipResults();
        }
      }, 180);
    } else {
      setSuggestions([]);
      setIsSearching(false);
      if (zipReps !== null) clearZipResults();
    }
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Trigger ZIP lookup after user stops typing (debounced 400ms)
  useEffect(() => {
    if (!isZipCode(query)) return;
    if (query === lastSearchedZip) return; // don't re-fetch same zip

    if (zipTimer.current) clearTimeout(zipTimer.current);
    zipTimer.current = setTimeout(async () => {
      setZipLoading(true);
      setZipReps(null);
      setZipError(false);

      const result = await fetchRepsByZip(query);
      setLastSearchedZip(query);

      if (result.fallback) {
        setZipError(true);
        setZipReps([]);
      } else {
        const enriched = enrichRepsWithVerdicts(result.reps, financeMap);
        setZipReps(enriched);
        setZipState(result.state ?? null);
      }
      setZipLoading(false);
    }, 400);

    return () => { if (zipTimer.current) clearTimeout(zipTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    if (isZipCode(q) && zipError) {
      // Fallback: route to congress search
      router.push(`/congress?search=${encodeURIComponent(q)}`);
    } else if (!isZipCode(q)) {
      router.push(`/congress?search=${encodeURIComponent(q)}`);
    }
    // If ZIP and results are shown, form submit does nothing extra
  };

  const handleSelect = (rep: typeof NOTABLE_REPS[0]) => {
    router.push(`/rep/${rep.id}`);
  };

  const showNameSuggestions = isFocused && suggestions.length > 0 && !isZipCode(query);
  const showZipPanel = isZipCode(query) && (zipLoading || zipReps !== null || zipError);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} role="search">
        {/* Outer wrap — animated on focus */}
        <div
          className={`search-wrap ${isFocused ? 'search-focused' : ''}`}
          style={{ borderRadius: showNameSuggestions || showZipPanel ? '4px 4px 0 0' : '4px', position: 'relative' }}
        >
          {/* Scanning animation overlay — only while typing */}
          {isSearching && isFocused && (
            <span
              className="search-scanner"
              style={{ borderRadius: showNameSuggestions ? '4px 4px 0 0' : '4px', zIndex: 1 }}
              aria-hidden="true"
            />
          )}

          <div
            className={`relative flex items-center border-2 bg-white overflow-hidden ${
              isFocused ? 'border-teal-600' : 'border-slate-900'
            } transition-colors duration-200`}
            style={{ borderRadius: showNameSuggestions || showZipPanel ? '4px 4px 0 0' : '4px' }}
          >
            {/* Search icon — show location pin for ZIP */}
            <div
              className="pl-4 flex-shrink-0 transition-colors duration-200"
              style={{ color: isFocused ? '#0F766E' : '#64748B' }}
            >
              {isZipCode(query) ? <LocationPinIcon /> : <SearchIcon size={size} />}
            </div>

            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder={placeholder}
              className={`flex-1 min-w-0 bg-transparent px-3 text-slate-900 placeholder-slate-400 focus:outline-none ${
                size === 'large' ? 'py-4 text-lg' : 'py-3 text-base'
              }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              aria-label="Search for a representative or enter your ZIP code"
              autoComplete="off"
              inputMode={isZipCode(query.slice(0, 5)) || query.length <= 5 ? 'numeric' : 'text'}
              maxLength={100}
            />

            <button
              type="submit"
              className="flex-shrink-0 mr-2 font-semibold rounded-sm px-4 py-1.5 text-sm transition-colors"
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                backgroundColor: isFocused ? '#0F766E' : '#0F172A',
                color: '#ffffff',
              }}
            >
              Look up
            </button>
          </div>
        </div>

        {/* Name suggestions dropdown */}
        {showNameSuggestions && (
          <div
            className="absolute left-0 right-0 z-50 bg-white border-2 border-t-0 border-teal-600 overflow-hidden"
            style={{ borderRadius: '0 0 4px 4px', boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)' }}
          >
            {suggestions.map((rep) => {
              const ps = PARTY_STYLES[rep.party] ?? PARTY_STYLES['I'];
              return (
                <button
                  key={rep.id}
                  type="button"
                  onMouseDown={() => handleSelect(rep)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group"
                >
                  {/* Rep photo */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-sm bg-slate-200 overflow-hidden"
                    style={{ border: '1px solid #E2E8F0' }}
                  >
                    <img
                      src={rep.photo}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Name + role */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-semibold text-slate-900 truncate group-hover:text-teal-700 transition-colors"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {rep.name}
                    </div>
                    <div
                      className="text-xs text-slate-500 truncate"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {rep.role}
                    </div>
                  </div>

                  {/* Party indicator */}
                  <div
                    className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-sm"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      backgroundColor: ps.bg,
                      color: ps.text,
                      fontSize: '0.625rem',
                      letterSpacing: '0.05em',
                    }}
                    aria-label={rep.party === 'D' ? 'Democrat' : rep.party === 'R' ? 'Republican' : 'Independent'}
                  >
                    {ps.label}
                  </div>
                </button>
              );
            })}

            {/* Footer */}
            <div
              className="px-4 py-2 text-xs bg-slate-50 flex items-center justify-between"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: '#94A3B8' }}
            >
              <span>Press Enter to search all results</span>
              {isSearching && (
                <span className="text-teal-600 font-semibold uppercase tracking-wide" style={{ fontSize: '0.6rem' }}>
                  Scanning...
                </span>
              )}
            </div>
          </div>
        )}

        {/* ZIP lookup panel */}
        {showZipPanel && (
          <div
            className="absolute left-0 right-0 z-50 bg-white border-2 border-t-0 border-teal-600 overflow-hidden"
            style={{ borderRadius: '0 0 4px 4px', boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)' }}
            role="region"
            aria-label="Your representatives"
          >
            {/* Panel header */}
            <div
              className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between"
              style={{ backgroundColor: '#F0FDF4' }}
            >
              <div className="flex items-center gap-2">
                <LocationPinIcon />
                <span
                  className="text-sm font-semibold text-teal-800"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  Your Representatives — ZIP {query}
                  {zipState && ` · ${zipState}`}
                </span>
              </div>
              <button
                type="button"
                onClick={clearZipResults}
                className="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
                aria-label="Close representatives panel"
              >
                ×
              </button>
            </div>

            {/* Loading state */}
            {zipLoading && <LoadingSpinner />}

            {/* Error / fallback */}
            {!zipLoading && zipError && (
              <div className="px-4 py-4 text-center">
                <p className="text-sm text-slate-600 mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Couldn&apos;t look up reps for this ZIP automatically.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(`/congress?search=${encodeURIComponent(query)}`)}
                  className="text-sm font-semibold text-teal-700 hover:text-teal-900 underline underline-offset-2"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  Search congress page for {query} →
                </button>
              </div>
            )}

            {/* Results */}
            {!zipLoading && zipReps && zipReps.length > 0 && (
              <div>
                {zipReps.map((rep) => {
                  const ps = PARTY_STYLES[rep.party] ?? PARTY_STYLES['I'];
                  return (
                    <a
                      key={rep.bioguide_id}
                      href={rep.profile_url}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group no-underline"
                    >
                      {/* Photo */}
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-sm bg-slate-200 overflow-hidden"
                        style={{ border: '1px solid #E2E8F0' }}
                      >
                        {rep.photo_url ? (
                          <img
                            src={rep.photo_url}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">
                            {rep.display_name[0] ?? '?'}
                          </div>
                        )}
                      </div>

                      {/* Name + role */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors truncate"
                            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                          >
                            {rep.display_name}
                          </span>
                          {/* Party badge */}
                          <span
                            className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-sm"
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              backgroundColor: ps.bg,
                              color: ps.text,
                              fontSize: '0.625rem',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {ps.label}
                          </span>
                        </div>
                        <div
                          className="text-xs text-slate-500"
                          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                        >
                          {rep.chamber === 'house'
                            ? `Representative · ${rep.state}-${rep.district}`
                            : `Senator · ${rep.state}`}
                        </div>
                      </div>

                      {/* Verdict badge */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {rep.pac_pct !== null && (
                          <RepVerdictBadge
                            pacPct={rep.pac_pct}
                            className="text-xs px-2 py-0.5"
                          />
                        )}
                        <ExternalLinkIcon />
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {!zipLoading && zipReps && zipReps.length === 0 && !zipError && (
              <div className="px-4 py-4 text-center text-sm text-slate-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                No representatives found for this ZIP code.
              </div>
            )}

            {/* Footer */}
            <div
              className="px-4 py-2 text-xs bg-slate-50 flex items-center justify-between"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: '#94A3B8' }}
            >
              <span>Click a rep to view their full accountability profile</span>
              <span className="text-teal-600 font-medium">ZIP Lookup</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
