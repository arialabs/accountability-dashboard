/**
 * OG image data-fetching and formatting utilities.
 *
 * These are pure-logic helpers consumed by the Cloudflare Pages Functions
 * (/functions/api/og.js) but intentionally kept in src/lib so they can be
 * tested with vitest alongside the rest of the codebase.
 */

import membersData from "@/data/members.json";
import financeData from "@/data/finance.json";
import cabinetData from "@/data/cabinet.json";

// ---------- Types -----------------------------------------------------------

export interface RepOgData {
  name: string;
  state: string;
  party: string;
  partyFull: string;
  chamber: string;
  district: number | null;
  pacPct: number | null;
  totalRaised: number | null;
  verdictLabel: string;
}

export interface CabinetOgData {
  name: string;
  role: string;
  department: string;
  conflictScore: number;
  conflictLabel: string;
  verdictType: string;
}

// ---------- Rep helpers -----------------------------------------------------

const financeMap = financeData as Record<
  string,
  { pac_percentage?: number; total_raised?: number } | undefined
>;

function partyFull(code: string): string {
  if (code === "D") return "Democrat";
  if (code === "R") return "Republican";
  return "Independent";
}

function repVerdictLabel(pacPct: number | null): string {
  if (pacPct === null) return "NO DATA";
  if (pacPct >= 60) return "DONOR CAPTURED";
  if (pacPct >= 30) return "MIXED ALLEGIANCE";
  return "CONSTITUENT FOCUSED";
}

export function getRepOgData(bioguideId: string): RepOgData | null {
  const member = (membersData as Array<{
    bioguide_id: string;
    full_name: string;
    state: string;
    party: string;
    chamber: string;
    district?: number | null;
  }>).find((m) => m.bioguide_id === bioguideId);

  if (!member) return null;

  const finance = financeMap[bioguideId];
  const pacPct = finance?.pac_percentage ?? null;
  const totalRaised = finance?.total_raised ?? null;

  return {
    name: member.full_name,
    state: member.state,
    party: member.party,
    partyFull: partyFull(member.party),
    chamber: member.chamber,
    district: member.district ?? null,
    pacPct,
    totalRaised,
    verdictLabel: repVerdictLabel(pacPct),
  };
}

// ---------- Cabinet helpers -------------------------------------------------

interface ConflictEntry {
  severity: string;
}

const severityWeights: Record<string, number> = {
  low: 1,
  medium: 3,
  high: 7,
  critical: 10,
};

function calcConflictScore(conflicts: ConflictEntry[]): number {
  return conflicts.reduce(
    (total, c) => total + (severityWeights[c.severity] ?? 0),
    0,
  );
}

function conflictLabel(score: number): string {
  if (score === 0) return "None";
  if (score < 5) return "Low";
  if (score < 15) return "Medium";
  if (score < 25) return "High";
  return "Critical";
}

export function getCabinetOgData(memberId: string): CabinetOgData | null {
  const member = (
    cabinetData as {
      members: Array<{
        id: string;
        name: string;
        role: string;
        department: string;
        conflicts_of_interest: ConflictEntry[];
      }>;
    }
  ).members.find((m) => m.id === memberId);

  if (!member) return null;

  const score = calcConflictScore(member.conflicts_of_interest);

  return {
    name: member.name,
    role: member.role,
    department: member.department,
    conflictScore: score,
    conflictLabel: conflictLabel(score),
    verdictType: score >= 15 ? "HIGH RISK" : score >= 5 ? "MODERATE" : "LOW RISK",
  };
}

// ---------- Formatting (shared w/ OG render) --------------------------------

export function formatDollars(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}
