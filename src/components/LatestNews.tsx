"use client";

import { useEffect, useState } from "react";
import type { ResearchResult } from "@/lib/perplexity";

// Static cache loaded at build time (fallback for static export)
type NewsCache = Record<string, { name: string; summary: string; citations: string[]; fetchedAt: string }>;

interface LatestNewsProps {
  bioguideId: string;
  memberName: string;
  staticCache?: NewsCache;
}

export default function LatestNews({ bioguideId, memberName, staticCache }: LatestNewsProps) {
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Try to use static cache first (for static builds)
  const cachedEntry = staticCache?.[bioguideId];

  useEffect(() => {
    if (cachedEntry || !expanded) return;
    // Only fetch via API when expanded and no cache entry
    setLoading(true);
    setError(null);
    fetch(`/api/research?id=${bioguideId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json() as Promise<ResearchResult>;
      })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [bioguideId, cachedEntry, expanded]);

  const summaryText = cachedEntry?.summary ?? result?.summary;
  const citations = cachedEntry?.citations ?? result?.citations ?? [];
  const fetchedAt = cachedEntry?.fetchedAt ?? result?.fetchedAt;

  if (!cachedEntry && !expanded) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-3">
          📰 Latest News
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Powered by Perplexity AI — real-time news search.
        </p>
        <button
          onClick={() => setExpanded(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors"
        >
          Load Latest News
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
          📰 Latest News
        </h3>
        <span className="text-xs text-slate-400 font-mono">via Perplexity AI</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">Searching latest news…</span>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
          ⚠️ Could not load news: {error}
        </div>
      )}

      {summaryText && (
        <div className="space-y-3">
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {summaryText}
          </div>

          {citations.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sources</p>
              <ul className="space-y-1">
                {citations.slice(0, 5).map((url, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal-600 hover:text-teal-700 hover:underline truncate block"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fetchedAt && (
            <p className="text-xs text-slate-400">
              Updated: {new Date(fetchedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
