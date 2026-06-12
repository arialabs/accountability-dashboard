import type { Metadata } from "next";
import Link from "next/link";
import provenanceData from "@/data/data-provenance.json";
import { formatDate, daysSince } from "@/components/DataProvenance";

export const metadata: Metadata = {
  title: "Data Status",
  description:
    "Every dataset on this site: where it comes from, how it refreshes, and when it was last updated.",
};

interface ProvenanceDataset {
  file: string;
  label: string;
  source: string;
  source_url: string;
  refresh: string;
  stale_after_days: number | null;
  last_updated: string | null;
  exists: boolean;
  hidden: boolean;
  notes: string | null;
}

const REFRESH_LABELS: Record<string, string> = {
  "auto-daily": "Automated · daily",
  "auto-weekly": "Automated · weekly",
  manual: "Script-refreshed · on demand",
  editorial: "Editorial · hand-researched",
};

const GROUP_ORDER = ["auto-daily", "auto-weekly", "manual", "editorial"];

const GROUP_DESCRIPTIONS: Record<string, string> = {
  "auto-daily":
    "Synced every day by automated pipelines. A failed sync files a GitHub issue automatically.",
  "auto-weekly": "Refreshed weekly by automated pipelines.",
  manual:
    "Refreshed by running a script manually. These can lag — the dates below are honest about it.",
  editorial:
    "Hand-researched content with sources cited inline. Shown with its last review date rather than a staleness warning.",
};

function statusBadge(d: ProvenanceDataset) {
  if (!d.exists || !d.last_updated) {
    return { text: "No data", cls: "bg-slate-100 text-slate-500" };
  }
  const age = daysSince(d.last_updated);
  if (d.stale_after_days !== null && age !== null && age > d.stale_after_days) {
    return { text: `Stale (${age}d)`, cls: "bg-amber-100 text-amber-800" };
  }
  if (d.refresh === "editorial" || d.refresh === "manual") {
    return { text: `${age}d old`, cls: "bg-slate-100 text-slate-600" };
  }
  return { text: "Fresh", cls: "bg-emerald-100 text-emerald-800" };
}

export default function DataStatusPage() {
  const { datasets, generated_at } = provenanceData as {
    datasets: ProvenanceDataset[];
    generated_at: string;
  };

  const visible = datasets.filter((d) => !d.hidden);

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <Link
            href="/"
            className="text-blue-300 hover:text-blue-200 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black tracking-tight mb-3">Data Status</h1>
          <p className="text-slate-300 max-w-2xl">
            Every dataset on this site, where it comes from, how it refreshes, and
            when it last changed. If a number can&apos;t be traced here, we
            shouldn&apos;t be showing it.
          </p>
          <p className="text-sm text-slate-400 mt-3">
            Page generated {formatDate(generated_at)} ·{" "}
            <Link href="/methodology" className="underline hover:text-slate-200">
              Methodology
            </Link>
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          {GROUP_ORDER.map((group) => {
            const rows = visible.filter((d) => d.refresh === group);
            if (rows.length === 0) return null;
            return (
              <div key={group}>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {REFRESH_LABELS[group]}
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  {GROUP_DESCRIPTIONS[group]}
                </p>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5">Dataset</th>
                        <th className="px-4 py-2.5">Source</th>
                        <th className="px-4 py-2.5">Last updated</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((d) => {
                        const badge = statusBadge(d);
                        return (
                          <tr key={d.file} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-medium text-slate-800">
                              {d.label}
                              {d.notes && (
                                <p className="text-xs font-normal text-slate-400 mt-0.5">
                                  {d.notes}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600">
                              {d.source_url ? (
                                d.source_url.startsWith("/") ? (
                                  <Link
                                    href={d.source_url}
                                    className="underline decoration-dotted hover:text-slate-900"
                                  >
                                    {d.source}
                                  </Link>
                                ) : (
                                  <a
                                    href={d.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline decoration-dotted hover:text-slate-900"
                                  >
                                    {d.source}
                                  </a>
                                )
                              ) : (
                                d.source
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                              {formatDate(d.last_updated)}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${badge.cls}`}
                              >
                                {badge.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">
              How staleness is decided
            </p>
            <p>
              Daily-automated datasets are flagged after 3 days without a refresh;
              weekly-automated after 14. Script-refreshed and editorial datasets
              show their age instead of a warning — judge them by the date. Failed
              pipeline runs automatically open a GitHub issue in the project
              repository.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
