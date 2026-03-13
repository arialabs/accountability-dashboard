/**
 * Conflict of Interest Detection
 * Correlates campaign finance industries with voting patterns
 */

import type { IndustryTotal } from "./industry-classifier";

export interface ConflictOfInterest {
  industry: string;
  industryDisplayName: string;
  icon: string;
  donationAmount: number;
  voteCategory: string;
  voteTitle: string;
  voteBill: string;
  voteDate: string;
  votePosition: "Yea" | "Nay" | "Present";
  expectedVote: "Yea" | "Nay";
  benefitsIndustry: boolean;
  conflictSeverity: "high" | "medium" | "low";
  explanation: string;
}

// Map vote categories (from key-votes.json) to related industries (from finance.json)
// Vote categories: Economy & Taxes, Climate & Environment, Healthcare, Government Ethics,
//   Immigration, National Security, Voting Rights, Other
// Finance industry keys: Finance/Securities, Agriculture, Health, Defense, Labor/Unions,
//   Lawyers/Law Firms, Oil & Gas, Real Estate, Telecom
export const INDUSTRY_VOTE_MAPPING: Record<string, {
  industries: string[];
  proIndustryVote: "Yea" | "Nay"; // Which vote benefits the industry
}> = {
  "Healthcare": {
    industries: ["Health"],
    proIndustryVote: "Nay", // Voting "Nay" on healthcare reform benefits health industry
  },
  "Economy & Taxes": {
    industries: ["Finance/Securities", "Real Estate"],
    proIndustryVote: "Nay", // Voting "Nay" on financial regulations benefits banks/RE
  },
  "Climate & Environment": {
    industries: ["Oil & Gas"],
    proIndustryVote: "Nay", // Voting "Nay" on climate action benefits fossil fuel
  },
  "National Security": {
    industries: ["Defense"],
    proIndustryVote: "Yea", // Voting "Yea" on defense spending benefits defense industry
  },
  "Immigration": {
    industries: ["Agriculture", "Labor/Unions"],
    proIndustryVote: "Nay", // Complex — agriculture benefits from immigrant labor
  },
  "Government Ethics": {
    industries: ["Lawyers/Law Firms"],
    proIndustryVote: "Nay", // Voting "Nay" on ethics/transparency benefits lobbying
  },
};

// Keywords to detect regulation/restriction bills (where "Nay" benefits industry)
const REGULATION_KEYWORDS = [
  "regulation",
  "oversight",
  "restriction",
  "ban",
  "prohibition",
  "accountability",
  "transparency",
  "reform",
  "consumer protection",
  "antitrust",
  "break up",
  "tax",
  "limit",
  "cap",
];

// Keywords to detect pro-industry bills (where "Yea" benefits industry)
const PRO_INDUSTRY_KEYWORDS = [
  "funding",
  "subsidy",
  "appropriation",
  "support",
  "assistance",
  "development",
  "authorization",
  "expansion",
];

/**
 * Detect conflicts of interest between campaign donations and votes
 */
export function detectConflicts(
  industries: IndustryTotal[],
  votes: Array<{
    bill: string;
    title: string;
    category: string;
    date: string;
    vote: "Yea" | "Nay" | "Present" | "Not Voting";
    description?: string;
  }>
): ConflictOfInterest[] {
  const conflicts: ConflictOfInterest[] = [];

  // Get top 5 industries by donation amount
  const topIndustries = industries.slice(0, 5);

  for (const vote of votes) {
    if (vote.vote === "Present" || vote.vote === "Not Voting") {
      continue; // Skip non-votes
    }

    const mapping = INDUSTRY_VOTE_MAPPING[vote.category];
    if (!mapping) {
      continue; // No industry mapping for this category
    }

    // Check if any top donor industries are related to this vote
    for (const industry of topIndustries) {
      if (!mapping.industries.includes(industry.industry)) {
        continue; // This industry isn't related to this vote category
      }

      // Determine if this is a regulation bill or pro-industry bill
      const voteText = `${vote.title} ${vote.description || ""}`.toLowerCase();
      const isRegulationBill = REGULATION_KEYWORDS.some(kw => voteText.includes(kw));
      const isProIndustryBill = PRO_INDUSTRY_KEYWORDS.some(kw => voteText.includes(kw));

      let expectedVote: "Yea" | "Nay";
      let benefitsIndustry: boolean;

      if (isRegulationBill) {
        // Regulation bills: industry benefits from "Nay"
        expectedVote = "Nay";
        benefitsIndustry = vote.vote === "Nay";
      } else if (isProIndustryBill) {
        // Pro-industry bills: industry benefits from "Yea"
        expectedVote = "Yea";
        benefitsIndustry = vote.vote === "Yea";
      } else {
        // Use mapping default
        expectedVote = mapping.proIndustryVote;
        benefitsIndustry = vote.vote === expectedVote;
      }

      // Only flag as conflict if vote benefits the donor industry
      if (benefitsIndustry) {
        // Calculate severity based on donation amount
        let conflictSeverity: "high" | "medium" | "low";
        if (industry.total > 100000) {
          conflictSeverity = "high";
        } else if (industry.total > 50000) {
          conflictSeverity = "medium";
        } else {
          conflictSeverity = "low";
        }

        conflicts.push({
          industry: industry.industry,
          industryDisplayName: industry.displayName,
          icon: industry.icon,
          donationAmount: industry.total,
          voteCategory: vote.category,
          voteTitle: vote.title,
          voteBill: vote.bill,
          voteDate: vote.date,
          votePosition: vote.vote,
          expectedVote,
          benefitsIndustry,
          conflictSeverity,
          explanation: generateExplanation(
            industry.displayName,
            industry.total,
            vote.vote,
            vote.title,
            isRegulationBill,
            isProIndustryBill
          ),
        });
      }
    }
  }

  // Sort by severity then donation amount
  const severityOrder = { high: 3, medium: 2, low: 1 };
  return conflicts.sort((a, b) => {
    if (a.conflictSeverity !== b.conflictSeverity) {
      return severityOrder[b.conflictSeverity] - severityOrder[a.conflictSeverity];
    }
    return b.donationAmount - a.donationAmount;
  });
}

/**
 * Generate human-readable explanation of a conflict
 */
function generateExplanation(
  industryName: string,
  donationAmount: number,
  votePosition: "Yea" | "Nay",
  voteTitle: string,
  isRegulationBill: boolean,
  isProIndustryBill: boolean
): string {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(donationAmount);

  if (isRegulationBill) {
    return `Received ${formattedAmount} from ${industryName} and voted ${votePosition} on regulations that would have restricted the industry.`;
  } else if (isProIndustryBill) {
    return `Received ${formattedAmount} from ${industryName} and voted ${votePosition} to provide funding/support to the industry.`;
  } else {
    return `Received ${formattedAmount} from ${industryName} and voted ${votePosition} on "${voteTitle}" in a way that benefits the industry.`;
  }
}
