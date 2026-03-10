/**
 * ConflictDataViz — Pure SVG data visualization for the homepage.
 * Shows real committee conflict + suspicious trading stats by party.
 * No charting library required.
 */

const W = 280;
const BAR_H = 22;
const BAR_GAP = 10;
const LABEL_W = 28;
const VALUE_W = 32;
const BAR_AREA = W - LABEL_W - VALUE_W - 8;

interface BarDatum {
  label: string;
  value: number;
  max: number;
  color: string;
  textColor: string;
}

function HorizBar({ datum, y }: { datum: BarDatum; y: number }) {
  const barW = Math.max(2, (datum.value / datum.max) * BAR_AREA);
  return (
    <g>
      <text
        x={0}
        y={y + BAR_H / 2 + 5}
        fontSize={11}
        fontWeight="700"
        fill={datum.textColor}
        fontFamily="'Inter', sans-serif"
      >
        {datum.label}
      </text>
      <rect
        x={LABEL_W}
        y={y}
        width={barW}
        height={BAR_H}
        rx={3}
        fill={datum.color}
        opacity={0.85}
      />
      <text
        x={LABEL_W + barW + 5}
        y={y + BAR_H / 2 + 5}
        fontSize={11}
        fontWeight="600"
        fill="#334155"
        fontFamily="'JetBrains Mono', monospace"
      >
        {datum.value}
      </text>
    </g>
  );
}

// ── Committee conflict data (pre-computed, updated when committee-conflicts.json changes)
const CONFLICT_DATA: BarDatum[] = [
  { label: "R", value: 64, max: 117, color: "#EF4444", textColor: "#B91C1C" },
  { label: "D", value: 52, max: 117, color: "#3B82F6", textColor: "#1D4ED8" },
  { label: "I", value:  1, max: 117, color: "#8B5CF6", textColor: "#6D28D9" },
];

// ── High suspicion traders
const SUSPICION_DATA: BarDatum[] = [
  { label: "R", value: 70, max: 133, color: "#EF4444", textColor: "#B91C1C" },
  { label: "D", value: 62, max: 133, color: "#3B82F6", textColor: "#1D4ED8" },
  { label: "I", value:  1, max: 133, color: "#8B5CF6", textColor: "#6D28D9" },
];

interface ChartPanelProps {
  title: string;
  subtitle: string;
  data: BarDatum[];
  total: number;
  accentColor: string;
}

function ChartPanel({ title, subtitle, data, total, accentColor }: ChartPanelProps) {
  const svgH = data.length * (BAR_H + BAR_GAP) - BAR_GAP;
  return (
    <div className="flex-1 min-w-[200px]">
      <div className="mb-2">
        <div
          className="text-2xl font-black"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: accentColor }}
        >
          {total}
        </div>
        <div
          className="text-xs font-bold uppercase tracking-wider"
          style={{ fontFamily: "'Inter', sans-serif", color: "#64748B" }}
        >
          {title}
        </div>
        <div
          className="text-xs mt-0.5"
          style={{ fontFamily: "'Inter', sans-serif", color: "#94A3B8" }}
        >
          {subtitle}
        </div>
      </div>
      <svg width={W} height={svgH} role="img" aria-label={`${title} by party`}>
        {data.map((d, i) => (
          <HorizBar key={d.label} datum={d} y={i * (BAR_H + BAR_GAP)} />
        ))}
      </svg>
    </div>
  );
}

export default function ConflictDataViz() {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-5 mt-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          📊 By the numbers — today
        </span>
      </div>
      <div className="flex flex-wrap gap-6">
        <ChartPanel
          title="Committee Conflicts"
          subtitle="Members trading in sectors they oversee"
          data={CONFLICT_DATA}
          total={117}
          accentColor="#DC2626"
        />
        <div className="w-px bg-slate-100 self-stretch hidden sm:block" />
        <ChartPanel
          title="High Suspicion Traders"
          subtitle="Members with ≥75% flagged trades"
          data={SUSPICION_DATA}
          total={133}
          accentColor="#DC2626"
        />
      </div>
      <p className="text-[10px] text-slate-400 mt-3">
        Data: STOCK Act disclosures · unitedstates/congress-legislators · Updated Mar 2026
      </p>
    </div>
  );
}
