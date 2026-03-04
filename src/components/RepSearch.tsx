'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

interface RepSearchProps {
  placeholder?: string;
  className?: string;
  size?: 'default' | 'large';
}

export default function RepSearch({
  placeholder = "Search by name, state, or ZIP code",
  className = "",
  size = 'default',
}: RepSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof NOTABLE_REPS>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length >= 2) {
      // Simulate brief "scanning" while filtering
      setIsSearching(true);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        const q = query.toLowerCase();
        setSuggestions(
          NOTABLE_REPS.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.role.toLowerCase().includes(q) ||
            r.state.toLowerCase().includes(q)
          ).slice(0, 5)
        );
        setIsSearching(false);
      }, 180);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/congress?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = (rep: typeof NOTABLE_REPS[0]) => {
    router.push(`/rep/${rep.id}`);
  };

  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} role="search">
        {/* Outer wrap — animated on focus */}
        <div
          className={`search-wrap ${isFocused ? 'search-focused' : ''}`}
          style={{ borderRadius: showSuggestions ? '4px 4px 0 0' : '4px', position: 'relative' }}
        >
          {/* Scanning animation overlay — only while typing */}
          {isSearching && isFocused && (
            <span
              className="search-scanner"
              style={{ borderRadius: showSuggestions ? '4px 4px 0 0' : '4px', zIndex: 1 }}
              aria-hidden="true"
            />
          )}

          <div
            className={`relative flex items-center border-2 bg-white overflow-hidden ${
              isFocused ? 'border-teal-600' : 'border-slate-900'
            } transition-colors duration-200`}
            style={{ borderRadius: showSuggestions ? '4px 4px 0 0' : '4px' }}
          >
            {/* Search icon */}
            <div
              className="pl-4 flex-shrink-0 transition-colors duration-200"
              style={{ color: isFocused ? '#0F766E' : '#64748B' }}
            >
              <SearchIcon size={size} />
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
              aria-label="Search for a representative"
              autoComplete="off"
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

        {/* Suggestions dropdown */}
        {showSuggestions && (
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
      </form>
    </div>
  );
}
