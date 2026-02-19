'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Stub data — real autocomplete will wire up to the database
const NOTABLE_REPS = [
  { name: "Nancy Pelosi", role: "Representative · CA-11 · D", id: "P000197" },
  { name: "Mitch McConnell", role: "Senator · Kentucky · R", id: "M000355" },
  { name: "Chuck Schumer", role: "Senator · New York · D", id: "S000148" },
  { name: "Mike Johnson", role: "Representative · LA-4 · R", id: "J000299" },
  { name: "Bernie Sanders", role: "Senator · Vermont · I", id: "S000033" },
  { name: "Alexandria Ocasio-Cortez", role: "Representative · NY-14 · D", id: "O000172" },
  { name: "Ted Cruz", role: "Senator · Texas · R", id: "C001098" },
  { name: "Elizabeth Warren", role: "Senator · Massachusetts · D", id: "W000817" },
  { name: "Marco Rubio", role: "Senator · Florida · R", id: "R000595" },
  { name: "Rand Paul", role: "Senator · Kentucky · R", id: "P000603" },
];

interface RepSearchProps {
  placeholder?: string;
  className?: string;
  size?: 'default' | 'large';
}

export default function RepSearch({ placeholder = "Search by name, state, or ZIP code", className = "", size = 'default' }: RepSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof NOTABLE_REPS>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length >= 2) {
      const q = query.toLowerCase();
      setSuggestions(
        NOTABLE_REPS.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q)
        ).slice(0, 5)
      );
    } else {
      setSuggestions([]);
    }
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
        <div className={`relative flex items-center border-2 border-slate-900 bg-white transition-shadow ${showSuggestions ? 'rounded-t-none rounded-b-none shadow-none' : 'rounded'} ${size === 'large' ? 'text-lg' : 'text-base'}`}
          style={{ borderRadius: showSuggestions ? '4px 4px 0 0' : '4px' }}
        >
          {/* Search Icon */}
          <div className="pl-4 text-slate-500 flex-shrink-0">
            <svg className={size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder={placeholder}
            className={`w-full bg-transparent px-3 text-slate-900 placeholder-slate-400 focus:outline-none ${size === 'large' ? 'py-4 text-lg' : 'py-3 text-base'}`}
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            aria-label="Search for a representative"
            autoComplete="off"
          />
          <button
            type="submit"
            className={`flex-shrink-0 mr-2 bg-slate-900 text-white font-semibold rounded px-4 py-1.5 hover:bg-teal-700 transition-colors text-sm`}
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Look up
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div className="absolute left-0 right-0 z-50 border-2 border-t-0 border-slate-900 bg-white shadow-lg rounded-b">
            {suggestions.map((rep) => (
              <button
                key={rep.id}
                type="button"
                onMouseDown={() => handleSelect(rep)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
              >
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <div className="text-sm font-semibold text-slate-900" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{rep.name}</div>
                  <div className="text-xs text-slate-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{rep.role}</div>
                </div>
              </button>
            ))}
            <div className="px-4 py-2 text-xs text-slate-400 bg-slate-50" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Press Enter to search all results
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
