export default function DevelopmentBanner() {
  // Data freshness — update this when pipelines run
  const lastUpdated = "February 19, 2026";

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-center py-1.5 px-4 text-xs font-medium" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        🚧 This project is under active development — data is being verified and expanded. Not all records are complete yet.
      </div>
      <div className="bg-slate-100 border-b border-slate-200 text-slate-600 text-center py-1.5 px-4 text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        Data last updated: <span className="font-semibold text-slate-800">{lastUpdated}</span>
        <span className="mx-2 text-slate-400">·</span>
        Sources: Congress.gov, OpenFEC, Voteview
      </div>
    </>
  );
}
