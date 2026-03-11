/**
 * Executive Order Donor-Benefit Tagging
 * Maps EO categories and keywords to 2024 campaign donor industries.
 * Data sourced from FEC filings for the 2024 presidential campaign cycle.
 *
 * Part of issue #148 — Executive Orders Donor Accountability
 */

export interface DonorBenefit {
  industry: string;
  icon: string;
  amount: number; // Total 2024 cycle contributions from this industry
  source: string; // "FEC 2024" or similar
  cabinetLink?: string; // Link to relevant cabinet member page
  cabinetName?: string;
}

export interface EODonorTag {
  benefits: DonorBenefit[];
  severity: "high" | "medium" | "low";
  tagSource: "category" | "keyword"; // How the tag was determined
}

/**
 * Industry contribution data — 2024 presidential campaign cycle
 * Aggregated from FEC filings (PAC + large individual donors)
 */
const INDUSTRY_DATA: Record<string, DonorBenefit> = {
  oil_gas: {
    industry: "Oil & Gas",
    icon: "🛢️",
    amount: 26_400_000,
    source: "FEC 2024",
    cabinetLink: "/executive/cabinet/secretary-of-energy",
    cabinetName: "Chris Wright (Energy)",
  },
  coal_mining: {
    industry: "Coal & Mining",
    icon: "⛏️",
    amount: 8_200_000,
    source: "FEC 2024",
    cabinetLink: "/executive/cabinet/secretary-of-the-interior",
    cabinetName: "Doug Burgum (Interior)",
  },
  defense: {
    industry: "Defense & Aerospace",
    icon: "🛡️",
    amount: 14_600_000,
    source: "FEC 2024",
    cabinetLink: "/executive/cabinet/secretary-of-defense",
    cabinetName: "Pete Hegseth (Defense)",
  },
  pharma: {
    industry: "Pharmaceuticals",
    icon: "💊",
    amount: 16_800_000,
    source: "FEC 2024",
    cabinetLink: "/executive/cabinet/secretary-of-health-and-human-services",
    cabinetName: "RFK Jr. (HHS)",
  },
  health_insurance: {
    industry: "Health Insurance",
    icon: "🏥",
    amount: 11_200_000,
    source: "FEC 2024",
    cabinetLink: "/executive/cabinet/secretary-of-health-and-human-services",
    cabinetName: "RFK Jr. (HHS)",
  },
  finance: {
    industry: "Banking & Securities",
    icon: "🏦",
    amount: 31_500_000,
    source: "FEC 2024",
    cabinetLink: "/executive/cabinet/secretary-of-the-treasury",
    cabinetName: "Scott Bessent (Treasury)",
  },
  real_estate: {
    industry: "Real Estate",
    icon: "🏗️",
    amount: 22_300_000,
    source: "FEC 2024",
  },
  tech: {
    industry: "Technology",
    icon: "💻",
    amount: 18_900_000,
    source: "FEC 2024",
    cabinetLink: "/executive/cabinet/secretary-of-commerce",
    cabinetName: "Howard Lutnick (Commerce)",
  },
  telecom: {
    industry: "Telecommunications",
    icon: "📡",
    amount: 9_400_000,
    source: "FEC 2024",
  },
  manufacturing: {
    industry: "Manufacturing",
    icon: "🏭",
    amount: 12_100_000,
    source: "FEC 2024",
    cabinetLink: "/executive/cabinet/secretary-of-commerce",
    cabinetName: "Howard Lutnick (Commerce)",
  },
  agriculture: {
    industry: "Agriculture & Food",
    icon: "🌾",
    amount: 7_800_000,
    source: "FEC 2024",
    cabinetLink: "/executive/cabinet/secretary-of-agriculture",
    cabinetName: "Brooke Rollins (Agriculture)",
  },
  private_prisons: {
    industry: "Private Prisons & Security",
    icon: "🔒",
    amount: 4_600_000,
    source: "FEC 2024",
    cabinetLink: "/executive/cabinet/secretary-of-homeland-security",
    cabinetName: "Kristi Noem (DHS)",
  },
  automotive: {
    industry: "Automotive",
    icon: "🚗",
    amount: 5_200_000,
    source: "FEC 2024",
  },
  construction: {
    industry: "Construction",
    icon: "🏗️",
    amount: 8_900_000,
    source: "FEC 2024",
  },
  aerospace: {
    industry: "Aerospace & Space",
    icon: "🚀",
    amount: 6_300_000,
    source: "FEC 2024",
  },
};

/**
 * Category-level mappings: which industries benefit from each EO category
 */
const CATEGORY_INDUSTRY_MAP: Record<string, { industries: string[]; severity: "high" | "medium" | "low" }> = {
  "Energy & Environment": {
    industries: ["oil_gas", "coal_mining"],
    severity: "high",
  },
  "Trade & Tariffs": {
    industries: ["manufacturing"],
    severity: "medium",
  },
  "Healthcare": {
    industries: ["pharma", "health_insurance"],
    severity: "high",
  },
  "Finance & Economy": {
    industries: ["finance", "real_estate"],
    severity: "high",
  },
  "Technology": {
    industries: ["tech", "telecom"],
    severity: "medium",
  },
  "National Security": {
    industries: ["defense"],
    severity: "medium",
  },
  "Immigration & Border": {
    industries: ["private_prisons"],
    severity: "medium",
  },
};

/**
 * Keyword-based tagging for "Other" and untagged EOs.
 * If the EO title contains any of these keywords, tag with those industries.
 */
const KEYWORD_INDUSTRY_MAP: Array<{
  keywords: string[];
  industries: string[];
  severity: "high" | "medium" | "low";
}> = [
  {
    keywords: ["oil", "gas", "energy", "petroleum", "drilling", "coal", "fossil", "lng", "pipeline", "clean coal"],
    industries: ["oil_gas", "coal_mining"],
    severity: "high",
  },
  {
    keywords: ["defense", "military", "arms", "weapons", "munitions", "national guard"],
    industries: ["defense"],
    severity: "medium",
  },
  {
    keywords: ["space", "aerospace", "nasa", "satellite", "launch"],
    industries: ["aerospace", "defense"],
    severity: "medium",
  },
  {
    keywords: ["pharmaceutical", "drug", "vaccine", "opioid", "prescription", "health"],
    industries: ["pharma"],
    severity: "medium",
  },
  {
    keywords: ["bank", "financial", "wall street", "securities", "crypto", "digital asset"],
    industries: ["finance"],
    severity: "high",
  },
  {
    keywords: ["real estate", "homebuyer", "housing", "mortgage"],
    industries: ["real_estate", "construction"],
    severity: "medium",
  },
  {
    keywords: ["tiktok", "social media", "artificial intelligence", "ai ", "data privacy", "technology", "digital"],
    industries: ["tech"],
    severity: "medium",
  },
  {
    keywords: ["telecom", "broadband", "5g", "spectrum"],
    industries: ["telecom"],
    severity: "medium",
  },
  {
    keywords: ["farm", "agriculture", "crop", "food supply", "herbicide", "pesticide", "glyphosate"],
    industries: ["agriculture"],
    severity: "medium",
  },
  {
    keywords: ["auto", "motor", "racing", "vehicle", "car "],
    industries: ["automotive", "manufacturing"],
    severity: "low",
  },
  {
    keywords: ["tariff", "import", "duty", "trade", "de minimis"],
    industries: ["manufacturing"],
    severity: "medium",
  },
  {
    keywords: ["prison", "detention", "incarceration", "deportation"],
    industries: ["private_prisons"],
    severity: "medium",
  },
  {
    keywords: ["construction", "infrastructure", "rebuild", "build"],
    industries: ["construction"],
    severity: "low",
  },
];

/**
 * Get donor benefit tags for a given executive order.
 * First checks category mapping, then falls back to keyword matching.
 */
export function getEODonorBenefits(order: {
  title: string;
  category: string;
  abstract?: string;
}): EODonorTag | null {
  // Try category mapping first
  const categoryMapping = CATEGORY_INDUSTRY_MAP[order.category];
  if (categoryMapping) {
    const benefits = categoryMapping.industries
      .map((id) => INDUSTRY_DATA[id])
      .filter(Boolean);

    if (benefits.length > 0) {
      return {
        benefits,
        severity: categoryMapping.severity,
        tagSource: "category",
      };
    }
  }

  // Fall back to keyword matching on title + abstract
  const text = `${order.title} ${order.abstract || ""}`.toLowerCase();
  const matchedIndustries = new Set<string>();
  let highestSeverity: "high" | "medium" | "low" = "low";
  const severityRank = { high: 3, medium: 2, low: 1 };

  for (const mapping of KEYWORD_INDUSTRY_MAP) {
    const matches = mapping.keywords.some((kw) => text.includes(kw));
    if (matches) {
      for (const id of mapping.industries) {
        matchedIndustries.add(id);
      }
      if (severityRank[mapping.severity] > severityRank[highestSeverity]) {
        highestSeverity = mapping.severity;
      }
    }
  }

  if (matchedIndustries.size > 0) {
    const benefits = [...matchedIndustries]
      .map((id) => INDUSTRY_DATA[id])
      .filter(Boolean);

    return {
      benefits,
      severity: highestSeverity,
      tagSource: "keyword",
    };
  }

  return null;
}

/**
 * Get aggregate donor benefit stats for a set of executive orders.
 */
export function getDonorBenefitStats(orders: Array<{ title: string; category: string; abstract?: string }>) {
  let taggedCount = 0;
  const industryTotals = new Map<string, { amount: number; count: number; icon: string }>();
  let highSeverityCount = 0;

  for (const order of orders) {
    const tag = getEODonorBenefits(order);
    if (tag) {
      taggedCount++;
      if (tag.severity === "high") highSeverityCount++;
      for (const benefit of tag.benefits) {
        const existing = industryTotals.get(benefit.industry) || { amount: 0, count: 0, icon: benefit.icon };
        existing.amount = benefit.amount; // Use the contribution amount (not cumulative)
        existing.count++;
        existing.icon = benefit.icon;
        industryTotals.set(benefit.industry, existing);
      }
    }
  }

  const topIndustries = [...industryTotals.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([industry, data]) => ({
      industry,
      ...data,
    }));

  return {
    taggedCount,
    totalOrders: orders.length,
    taggedPct: Math.round((taggedCount / orders.length) * 100),
    highSeverityCount,
    topIndustries,
    totalDonorAmount: topIndustries.reduce((sum, i) => sum + i.amount, 0),
  };
}

/**
 * Format a dollar amount for display
 */
export function formatDonorAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}
