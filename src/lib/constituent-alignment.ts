/**
 * Constituent Alignment — "Represents You?" scoring
 *
 * Compares a member's votes against the majority preferences of their
 * state's constituents, using well-documented public polling data.
 */

import { getMember } from "@/lib/data";
import constituentData from "@/data/constituent-preferences.json";
import keyVotesData from "@/data/key-votes.json";
import bioguideToIcpsrData from "@/data/bioguide-to-icpsr.json";

// ─── Types ───────────────────────────────────────────────────────────

export interface PolicyAlignment {
  policyKey: string;
  label: string;
  category: string;
  description: string;
  source: string;
  stateSupport: number; // % of constituents who support this
  nationalSupport: number;
  votesFound: VoteMatch[];
  aligned: boolean | null; // null = no votes found for this policy
}

export interface VoteMatch {
  voteId: string;
  bill: string;
  shortLabel: string;
  memberVote: "Yea" | "Nay" | "Present" | "Not Voting";
  proConstituentVote: "Yea" | "Nay";
  aligned: boolean;
  explanation: string;
}

export interface ConstituentAlignmentResult {
  bioguideId: string;
  state: string;
  overallScore: number; // 0-100
  totalVotesScored: number;
  totalVotesAligned: number;
  policies: PolicyAlignment[];
}

// ─── Types for JSON data ─────────────────────────────────────────────

interface VoteMapping {
  vote_id: string;
  bill: string;
  short_label: string;
  pro_constituent_vote: "Yea" | "Nay";
  explanation: string;
}

interface PolicyData {
  label: string;
  category: string;
  description: string;
  source: string;
  national_support_pct: number;
  state_support: Record<string, number>;
  vote_mappings: VoteMapping[];
}

interface KeyVoteRecord {
  id: string;
  bill: string;
  votes: Record<string, string>;
}

// ─── Core logic ──────────────────────────────────────────────────────

/**
 * Calculate constituent alignment for a member of Congress.
 *
 * Returns null if the member isn't found or has no state.
 */
export function getConstituentAlignment(
  bioguideId: string
): ConstituentAlignmentResult | null {
  const member = getMember(bioguideId);
  if (!member) return null;

  const state = member.state; // Already 2-letter abbreviation (data.ts transforms)
  if (!state || state.length !== 2) return null;

  // Get ICPSR ID for vote lookup
  const icpsrId = (bioguideToIcpsrData as Record<string, string>)[bioguideId];

  const policies = constituentData.policies as Record<string, PolicyData>;
  const keyVotes = keyVotesData as unknown as KeyVoteRecord[];

  // Build a map of vote ID → vote record for fast lookup
  const voteMap = new Map<string, KeyVoteRecord>();
  for (const vote of keyVotes) {
    voteMap.set(vote.id, vote);
  }

  let totalVotesScored = 0;
  let totalVotesAligned = 0;

  const policyResults: PolicyAlignment[] = [];

  for (const [policyKey, policy] of Object.entries(policies)) {
    const stateSupport = policy.state_support[state];
    if (stateSupport === undefined) continue; // No data for this state

    const votesFound: VoteMatch[] = [];

    for (const mapping of policy.vote_mappings) {
      const voteRecord = voteMap.get(mapping.vote_id);
      if (!voteRecord) continue;

      // Look up member's vote — key votes use ICPSR IDs
      const memberVoteStr = icpsrId
        ? voteRecord.votes[icpsrId]
        : undefined;

      if (!memberVoteStr) continue; // Member didn't vote on this

      const memberVote = memberVoteStr as "Yea" | "Nay" | "Present" | "Not Voting";

      // Only score Yea/Nay votes (not Present or Not Voting)
      if (memberVote !== "Yea" && memberVote !== "Nay") continue;

      const aligned = memberVote === mapping.pro_constituent_vote;

      votesFound.push({
        voteId: mapping.vote_id,
        bill: mapping.bill,
        shortLabel: mapping.short_label,
        memberVote,
        proConstituentVote: mapping.pro_constituent_vote,
        aligned,
        explanation: mapping.explanation,
      });

      totalVotesScored++;
      if (aligned) totalVotesAligned++;
    }

    // Determine overall alignment for this policy
    let policyAligned: boolean | null = null;
    if (votesFound.length > 0) {
      const alignedCount = votesFound.filter((v) => v.aligned).length;
      policyAligned = alignedCount > votesFound.length / 2;
    }

    policyResults.push({
      policyKey,
      label: policy.label,
      category: policy.category,
      description: policy.description,
      source: policy.source,
      stateSupport,
      nationalSupport: policy.national_support_pct,
      votesFound,
      aligned: policyAligned,
    });
  }

  const overallScore =
    totalVotesScored > 0
      ? Math.round((totalVotesAligned / totalVotesScored) * 100)
      : 0;

  return {
    bioguideId,
    state,
    overallScore,
    totalVotesScored,
    totalVotesAligned,
    policies: policyResults,
  };
}
