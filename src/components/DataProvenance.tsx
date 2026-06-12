import Link from "next/link";
import provenanceData from "@/data/data-provenance.json";

/**
 * One-line provenance attribution for a dataset: source, last-updated date,
 * and an automatic staleness warning when an auto-refreshed dataset has
 * blown past its expected refresh interval.
 *
 * Dates come from src/data/data-provenance.json, generated at build time by
 * scripts/compute-data-provenance.ts.
 */

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

const DATASETS: ProvenanceDataset[] = (
  provenanceData as { datasets: ProvenanceDataset[] }
).datasets;

export function getDataset(file: string): ProvenanceDataset | null {
  return DATASETS.find((d) => d.file === file) ?? null;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "unknown";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return null;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export default function DataProvenance({
  dataset,
  className = "",
}: {
  /** File name in src/data, e.g. "finance.json" */
  dataset: string;
  className?: string;
}) {
  const d = getDataset(dataset);
  if (!d) return null;

  const age = daysSince(d.last_updated);
  const isStale =
    d.stale_after_days !== null && age !== null && age > d.stale_after_days;
  const isEditorial = d.refresh === "editorial";

  const sourceNode = d.source_url.startsWith("/") ? (
    <Link href={d.source_url} className="underline decoration-dotted hover:text-slate-600">
      {d.source}
    </Link>
  ) : d.source_url ? (
    <a
      href={d.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-dotted hover:text-slate-600"
    >
      {d.source}
    </a>
  ) : (
    <span>{d.source}</span>
  );

  return (
    <div className={`text-xs text-slate-400 ${className}`}>
      <span>
        {isEditorial ? "Editorial — " : "Source: "}
        {sourceNode}
        {" · "}
        {isEditorial ? "last reviewed" : "updated"} {formatDate(d.last_updated)}
      </span>
      {isStale && (
        <span className="ml-2 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
          ⚠️ may be outdated ({age} days old)
        </span>
      )}
      {" · "}
      <Link href="/data-status" className="underline decoration-dotted hover:text-slate-600">
        all sources
      </Link>
    </div>
  );
}
