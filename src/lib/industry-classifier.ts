/**
 * Industry classification for campaign contributions
 * Maps employer names to industry categories
 */

export interface IndustryCategory {
  name: string;
  keywords: string[];
  icon: string;
}

// Industry classification based on employer keywords
export const INDUSTRIES: Record<string, IndustryCategory> = {
  tech: {
    name: "Tech & Internet",
    keywords: ["google", "amazon", "meta", "facebook", "apple", "microsoft", "alphabet", "twitter", "x corp", "netflix", "uber", "lyft", "airbnb", "tesla", "spacex", "nvidia", "intel", "amd", "cisco", "oracle", "salesforce", "adobe", "snap", "tiktok", "bytedance", "ibm", "dell", "hp ", "software", "tech", "computing", "semiconductor", "cloud"],
    icon: "💻",
  },
  finance: {
    name: "Finance & Banking",
    keywords: ["goldman", "morgan", "jpmorgan", "chase", "bank", "wells fargo", "citigroup", "credit", "capital", "investment", "securities", "fidelity", "vanguard", "blackrock", "financial", "insurance", "prudential", "metlife", "aig", "visa", "mastercard", "amex", "american express", "paypal", "venture", "private equity"],
    icon: "💰",
  },
  pharma: {
    name: "Pharmaceuticals & Health",
    keywords: ["pfizer", "moderna", "johnson", "merck", "abbvie", "bristol", "eli lilly", "amgen", "gilead", "biogen", "pharmaceutical", "pharma", "biotech", "medicine", "drug", "health care", "healthcare", "hospital", "medical", "unitedhealth", "anthem", "cigna", "humana", "aetna", "kaiser"],
    icon: "💊",
  },
  energy: {
    name: "Energy & Utilities",
    keywords: ["exxon", "chevron", "shell", "bp ", "conoco", "marathon", "valero", "occidental", "energy", "oil", "gas", "petroleum", "coal", "electric", "utility", "power", "solar", "wind", "renewable", "nextera", "duke energy", "southern company", "dominion"],
    icon: "⚡",
  },
  defense: {
    name: "Defense & Aerospace",
    keywords: ["lockheed", "boeing", "raytheon", "northrop", "grumman", "general dynamics", "l3harris", "aerospace", "defense", "military", "weapons", "missile", "aircraft", "space"],
    icon: "🛡️",
  },
  telecom: {
    name: "Telecommunications",
    keywords: ["verizon", "at&t", "t-mobile", "sprint", "comcast", "charter", "spectrum", "cox", "dish", "telecom", "wireless", "cable", "broadband", "communications"],
    icon: "📡",
  },
  retail: {
    name: "Retail & Consumer",
    keywords: ["walmart", "target", "costco", "home depot", "lowe's", "best buy", "macy", "nordstrom", "gap", "retail", "store", "shopping", "consumer", "kroger", "albertsons", "safeway", "walgreens", "cvs"],
    icon: "🛒",
  },
  realestate: {
    name: "Real Estate & Construction",
    keywords: ["real estate", "realty", "property", "construction", "builder", "developer", "housing", "mortgage", "zillow", "redfin", "cbre", "jones lang", "cushman"],
    icon: "🏗️",
  },
  legal: {
    name: "Legal & Lobbying",
    keywords: ["law", "attorney", "lawyer", "legal", "counsel", "lobbying", "lobby", "advocacy", "consulting"],
    icon: "⚖️",
  },
  education: {
    name: "Education",
    keywords: ["university", "college", "school", "education", "academic", "learning", "student", "teacher", "professor"],
    icon: "🎓",
  },
  entertainment: {
    name: "Entertainment & Media",
    keywords: ["disney", "warner", "paramount", "universal", "sony", "fox", "nbc", "abc", "cbs", "cnn", "media", "entertainment", "film", "movie", "music", "spotify", "gaming", "electronic arts", "activision"],
    icon: "🎬",
  },
  agriculture: {
    name: "Agriculture & Food",
    keywords: ["agriculture", "farm", "food", "crop", "livestock", "dairy", "meat", "grain", "seed", "monsanto", "bayer", "syngenta", "cargill", "tyson", "kraft", "nestle", "pepsico", "coca-cola", "general mills"],
    icon: "🌾",
  },
  transportation: {
    name: "Transportation & Logistics",
    keywords: ["airline", "railway", "shipping", "freight", "logistics", "fedex", "ups", "usps", "delta", "united airlines", "american airlines", "southwest", "transport"],
    icon: "🚚",
  },
  labor: {
    name: "Labor Unions",
    keywords: ["union", "labor", "workers", "afl-cio", "seiu", "teamsters", "uaw", "ufcw", "afscme", "federation"],
    icon: "👷",
  },
};

/**
 * Classify an employer into an industry category
 */
export function classifyEmployer(employer: string | null | undefined): string {
  if (!employer) return "other";
  
  const normalized = employer.toLowerCase().trim();
  
  // Check each industry's keywords
  for (const [key, industry] of Object.entries(INDUSTRIES)) {
    for (const keyword of industry.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return key;
      }
    }
  }
  
  return "other";
}

/**
 * Get display name for an industry
 */
export function getIndustryName(industryKey: string): string {
  return INDUSTRIES[industryKey]?.name || "Other";
}

/**
 * Get icon for an industry
 */
export function getIndustryIcon(industryKey: string): string {
  return INDUSTRIES[industryKey]?.icon || "📊";
}

/**
 * Aggregate contributions by industry
 */
export interface IndustryTotal {
  industry: string;
  displayName: string;
  icon: string;
  total: number;
  count: number;
  topContributors: Array<{
    name: string;
    employer: string;
    amount: number;
  }>;
}

export function aggregateByIndustry(
  contributions: Array<{
    contributor_name: string;
    contributor_employer?: string | null;
    contribution_receipt_amount: number;
  }>
): IndustryTotal[] {
  const industryMap = new Map<string, {
    total: number;
    count: number;
    contributors: Array<{ name: string; employer: string; amount: number }>;
  }>();
  
  // Aggregate contributions by industry
  for (const contrib of contributions) {
    const industry = classifyEmployer(contrib.contributor_employer);
    const existing = industryMap.get(industry) || { 
      total: 0, 
      count: 0,
      contributors: [],
    };
    
    existing.total += contrib.contribution_receipt_amount;
    existing.count += 1;
    existing.contributors.push({
      name: contrib.contributor_name,
      employer: contrib.contributor_employer || "Unknown",
      amount: contrib.contribution_receipt_amount,
    });
    
    industryMap.set(industry, existing);
  }
  
  // Convert to array and sort by total
  const results: IndustryTotal[] = [];
  for (const [industry, data] of industryMap.entries()) {
    // Sort contributors by amount and take top 5
    const topContributors = data.contributors
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    results.push({
      industry,
      displayName: getIndustryName(industry),
      icon: getIndustryIcon(industry),
      total: data.total,
      count: data.count,
      topContributors,
    });
  }
  
  return results.sort((a, b) => b.total - a.total);
}
