/**
 * Say vs Do Scoring Algorithm — v3.0
 *
 * METHODOLOGY OVERVIEW
 * ====================
 * Measures how consistently a politician votes with their stated positions.
 *
 * Previous versions relied on the `publicBenefit` field to determine a vote's
 * ideological direction, but 75% of votes were labeled "mixed", making the
 * algorithm effectively random/backwards for most of the dataset.
 *
 * v3.0 fixes this by using PARTISAN VOTING PATTERNS as a reliable signal:
 *   - If Democrats vote Yea and Republicans vote Nay → Yea is the "liberal" direction
 *   - If Democrats vote Nay and Republicans vote Yea → Nay is the "liberal" direction
 *   - If the vote is bipartisan (< 30% split) → skip it; it's uninformative for Say vs Do
 *
 * SCORING STEPS (per member):
 *   1. For each stated position (topic + intensity 1-5):
 *      a. Skip intensity=3 (neutral — no clear stance to compare)
 *      b. Find votes in the relevant policy category
 *      c. For each vote:
 *         - Skip bipartisan votes (< PARTISAN_THRESHOLD split between parties)
 *         - Determine expected vote direction from: topic ideology + member's stance direction
 *         - Compare expected vs actual → aligned (true) or misaligned (false)
 *         - Compute weight = intensity_weight × time_weight
 *   2. Overall score = sum(weight × aligned) / sum(weight) × 100
 *
 * TOPIC IDEOLOGY
 * ==============
 * Each OnTheIssues topic has a "liberal" or "conservative" ideological direction.
 * This determines what "supporting" (intensity 4-5) or "opposing" (intensity 1-2)
 * the topic means in terms of expected vote direction.
 *
 * Example:
 *   - "Expand ObamaCare" is liberal. A member with intensity=5 (Strongly Supports) on
 *     this topic should vote with Democrats (Yea) when Dems support a healthcare bill.
 *   - "Fight EPA regulatory over-reach" is conservative. A member with intensity=5
 *     (Strongly Supports fighting EPA) should vote with Republicans (Nay on pro-EPA bills).
 *
 * "Neutral" topics (both parties agree or neither clearly aligns) are skipped.
 */

export type TopicIdeology = 'liberal' | 'conservative' | 'neutral';
export type VoteDirection = 'liberal' | 'conservative' | 'unclear';

// ─── Constants ──────────────────────────────────────────────────────────────

/** Minimum partisan split (|demYeaPct - repYeaPct|) to treat a vote as partisan */
export const PARTISAN_THRESHOLD = 0.30;

/** Minimum party sample size to determine vote direction */
export const MIN_PARTY_SAMPLE = 10;

/** Confidence thresholds (number of position-vote comparisons made) */
export const CONFIDENCE_THRESHOLDS = {
  high: 20,
  medium: 10,
  low: 3,
} as const;

// ─── Topic Ideology Mapping ──────────────────────────────────────────────────

/**
 * Maps each OnTheIssues topic to its ideological direction.
 * 'liberal'  → supporting this topic is the liberal/Democratic position
 * 'conservative' → supporting this topic is the conservative/Republican position
 * 'neutral'  → unclear or genuinely bipartisan; skip for scoring
 */
export const TOPIC_IDEOLOGY: Record<string, TopicIdeology> = {
  // Healthcare
  "Expand ObamaCare": 'liberal',
  "Marijuana is a gateway drug": 'conservative',

  // Economy
  "Higher taxes on the wealthy": 'liberal',
  "Privatize Social Security": 'conservative',
  "Vouchers for school choice": 'conservative',
  "Support & expand free trade": 'neutral',
  "Stimulus better than market-led recovery": 'liberal',

  // Environment
  "Prioritize green energy": 'liberal',
  "Fight EPA regulatory over-reach": 'conservative',
  "Businesses have a right to pollute": 'conservative',

  // Immigration
  "Pathway to citizenship for illegal aliens": 'liberal',

  // Civil Rights / Social
  "Abortion is a woman's unrestricted right": 'liberal',
  "Legally require hiring women & minorities": 'liberal',
  "Comfortable with same-sex marriage": 'liberal',
  "Make voter registration easier": 'liberal',
  "Keep God in the public sphere": 'conservative',
  "America was founded on Christian values": 'conservative',

  // Defense / Foreign Policy
  "Expand the military": 'conservative',
  "Avoid foreign entanglements": 'neutral',
  "Support American Exceptionalism": 'conservative',
  "Peace through Strength": 'conservative',
  "Stay away from the UN & Globalism": 'conservative',
  "Stay out of foreign wars": 'neutral',

  // Crime
  "Stricter punishment reduces crime": 'conservative',

  // Guns
  "Absolute right to gun ownership": 'conservative',
};

// ─── Topic → Vote Category Mapping ─────────────────────────────────────────

/**
 * Maps OnTheIssues topic to vote categories from key-votes.json.
 * Topics can map to multiple categories.
 */
export const TOPIC_TO_CATEGORIES: Record<string, string[]> = {
  "Expand ObamaCare":                         ['Healthcare'],
  "Marijuana is a gateway drug":              ['Healthcare', 'Other'],
  "Higher taxes on the wealthy":              ['Economy & Taxes'],
  "Privatize Social Security":               ['Economy & Taxes'],
  "Vouchers for school choice":              ['Economy & Taxes'],
  "Support & expand free trade":             ['Economy & Taxes'],
  "Stimulus better than market-led recovery": ['Economy & Taxes'],
  "Prioritize green energy":                 ['Climate & Environment'],
  "Fight EPA regulatory over-reach":         ['Climate & Environment'],
  "Businesses have a right to pollute":      ['Climate & Environment'],
  "Pathway to citizenship for illegal aliens": ['Immigration'],
  "Abortion is a woman's unrestricted right":  ['Healthcare'],
  "Legally require hiring women & minorities": ['Voting Rights', 'Government Ethics'],
  "Comfortable with same-sex marriage":       ['Voting Rights'],
  "Make voter registration easier":           ['Voting Rights'],
  "Keep God in the public sphere":            ['Other'],
  "America was founded on Christian values":  ['Other'],
  "Expand the military":                      ['National Security'],
  "Avoid foreign entanglements":              ['National Security'],
  "Support American Exceptionalism":          ['National Security'],
  "Peace through Strength":                   ['National Security'],
  "Stay away from the UN & Globalism":        ['National Security'],
  "Stay out of foreign wars":                 ['National Security'],
  "Stricter punishment reduces crime":        ['Other'],
  "Absolute right to gun ownership":          ['Other'],
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KeyVoteInput {
  id: string;
  category: string;
  date?: string;
  votes: Record<string, string>; // bioguide_id → 'Yea' | 'Nay' | 'Not Voting' | 'Present'
}

export interface MemberInput {
  bioguide_id: string;
  party: 'D' | 'R' | 'I' | string;
}

export interface Position {
  topic: string;
  stance: string;
  intensity: number; // 1=Strongly Opposes ... 5=Strongly Supports
}

export interface VoteComparison {
  voteId: string;
  category: string;
  topic: string;
  statedStance: string;
  intensity: number;
  actualVote: string;
  expectedDirection: 'liberal' | 'conservative';
  voteDirection: VoteDirection;
  aligned: boolean;
  weight: number;
  date?: string;
}

export interface TopicScore {
  topic: string;
  ideology: TopicIdeology;
  statedIntensity: number;
  statedStance: string;
  comparisons: number;
  aligned: number;
  score: number | null; // null if no data
}

export interface CategoryScore {
  category: string;
  comparisons: number;
  aligned: number;
  score: number; // 0-100
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'insufficient';

export interface SayVsDoScore {
  bioguide_id: string;
  score: number | null;           // 0-100 or null if no data
  totalComparisons: number;       // How many position-vote pairs were scored
  alignedComparisons: number;     // How many were aligned
  misalignedComparisons: number;
  confidence: ConfidenceLevel;
  topicBreakdown: TopicScore[];
  categoryBreakdown: CategoryScore[];
  notableContradictions: VoteComparison[]; // Top misaligned comparisons
  allComparisons: VoteComparison[];        // Full transparency
  methodology: 'say-vs-do-v3';
  computedAt: string;
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Determine the ideological direction of a vote based on party voting patterns.
 *
 * Returns 'liberal' if Democrats predominantly voted Yea (and Republicans Nay),
 * 'conservative' if the reverse, or 'unclear' if bipartisan or insufficient data.
 */
export function getVoteDirection(
  voteRecord: Record<string, string>,
  allMembers: MemberInput[]
): VoteDirection {
  const memberMap = new Map(allMembers.map(m => [m.bioguide_id, m]));

  let demYea = 0, demNay = 0, repYea = 0, repNay = 0;

  for (const [id, vote] of Object.entries(voteRecord)) {
    const member = memberMap.get(id);
    if (!member) continue;
    if (vote === 'Not Voting' || vote === 'Present') continue;

    if (member.party === 'D') {
      if (vote === 'Yea') demYea++;
      else if (vote === 'Nay') demNay++;
    } else if (member.party === 'R') {
      if (vote === 'Yea') repYea++;
      else if (vote === 'Nay') repNay++;
    }
  }

  const demTotal = demYea + demNay;
  const repTotal = repYea + repNay;

  if (demTotal < MIN_PARTY_SAMPLE || repTotal < MIN_PARTY_SAMPLE) return 'unclear';

  const demYeaPct = demYea / demTotal;
  const repYeaPct = repYea / repTotal;
  const split = demYeaPct - repYeaPct;

  if (split > PARTISAN_THRESHOLD) return 'liberal';   // Dems vote Yea, Reps vote Nay
  if (split < -PARTISAN_THRESHOLD) return 'conservative'; // Reps vote Yea, Dems vote Nay

  return 'unclear'; // Bipartisan or mixed
}

/**
 * Calculate time-decay weight for a vote.
 * Recent votes matter more than older ones.
 *
 * @returns weight in range [0.5, 1.0]
 */
export function calculateTimeWeight(voteDate?: string): number {
  if (!voteDate) return 0.8;

  const now = new Date();
  const vote = new Date(voteDate);
  const daysSince = (now.getTime() - vote.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince <= 30) return 1.0;
  if (daysSince <= 180) return 1.0 - ((daysSince - 30) / 150) * 0.1;
  if (daysSince <= 365) return 0.9 - ((daysSince - 180) / 185) * 0.2;
  if (daysSince <= 730) return 0.6;
  return 0.5;
}

/**
 * Calculate intensity weight from a stated position's intensity (1-5).
 * Strong positions (1 or 5) count more than mild ones (2 or 4).
 * Neutral (3) returns 0 and should be skipped.
 *
 * Mapping: 1→1.0, 2→0.5, 3→0.0, 4→0.5, 5→1.0
 */
export function calculateIntensityWeight(intensity: number): number {
  return Math.abs(intensity - 3) / 2;
}

/**
 * Determine the expected vote direction for a member given their position on a topic.
 *
 * @param topicIdeology Whether "supporting" this topic is liberal or conservative
 * @param intensity 1-5 (1=Strongly Opposes, 5=Strongly Supports)
 * @returns Expected vote direction, or null if intensity is neutral (3)
 */
export function getExpectedDirection(
  topicIdeology: TopicIdeology,
  intensity: number
): 'liberal' | 'conservative' | null {
  if (intensity === 3) return null; // Neutral — can't determine expected direction

  const memberSupports = intensity >= 4; // 4-5 = supports; 1-2 = opposes

  if (topicIdeology === 'liberal') {
    return memberSupports ? 'liberal' : 'conservative';
  } else if (topicIdeology === 'conservative') {
    return memberSupports ? 'conservative' : 'liberal';
  }

  return null; // Neutral topic
}

/**
 * Compute the full Say vs Do score for a single member.
 */
export function computeMemberSayVsDo(
  bioguideId: string,
  positions: Position[],
  keyVotes: KeyVoteInput[],
  allMembers: MemberInput[]
): SayVsDoScore {
  const allComparisons: VoteComparison[] = [];

  // Pre-compute vote directions (expensive — only do once per vote)
  const voteDirectionCache = new Map<string, VoteDirection>();
  for (const vote of keyVotes) {
    voteDirectionCache.set(vote.id, getVoteDirection(vote.votes, allMembers));
  }

  // Group votes by category
  const votesByCategory = new Map<string, KeyVoteInput[]>();
  for (const vote of keyVotes) {
    const cat = vote.category;
    if (!votesByCategory.has(cat)) votesByCategory.set(cat, []);
    votesByCategory.get(cat)!.push(vote);
  }

  // Process each stated position
  for (const position of positions) {
    const { topic, stance, intensity } = position;

    // Skip neutral positions (intensity=3) — no clear stance to compare against
    const intensityWeight = calculateIntensityWeight(intensity);
    if (intensityWeight === 0) continue;

    const topicIdeology = TOPIC_IDEOLOGY[topic];
    if (!topicIdeology || topicIdeology === 'neutral') continue;

    const expectedDirection = getExpectedDirection(topicIdeology, intensity);
    if (expectedDirection === null) continue;

    const relevantCategories = TOPIC_TO_CATEGORIES[topic] ?? [];

    for (const category of relevantCategories) {
      const votesInCategory = votesByCategory.get(category) ?? [];

      for (const vote of votesInCategory) {
        const memberVote = vote.votes[bioguideId];

        // Skip if member didn't vote
        if (!memberVote || memberVote === 'Not Voting' || memberVote === 'Present') continue;

        const voteDirection = voteDirectionCache.get(vote.id) ?? 'unclear';

        // Skip bipartisan/unclear votes — they don't reveal alignment
        if (voteDirection === 'unclear') continue;

        // Does the member's actual vote match the expected direction?
        // "liberal" direction = Yea is the liberal vote (Dems voted Yea)
        // "conservative" direction = Yea is the conservative vote (Reps voted Yea)
        const memberVotedInLiberalDirection =
          (voteDirection === 'liberal' && memberVote === 'Yea') ||
          (voteDirection === 'conservative' && memberVote === 'Nay');

        const memberVotedInExpectedDirection =
          expectedDirection === 'liberal'
            ? memberVotedInLiberalDirection
            : !memberVotedInLiberalDirection;

        const timeWeight = calculateTimeWeight(vote.date);
        const weight = intensityWeight * timeWeight;

        allComparisons.push({
          voteId: vote.id,
          category,
          topic,
          statedStance: stance,
          intensity,
          actualVote: memberVote,
          expectedDirection,
          voteDirection,
          aligned: memberVotedInExpectedDirection,
          weight,
          date: vote.date,
        });
      }
    }
  }

  // ── Aggregate scores ────────────────────────────────────────────────────

  let weightedAligned = 0;
  let totalWeight = 0;

  for (const comp of allComparisons) {
    totalWeight += comp.weight;
    if (comp.aligned) weightedAligned += comp.weight;
  }

  const score =
    totalWeight > 0 ? Math.round((weightedAligned / totalWeight) * 100) : null;

  const totalComparisons = allComparisons.length;
  const alignedComparisons = allComparisons.filter(c => c.aligned).length;
  const misalignedComparisons = totalComparisons - alignedComparisons;

  // ── Confidence ──────────────────────────────────────────────────────────

  let confidence: ConfidenceLevel;
  if (totalComparisons >= CONFIDENCE_THRESHOLDS.high) confidence = 'high';
  else if (totalComparisons >= CONFIDENCE_THRESHOLDS.medium) confidence = 'medium';
  else if (totalComparisons >= CONFIDENCE_THRESHOLDS.low) confidence = 'low';
  else confidence = 'insufficient';

  // ── Topic breakdown ─────────────────────────────────────────────────────

  const topicMap = new Map<string, { aligned: number; total: number; position: Position }>();
  for (const comp of allComparisons) {
    if (!topicMap.has(comp.topic)) {
      const pos = positions.find(p => p.topic === comp.topic)!;
      topicMap.set(comp.topic, { aligned: 0, total: 0, position: pos });
    }
    const entry = topicMap.get(comp.topic)!;
    entry.total++;
    if (comp.aligned) entry.aligned++;
  }

  const topicBreakdown: TopicScore[] = [...topicMap.entries()].map(([topic, data]) => ({
    topic,
    ideology: TOPIC_IDEOLOGY[topic] ?? 'neutral',
    statedIntensity: data.position.intensity,
    statedStance: data.position.stance,
    comparisons: data.total,
    aligned: data.aligned,
    score: data.total > 0 ? Math.round((data.aligned / data.total) * 100) : null,
  }));

  // ── Category breakdown ──────────────────────────────────────────────────

  const categoryMap = new Map<string, { aligned: number; total: number }>();
  for (const comp of allComparisons) {
    if (!categoryMap.has(comp.category)) {
      categoryMap.set(comp.category, { aligned: 0, total: 0 });
    }
    const entry = categoryMap.get(comp.category)!;
    entry.total++;
    if (comp.aligned) entry.aligned++;
  }

  const categoryBreakdown: CategoryScore[] = [...categoryMap.entries()].map(
    ([category, data]) => ({
      category,
      comparisons: data.total,
      aligned: data.aligned,
      score: data.total > 0 ? Math.round((data.aligned / data.total) * 100) : 0,
    })
  );

  // ── Notable contradictions ──────────────────────────────────────────────

  const notableContradictions = allComparisons
    .filter(c => !c.aligned)
    .sort((a, b) => b.intensity - a.intensity || b.weight - a.weight)
    .slice(0, 10);

  return {
    bioguide_id: bioguideId,
    score,
    totalComparisons,
    alignedComparisons,
    misalignedComparisons,
    confidence,
    topicBreakdown,
    categoryBreakdown,
    notableContradictions,
    allComparisons,
    methodology: 'say-vs-do-v3',
    computedAt: new Date().toISOString(),
  };
}

/**
 * Compute Say vs Do scores for all members with positions.
 * Returns results sorted by score (descending), with nulls at the end.
 */
export function computeAllSayVsDo(
  memberPositions: Array<{ bioguide_id: string; positions: Position[] }>,
  keyVotes: KeyVoteInput[],
  allMembers: MemberInput[]
): SayVsDoScore[] {
  const results = memberPositions.map(mp =>
    computeMemberSayVsDo(mp.bioguide_id, mp.positions, keyVotes, allMembers)
  );

  return results.sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  });
}

/**
 * Get a human-readable confidence description.
 */
export function describeConfidence(level: ConfidenceLevel, comparisons: number): string {
  switch (level) {
    case 'high':
      return `High confidence based on ${comparisons} position-vote comparisons`;
    case 'medium':
      return `Medium confidence based on ${comparisons} position-vote comparisons`;
    case 'low':
      return `Low confidence — only ${comparisons} position-vote comparisons available`;
    case 'insufficient':
      return `Insufficient data — fewer than ${CONFIDENCE_THRESHOLDS.low} comparable votes found`;
  }
}
