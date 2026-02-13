import Link from "next/link";

export type DataSourceType = "congress" | "openfec" | "ontheissues" | "propublica" | "opensecrets";

interface DataSourceConfig {
  label: string;
  icon: string;
  baseUrl: string;
  color: string;
  bg: string;
}

const sources: Record<DataSourceType, DataSourceConfig> = {
  congress: {
    label: "Congress.gov",
    icon: "🏛️",
    baseUrl: "https://www.congress.gov",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  openfec: {
    label: "OpenFEC",
    icon: "💰",
    baseUrl: "https://www.fec.gov",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200 hover:bg-green-100",
  },
  ontheissues: {
    label: "OnTheIssues",
    icon: "📋",
    baseUrl: "https://www.ontheissues.org",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  propublica: {
    label: "ProPublica",
    icon: "📰",
    baseUrl: "https://www.propublica.org",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
  opensecrets: {
    label: "OpenSecrets",
    icon: "🔍",
    baseUrl: "https://www.opensecrets.org",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200 hover:bg-red-100",
  },
};

interface DataSourceBadgeProps {
  source: DataSourceType;
  /** Direct URL to the specific data point */
  url?: string;
  /** When this data was retrieved */
  retrievedAt?: string;
  /** Compact mode — icon + abbreviation only */
  compact?: boolean;
}

export default function DataSourceBadge({ source, url, retrievedAt, compact = false }: DataSourceBadgeProps) {
  const config = sources[source];
  const href = url || config.baseUrl;

  const badge = (
    <span
      className={`inline-flex items-center gap-1 rounded-full border text-xs font-semibold transition-colors ${config.bg} ${config.color} ${
        compact ? "px-1.5 py-0.5" : "px-2.5 py-1"
      }`}
      title={retrievedAt ? `Data from ${config.label} · Retrieved ${retrievedAt}` : `Data from ${config.label}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {!compact && <span>{config.label}</span>}
      {!compact && (
        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </span>
  );

  if (url) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex">
        {badge}
      </a>
    );
  }

  return badge;
}

/** Footer attribution bar for site-wide use */
export function DataAttributionFooter({ lastUpdated }: { lastUpdated?: string }) {
  return (
    <div className="border-t border-slate-200 bg-slate-50 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-slate-600">Data from:</span>
          <DataSourceBadge source="congress" compact />
          <DataSourceBadge source="openfec" compact />
          <DataSourceBadge source="ontheissues" compact />
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && <span>Updated {lastUpdated}</span>}
          <Link href="/methodology" className="text-blue-600 hover:text-blue-700 font-semibold">
            Methodology
          </Link>
        </div>
      </div>
    </div>
  );
}
