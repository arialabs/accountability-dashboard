"use client";

type NewsCache = Record<string, { name: string; summary: string; citations: string[]; fetchedAt: string }>;

interface LatestNewsProps {
  bioguideId: string;
  memberName: string;
  staticCache?: NewsCache;
}

export default function LatestNews({ bioguideId, staticCache }: LatestNewsProps) {
  const cachedEntry = staticCache?.[bioguideId];

  if (!cachedEntry) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-3">
          Latest News
        </h3>
        <p className="text-sm text-slate-500">
          Live news integration coming soon.
        </p>
      </div>
    );
  }

  const { summary, citations, fetchedAt } = cachedEntry;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
      <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">
        Latest News
      </h3>

      <div className="space-y-3">
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {summary}
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
    </div>
  );
}
