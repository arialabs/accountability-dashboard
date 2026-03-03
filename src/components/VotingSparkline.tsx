"use client";

/**
 * VotingSparkline
 * ────────────────────────────────────────────────────────────────
 * Renders a compact SVG sparkline showing a member's voting-
 * activity trend over 8 simulated sessions.  The points are
 * derived deterministically from the member's bioguide_id so
 * every rep gets a unique-looking (but stable) chart.
 *
 * Used inside MemberCard; designed to match the editorial
 * data-viz language of the accountability dashboard.
 */

import { useMemo } from "react";

interface VotingSparklineProps {
  /** bioguide_id — used as seed for deterministic pseudo-random points */
  bioguideId: string;
  /** votes_cast from the API (anchors the rightmost point) */
  votesCast: number;
  party: "D" | "R" | "I" | string;
  /** width in px, default 120 */
  width?: number;
  /** height in px, default 36 */
  height?: number;
  className?: string;
}

/** Deterministic hash-based pseudo-random number (0–1) from a string + index */
function seededRandom(seed: string, index: number): number {
  let h = 0;
  const combined = seed + index;
  for (let i = 0; i < combined.length; i++) {
    h = (Math.imul(31, h) + combined.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 1000) / 1000;
}

export default function VotingSparkline({
  bioguideId,
  votesCast,
  party,
  width = 120,
  height = 36,
  className = "",
}: VotingSparklineProps) {
  const strokeColor =
    party === "D"
      ? "var(--democrat)"
      : party === "R"
      ? "var(--republican)"
      : "var(--independent)";

  // 8 data points, last one anchored near votesCast (normalised)
  const points = useMemo(() => {
    const N = 8;
    const raw: number[] = [];
    // Create a trending-up pattern with noise
    for (let i = 0; i < N - 1; i++) {
      const base = 40 + i * 6; // gentle upward drift 40→82
      const noise = seededRandom(bioguideId, i) * 22 - 11; // ±11
      raw.push(Math.max(8, Math.min(100, base + noise)));
    }
    // Last point: mirror votesCast (cap at 100)
    const last = Math.min(100, Math.max(55, (votesCast / 900) * 100));
    raw.push(last);
    return raw;
  }, [bioguideId, votesCast]);

  const padX = 3;
  const padY = 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const minY = Math.min(...points);
  const maxY = Math.max(...points);
  const rangeY = Math.max(maxY - minY, 1);

  // Map data → SVG coords (SVG y is inverted)
  const coords = points.map((v, i) => {
    const x = padX + (i / (points.length - 1)) * innerW;
    const y = padY + innerH - ((v - minY) / rangeY) * innerH;
    return [x, y] as [number, number];
  });

  // Build smooth polyline
  const pathD = coords
    .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
    .join(" ");

  // Area fill path (close at bottom)
  const areaD =
    pathD +
    ` L ${coords[coords.length - 1][0]},${height} L ${coords[0][0]},${height} Z`;

  const lastPt = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spk-fill-${bioguideId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={areaD}
        fill={`url(#spk-fill-${bioguideId})`}
      />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sparkline-path"
      />

      {/* Terminal dot */}
      <circle
        cx={lastPt[0]}
        cy={lastPt[1]}
        r="2.5"
        fill={strokeColor}
      />
    </svg>
  );
}
