/**
 * Cloudflare Pages Function — /api/og/rep?id=[bioguide_id]
 *
 * Returns an SVG social share image (1200×630) for a congress member.
 * Pure SVG — no native binaries, works in Cloudflare Workers runtime.
 * Social crawlers (Twitter, LinkedIn, Slack, iMessage) accept SVG OG images.
 */

import membersData from "../../../src/data/members.json";
import financeData from "../../../src/data/finance.json";

function partyFull(code) {
  if (code === "D") return "Democrat";
  if (code === "R") return "Republican";
  return "Independent";
}

function partyColor(code) {
  if (code === "D") return "#1D4ED8";
  if (code === "R") return "#DC2626";
  return "#6B7280";
}

function verdictColor(label) {
  if (!label) return "#6B7280";
  const l = label.toLowerCase();
  if (l.includes("captured") || l.includes("critical")) return "#DC2626";
  if (l.includes("high")) return "#D97706";
  if (l.includes("clean") || l.includes("low")) return "#16A34A";
  return "#6B7280";
}

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const members = membersData?.members ?? membersData ?? [];
  const member = members.find((m) => m.bioguide_id === id);
  if (!member) return new Response("Not found", { status: 404 });

  const finance = (financeData?.members ?? financeData ?? []).find(
    (f) => f.bioguide_id === id
  );

  const name = escapeXml(member.full_name ?? `${member.first_name} ${member.last_name}`);
  const party = escapeXml(partyFull(member.party));
  const state = escapeXml(member.state ?? "");
  const chamber = escapeXml(
    member.chamber === "senate" ? "U.S. Senate" : "U.S. House of Representatives"
  );
  const pacPct = finance?.pac_percentage != null
    ? `${finance.pac_percentage.toFixed(0)}% PAC`
    : null;
  const raised = finance?.total_raised != null
    ? `$${(finance.total_raised / 1_000_000).toFixed(1)}M raised`
    : null;
  const verdictLabel = escapeXml(finance?.verdict_label ?? "");
  const vColor = verdictColor(finance?.verdict_label ?? "");
  const pColor = partyColor(member.party);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Background -->
  <rect width="1200" height="630" fill="#FFFFFF"/>
  <!-- Left accent bar -->
  <rect x="0" y="0" width="8" height="630" fill="${pColor}"/>
  <!-- Top strip -->
  <rect x="8" y="0" width="1192" height="80" fill="#F9FAFB"/>
  <text x="48" y="52" font-family="Georgia, serif" font-size="22" fill="#6B7280" font-weight="normal">
    Rep. Accountability Dashboard · reps.arialabs.ai
  </text>

  <!-- Name -->
  <text x="48" y="180" font-family="Georgia, serif" font-size="72" fill="#111111" font-weight="bold">${name}</text>

  <!-- Party + State + Chamber -->
  <rect x="48" y="205" width="12" height="12" rx="2" fill="${pColor}"/>
  <text x="68" y="216" font-family="system-ui, sans-serif" font-size="26" fill="#374151">${party} · ${state} · ${chamber}</text>

  <!-- Divider -->
  <line x1="48" y1="260" x2="1152" y2="260" stroke="#E5E7EB" stroke-width="1"/>

  <!-- Stats row -->
  ${pacPct ? `
  <text x="48" y="330" font-family="system-ui, sans-serif" font-size="22" fill="#6B7280">PAC FUNDING</text>
  <text x="48" y="375" font-family="Georgia, serif" font-size="48" fill="#111111" font-weight="bold">${escapeXml(pacPct)}</text>
  ` : ""}
  ${raised ? `
  <text x="380" y="330" font-family="system-ui, sans-serif" font-size="22" fill="#6B7280">TOTAL RAISED</text>
  <text x="380" y="375" font-family="Georgia, serif" font-size="48" fill="#111111" font-weight="bold">${escapeXml(raised)}</text>
  ` : ""}
  ${verdictLabel ? `
  <text x="720" y="330" font-family="system-ui, sans-serif" font-size="22" fill="#6B7280">ACCOUNTABILITY</text>
  <rect x="720" y="340" width="${Math.min(verdictLabel.length * 20 + 40, 400)}" height="52" rx="6" fill="${vColor}" opacity="0.12"/>
  <text x="740" y="377" font-family="system-ui, sans-serif" font-size="32" fill="${vColor}" font-weight="bold">${verdictLabel}</text>
  ` : ""}

  <!-- Footer -->
  <rect x="8" y="570" width="1192" height="60" fill="#F9FAFB"/>
  <text x="48" y="607" font-family="system-ui, sans-serif" font-size="20" fill="#9CA3AF">
    Data: Congress.gov · OpenFEC · Last updated ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
  </text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
