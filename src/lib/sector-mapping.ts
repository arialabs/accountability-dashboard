/**
 * Committee → Sector → Ticker mapping for detecting stock-trade conflicts.
 *
 * When a member sits on a committee that oversees a sector and trades stocks
 * in that sector, it's a potential STOCK Act conflict of interest.
 */

export type SectorCode =
  | "financials"
  | "energy"
  | "technology"
  | "defense"
  | "healthcare"
  | "media"
  | "agriculture"
  | "realestate"
  | "utilities"
  | "industrials"
  | "materials";

export interface SectorInfo {
  label: string;
  icon: string;
  color: string; // Tailwind class prefix for bg/text/border
}

export const SECTORS: Record<SectorCode, SectorInfo> = {
  financials: { label: "Financials", icon: "🏦", color: "blue" },
  energy: { label: "Energy", icon: "⚡", color: "yellow" },
  technology: { label: "Technology", icon: "💻", color: "purple" },
  defense: { label: "Defense", icon: "🛡️", color: "slate" },
  healthcare: { label: "Healthcare", icon: "🏥", color: "green" },
  media: { label: "Media & Telecom", icon: "📡", color: "pink" },
  agriculture: { label: "Agriculture", icon: "🌾", color: "lime" },
  realestate: { label: "Real Estate", icon: "🏠", color: "orange" },
  utilities: { label: "Utilities", icon: "💡", color: "amber" },
  industrials: { label: "Industrials", icon: "🏭", color: "gray" },
  materials: { label: "Materials", icon: "⚗️", color: "teal" },
};

/**
 * Committee name keywords → sector(s) they oversee.
 * Matched via substring search (case-insensitive).
 */
export const COMMITTEE_SECTOR_MAP: Array<{ keywords: string[]; sectors: SectorCode[] }> = [
  { keywords: ["banking", "financial services", "finance", "securities", "monetary"], sectors: ["financials"] },
  { keywords: ["energy", "natural resources", "environment", "climate"], sectors: ["energy", "utilities"] },
  { keywords: ["science", "technology", "innovation", "commerce", "trade"], sectors: ["technology"] },
  { keywords: ["armed services", "defense", "military", "national security", "intelligence"], sectors: ["defense"] },
  { keywords: ["health", "labor", "welfare", "aging", "education"], sectors: ["healthcare"] },
  { keywords: ["judiciary", "commerce", "internet", "communications", "media", "telecom", "broadband"], sectors: ["media", "technology"] },
  { keywords: ["agriculture", "nutrition", "forestry", "rural"], sectors: ["agriculture"] },
  { keywords: ["housing", "urban", "real estate"], sectors: ["realestate"] },
  { keywords: ["transportation", "infrastructure", "aviation", "railroad"], sectors: ["industrials"] },
];

/**
 * Stock ticker → sector mapping for common holdings.
 * ETFs (XLF, XLE, etc.) and major individual stocks.
 */
export const TICKER_SECTOR_MAP: Record<string, SectorCode> = {
  // Financials ETF & stocks
  XLF: "financials", KBE: "financials", KRE: "financials",
  JPM: "financials", BAC: "financials", WFC: "financials", GS: "financials",
  MS: "financials", C: "financials", BRK: "financials", AXP: "financials",
  V: "financials", MA: "financials", COF: "financials", USB: "financials",
  PNC: "financials", TFC: "financials", SCHW: "financials", BLK: "financials",
  // Energy ETF & stocks
  XLE: "energy", XOP: "energy", USO: "energy",
  XOM: "energy", CVX: "energy", COP: "energy", EOG: "energy", SLB: "energy",
  OXY: "energy", MPC: "energy", PSX: "energy", VLO: "energy", HAL: "energy",
  // Tech ETF & stocks
  XLK: "technology", QQQ: "technology", SMH: "technology",
  AAPL: "technology", MSFT: "technology", GOOGL: "technology", GOOG: "technology",
  AMZN: "technology", META: "technology", NVDA: "technology", TSLA: "technology",
  AMD: "technology", INTC: "technology", QCOM: "technology", AVGO: "technology",
  ORCL: "technology", IBM: "technology", CRM: "technology", ADBE: "technology",
  NFLX: "technology", UBER: "technology", LYFT: "technology", SNAP: "technology",
  // Defense
  XAR: "defense", ITA: "defense",
  LMT: "defense", RTX: "defense", NOC: "defense", GD: "defense", BA: "defense",
  L3H: "defense", HII: "defense", LDOS: "defense", SAIC: "defense", CACI: "defense",
  // Healthcare ETF & stocks
  XLV: "healthcare", IBB: "healthcare", XBI: "healthcare",
  JNJ: "healthcare", PFE: "healthcare", MRK: "healthcare", ABBV: "healthcare",
  UNH: "healthcare", CVS: "healthcare", CI: "healthcare", HUM: "healthcare",
  LLY: "healthcare", BMY: "healthcare", AMGN: "healthcare", GILD: "healthcare",
  MRNA: "healthcare", BNTX: "healthcare", REGN: "healthcare", BIIB: "healthcare",
  // Utilities
  XLU: "utilities", NEE: "utilities", DUK: "utilities", SO: "utilities",
  D: "utilities", AEP: "utilities", EXC: "utilities", PCG: "utilities",
  // Real Estate
  VNQ: "realestate", IYR: "realestate", AMT: "realestate", EQIX: "realestate",
  PLD: "realestate", CCI: "realestate", SPG: "realestate", O: "realestate",
  // Media & Telecom
  CMCSA: "media", T: "media", VZ: "media", DIS: "media", FOXA: "media",
  PARA: "media", WBD: "media", NWSA: "media", CHTR: "media", TMUS: "media",
  // Industrials
  XLI: "industrials", UPS: "industrials", FDX: "industrials", CSX: "industrials",
  UNP: "industrials", CAT: "industrials", DE: "industrials", GE: "industrials",
  MMM: "industrials", HON: "industrials", ITW: "industrials", EMR: "industrials",
  // Materials
  XLB: "materials", NEM: "materials", FCX: "materials", AA: "materials",
  // Agriculture
  ADM: "agriculture", BG: "agriculture", MOS: "agriculture", CF: "agriculture",
};

/**
 * Get the sector for a given ticker (or null if unknown).
 */
export function getTickerSector(ticker: string): SectorCode | null {
  return TICKER_SECTOR_MAP[ticker.toUpperCase()] ?? null;
}

/**
 * Given a list of committee names, return the sectors they oversee.
 */
export function getCommitteeSectors(committeeNames: string[]): Set<SectorCode> {
  const sectors = new Set<SectorCode>();
  for (const name of committeeNames) {
    const lower = name.toLowerCase();
    for (const mapping of COMMITTEE_SECTOR_MAP) {
      if (mapping.keywords.some((kw) => lower.includes(kw))) {
        mapping.sectors.forEach((s) => sectors.add(s));
      }
    }
  }
  return sectors;
}

/**
 * Detect sector conflicts: returns sectors where the member is both on a
 * relevant committee AND traded stocks in that sector.
 */
export function detectCommitteeConflicts(
  committeeNames: string[],
  tickers: string[]
): SectorCode[] {
  const oversightSectors = getCommitteeSectors(committeeNames);
  if (oversightSectors.size === 0) return [];

  const tradedSectors = new Set(
    tickers.map((t) => getTickerSector(t)).filter(Boolean) as SectorCode[]
  );

  return [...oversightSectors].filter((s) => tradedSectors.has(s));
}
