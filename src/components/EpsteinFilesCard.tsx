import Link from "next/link";

interface EpsteinFilesCardProps {
  variant?: "full" | "compact";
  className?: string;
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// Teal accent for Epstein card (consistent with site accent system)
const EPSTEIN_ACCENT = "#0F766E";
const EPSTEIN_ACCENT_DARK = "#0D9488";
const EPSTEIN_ACCENT_BG = "#F0FDFA";

export default function EpsteinFilesCard({ variant = "full", className = "" }: EpsteinFilesCardProps) {
  if (variant === "compact") {
    return (
      <a
        href="https://epstein.arialabs.ai"
        target="_blank"
        rel="noopener noreferrer"
        className={`group block bg-white border border-slate-200 rounded-md p-5 spotlight-card ${className}`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center"
            style={{ backgroundColor: EPSTEIN_ACCENT_BG, color: EPSTEIN_ACCENT }}
          >
            <DocumentIcon />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm"
            style={{ fontFamily: "'Source Sans 3', sans-serif", backgroundColor: EPSTEIN_ACCENT_BG, color: EPSTEIN_ACCENT }}
          >
            Deep Dive
          </span>
        </div>
        <h3
          className="text-base font-semibold mb-1 group-hover:underline"
          style={{ fontFamily: "'Newsreader', Georgia, serif", color: "var(--text-primary)", letterSpacing: "-0.01em" }}
        >
          Epstein Files Explorer
        </h3>
        <p className="text-xs mb-3" style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}>
          Interactive timeline, network connections, and court documents.
        </p>
        <div className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all" style={{ fontFamily: "'Source Sans 3', sans-serif", color: EPSTEIN_ACCENT }}>
          Explore <ArrowRightIcon />
        </div>
      </a>
    );
  }

  // "full" variant — the main deep-dive featured card
  return (
    <a
      href="https://epstein.arialabs.ai"
      target="_blank"
      rel="noopener noreferrer"
      className={`group block bg-white border border-slate-200 rounded-md overflow-hidden deep-dive-hero doc-corner-fold ${className}`}
      style={{ borderLeft: `3px solid ${EPSTEIN_ACCENT}` }}
    >
      {/* Header accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: EPSTEIN_ACCENT }} />

      <div className="p-8 md:p-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: EPSTEIN_ACCENT }}
            >
              Deep Dive Investigation
            </span>
            {/* FILED stamp */}
            <span className="stamp-badge stamp-filed" aria-label="Filed investigation">
              Filed
            </span>
          </div>
          <div
            className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center"
            style={{ backgroundColor: EPSTEIN_ACCENT_BG, color: EPSTEIN_ACCENT }}
          >
            <DocumentIcon />
          </div>
        </div>

        <h3
          className="text-2xl md:text-3xl font-bold mb-3 group-hover:underline"
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Epstein Files Explorer
        </h3>

        <p
          className="mb-6 text-sm leading-relaxed"
          style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
        >
          Comprehensive investigation into the Jeffrey Epstein case. Interactive timeline,
          network connections, and searchable court documents released under federal orders.
        </p>

        {/* Stats row */}
        <div className="flex gap-8 mb-6 pt-4 border-t border-slate-100">
          <div>
            <div
              className="text-xl font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}
            >
              2,100+
            </div>
            <div
              className="text-xs uppercase tracking-wide mt-0.5"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Documents
            </div>
          </div>
          <div>
            <div
              className="text-xl font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}
            >
              500+
            </div>
            <div
              className="text-xs uppercase tracking-wide mt-0.5"
              style={{ fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-secondary)" }}
            >
              Named individuals
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
          style={{ fontFamily: "'Source Sans 3', sans-serif", color: EPSTEIN_ACCENT_DARK }}
        >
          Explore full investigation <ArrowRightIcon />
        </div>
      </div>
    </a>
  );
}
