import { describe, it, expect } from 'vitest';
import { calculateEnhancedAlignment, getScoreExplanation } from './alignment-enhanced';
import type { AlignmentScore } from './data';
import type { CampaignFinance } from './types';

const mockAlignmentScore: AlignmentScore = {
  bioguide_id: 'A000001',
  name: 'Test Member',
  total_votes_analyzed: 20,
  aligned_votes: 16,
  misaligned_votes: 4,
  alignment_score: 80,
  category_breakdown: {
    'Healthcare': { aligned: 4, total: 5, score: 80 },
    'Climate & Environment': { aligned: 5, total: 6, score: 83 },
    'Economy & Taxes': { aligned: 7, total: 9, score: 78 },
  },
  notable_misalignments: [],
};

const mockFinance: CampaignFinance = {
  candidate_id: 'H00000000',
  cycle: 2024,
  total_raised: 1000000,
  total_spent: 800000,
  cash_on_hand: 200000,
  individual_contributions: 600000,
  pac_contributions: 300000,
  party_contributions: 100000,
  candidate_self_funding: 0,
  small_donors: 200000,
  large_donors: 400000,
  pac_percentage: 30,
  small_donor_percentage: 20,
  large_donor_percentage: 40,
  top_contributors: [],
  top_industries: [],
};

describe('Enhanced Alignment Calculation', () => {
  it('should calculate weighted score with all factors', () => {
    const result = calculateEnhancedAlignment(
      mockAlignmentScore,
      mockFinance,
      85, // party alignment
      100 // votes count
    );
    
    expect(result.weighted_score).toBeDefined();
    expect(result.weighted_score).toBeGreaterThan(0);
    expect(result.weighted_score).toBeLessThanOrEqual(100);
    expect(result.factors.length).toBeGreaterThan(0);
  });
  
  it('should include voting record as primary factor', () => {
    const result = calculateEnhancedAlignment(mockAlignmentScore);
    
    const votingFactor = result.factors.find(f => f.name === 'Position-to-Vote Alignment');
    expect(votingFactor).toBeDefined();
    expect(votingFactor!.score).toBe(80);
    expect(votingFactor!.weight).toBeGreaterThan(0.5); // Should be primary factor
  });
  
  it('should penalize high PAC and large donor funding', () => {
    const highPacFinance: CampaignFinance = {
      ...mockFinance,
      pac_percentage: 60,
      large_donor_percentage: 30,
      small_donor_percentage: 10,
    };
    
    const lowPacFinance: CampaignFinance = {
      ...mockFinance,
      pac_percentage: 10,
      large_donor_percentage: 20,
      small_donor_percentage: 70,
    };
    
    const highPacResult = calculateEnhancedAlignment(mockAlignmentScore, highPacFinance);
    const lowPacResult = calculateEnhancedAlignment(mockAlignmentScore, lowPacFinance);
    
    const highPacFactor = highPacResult.factors.find(f => f.name === 'Campaign Finance Influence');
    const lowPacFactor = lowPacResult.factors.find(f => f.name === 'Campaign Finance Influence');
    
    expect(lowPacFactor!.score).toBeGreaterThan(highPacFactor!.score);
  });
  
  it('should calculate consistency score', () => {
    const result = calculateEnhancedAlignment(mockAlignmentScore);
    
    expect(result.consistency_score).toBeDefined();
    expect(result.consistency_score).toBeGreaterThan(0);
    expect(result.consistency_score).toBeLessThanOrEqual(100);
    
    const consistencyFactor = result.factors.find(f => f.name === 'Voting Consistency');
    expect(consistencyFactor).toBeDefined();
  });
  
  it('should include bipartisan score when party data available', () => {
    const result = calculateEnhancedAlignment(
      mockAlignmentScore,
      mockFinance,
      85, // party alignment
      100 // votes count
    );
    
    expect(result.bipartisan_score).not.toBeNull();
    const bipartisanFactor = result.factors.find(f => f.name === 'Bipartisan Cooperation');
    expect(bipartisanFactor).toBeDefined();
  });
  
  it('should not include bipartisan score without party data', () => {
    const result = calculateEnhancedAlignment(mockAlignmentScore, mockFinance);
    
    expect(result.bipartisan_score).toBeNull();
    const bipartisanFactor = result.factors.find(f => f.name === 'Bipartisan Cooperation');
    expect(bipartisanFactor).toBeUndefined();
  });
  
  it('should reward moderate cross-party voting', () => {
    const rigidResult = calculateEnhancedAlignment(
      mockAlignmentScore,
      mockFinance,
      98, // very rigid party line
      100
    );
    
    const moderateResult = calculateEnhancedAlignment(
      mockAlignmentScore,
      mockFinance,
      82, // moderate independence
      100
    );
    
    const veryIndependentResult = calculateEnhancedAlignment(
      mockAlignmentScore,
      mockFinance,
      60, // very independent
      100
    );
    
    // Moderate should score highest
    expect(moderateResult.bipartisan_score).toBeGreaterThanOrEqual(rigidResult.bipartisan_score!);
    expect(moderateResult.bipartisan_score).toBeGreaterThanOrEqual(veryIndependentResult.bipartisan_score!);
  });
  
  it('should include confidence metrics', () => {
    const result = calculateEnhancedAlignment(mockAlignmentScore, mockFinance);
    
    expect(result.confidence).toBeDefined();
    expect(result.confidence.level).toMatch(/^(low|medium|high)$/);
    expect(result.confidence.dataPoints).toBeGreaterThan(0);
    expect(result.confidence.overall).toBeGreaterThanOrEqual(0);
    expect(result.confidence.overall).toBeLessThanOrEqual(100);
  });
  
  it('should generate clear explanations', () => {
    const result = calculateEnhancedAlignment(
      mockAlignmentScore,
      mockFinance,
      85,
      100
    );
    
    const explanations = getScoreExplanation(result);
    
    expect(explanations.length).toBeGreaterThan(0);
    expect(explanations[0]).toContain(result.weighted_score.toString());
    expect(explanations.some(e => e.includes('Confidence'))).toBe(true);
  });
  
  it('should handle missing finance data gracefully', () => {
    const result = calculateEnhancedAlignment(mockAlignmentScore);
    
    const financeFactor = result.factors.find(f => f.name === 'Campaign Finance Influence');
    expect(financeFactor).toBeDefined();
    expect(financeFactor!.score).toBe(50); // Neutral score when no data
  });
  
  it('should redistribute weights when bipartisan data missing', () => {
    const withBipartisan = calculateEnhancedAlignment(
      mockAlignmentScore,
      mockFinance,
      85,
      100
    );
    
    const withoutBipartisan = calculateEnhancedAlignment(
      mockAlignmentScore,
      mockFinance
    );
    
    // Without bipartisan, other weights should sum to 1.0
    const totalWeight = withoutBipartisan.factors.reduce((sum, f) => sum + f.weight, 0);
    expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.001);
  });
});
