import { describe, it, expect } from 'vitest';
import {
  getVoteDirection,
  calculateTimeWeight,
  calculateIntensityWeight,
  getExpectedDirection,
  computeMemberSayVsDo,
  computeAllSayVsDo,
  describeConfidence,
  PARTISAN_THRESHOLD,
  CONFIDENCE_THRESHOLDS,
  TOPIC_IDEOLOGY,
  TOPIC_TO_CATEGORIES,
} from './say-vs-do';
import type {
  KeyVoteInput,
  MemberInput,
  Position,
} from './say-vs-do';

// ─── Test Fixtures ────────────────────────────────────────────────────────────

/** 20 Democrats + 20 Republicans for party detection */
function makeMemberPool(): MemberInput[] {
  const dems: MemberInput[] = Array.from({ length: 20 }, (_, i) => ({
    bioguide_id: `D${String(i).padStart(6, '0')}`,
    party: 'D',
  }));
  const reps: MemberInput[] = Array.from({ length: 20 }, (_, i) => ({
    bioguide_id: `R${String(i).padStart(6, '0')}`,
    party: 'R',
  }));
  return [...dems, ...reps];
}

const MEMBERS = makeMemberPool();
const DEM_IDS = MEMBERS.filter(m => m.party === 'D').map(m => m.bioguide_id);
const REP_IDS = MEMBERS.filter(m => m.party === 'R').map(m => m.bioguide_id);

/** Create votes where Dems vote Yea and Reps vote Nay (liberal-direction vote) */
function makeLibVote(id: string, category: string, memberId?: string, memberVote?: string): KeyVoteInput {
  const votes: Record<string, string> = {};
  DEM_IDS.forEach(id => { votes[id] = 'Yea'; });
  REP_IDS.forEach(id => { votes[id] = 'Nay'; });
  if (memberId && memberVote) votes[memberId] = memberVote;
  return { id, category, date: '2025-06-01', votes };
}

/** Create votes where Reps vote Yea and Dems vote Nay (conservative-direction vote) */
function makeConVote(id: string, category: string, memberId?: string, memberVote?: string): KeyVoteInput {
  const votes: Record<string, string> = {};
  REP_IDS.forEach(id => { votes[id] = 'Yea'; });
  DEM_IDS.forEach(id => { votes[id] = 'Nay'; });
  if (memberId && memberVote) votes[memberId] = memberVote;
  return { id, category, date: '2025-06-01', votes };
}

/** Create a bipartisan vote (everyone votes Yea) */
function makeBipartisanVote(id: string, category: string, memberId?: string, memberVote?: string): KeyVoteInput {
  const votes: Record<string, string> = {};
  DEM_IDS.forEach(id => { votes[id] = 'Yea'; });
  REP_IDS.forEach(id => { votes[id] = 'Yea'; });
  if (memberId && memberVote) votes[memberId] = memberVote;
  return { id, category, date: '2025-06-01', votes };
}

// ─── getVoteDirection ─────────────────────────────────────────────────────────

describe('getVoteDirection', () => {
  it('returns "liberal" when Dems vote Yea and Reps vote Nay', () => {
    const vote = makeLibVote('v1', 'Healthcare');
    expect(getVoteDirection(vote.votes, MEMBERS)).toBe('liberal');
  });

  it('returns "conservative" when Reps vote Yea and Dems vote Nay', () => {
    const vote = makeConVote('v1', 'Healthcare');
    expect(getVoteDirection(vote.votes, MEMBERS)).toBe('conservative');
  });

  it('returns "unclear" when vote is bipartisan (< PARTISAN_THRESHOLD split)', () => {
    const vote = makeBipartisanVote('v1', 'Healthcare');
    expect(getVoteDirection(vote.votes, MEMBERS)).toBe('unclear');
  });

  it('returns "unclear" when split is exactly at the threshold boundary', () => {
    // Mix Dems: 15 Yea + 5 Nay = 75% Yea; Reps: 9 Yea + 11 Nay = 45% Yea → split 30%
    const votes: Record<string, string> = {};
    DEM_IDS.slice(0, 15).forEach(id => { votes[id] = 'Yea'; });
    DEM_IDS.slice(15).forEach(id => { votes[id] = 'Nay'; });
    REP_IDS.slice(0, 9).forEach(id => { votes[id] = 'Yea'; });
    REP_IDS.slice(9).forEach(id => { votes[id] = 'Nay'; });
    // split = 0.75 - 0.45 = 0.30, which is exactly PARTISAN_THRESHOLD → NOT greater, so unclear
    expect(getVoteDirection(votes, MEMBERS)).toBe('unclear');
  });

  it('returns "unclear" when party sample sizes are too small', () => {
    // Only 5 Dems and 5 Reps — below MIN_PARTY_SAMPLE of 10
    const smallMembers: MemberInput[] = [
      ...Array.from({ length: 5 }, (_, i) => ({ bioguide_id: `D${i}`, party: 'D' as const })),
      ...Array.from({ length: 5 }, (_, i) => ({ bioguide_id: `R${i}`, party: 'R' as const })),
    ];
    const votes: Record<string, string> = {};
    smallMembers.filter(m => m.party === 'D').forEach(m => { votes[m.bioguide_id] = 'Yea'; });
    smallMembers.filter(m => m.party === 'R').forEach(m => { votes[m.bioguide_id] = 'Nay'; });
    expect(getVoteDirection(votes, smallMembers)).toBe('unclear');
  });

  it('ignores Not Voting and Present when computing party split', () => {
    const votes: Record<string, string> = {};
    DEM_IDS.slice(0, 18).forEach(id => { votes[id] = 'Yea'; });
    DEM_IDS.slice(18).forEach(id => { votes[id] = 'Not Voting'; }); // abstentions excluded
    REP_IDS.forEach(id => { votes[id] = 'Nay'; });
    // Dems: 18 Yea / 18 total = 100%; Reps: 0/20 = 0% → split > 0.30 → liberal
    expect(getVoteDirection(votes, MEMBERS)).toBe('liberal');
  });
});

// ─── calculateTimeWeight ──────────────────────────────────────────────────────

describe('calculateTimeWeight', () => {
  it('returns 1.0 for votes in the last 30 days', () => {
    const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    expect(calculateTimeWeight(recentDate)).toBe(1.0);
  });

  it('returns less than 1.0 for votes older than 30 days', () => {
    const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    expect(calculateTimeWeight(oldDate)).toBeLessThan(1.0);
  });

  it('returns 0.5 for votes older than 2 years', () => {
    expect(calculateTimeWeight('2020-01-01')).toBe(0.5);
  });

  it('returns default 0.8 when no date provided', () => {
    expect(calculateTimeWeight(undefined)).toBe(0.8);
  });

  it('gives more weight to recent votes than old ones', () => {
    const recent = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const old = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    expect(calculateTimeWeight(recent)).toBeGreaterThan(calculateTimeWeight(old));
  });
});

// ─── calculateIntensityWeight ─────────────────────────────────────────────────

describe('calculateIntensityWeight', () => {
  it('returns 1.0 for intensity 1 (Strongly Opposes)', () => {
    expect(calculateIntensityWeight(1)).toBe(1.0);
  });

  it('returns 1.0 for intensity 5 (Strongly Supports)', () => {
    expect(calculateIntensityWeight(5)).toBe(1.0);
  });

  it('returns 0.5 for intensity 2 (Opposes)', () => {
    expect(calculateIntensityWeight(2)).toBe(0.5);
  });

  it('returns 0.5 for intensity 4 (Supports)', () => {
    expect(calculateIntensityWeight(4)).toBe(0.5);
  });

  it('returns 0.0 for intensity 3 (Neutral)', () => {
    expect(calculateIntensityWeight(3)).toBe(0.0);
  });
});

// ─── getExpectedDirection ─────────────────────────────────────────────────────

describe('getExpectedDirection', () => {
  it('returns "liberal" when supporting a liberal topic', () => {
    // intensity=5 (Strongly Supports) + liberal topic → expected = liberal
    expect(getExpectedDirection('liberal', 5)).toBe('liberal');
    expect(getExpectedDirection('liberal', 4)).toBe('liberal');
  });

  it('returns "conservative" when opposing a liberal topic', () => {
    // intensity=1 (Strongly Opposes) + liberal topic → expected = conservative
    expect(getExpectedDirection('liberal', 1)).toBe('conservative');
    expect(getExpectedDirection('liberal', 2)).toBe('conservative');
  });

  it('returns "conservative" when supporting a conservative topic', () => {
    expect(getExpectedDirection('conservative', 5)).toBe('conservative');
    expect(getExpectedDirection('conservative', 4)).toBe('conservative');
  });

  it('returns "liberal" when opposing a conservative topic', () => {
    expect(getExpectedDirection('conservative', 1)).toBe('liberal');
    expect(getExpectedDirection('conservative', 2)).toBe('liberal');
  });

  it('returns null for neutral intensity (3)', () => {
    expect(getExpectedDirection('liberal', 3)).toBeNull();
    expect(getExpectedDirection('conservative', 3)).toBeNull();
  });

  it('returns null for neutral topic ideology', () => {
    expect(getExpectedDirection('neutral', 5)).toBeNull();
    expect(getExpectedDirection('neutral', 1)).toBeNull();
  });
});

// ─── computeMemberSayVsDo ─────────────────────────────────────────────────────

describe('computeMemberSayVsDo', () => {
  const MEMBER_ID = 'T000001';

  it('scores 100% for a member who always votes consistent with stated positions', () => {
    // Member says: Strongly Supports expanding healthcare (intensity=5, liberal topic)
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
    ];

    // All votes are liberal-direction; member votes Yea every time (aligned)
    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', MEMBER_ID, 'Yea'),
      makeLibVote('v2', 'Healthcare', MEMBER_ID, 'Yea'),
      makeLibVote('v3', 'Healthcare', MEMBER_ID, 'Yea'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.score).toBe(100);
    expect(result.alignedComparisons).toBe(3);
    expect(result.misalignedComparisons).toBe(0);
  });

  it('scores 0% for a member who always contradicts stated positions', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
    ];

    // Liberal votes, but member votes Nay every time (contradicts "strongly supports")
    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', MEMBER_ID, 'Nay'),
      makeLibVote('v2', 'Healthcare', MEMBER_ID, 'Nay'),
      makeLibVote('v3', 'Healthcare', MEMBER_ID, 'Nay'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.score).toBe(0);
    expect(result.alignedComparisons).toBe(0);
    expect(result.misalignedComparisons).toBe(3);
  });

  it('correctly handles conservative positions — Strongly Opposes liberal topic', () => {
    // Member says: Strongly Opposes healthcare expansion (intensity=1 → conservative expected)
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Opposes', intensity: 1 },
    ];

    // Liberal-direction votes; member votes Nay (correct for someone opposing expansion)
    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', MEMBER_ID, 'Nay'),
      makeLibVote('v2', 'Healthcare', MEMBER_ID, 'Nay'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.score).toBe(100);
    expect(result.alignedComparisons).toBe(2);
  });

  it('correctly handles conservative positions — Strongly Supports conservative topic', () => {
    // Member says: Strongly Supports fighting EPA (intensity=5, conservative topic)
    // Expected: vote conservative direction (Yea on anti-EPA bills = conservative vote)
    const positions: Position[] = [
      { topic: 'Fight EPA regulatory over-reach', stance: 'Strongly Supports', intensity: 5 },
    ];

    // Conservative-direction vote (Reps Yea, Dems Nay); member votes Yea (aligned)
    const votes: KeyVoteInput[] = [
      makeConVote('v1', 'Climate & Environment', MEMBER_ID, 'Yea'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.score).toBe(100);
  });

  it('skips bipartisan votes — they are uninformative for Say vs Do', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
    ];

    // Bipartisan votes (everyone votes Yea) should be ignored
    const votes: KeyVoteInput[] = [
      makeBipartisanVote('v1', 'Healthcare', MEMBER_ID, 'Yea'),
      makeBipartisanVote('v2', 'Healthcare', MEMBER_ID, 'Nay'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.totalComparisons).toBe(0);
    expect(result.score).toBeNull();
  });

  it('skips neutral intensity positions (intensity=3)', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Neutral', intensity: 3 },
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', MEMBER_ID, 'Yea'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.totalComparisons).toBe(0);
    expect(result.score).toBeNull();
  });

  it('skips neutral topic ideology topics', () => {
    // "Support & expand free trade" is 'neutral' topology — skip
    const positions: Position[] = [
      { topic: 'Support & expand free trade', stance: 'Strongly Supports', intensity: 5 },
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Economy & Taxes', MEMBER_ID, 'Yea'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.totalComparisons).toBe(0);
  });

  it('skips "Not Voting" and "Present" member votes', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', MEMBER_ID, 'Not Voting'),
      makeLibVote('v2', 'Healthcare', MEMBER_ID, 'Present'),
      makeLibVote('v3', 'Healthcare', MEMBER_ID, 'Yea'), // Only this one should count
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.totalComparisons).toBe(1);
    expect(result.alignedComparisons).toBe(1);
  });

  it('weights strong positions (intensity 1 or 5) more than mild ones (2 or 4)', () => {
    // Member: Strongly Supports healthcare (5) but mildly opposes immigration (2)
    // On healthcare: aligned (1 vote)
    // On immigration: misaligned (1 vote)
    const MEMBER_A = 'A000001';
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 }, // weight 1.0
      { topic: 'Pathway to citizenship for illegal aliens', stance: 'Opposes', intensity: 2 }, // weight 0.5
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', MEMBER_A, 'Yea'),        // aligned, weight 1.0
      makeLibVote('v2', 'Immigration', MEMBER_A, 'Yea'),       // misaligned (opposes liberal immigration but votes Yea), weight 0.5
    ];

    const result = computeMemberSayVsDo(MEMBER_A, positions, votes, MEMBERS);

    // Weighted: aligned = 1.0 (healthcare), misaligned = 0.5 (immigration)
    // Score = 1.0 / (1.0 + 0.5) * 100 = 66.67 ≈ 67%
    expect(result.score).toBeCloseTo(67, 0);
  });

  it('returns null score when member has no position-vote comparisons', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
    ];

    // No votes
    const result = computeMemberSayVsDo(MEMBER_ID, positions, [], MEMBERS);

    expect(result.score).toBeNull();
    expect(result.confidence).toBe('insufficient');
  });

  it('confidence levels reflect comparison count', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
    ];

    // Create enough votes for "high" confidence (>= 20 comparisons)
    const manyVotes = Array.from({ length: 25 }, (_, i) =>
      makeLibVote(`v${i}`, 'Healthcare', MEMBER_ID, 'Yea')
    );

    const highResult = computeMemberSayVsDo(MEMBER_ID, positions, manyVotes, MEMBERS);
    expect(highResult.confidence).toBe('high');

    const fewVotes = Array.from({ length: 5 }, (_, i) =>
      makeLibVote(`v${i}`, 'Healthcare', MEMBER_ID, 'Yea')
    );

    const medResult = computeMemberSayVsDo(MEMBER_ID, positions, fewVotes, MEMBERS);
    expect(['medium', 'low']).toContain(medResult.confidence);

    const result2 = computeMemberSayVsDo(MEMBER_ID, positions, [], MEMBERS);
    expect(result2.confidence).toBe('insufficient');
  });

  it('builds topic breakdown correctly', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
      { topic: 'Higher taxes on the wealthy', stance: 'Supports', intensity: 4 },
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', MEMBER_ID, 'Yea'),
      makeLibVote('v2', 'Economy & Taxes', MEMBER_ID, 'Nay'), // misaligned
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.topicBreakdown).toHaveLength(2);

    const healthTopic = result.topicBreakdown.find(t => t.topic === 'Expand ObamaCare');
    expect(healthTopic).toBeDefined();
    expect(healthTopic!.score).toBe(100);

    const taxTopic = result.topicBreakdown.find(t => t.topic === 'Higher taxes on the wealthy');
    expect(taxTopic).toBeDefined();
    expect(taxTopic!.score).toBe(0);
  });

  it('builds category breakdown correctly', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', MEMBER_ID, 'Yea'),
      makeLibVote('v2', 'Healthcare', MEMBER_ID, 'Nay'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    const healthCat = result.categoryBreakdown.find(c => c.category === 'Healthcare');
    expect(healthCat).toBeDefined();
    expect(healthCat!.comparisons).toBe(2);
    expect(healthCat!.aligned).toBe(1);
    expect(healthCat!.score).toBe(50);
  });

  it('lists notable contradictions sorted by intensity then weight', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
      { topic: 'Higher taxes on the wealthy', stance: 'Supports', intensity: 4 },
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', MEMBER_ID, 'Nay'),      // misaligned, intensity 5
      makeLibVote('v2', 'Economy & Taxes', MEMBER_ID, 'Nay'), // misaligned, intensity 4
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.notableContradictions.length).toBe(2);
    // Higher intensity (5) should come first
    expect(result.notableContradictions[0].intensity).toBe(5);
    expect(result.notableContradictions[1].intensity).toBe(4);
  });

  it('populates allComparisons for full transparency', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', MEMBER_ID, 'Yea'),
      makeLibVote('v2', 'Healthcare', MEMBER_ID, 'Nay'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.allComparisons).toHaveLength(2);
    expect(result.allComparisons.every(c => 'aligned' in c && 'weight' in c)).toBe(true);
    expect(result.allComparisons.every(c => c.voteId !== undefined)).toBe(true);
  });

  it('uses methodology tag for version tracking', () => {
    const result = computeMemberSayVsDo('X', [], [], MEMBERS);
    expect(result.methodology).toBe('say-vs-do-v3');
  });
});

// ─── computeAllSayVsDo ────────────────────────────────────────────────────────

describe('computeAllSayVsDo', () => {
  it('returns results for all members with positions', () => {
    const memberPositions = [
      {
        bioguide_id: 'A000001',
        positions: [{ topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 }],
      },
      {
        bioguide_id: 'B000001',
        positions: [{ topic: 'Expand ObamaCare', stance: 'Strongly Opposes', intensity: 1 }],
      },
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', 'A000001', 'Yea'),
      makeLibVote('v1', 'Healthcare', 'B000001', 'Nay'),
    ];

    const results = computeAllSayVsDo(memberPositions, votes, MEMBERS);

    expect(results).toHaveLength(2);
    // Both members are aligned — both should score 100
    expect(results[0].score).toBe(100);
    expect(results[1].score).toBe(100);
  });

  it('sorts results by score descending (nulls at end)', () => {
    const memberPositions = [
      {
        bioguide_id: 'A000001', // High scorer
        positions: [{ topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 }],
      },
      {
        bioguide_id: 'B000001', // Low scorer
        positions: [{ topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 }],
      },
      {
        bioguide_id: 'C000001', // No data → null score
        positions: [{ topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 }],
      },
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('v1', 'Healthcare', 'A000001', 'Yea'), // aligned
      makeLibVote('v1', 'Healthcare', 'B000001', 'Nay'), // misaligned
      // C000001 doesn't appear in votes → null score
    ];

    const results = computeAllSayVsDo(memberPositions, votes, MEMBERS);

    expect(results[0].bioguide_id).toBe('A000001'); // Score 100
    expect(results[1].bioguide_id).toBe('B000001'); // Score 0
    expect(results[2].bioguide_id).toBe('C000001'); // null
    expect(results[2].score).toBeNull();
  });
});

// ─── describeConfidence ───────────────────────────────────────────────────────

describe('describeConfidence', () => {
  it('returns descriptive string for each confidence level', () => {
    expect(describeConfidence('high', 25)).toContain('25');
    expect(describeConfidence('medium', 12)).toContain('12');
    expect(describeConfidence('low', 4)).toContain('4');
    expect(describeConfidence('insufficient', 1).toLowerCase()).toContain('insufficient');
  });
});

// ─── TOPIC_IDEOLOGY coverage ──────────────────────────────────────────────────

describe('TOPIC_IDEOLOGY', () => {
  it('covers all mapped topics (no undefined ideologies)', () => {
    for (const [topic, ideology] of Object.entries(TOPIC_IDEOLOGY)) {
      expect(['liberal', 'conservative', 'neutral']).toContain(ideology);
    }
  });

  it('Expand ObamaCare is liberal', () => {
    expect(TOPIC_IDEOLOGY['Expand ObamaCare']).toBe('liberal');
  });

  it('Fight EPA regulatory over-reach is conservative', () => {
    expect(TOPIC_IDEOLOGY['Fight EPA regulatory over-reach']).toBe('conservative');
  });

  it('Prioritize green energy is liberal', () => {
    expect(TOPIC_IDEOLOGY['Prioritize green energy']).toBe('liberal');
  });

  it('Higher taxes on the wealthy is liberal', () => {
    expect(TOPIC_IDEOLOGY['Higher taxes on the wealthy']).toBe('liberal');
  });

  it("Abortion is a woman's unrestricted right is liberal", () => {
    expect(TOPIC_IDEOLOGY["Abortion is a woman's unrestricted right"]).toBe('liberal');
  });

  it('Absolute right to gun ownership is conservative', () => {
    expect(TOPIC_IDEOLOGY['Absolute right to gun ownership']).toBe('conservative');
  });

  it('Support & expand free trade is neutral', () => {
    expect(TOPIC_IDEOLOGY['Support & expand free trade']).toBe('neutral');
  });

  it('Avoid foreign entanglements is neutral', () => {
    expect(TOPIC_IDEOLOGY['Avoid foreign entanglements']).toBe('neutral');
  });
});

// ─── TOPIC_TO_CATEGORIES coverage ────────────────────────────────────────────

describe('TOPIC_TO_CATEGORIES', () => {
  it('Expand ObamaCare maps to Healthcare', () => {
    expect(TOPIC_TO_CATEGORIES['Expand ObamaCare']).toContain('Healthcare');
  });

  it('Fight EPA regulatory over-reach maps to Climate & Environment', () => {
    expect(TOPIC_TO_CATEGORIES['Fight EPA regulatory over-reach']).toContain(
      'Climate & Environment'
    );
  });

  it('Pathway to citizenship maps to Immigration', () => {
    expect(
      TOPIC_TO_CATEGORIES['Pathway to citizenship for illegal aliens']
    ).toContain('Immigration');
  });

  it('Higher taxes on the wealthy maps to Economy & Taxes', () => {
    expect(TOPIC_TO_CATEGORIES['Higher taxes on the wealthy']).toContain('Economy & Taxes');
  });

  it('Expand the military maps to National Security', () => {
    expect(TOPIC_TO_CATEGORIES['Expand the military']).toContain('National Security');
  });
});

// ─── Regression tests for known bugs ─────────────────────────────────────────

describe('Regression: Bug #37 / #39 - publicBenefit "mixed" causing backwards scores', () => {
  const MEMBER_ID = 'BUG037TEST';

  it('correctly scores a member who supports healthcare and votes Yea on partisan healthcare vote', () => {
    // This was BROKEN before: mixed bills caused Yea votes to score as misaligned
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Supports', intensity: 5 },
    ];

    // Liberal-direction healthcare vote (Dems Yea, Reps Nay) — previously labeled "mixed" publicBenefit
    const votes: KeyVoteInput[] = [
      makeLibVote('HR7148', 'Healthcare', MEMBER_ID, 'Yea'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.score).toBe(100); // Was returning ~0 before (inverted) due to publicBenefit=mixed bug
    expect(result.allComparisons[0].aligned).toBe(true);
  });

  it('correctly scores a conservative member who opposes healthcare and votes Nay on liberal healthcare vote', () => {
    const positions: Position[] = [
      { topic: 'Expand ObamaCare', stance: 'Strongly Opposes', intensity: 1 },
    ];

    const votes: KeyVoteInput[] = [
      makeLibVote('HR7148', 'Healthcare', MEMBER_ID, 'Nay'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.score).toBe(100);
    expect(result.allComparisons[0].aligned).toBe(true);
  });

  it('catches a member who claims to support environment but votes against it', () => {
    // Before v3: "mixed" publicBenefit made this alignment check unreliable
    const positions: Position[] = [
      { topic: 'Prioritize green energy', stance: 'Strongly Supports', intensity: 5 },
    ];

    // Liberal-direction climate vote (Dems Yea); member votes Nay (says one thing, does another)
    const votes: KeyVoteInput[] = [
      makeLibVote('climate1', 'Climate & Environment', MEMBER_ID, 'Nay'),
    ];

    const result = computeMemberSayVsDo(MEMBER_ID, positions, votes, MEMBERS);

    expect(result.score).toBe(0);
    expect(result.notableContradictions.length).toBeGreaterThan(0);
  });
});

// ─── PARTISAN_THRESHOLD and CONFIDENCE_THRESHOLDS are exported ───────────────

describe('Exported constants', () => {
  it('PARTISAN_THRESHOLD is a positive number', () => {
    expect(PARTISAN_THRESHOLD).toBeGreaterThan(0);
    expect(PARTISAN_THRESHOLD).toBeLessThan(1);
  });

  it('CONFIDENCE_THRESHOLDS has high > medium > low', () => {
    expect(CONFIDENCE_THRESHOLDS.high).toBeGreaterThan(CONFIDENCE_THRESHOLDS.medium);
    expect(CONFIDENCE_THRESHOLDS.medium).toBeGreaterThan(CONFIDENCE_THRESHOLDS.low);
    expect(CONFIDENCE_THRESHOLDS.low).toBeGreaterThan(0);
  });
});
