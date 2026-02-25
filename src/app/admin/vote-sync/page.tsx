import { getLiveVoteMeta, getVoteSyncStatus } from '@/lib/live-votes';

function formatDate(date: string | null) {
  if (!date) return 'Never';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
}

export default function VoteSyncAdminPage() {
  const status = getVoteSyncStatus();
  const meta = getLiveVoteMeta();

  const statusBadge =
    status.status === 'ok'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : status.status === 'partial'
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-red-100 text-red-700 border-red-200';

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Vote Sync Admin Status</h1>
            <span className={`px-3 py-1 rounded-full border text-sm font-semibold ${statusBadge}`}>
              {status.status.toUpperCase()}
            </span>
          </div>
          <p className="text-slate-600 mt-3">
            Last attempt: {formatDate(status.last_attempt_at)}
            <br />
            Last success: {formatDate(status.last_success_at)}
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Sync Counts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">Fetched roll calls: <strong>{status.total_roll_calls_fetched}</strong></div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">Stored roll calls: <strong>{status.total_roll_calls_stored}</strong></div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">Stored member votes: <strong>{status.total_member_votes_stored}</strong></div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">Deduped votes removed: <strong>{status.deduped_member_votes}</strong></div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">Store generated: <strong>{formatDate(meta.generated_at)}</strong></div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">Lookback window: <strong>{meta.lookback_days} days</strong></div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Manual Trigger Endpoint</h2>
          <p className="text-sm text-slate-600 mb-3">
            Trigger via GitHub Actions workflow dispatch endpoint:
          </p>
          <code className="block text-xs bg-slate-950 text-slate-100 rounded-lg p-3 overflow-x-auto">
            POST https://api.github.com/repos/&lt;owner&gt;/&lt;repo&gt;/actions/workflows/vote-sync.yml/dispatches
          </code>
          <p className="text-xs text-slate-500 mt-3">
            Required headers: Authorization: Bearer &lt;token&gt;, Accept: application/vnd.github+json
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Recent Errors</h2>
          {status.errors.length === 0 ? (
            <p className="text-sm text-slate-600">No recent sync errors.</p>
          ) : (
            <ul className="space-y-2">
              {status.errors.slice(0, 10).map((error, idx) => (
                <li key={`${error.at}-${idx}`} className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm font-semibold text-red-900">{error.stage}</p>
                  <p className="text-xs text-red-800 mt-1">{error.message}</p>
                  {error.detail && <p className="text-xs text-red-700 mt-1">{error.detail}</p>}
                  <p className="text-[11px] text-red-700 mt-1">{formatDate(error.at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
