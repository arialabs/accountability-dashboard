import { describe, it, expect } from 'vitest';
import { calculateVoteBasedScores } from './vote-based-scoring';

describe('vote-based-scoring', () => {
  describe('BUG #39 REGRESSION: Progressive/Conservative alignment score calculation', () => {
    it('calculates progressive score correctly (Republicans voting conservative show LOW progressive score)', () => {
      // Simulate Ben Cline (R-VA) scenario: 98.3% party loyalty, should show ~98% conservative
      const republicanId = 'C001118';
      const allMembers = [
        // Test Republican
        { bioguide_id: republicanId, party: 'R' },
        // 10 Republicans for sample size
        ...Array.from({ length: 10 }, (_, i) => ({ bioguide_id: `R${i.toString().padStart(6, '0')}`, party: 'R' })),
        // 10 Democrats for sample size
        ...Array.from({ length: 10 }, (_, i) => ({ bioguide_id: `D${i.toString().padStart(6, '0')}`, party: 'D' })),
      ];

      // Create votes where Democrats vote Yea (progressive) and Republicans vote Nay (conservative)
      const keyVotes = [
        {
          id: '1',
          bill: 'H.R. 1234',
          title: 'Healthcare Expansion Act',
          category: 'Healthcare',
          date: '2024-01-15',
          description: 'Expand healthcare coverage',
          votes: {
            // Test Republican votes Nay (conservative position)
            [republicanId]: 'Nay',
            // All other Republicans vote Nay
            ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`R${i.toString().padStart(6, '0')}`, 'Nay'])),
            // All Democrats vote Yea (progressive position)
            ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`D${i.toString().padStart(6, '0')}`, 'Yea'])),
          },
          yea_count: 10,
          nay_count: 11,
        },
        {
          id: '2',
          bill: 'H.R. 5678',
          title: 'Climate Action Bill',
          category: 'Climate & Environment',
          date: '2024-02-20',
          description: 'Address climate change',
          votes: {
            [republicanId]: 'Nay',
            ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`R${i.toString().padStart(6, '0')}`, 'Nay'])),
            ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`D${i.toString().padStart(6, '0')}`, 'Yea'])),
          },
          yea_count: 10,
          nay_count: 11,
        },
      ];

      const result = calculateVoteBasedScores(republicanId, keyVotes, allMembers);

      // The overallProgressiveScore should be LOW (close to 0) for a consistent conservative Republican
      // This is correct - the score represents progressive alignment, so conservatives have low scores
      expect(result.overallProgressiveScore).toBeLessThan(10);
      
      // Note: The UI layer (VoteBasedPositions.tsx) inverts this for Republicans to show:
      // Conservative score = 100 - progressive score = ~98% (HIGH, as expected)
    });

    it('calculates progressive score correctly (Democrats voting progressive show HIGH progressive score)', () => {
      const democratId = 'D000001';
      const allMembers = [
        // Test Democrat
        { bioguide_id: democratId, party: 'D' },
        // 10 more Democrats for sample size
        ...Array.from({ length: 10 }, (_, i) => ({ bioguide_id: `D${(i + 2).toString().padStart(6, '0')}`, party: 'D' })),
        // 10 Republicans for sample size
        ...Array.from({ length: 10 }, (_, i) => ({ bioguide_id: `R${i.toString().padStart(6, '0')}`, party: 'R' })),
      ];

      const keyVotes = [
        {
          id: '1',
          bill: 'H.R. 1234',
          title: 'Healthcare Expansion Act',
          category: 'Healthcare',
          date: '2024-01-15',
          description: 'Expand healthcare coverage',
          votes: {
            // Test Democrat votes Yea (progressive position)
            [democratId]: 'Yea',
            // All other Democrats vote Yea
            ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`D${(i + 2).toString().padStart(6, '0')}`, 'Yea'])),
            // All Republicans vote Nay
            ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`R${i.toString().padStart(6, '0')}`, 'Nay'])),
          },
          yea_count: 11,
          nay_count: 10,
        },
      ];

      const result = calculateVoteBasedScores(democratId, keyVotes, allMembers);

      // Progressive score should be HIGH for consistent progressive voting
      expect(result.overallProgressiveScore).toBeGreaterThan(90);
    });

    it('scores are mathematically proportional to progressive voting percentage', () => {
      // Test that a member voting with progressives X% of the time gets ~X% progressive score
      const memberId = 'M000001';
      const allMembers = [
        { bioguide_id: memberId, party: 'I' }, // Independent to test score directly
        // 10 Democrats
        ...Array.from({ length: 10 }, (_, i) => ({
          bioguide_id: `D${i.toString().padStart(6, '0')}`,
          party: 'D',
        })),
        // 10 Republicans
        ...Array.from({ length: 10 }, (_, i) => ({
          bioguide_id: `R${i.toString().padStart(6, '0')}`,
          party: 'R',
        })),
      ];

      // Create 10 votes, member votes progressive on 7 of them (70%)
      const keyVotes = Array.from({ length: 10 }, (_, i) => {
        const votes: Record<string, string> = {
          [memberId]: i < 7 ? 'Yea' : 'Nay', // 70% Yea (progressive)
        };
        
        // Democrats vote Yea (progressive direction)
        for (let j = 0; j < 10; j++) {
          votes[`D${j.toString().padStart(6, '0')}`] = 'Yea';
        }
        
        // Republicans vote Nay (conservative direction)
        for (let j = 0; j < 10; j++) {
          votes[`R${j.toString().padStart(6, '0')}`] = 'Nay';
        }

        return {
          id: `vote-${i}`,
          bill: `H.R. ${1000 + i}`,
          title: `Test Bill ${i}`,
          category: 'Healthcare',
          date: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
          description: 'Test',
          votes,
          yea_count: 10 + (i < 7 ? 1 : 0),
          nay_count: 10 + (i < 7 ? 0 : 1),
        };
      });

      const result = calculateVoteBasedScores(memberId, keyVotes, allMembers);

      // Should be approximately 70% progressive
      expect(result.overallProgressiveScore).toBeGreaterThanOrEqual(65);
      expect(result.overallProgressiveScore).toBeLessThanOrEqual(75);
    });
  });
});
