'use client';

import { useEffect, useRef, useState } from 'react';

interface AccountabilityDataCardProps {
  value: string;
  label: string;
  /** Optional: 'up' | 'down' | 'flag' | 'neutral' */
  indicator?: 'up' | 'down' | 'flag' | 'neutral';
  /** Optional subtext shown below indicator */
  context?: string;
  /** Optional: override card background (default dark) */
  light?: boolean;
  /** Optional: make this stat visually dominant (larger number) */
  featured?: boolean;
  className?: string;
}

function TrendUp() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 5 5M7 7l5-5 5 5" />
    </svg>
  );
}

function TrendDown() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-5 5-5-5M17 17l-5 5-5-5" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18M3 5l8 4-8 4" />
    </svg>
  );
}

export default function AccountabilityDataCard({
  value,
  label,
  indicator = 'neutral',
  context,
  light = false,
  featured = false,
  className = '',
}: AccountabilityDataCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const indicatorColor =
    indicator === 'up' ? '#5EEAD4' :
    indicator === 'down' ? '#F87171' :
    indicator === 'flag' ? '#F59E0B' :
    '#94A3B8';

  const indicatorLabel =
    indicator === 'up' ? 'trending up' :
    indicator === 'down' ? 'trending down' :
    indicator === 'flag' ? 'flagged' :
    '';

  if (light) {
    return (
      <div
        ref={ref}
        className={`border-l-2 pl-4 py-2 ${className}`}
        style={{ borderColor: 'var(--accent)' }}
      >
        <div
          className="text-2xl font-bold tabular-nums"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent)' }}
        >
          {value}
        </div>
        <div
          className="text-xs uppercase tracking-wider mt-1"
          style={{ fontFamily: "'Source Sans 3', sans-serif", color: 'var(--text-secondary)' }}
        >
          {label}
        </div>
        {context && (
          <div className="text-xs mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif", color: 'var(--text-secondary)' }}>
            {context}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-sm ${className}`}
      style={{ backgroundColor: '#0F172A', padding: '1.5rem 1.25rem' }}
    >
      {/* Teal left-border brand mark */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ backgroundColor: '#14B8A6' }}
        aria-hidden="true"
      />

      {/* Value */}
      <div
        className={`${featured ? 'text-5xl' : 'text-3xl'} font-bold tabular-nums leading-none mb-2 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        style={{ fontFamily: "'JetBrains Mono', monospace", color: '#5EEAD4' }}
      >
        {value}
      </div>

      {/* Label */}
      <div
        className="text-xs uppercase tracking-wider mb-3"
        style={{ fontFamily: "'Source Sans 3', sans-serif", color: '#94A3B8' }}
      >
        {label}
      </div>

      {/* Indicator */}
      {indicator !== 'neutral' && (
        <div
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ fontFamily: "'Source Sans 3', sans-serif", color: indicatorColor }}
          aria-label={indicatorLabel}
        >
          {indicator === 'up' && <TrendUp />}
          {indicator === 'down' && <TrendDown />}
          {indicator === 'flag' && <FlagIcon />}
          {context && <span>{context}</span>}
        </div>
      )}

      {!context && indicator === 'neutral' && (
        <div style={{ height: '1rem' }} />
      )}
    </div>
  );
}
