import Link from "next/link";

interface EpsteinFilesCardProps {
  variant?: "full" | "compact";
  className?: string;
}

export default function EpsteinFilesCard({ variant = "full", className = "" }: EpsteinFilesCardProps) {
  if (variant === "compact") {
    return (
      <a
        href="https://epstein.arialabs.ai"
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative bg-white rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 border-2 border-slate-200 hover:border-purple-400 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 ${className}`}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-rose-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-rose-500/5 transition-all duration-500" />
        
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-rose-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight tracking-tight">
            Epstein Files Explorer
          </h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Dive deep into the Jeffrey Epstein case files. Interactive timeline, connections, and court documents.
          </p>
          <div className="flex items-center gap-2 text-purple-600 font-bold group-hover:gap-3 transition-all">
            <span className="text-sm">Explore Deep Dive</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href="https://epstein.arialabs.ai"
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative bg-white rounded-3xl p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 border-2 border-slate-200 hover:border-purple-400 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 ${className}`}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-rose-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-rose-500/5 transition-all duration-500" />
      
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-rose-600 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 leading-tight tracking-tight">
          Epstein Files Explorer
        </h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Comprehensive investigation into the Jeffrey Epstein case. Interactive timeline, network connections, and searchable court documents.
        </p>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500 font-semibold uppercase tracking-wide">Deep Dive Project</div>
          </div>
          <div className="flex items-center gap-2 text-purple-600 font-bold group-hover:gap-3 transition-all">
            Explore
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}
