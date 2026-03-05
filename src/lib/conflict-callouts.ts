/**
 * Conflict Callout Utility
 *
 * Surfaces "say one thing, do another" insights by matching top donor industries
 * against voting records and generating plain-language narrative statements like:
 *   "Took $420K from pharmaceutical industry — voted against Medicare drug pricing reform 3 times"
 *
 * Issue #109
 */

import type { CampaignFinance } from "@/lib/types";
import { INDUSTRIES } from "@/lib/industry-classifier";

// Keywords that identify regulation/restriction bills (where Nay benefits industry)
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
  "disapproval", // CRA resolutions rolling back rules
  "rescind",
  "cut",
  "lower",
  "reduce",
];

// Keywords that identify pro-industry bills (where Yea benefits industry)
const PRO_INDUSTRY_KEYWORDS = [
  "funding",
  "subsidy",
  "appropriation",
  "support",
  "assistance",
  "development",
  "authorization",
  "expansion",
  "increase",
];

export interface ConflictCallout {
  /** Unique key for React rendering */
  id: string;
  industryKey: string;
  industryDisplayName: string;
  industryIcon: string;
  /** Total donated by this industry */
  donationAmount: number;
  /** Number of votes that conflict with public interest */
  voteCount: number;
  /** Plain-language narrative, e.g. "Took $420K from pharma — voted against drug pricing reform 3 times" */
  narrative: string;
  severity: "high" | "medium" | "low";
  votes: Array<{
    bill: string;
    title: string;
    description: string;
    date: string;
    vote: string;
    category: string;
  }>;
}

/** Industry-specific narrative config */
interface IndustryNarrativeConfig {
  categories: string[];
  donationVerb: string;
  /** Returns true if this vote benefits the industry */
  benefitsIndustry: (vote: string, isRegulation: boolean, isProIndustry: boolean) => boolean;
  /** Generate the action phrase for N conflicting votes */
  actionPhrase: (dominantVote: "Yea" | "Nay", count: number) => string;
}

const INDUSTRY_NARRATIVE_CONFIG: Record<string, IndustryNarrativeConfig> = {
  pharma: {
    categories: ["Healthcare"],
    donationVerb: "Took",
    benefitsIndustry: (vote, isRegulation, isProIndustry) => {
      if (isRegulation) return vote === "Nay"; // Against drug price reform = pharma wins
      if (isProIndustry) return vote === "Yea";
      return vote === "Nay"; // Default: Nay on healthcare bills benefits pharma
    },
    actionPhrase: (dominantVote, count) => {
      const times = count === 1 ? "once" : `${count} times`;
      return dominantVote === "Nay"
        ? `voted against Medicare drug pricing and healthcare reform ${times}`
        : `voted to weaken healthcare consumer protections ${times}`;
    },
  },
  energy: {
    categories: ["Climate & Environment"],
    donationVerb: "Received",
    benefitsIndustry: (vote, isRegulation) => {
      // CRA "disapproval" resolutions roll back EPA rules — Yea = pro-energy
      // Regulation bills: Nay = pro-energy
      if (isRegulation) return vote === "Nay";
      return vote === "Yea"; // Default: Yea on energy-related bills benefits fossil fuel
    },
    actionPhrase: (dominantVote, count) => {
      const times = count === 1 ? "once" : `${count} times`;
      return dominantVote === "Yea"
        ? `voted to roll back EPA emissions and environmental rules ${times}`
        : `voted against clean energy and climate legislation ${times}`;
    },
  },
  finance: {
    categories: ["Economy & Taxes"],
    donationVerb: "Accepted",
    benefitsIndustry: (vote, isRegulation) => {
      return isRegulation ? vote === "Nay" : false;
    },
    actionPhrase: (_dominantVote, count) => {
      const times = count === 1 ? "once" : `${count} times`;
      return `voted against consumer financial protection legislation ${times}`;
    },
  },
  defense: {
    categories: ["National Security"],
    donationVerb: "Received",
    benefitsIndustry: (vote) => vote === "Yea",
    actionPhrase: (_dominantVote, count) => {
      const times = count === 1 ? "once" : `${count} times`;
      return `voted for increased defense contractor authorization and spending ${times}`;
    },
  },
  telecom: {
    categories: ["Economy & Taxes", "Government Ethics"],
    donationVerb: "Received",
    benefitsIndustry: (vote, isRegulation) => {
      return isRegulation ? vote === "Nay" : false;
    },
    actionPhrase: (_dominantVote, count) => {
      const times = count === 1 ? "once" : `${count} times`;
      return `voted against telecommunications accountability legislation ${times}`;
    },
  },
  realestate: {
    categories: ["Economy & Taxes"],
    donationVerb: "Accepted",
    benefitsIndustry: (vote, isRegulation) => {
      return isRegulation ? vote === "Nay" : vote === "Yea";
    },
    actionPhrase: (dominantVote, count) => {
      const times = count === 1 ? "once" : `${count} times`;
      return dominantVote === "Yea"
        ? `voted for real estate industry subsidies ${times}`
        : `voted against housing market reforms ${times}`;
    },
  },
};

export interface IndustryBucket {
  industryKey: string;
  displayName: string;
  icon: string;
  total: number;
  contributors: string[];
}

/**
 * Classify top_contributors from finance data into industry buckets
 */
export function classifyContributorsIntoIndustries(
  topContributors: Array<{ name: string; total: number }>
): IndustryBucket[] {
  const buckets: Record<string, IndustryBucket> = {};

  for (const contributor of topContributors) {
    const nameLower = contributor.name.toLowerCase();
    let matched = false;

    for (const [industryKey, industry] of Object.entries(INDUSTRIES)) {
      if (industry.keywords.some((kw) => nameLower.includes(kw.toLowerCase()))) {
        if (!buckets[industryKey]) {
          buckets[industryKey] = {
            industryKey,
            displayName: industry.name,
            icon: industry.icon,
            total: 0,
            contributors: [],
          };
        }
        buckets[industryKey].total += contributor.total;
        buckets[industryKey].contributors.push(contributor.name);
        matched = true;
        break; // First matching industry wins
      }
    }

    // Political PAC / Super PAC classification
    if (!matched) {
      const pac = ["PAC", "super pac", "leadership fund", "victory fund"].some((kw) =>
        nameLower.includes(kw.toLowerCase())
      );
      if (!pac) {
        // Unclassified — skip
      }
    }
  }

  return Object.values(buckets).sort((a, b) => b.total - a.total);
}

/**
 * Determine if a vote text is a regulation bill or pro-industry bill
 */
function classifyVoteBill(title: string, description?: string): {
  isRegulation: boolean;
  isProIndustry: boolean;
} {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  const isRegulation = REGULATION_KEYWORDS.some((kw) => text.includes(kw));
  const isProIndustry = PRO_INDUSTRY_KEYWORDS.some((kw) => text.includes(kw));
  return { isRegulation, isProIndustry };
}

/**
 * Format currency in a short human-readable form
 */
function formatDonationAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

/**
 * Build conflict callouts for a member given their finance data and vote records.
 *
 * @param bioguideId  The member's bioguide ID
 * @param finance     Campaign finance data (may be null)
 * @param keyVotes    Array of key votes with votes[icpsrId]
 * @param icpsrId     The member's ICPSR numeric ID (used as key in keyVotes.votes)
 */
export function getConflictCallouts(
  bioguideId: string,
  finance: CampaignFinance | null,
  keyVotes: Array<{
    id?: string;
    bill: string;
    title: string;
    description?: string;
    category: string;
    date: string;
    votes: Record<string, string>;
  }>,
  icpsrId?: string
): ConflictCallout[] {
  if (!finance?.top_contributors || finance.top_contributors.length === 0) {
    return [];
  }

  // Classify top contributors into industry buckets
  const industries = classifyContributorsIntoIndustries(
    finance.top_contributors.map((c) => ({ name: c.name, total: c.total }))
  );

  if (industries.length === 0) return [];

  // Resolve the vote lookup key: prefer icpsrId (ICPSR numeric), fall back to bioguideId
  const voteKey = icpsrId ?? bioguideId;

  const callouts: ConflictCallout[] = [];

  for (const industry of industries.slice(0, 6)) {
    const config = INDUSTRY_NARRATIVE_CONFIG[industry.industryKey];
    if (!config) continue;

    // Minimum $5K threshold to surface a callout
    if (industry.total < 5_000) continue;

    // Find votes in relevant categories where member voted to benefit this industry
    const conflictVotes: ConflictCallout["votes"] = [];

    for (const vote of keyVotes) {
      if (!config.categories.includes(vote.category)) continue;

      const memberVote = vote.votes[voteKey];
      if (!memberVote || memberVote === "Present" || memberVote === "Not Voting") continue;

      const { isRegulation, isProIndustry } = classifyVoteBill(vote.title, vote.description);

      if (config.benefitsIndustry(memberVote, isRegulation, isProIndustry)) {
        conflictVotes.push({
          bill: vote.bill,
          title: vote.title,
          description: vote.description ?? "",
          date: vote.date,
          vote: memberVote,
          category: vote.category,
        });
      }
    }

    if (conflictVotes.length === 0) continue;

    // Determine dominant vote direction for narrative phrasing
    const yeaCount = conflictVotes.filter((v) => v.vote === "Yea").length;
    const nayCount = conflictVotes.filter((v) => v.vote === "Nay").length;
    const dominantVote: "Yea" | "Nay" = yeaCount >= nayCount ? "Yea" : "Nay";

    const actionPhrase = config.actionPhrase(dominantVote, conflictVotes.length);
    const amountStr = formatDonationAmount(industry.total);

    const narrative = `${config.donationVerb} ${amountStr} from ${industry.displayName} — ${actionPhrase}`;

    // Severity: high if >$100K, medium if >$25K, low otherwise
    const severity: ConflictCallout["severity"] =
      industry.total > 100_000 ? "high" : industry.total > 25_000 ? "medium" : "low";

    callouts.push({
      id: `${bioguideId}-${industry.industryKey}`,
      industryKey: industry.industryKey,
      industryDisplayName: industry.displayName,
      industryIcon: industry.icon,
      donationAmount: industry.total,
      voteCount: conflictVotes.length,
      narrative,
      severity,
      votes: conflictVotes.slice(0, 5), // Show up to 5 supporting votes
    });
  }

  // Sort by severity then donation amount
  const severityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
  return callouts.sort((a, b) => {
    if (a.severity !== b.severity) {
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return b.donationAmount - a.donationAmount;
  });
}
