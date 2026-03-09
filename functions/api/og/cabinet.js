/**
 * Cloudflare Pages Function — /api/og/cabinet?id=[member_id]
 *
 * Returns an SVG social share image (1200×630) for a cabinet member.
 * Pure SVG — no native binaries, works in Cloudflare Workers runtime.
 */

import cabinetData from "../../../src/data/cabinet.json";

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function conflictColor(score) {
  if (score >= 25) return "#DC2626";
  if (score >= 15) return "#D97706";
  if (score >= 5)  return "#CA8A04";
  return "#16A34A";
}

function conflictLabel(score) {
  if (score >= 25) return "Critical Conflicts";
  if (score >= 15) return "High Risk";
  if (score >= 5)  return "Moderate Risk";
  return "Low Risk";
}

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const members = cabinetData?.members ?? cabinetData ?? [];
  const member = members.find((m) => m.id === id);
  if (!member) return new Response("Not found", { status: 404 });

  const name = escapeXml(member.name ?? "");
  const role = escapeXml(member.role ?? "");
  const conflicts = member.conflicts_of_interest ?? [];
  const score = conflicts.reduce((s, c) => {
    const w = { critical: 10, high: 7, medium: 3, low: 1 };
    return s + (w[c.severity] ?? 0);
  }, 0);
  const label = conflictLabel(score);
  const color = conflictColor(score);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FFFFFF"/>
  <rect x="0" y="0" width="8" height="630" fill="#1F2937"/>
  <rect x="8" y="0" width="1192" height="80" fill="#F9FAFB"/>
  <text x="48" y="52" font-family="Georgia, serif" font-size="22" fill="#6B7280">
    Rep. Accountability Dashboard — Executive Branch · reps.arialabs.ai
  </text>

  <text x="48" y="80" font-family="system-ui, sans-serif" font-size="20" fill="#9CA3AF">CABINET MEMBER</text>
  <text x="48" y="180" font-family="Georgia, serif" font-size="72" fill="#111111" font-weight="bold">${name}</text>
  <text x="48" y="230" font-family="system-ui, sans-serif" font-size="28" fill="#374151">${role}</text>

  <line x1="48" y1="270" x2="1152" y2="270" stroke="#E5E7EB" stroke-width="1"/>

  <text x="48" y="340" font-family="system-ui, sans-serif" font-size="22" fill="#6B7280">CONFLICTS OF INTEREST</text>
  <text x="48" y="400" font-family="Georgia, serif" font-size="64" fill="#111111" font-weight="bold">${conflicts.length}</text>
  <text x="160" y="400" font-family="system-ui, sans-serif" font-size="28" fill="#6B7280">identified</text>

  <text x="480" y="340" font-family="system-ui, sans-serif" font-size="22" fill="#6B7280">RISK LEVEL</text>
  <rect x="480" y="350" width="280" height="60" rx="6" fill="${color}" opacity="0.12"/>
  <text x="500" y="392" font-family="system-ui, sans-serif" font-size="34" fill="${color}" font-weight="bold">${escapeXml(label)}</text>

  <rect x="8" y="570" width="1192" height="60" fill="#F9FAFB"/>
  <text x="48" y="607" font-family="system-ui, sans-serif" font-size="20" fill="#9CA3AF">
    Data: Public financial disclosures · Last updated ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
  </text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
