'use client';

import { useState, useEffect } from 'react';

export default function DevelopmentBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const isDismissed = localStorage.getItem('dev-banner-dismissed') === 'true';
      setDismissed(isDismissed);
    } catch {
      // localStorage not available (SSR edge case)
    }
  }, []);

  // Don't render during SSR or if dismissed
  if (!mounted || dismissed) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem('dev-banner-dismissed', 'true');
    } catch {
      // localStorage not available
    }
    setDismissed(true);
  };

  return (
    <div
      className="bg-amber-50 border-b border-amber-200 py-1.5 px-4"
      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      role="status"
      aria-label="Site status notification"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="flex-1 text-center text-xs font-medium text-amber-800 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>🚧 Active development — data is being verified and expanded.</span>
          <span className="text-amber-400" aria-hidden="true">·</span>
          <span className="text-amber-700">
            Last updated:{' '}
            <span className="font-semibold text-amber-900">Feb 19, 2026</span>
          </span>
          <span className="text-amber-400" aria-hidden="true">·</span>
          <span className="text-amber-600">Sources: Congress.gov, OpenFEC, Voteview</span>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-amber-400 hover:text-amber-700 transition-colors text-base leading-none"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
