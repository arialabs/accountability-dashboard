'use client';

import voteSyncStatus from '@/data/vote-sync-status.json';

// Format the last success date as "Mar 5, 2026"
function formatSyncDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return isoDate.slice(0, 10);
  }
}

const LAST_SYNCED = formatSyncDate(
  (voteSyncStatus as { last_success_at?: string }).last_success_at ?? ''
);

export default function DevelopmentBanner() {
  return (
    <div
      className="border-b border-slate-200 py-1.5 px-4"
      style={{
        backgroundColor: "#F8FAFC",
        fontFamily: "'JetBrains Mono', monospace",
      }}
      role="status"
      aria-label="Data freshness indicator"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#6B7280" }}>
          Data synced
        </span>
        <span className="text-[11px] font-bold" style={{ color: "#111827" }}>
          {LAST_SYNCED}
        </span>
        <span className="text-slate-300" aria-hidden="true">·</span>
        <span className="text-[11px]" style={{ color: "#6B7280" }}>
          Sources: Congress.gov · OpenFEC · Voteview
        </span>
        <span className="text-slate-300" aria-hidden="true">·</span>
        <span className="text-[11px]" style={{ color: "#6B7280" }}>
          535 members · 2.4M+ votes
        </span>
      </div>
    </div>
  );
}
