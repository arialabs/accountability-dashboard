"use client";

import { useState } from "react";
import type { Source } from "@/lib/types";

interface SourceListProps {
  sources: Source[];
  expanded?: boolean;
  maxVisible?: number;
}

const sourceIcons: Record<Source["type"], string> = {
  news: "📰",
  court_doc: "⚖️",
  official_report: "📄",
  congressional_record: "🏛️",
  filing: "📊",
};

export default function SourceList({ 
  sources, 
  expanded: initialExpanded = false,
  maxVisible = 3 
}: SourceListProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  
  const visibleSources = expanded ? sources : sources.slice(0, maxVisible);
  const hasMore = sources.length > maxVisible;
  
  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
        SOURCES ({sources.length})
      </div>
      
      <div className="space-y-2">
        {visibleSources.map((source, index) => (
          <div 
            key={index}
            className="bg-slate-50 rounded-lg p-3 flex items-start gap-3 hover:bg-slate-100 transition-colors"
          >
            {/* Icon */}
            <span className="text-2xl flex-shrink-0" aria-hidden="true">
              {sourceIcons[source.type]}
            </span>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 text-sm">
                {source.publication}
              </div>
              <div className="text-slate-600 text-sm leading-snug mt-0.5">
                "{source.title}"
              </div>
              <div className="text-slate-400 text-xs mt-1">
                Published: {new Date(source.published_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            {/* Action */}
            <a 
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex-shrink-0 whitespace-nowrap min-h-[44px] flex items-center"
              aria-label={`View source: ${source.title}`}
            >
              View →
            </a>
          </div>
        ))}
      </div>
      
      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-3 text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 min-h-[44px]"
          aria-label={`Show ${sources.length - maxVisible} more sources`}
        >
          + Show {sources.length - maxVisible} more source{sources.length - maxVisible !== 1 ? 's' : ''}
        </button>
      )}
      
      {expanded && hasMore && (
        <button
          onClick={() => setExpanded(false)}
          className="mt-3 text-slate-600 hover:text-slate-700 font-semibold text-sm flex items-center gap-1"
        >
          Show less
        </button>
      )}
    </div>
  );
}
