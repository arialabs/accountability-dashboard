import { describe, it, expect } from 'vitest';
import { calculateConfidence, getConfidenceColor, getConfidenceDots, type DataSource } from './confidence';

describe('Confidence Calculation', () => {
  it('should return high confidence with many data points and good coverage', () => {
    const sources: DataSource[] = [
      { name: 'Voting Record', available: true, dataPoints: 25, lastUpdated: '2024-02-01' },
      { name: 'Campaign Finance', available: true, dataPoints: 10 },
      { name: 'Party Voting', available: true, dataPoints: 100 },
    ];
    
    const result = calculateConfidence(25, sources);
    
    expect(result.level).toBe('high');
    expect(result.dataPoints).toBe(135);
    expect(result.overall).toBeGreaterThanOrEqual(70);
  });
  
  it('should return medium confidence with moderate data', () => {
    const sources: DataSource[] = [
      { name: 'Voting Record', available: true, dataPoints: 8 },
      { name: 'Campaign Finance', available: false, dataPoints: 0 },
      { name: 'Party Voting', available: true, dataPoints: 30 },
    ];
    
    const result = calculateConfidence(8, sources);
    
    expect(result.level).toBe('medium');
    expect(result.overall).toBeGreaterThanOrEqual(40);
    expect(result.overall).toBeLessThan(70);
  });
  
  it('should return low confidence with minimal data', () => {
    const sources: DataSource[] = [
      { name: 'Voting Record', available: true, dataPoints: 3 },
      { name: 'Campaign Finance', available: false, dataPoints: 0 },
    ];
    
    const result = calculateConfidence(3, sources);
    
    expect(result.level).toBe('low');
    expect(result.overall).toBeLessThan(40);
  });
  
  it('should factor in source coverage', () => {
    const allSources: DataSource[] = [
      { name: 'Voting Record', available: true, dataPoints: 10 },
      { name: 'Campaign Finance', available: true, dataPoints: 5 },
      { name: 'Party Voting', available: true, dataPoints: 20 },
    ];
    
    const someSources: DataSource[] = [
      { name: 'Voting Record', available: true, dataPoints: 10 },
      { name: 'Campaign Finance', available: false, dataPoints: 0 },
      { name: 'Party Voting', available: true, dataPoints: 20 },
    ];
    
    const allResult = calculateConfidence(10, allSources);
    const someResult = calculateConfidence(10, someSources);
    
    expect(allResult.sourceCoverage).toBe(100);
    expect(someResult.sourceCoverage).toBe(67); // 2 out of 3
  });
  
  it('should calculate recency score properly', () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10); // 10 days ago
    
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 2); // 2 years ago
    
    const recentSources: DataSource[] = [
      { name: 'Voting Record', available: true, dataPoints: 10, lastUpdated: recentDate.toISOString().split('T')[0] },
    ];
    
    const oldSources: DataSource[] = [
      { name: 'Voting Record', available: true, dataPoints: 10, lastUpdated: oldDate.toISOString().split('T')[0] },
    ];
    
    const recentResult = calculateConfidence(10, recentSources);
    const oldResult = calculateConfidence(10, oldSources);
    
    expect(recentResult.recencyScore).toBeGreaterThan(90);
    expect(oldResult.recencyScore).toBe(0);
  });
});

describe('Confidence UI Utilities', () => {
  it('should return correct colors for each confidence level', () => {
    expect(getConfidenceColor('high').text).toContain('emerald');
    expect(getConfidenceColor('medium').text).toContain('amber');
    expect(getConfidenceColor('low').text).toContain('orange');
  });
  
  it('should return correct dots for each confidence level', () => {
    expect(getConfidenceDots('high')).toBe('●●●');
    expect(getConfidenceDots('medium')).toBe('●●○');
    expect(getConfidenceDots('low')).toBe('●○○');
  });
});
