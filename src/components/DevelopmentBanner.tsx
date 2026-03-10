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
      className="border-b py-1 px-4"
      style={{
        backgroundColor: "#F1F5F9",
        borderColor: "#E2E8F0",
        fontFamily: "'JetBrains Mono', monospace",
      }}
      role="status"
      aria-label="Site status and data freshness"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-center">
        <span className="text-[11px]" style={{ color: "#64748B" }}>
          Data synced <span className="font-semibold" style={{ color: "#334155" }}>{LAST_SYNCED}</span>
        </span>
        <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
        <span className="text-[11px] hidden sm:inline" style={{ color: "#64748B" }}>
          Sources: Congress.gov · OpenFEC · Voteview
        </span>
        <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
        <span className="text-[11px] hidden sm:inline" style={{ color: "#64748B" }}>
          535 members · 2.4M+ votes
        </span>
      </div>
    </div>
  );
}
