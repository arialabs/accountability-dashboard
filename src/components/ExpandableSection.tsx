"use client";

import { useState } from "react";

interface ExpandableSectionProps {
  title: string;
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  sources?: Array<{ name: string; url?: string }>;
}

export default function ExpandableSection({
  title,
  summary,
  children,
  defaultExpanded = false,
  sources,
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  return (
    <div>
      {/* Title */}
      <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>

      {/* Summary layer — always visible */}
      <div className="mb-3">{summary}</div>

      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
      >
        {expanded ? "Hide details" : "Show details"}
      </button>

      {/* Detail layer — expandable */}
      {expanded && (
        <div className="mt-4">
          {children}

          {/* Reference layer — sources, collapsed by default */}
          {sources && sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSourcesExpanded(!sourcesExpanded)}
                aria-expanded={sourcesExpanded}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                {sourcesExpanded ? "Hide sources" : `Sources (${sources.length})`}
              </button>

              {sourcesExpanded && (
                <ul className="mt-2 space-y-1">
                  {sources.map((source, i) => (
                    <li key={i} className="text-xs text-slate-500">
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 underline"
                        >
                          {source.name}
                        </a>
                      ) : (
                        source.name
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
