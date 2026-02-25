'use client';

/**
 * HeroSparkline — CSS-only animated sparkline for the hero section.
 * Shows a simulated voting trend line with an animated draw-on effect.
 * Pure SVG + CSS, no runtime JS required.
 */

// Simulated 12-session voting activity data (normalized 0–100)
const POINTS = [32, 48, 41, 67, 58, 72, 63, 85, 71, 88, 79, 94];
const W = 200;
const H = 48;
const PAD = 4;

function toPath(points: number[]): string {
  const xs = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2));
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const ys = points.map((v) => PAD + (1 - (v - min) / range) * (H - PAD * 2));

  let d = `M ${xs[0]},${ys[0]}`;
  for (let i = 1; i < points.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cx},${ys[i - 1]} ${cx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  return d;
}

function toAreaPath(points: number[]): string {
  const line = toPath(points);
  const xs = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2));
  return `${line} L ${xs[xs.length - 1]},${H - PAD} L ${xs[0]},${H - PAD} Z`;
}

export default function HeroSparkline() {
  const linePath = toPath(POINTS);
  const areaPath = toAreaPath(POINTS);

  return (
    <div
      className="flex flex-wrap items-center gap-4 mt-8 mb-2 sm:flex-nowrap"
      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
    >
      {/* Mini stat */}
      <div className="flex-shrink-0">
        <div
          className="text-3xl font-bold leading-none"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}
        >
          2.4M+
        </div>
        <div className="text-xs uppercase tracking-widest mt-1" style={{ color: "var(--text-secondary)" }}>
          Votes tracked
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-slate-200" aria-hidden="true" />

      {/* Animated sparkline */}
      <div className="flex flex-col gap-1 min-w-0">
        <svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="w-[180px] sm:w-[200px]"
          aria-hidden="true"
          role="img"
        >
          {/* Area fill */}
          <path
            d={areaPath}
            fill="var(--accent)"
            fillOpacity="0.08"
          />
          {/* Animated line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sparkline-path"
          />
          {/* End dot */}
          <circle
            cx={PAD + (W - PAD * 2)}
            cy={PAD + (1 - (POINTS[POINTS.length - 1] - Math.min(...POINTS)) / (Math.max(...POINTS) - Math.min(...POINTS))) * (H - PAD * 2)}
            r={3.5}
            fill="var(--accent)"
          />
        </svg>
        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Voting activity — 119th Congress
        </div>
      </div>

      {/* Secondary stat */}
      <div className="flex-shrink-0 hidden sm:block">
        <div className="h-px w-6 bg-slate-300 mb-3" />
        <div
          className="text-xl font-bold leading-none"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}
        >
          535
        </div>
        <div className="text-xs uppercase tracking-widest mt-1" style={{ color: "var(--text-secondary)" }}>
          Members
        </div>
      </div>
    </div>
  );
}
