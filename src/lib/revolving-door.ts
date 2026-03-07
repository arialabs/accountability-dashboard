/**
 * Revolving Door Analysis
 * 
 * Identifies when executive officials came directly from the industries
 * they now regulate, or hold ideological positions that conflict with
 * their department's mission.
 * 
 * This directly answers: "Is this official working for you, or for their former industry?"
 */

export type RevolvingDoorType =
  | "industry_insider"   // Came directly from the regulated industry (e.g., oil CEO → Energy Sec)
  | "ideological_conflict" // Beliefs actively conflict with agency mission (e.g., anti-vaxxer → HHS)
  | "lobbying_door"      // Came from lobbying/revolving door position
  | "public_service";    // Primarily government/military background

export interface RevolvingDoorEntry {
  type: RevolvingDoorType;
  prior_industry: string;
  summary: string;
  severity: "critical" | "high" | "medium" | "low";
}

/**
 * Revolving door classifications for all cabinet members.
 * Sourced from publicly known prior positions and policy stances.
 */
export const REVOLVING_DOOR_DATA: Record<string, RevolvingDoorEntry> = {
  "secretary-of-state": {
    type: "public_service",
    prior_industry: "U.S. Senate / Florida Legislature",
    summary: "Career politician from U.S. Senate — no direct industry conflict.",
    severity: "low",
  },
  "secretary-of-defense": {
    type: "lobbying_door",
    prior_industry: "Fox News / Media",
    summary: "Fox News TV host with no senior military or government executive experience; media personality now overseeing world's largest military.",
    severity: "high",
  },
  "attorney-general": {
    type: "lobbying_door",
    prior_industry: "Ballard Partners (Lobbying Firm)",
    summary: "After serving as FL Attorney General, joined Ballard Partners — a prominent lobbying firm with foreign clients. Now top law enforcement official.",
    severity: "high",
  },
  "secretary-of-treasury": {
    type: "industry_insider",
    prior_industry: "Hedge Funds (Soros Fund Management, Key Square Group)",
    summary: "Career hedge fund manager and Wall Street financier now overseeing U.S. economic and monetary policy, tax enforcement, and financial regulation.",
    severity: "critical",
  },
  "secretary-of-hhs": {
    type: "ideological_conflict",
    prior_industry: "Children's Health Defense (Anti-Vaccine Advocacy)",
    summary: "Founded and led an anti-vaccine advocacy organization. Now heads the department responsible for public health, FDA, CDC, and vaccine policy.",
    severity: "critical",
  },
  "secretary-of-homeland-security": {
    type: "public_service",
    prior_industry: "South Dakota Governor / U.S. Congress",
    summary: "Career in elected government — Governor and Congresswoman. No direct industry conflict.",
    severity: "low",
  },
  "epa-administrator": {
    type: "ideological_conflict",
    prior_industry: "U.S. Congress (voted against climate action)",
    summary: "As a Congressman, consistently voted against environmental protections and against climate science. Now leads the EPA, whose mission is environmental protection.",
    severity: "critical",
  },
  "secretary-of-interior": {
    type: "industry_insider",
    prior_industry: "Great Plains Software (Tech CEO) / North Dakota Energy Industry",
    summary: "North Dakota Governor with deep ties to the state's oil and gas industry. Interior Department manages public lands, federal drilling leases, and energy extraction.",
    severity: "high",
  },
  "secretary-of-agriculture": {
    type: "lobbying_door",
    prior_industry: "America First Policy Institute (Political Think Tank)",
    summary: "Led a Trump-aligned political think tank. No agricultural background or experience with farming, food safety, or rural development.",
    severity: "medium",
  },
  "secretary-of-commerce": {
    type: "industry_insider",
    prior_industry: "Cantor Fitzgerald / BGC Group (Wall Street)",
    summary: "Wall Street billionaire and CEO of major financial firms. Simultaneously chaired Trump transition team while being nominated — directly selecting the administration he would serve in.",
    severity: "critical",
  },
  "secretary-of-labor": {
    type: "public_service",
    prior_industry: "U.S. Congress / Local Government",
    summary: "Congresswoman from Oregon. Primary background is elected public service.",
    severity: "low",
  },
  "secretary-of-transportation": {
    type: "lobbying_door",
    prior_industry: "Fox News / Media",
    summary: "Fox News host with no transportation industry experience. Now oversees aviation, railroads, highways, and infrastructure safety.",
    severity: "high",
  },
  "secretary-of-energy": {
    type: "industry_insider",
    prior_industry: "Liberty Energy (Fossil Fuel / Fracking CEO)",
    summary: "CEO of Liberty Energy, a fracking services company, for 14 years. Now heads the Department of Energy — which oversees nuclear weapons, energy research, and clean energy policy. Climate change denier regulating climate-related energy.",
    severity: "critical",
  },
  "secretary-of-education": {
    type: "industry_insider",
    prior_industry: "WWE (World Wrestling Entertainment) / SBA",
    summary: "Former CEO of WWE. No background in education policy, pedagogy, or public schools. Now heads the Department of Education, overseeing $70B budget and federal student aid.",
    severity: "high",
  },
  "secretary-of-veterans-affairs": {
    type: "public_service",
    prior_industry: "U.S. Congress / U.S. Air Force Reserve",
    summary: "Former Congressman and Air Force Reserve chaplain. Background aligns with veterans' service mission.",
    severity: "low",
  },
  "secretary-of-hud": {
    type: "public_service",
    prior_industry: "White House / Texas Legislature",
    summary: "Former Texas state legislator and White House staffer. Government background without obvious industry conflict.",
    severity: "low",
  },
};

/**
 * Get the revolving door status for a cabinet member by their ID.
 */
export function getRevolvingDoorStatus(memberId: string): RevolvingDoorType | null {
  const entry = REVOLVING_DOOR_DATA[memberId];
  return entry ? entry.type : null;
}

/**
 * Get the full revolving door entry for a cabinet member.
 */
export function getRevolvingDoorEntry(memberId: string): RevolvingDoorEntry | null {
  return REVOLVING_DOOR_DATA[memberId] ?? null;
}

/**
 * Human-readable label for the revolving door type.
 */
export function getRevolvingDoorLabel(type: RevolvingDoorType | null): string | null {
  if (!type) return null;
  const labels: Record<RevolvingDoorType, string> = {
    industry_insider: "Industry Insider",
    ideological_conflict: "Mission Conflict",
    lobbying_door: "Lobbyist / Media",
    public_service: "Public Service",
  };
  return labels[type];
}

/**
 * Short description for display in badges and cards.
 */
export function getRevolvingDoorShortDesc(type: RevolvingDoorType | null): string | null {
  if (!type) return null;
  const descs: Record<RevolvingDoorType, string> = {
    industry_insider: "Came from the industry they regulate",
    ideological_conflict: "Opposes their department's mission",
    lobbying_door: "Came from lobbying or media — not the sector",
    public_service: "Career in elected/public service",
  };
  return descs[type];
}

/**
 * Tailwind CSS classes for the badge based on revolving door type.
 */
export function getRevolvingDoorColor(type: RevolvingDoorType | null): string {
  if (!type) return "text-slate-500 bg-slate-50 border-slate-200";
  const colors: Record<RevolvingDoorType, string> = {
    industry_insider: "text-red-700 bg-red-50 border-red-200",
    ideological_conflict: "text-orange-700 bg-orange-50 border-orange-200",
    lobbying_door: "text-amber-700 bg-amber-50 border-amber-200",
    public_service: "text-green-700 bg-green-50 border-green-200",
  };
  return colors[type];
}

/**
 * Emoji icon for the revolving door type.
 */
export function getRevolvingDoorIcon(type: RevolvingDoorType | null): string {
  if (!type) return "❓";
  const icons: Record<RevolvingDoorType, string> = {
    industry_insider: "🔄",
    ideological_conflict: "⚔️",
    lobbying_door: "🎭",
    public_service: "🏛️",
  };
  return icons[type];
}

/**
 * Get all cabinet members sorted by conflict severity (most concerning first).
 */
export function getCabinetRevolvingDoorRanking(): Array<{
  id: string;
  entry: RevolvingDoorEntry;
}> {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return Object.entries(REVOLVING_DOOR_DATA)
    .map(([id, entry]) => ({ id, entry }))
    .sort((a, b) => severityOrder[a.entry.severity] - severityOrder[b.entry.severity]);
}
