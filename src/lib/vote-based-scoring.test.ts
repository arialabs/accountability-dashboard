import { describe, it, expect } from 'vitest';
import { calculateVoteBasedScores } from './vote-based-scoring';

describe('vote-based-scoring', () => {
  describe('BUG #39 REGRESSION: Progressive/Conservative alignment score inversion', () => {
    it('Republican with high party loyalty should have HIGH conservative score (not low)', () => {
      // Simulate Ben Cline (R-VA) scenario: 98.3% party loyalty, should show ~98% conservative
      const republicanId = 'C001118';
      const allMembers = [
        { bioguide_id: republicanId, party: 'R' },
        { bioguide_id: 'D000001', party: 'D' },
        { bioguide_id: 'D000002', party: 'D' },
        { bioguide_id: 'D000003', party: 'D' },
        { bioguide_id: 'D000004', party: 'D' },
        { bioguide_id: 'D000005', party: 'D' },
        { bioguide_id: 'D000006', party: 'D' },
        { bioguide_id: 'D000007', party: 'D' },
        { bioguide_id: 'D000008', party: 'D' },
        { bioguide_id: 'D000009', party: 'D' },
        { bioguide_id: 'D000010', party: 'D' },
      ];

      // Create votes where Democrats vote Yea (progressive) and Republican votes Nay (conservative)
      const keyVotes = [
        {
          id: '1',
          bill: 'H.R. 1234',
          title: 'Healthcare Expansion Act',
          category: 'Healthcare',
          date: '2024-01-15',
          description: 'Expand healthcare coverage',
          votes: {
            [republicanId]: 'Nay', // Republican votes against progressive bill
            'D000001': 'Yea',
            'D000002': 'Yea',
            'D000003': 'Yea',
            'D000004': 'Yea',
            'D000005': 'Yea',
            'D000006': 'Yea',
            'D000007': 'Yea',
            'D000008': 'Yea',
            'D000009': 'Yea',
            'D000010': 'Yea',
          },
          yea_count: 10,
          nay_count: 1,
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
            'D000001': 'Yea',
            'D000002': 'Yea',
            'D000003': 'Yea',
            'D000004': 'Yea',
            'D000005': 'Yea',
            'D000006': 'Yea',
            'D000007': 'Yea',
            'D000008': 'Yea',
            'D000009': 'Yea',
            'D000010': 'Yea',
          },
          yea_count: 10,
          nay_count: 1,
        },
      ];

      const result = calculateVoteBasedScores(republicanId, keyVotes, allMembers);

      // The overallProgressiveScore should be LOW (close to 0) for a consistent conservative
      expect(result.overallProgressiveScore).toBeLessThan(10);
      
      // The CONSERVATIVE score (100 - progressive) should be HIGH (close to 100)
      const conservativeScore = 100 - result.overallProgressiveScore;
      expect(conservativeScore).toBeGreaterThan(90);
      
      // This matches the expected ~98% conservative score for high party loyalty Republicans
    });

    it('Democrat with high party loyalty should have HIGH progressive score', () => {
      const democratId = 'D000001';
      const allMembers = [
        { bioguide_id: democratId, party: 'D' },
        { bioguide_id: 'D000002', party: 'D' },
        { bioguide_id: 'D000003', party: 'D' },
        { bioguide_id: 'D000004', party: 'D' },
        { bioguide_id: 'D000005', party: 'D' },
        { bioguide_id: 'D000006', party: 'D' },
        { bioguide_id: 'D000007', party: 'D' },
        { bioguide_id: 'D000008', party: 'D' },
        { bioguide_id: 'D000009', party: 'D' },
        { bioguide_id: 'D000010', party: 'D' },
        { bioguide_id: 'R000001', party: 'R' },
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
            [democratId]: 'Yea',
            'D000002': 'Yea',
            'D000003': 'Yea',
            'D000004': 'Yea',
            'D000005': 'Yea',
            'D000006': 'Yea',
            'D000007': 'Yea',
            'D000008': 'Yea',
            'D000009': 'Yea',
            'D000010': 'Yea',
            'R000001': 'Nay',
          },
          yea_count: 10,
          nay_count: 1,
        },
      ];

      const result = calculateVoteBasedScores(democratId, keyVotes, allMembers);

      // Progressive score should be HIGH for consistent progressive voting
      expect(result.overallProgressiveScore).toBeGreaterThan(90);
    });

    it('scores are mathematically consistent with party loyalty percentages', () => {
      // Test that a member voting with progressives X% of the time gets ~X% progressive score
      const memberId = 'M000001';
      const allMembers = Array.from({ length: 20 }, (_, i) => ({
        bioguide_id: `D${i.toString().padStart(6, '0')}`,
        party: 'D',
      })).concat([
        { bioguide_id: memberId, party: 'I' }, // Independent to test score directly
      ]);

      // Create 10 votes, member votes progressive on 7 of them (70%)
      const keyVotes = Array.from({ length: 10 }, (_, i) => {
        const votes: Record<string, string> = {
          [memberId]: i < 7 ? 'Yea' : 'Nay', // 70% Yea
        };
        
        // Democrats vote Yea (progressive direction)
        for (let j = 0; j < 20; j++) {
          votes[`D${j.toString().padStart(6, '0')}`] = 'Yea';
        }

        return {
          id: `vote-${i}`,
          bill: `H.R. ${1000 + i}`,
          title: `Test Bill ${i}`,
          category: 'Healthcare',
          date: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
          description: 'Test',
          votes,
          yea_count: 20 + (i < 7 ? 1 : 0),
          nay_count: i < 7 ? 0 : 1,
        };
      });

      const result = calculateVoteBasedScores(memberId, keyVotes, allMembers);

      // Should be approximately 70% progressive
      expect(result.overallProgressiveScore).toBeGreaterThanOrEqual(65);
      expect(result.overallProgressiveScore).toBeLessThanOrEqual(75);
    });
  });
});
