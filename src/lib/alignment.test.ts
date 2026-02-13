import { describe, it, expect } from 'vitest';
import {
  getRelevantCategories,
  isVoteAligned,
  calculateMemberAlignment,
} from './alignment';
import type { MemberPositions } from './types';

describe('alignment', () => {
  describe('getRelevantCategories', () => {
    it('returns Healthcare for ObamaCare topic', () => {
      const categories = getRelevantCategories('Expand ObamaCare');
      expect(categories).toContain('Healthcare');
    });

    it('returns Immigration for citizenship topic', () => {
      const categories = getRelevantCategories('Pathway to citizenship for illegal aliens');
      expect(categories).toContain('Immigration');
    });

    it('returns Climate & Environment for EPA topic', () => {
      const categories = getRelevantCategories('Fight EPA regulatory over-reach');
      expect(categories).toContain('Climate & Environment');
    });

    it('returns Economy & Taxes for tax topics', () => {
      const categories = getRelevantCategories('Higher taxes on the wealthy');
      expect(categories).toContain('Economy & Taxes');
    });

    it('handles fuzzy matching for healthcare keywords', () => {
      const categories = getRelevantCategories('Support Medicare for All');
      expect(categories).toContain('Healthcare');
    });

    it('handles fuzzy matching for environment keywords', () => {
      const categories = getRelevantCategories('Protect the environment');
      expect(categories).toContain('Climate & Environment');
    });

    it('returns Other for unrecognized topics', () => {
      const categories = getRelevantCategories('Some random unrelated topic');
      expect(categories).toContain('Other');
    });
  });

  describe('isVoteAligned', () => {
    it('returns null for Not Voting', () => {
      const result = isVoteAligned('Strongly Supports', 'Not Voting', 'positive');
      expect(result).toBeNull();
    });

    it('returns true when progressive stance aligns with Yea on positive bill', () => {
      const result = isVoteAligned('Strongly Supports', 'Yea', 'positive');
      expect(result).toBe(true);
    });

    it('returns false when progressive stance opposes Nay on positive bill', () => {
      const result = isVoteAligned('Strongly Supports', 'Nay', 'positive');
      expect(result).toBe(false);
    });

    it('returns true when conservative stance aligns with Nay on positive bill', () => {
      const result = isVoteAligned('Strongly Opposes', 'Nay', 'positive');
      expect(result).toBe(true);
    });

    it('returns false when conservative stance misaligns with Yea on positive bill', () => {
      const result = isVoteAligned('Strongly Opposes', 'Yea', 'positive');
      expect(result).toBe(false);
    });

    it('handles "Favors" as progressive', () => {
      const result = isVoteAligned('Favors', 'Yea', 'positive');
      expect(result).toBe(true);
    });

    // Bug #37 regression tests: Voting Nay on harmful bills should align with progressive stance
    it('returns true when progressive stance votes Nay to block negative bill', () => {
      // Example: Rep supports healthcare, votes Nay on bill to rescind Medicaid funding
      const result = isVoteAligned('Strongly Supports', 'Nay', 'negative');
      expect(result).toBe(true);
    });

    it('returns false when progressive stance votes Yea for negative bill', () => {
      // Example: Rep claims to support healthcare but votes Yea to cut Medicaid
      const result = isVoteAligned('Strongly Supports', 'Yea', 'negative');
      expect(result).toBe(false);
    });

    it('returns true when conservative stance votes Yea for negative bill', () => {
      // Example: Rep opposes ObamaCare, votes Yea to rescind ACA funding
      const result = isVoteAligned('Strongly Opposes', 'Yea', 'negative');
      expect(result).toBe(true);
    });

    it('returns false when conservative stance votes Nay on negative bill', () => {
      // Example: Rep opposes healthcare expansion but votes Nay to block cuts
      const result = isVoteAligned('Strongly Opposes', 'Nay', 'negative');
      expect(result).toBe(false);
    });
  });

  describe('calculateMemberAlignment', () => {
    const mockMemberPositions: MemberPositions = {
      bioguide_id: 'T000001',
      name: 'Test Member',
      source: 'ontheissues',
      source_url: 'https://example.com',
      last_updated: '2026-01-01',
      positions: [
        {
          topic: 'Expand ObamaCare',
          stance: 'Strongly Supports',
          intensity: 5,
          quotes: [],
          votes: [],
        },
        {
          topic: 'Pathway to citizenship for illegal aliens',
          stance: 'Opposes',
          intensity: 2,
          quotes: [],
          votes: [],
        },
      ],
    };

    const mockKeyVotes = [
      {
        category: 'Healthcare',
        publicBenefit: 'positive',
        votes: { 'T000001': 'Yea' },
      },
      {
        category: 'Healthcare',
        publicBenefit: 'negative',
        votes: { 'T000001': 'Nay' },
      },
      {
        category: 'Immigration',
        publicBenefit: 'positive',
        votes: { 'T000001': 'Nay' },
      },
    ];

    it('calculates alignment summary', () => {
      const result = calculateMemberAlignment(mockMemberPositions, mockKeyVotes);
      
      expect(result.bioguideId).toBe('T000001');
      expect(result.totalPositions).toBe(2);
    });

    it('includes results for each position', () => {
      const result = calculateMemberAlignment(mockMemberPositions, mockKeyVotes);
      
      expect(result.results).toHaveLength(2);
      expect(result.results[0].position.topic).toBe('Expand ObamaCare');
    });

    it('calculates category scores', () => {
      const result = calculateMemberAlignment(mockMemberPositions, mockKeyVotes);
      
      // Should have scores for Healthcare and Immigration
      expect(Object.keys(result.categoryScores).length).toBeGreaterThan(0);
    });

    it('returns null overall score when no relevant votes', () => {
      const emptyMember: MemberPositions = {
        bioguide_id: 'E000001',
        name: 'Empty Member',
        source: 'ontheissues',
        source_url: 'https://example.com',
        last_updated: '2026-01-01',
        positions: [
          {
            topic: 'Some random topic',
            stance: 'Neutral',
            intensity: 3,
            quotes: [],
            votes: [],
          },
        ],
      };
      
      const result = calculateMemberAlignment(emptyMember, mockKeyVotes);
      expect(result.overallAlignmentScore).toBeNull();
    });
  });
});
