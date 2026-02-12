/**
 * Integration tests for OpenFEC API
 * Tests real API calls (requires FEC_API_KEY to be set)
 * 
 * Run with: npm run test:run src/lib/fec-integration.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  searchCandidateByName,
  getCandidateFinancials,
  getTopContributors,
  getDonorBreakdown,
  getMemberFECData,
} from './fec';

const SKIP_INTEGRATION = !process.env.FEC_API_KEY || process.env.FEC_API_KEY === 'DEMO_KEY';

describe('FEC API Integration (Real API Calls)', () => {
  if (SKIP_INTEGRATION) {
    it.skip('Skipping integration tests (set FEC_API_KEY to run)', () => {});
    return;
  }

  describe('searchCandidateByName with real API', () => {
    it('should find Bernie Sanders', async () => {
      const result = await searchCandidateByName('Bernard', 'Sanders', 'S');
      
      expect(result).toBeDefined();
      expect(result?.name).toContain('SANDERS');
      expect(result?.office).toBe('S');
      expect(result?.state).toBe('VT');
    }, 10000);

    it('should find Alexandria Ocasio-Cortez', async () => {
      const result = await searchCandidateByName('Alexandria', 'Ocasio-Cortez', 'H');
      
      expect(result).toBeDefined();
      expect(result?.name).toContain('OCASIO-CORTEZ');
      expect(result?.office).toBe('H');
      expect(result?.state).toBe('NY');
    }, 10000);

    it('should find Mitch McConnell', async () => {
      const result = await searchCandidateByName('Mitch', 'McConnell', 'S');
      
      expect(result).toBeDefined();
      expect(result?.name).toContain('MCCONNELL');
      expect(result?.office).toBe('S');
      expect(result?.state).toBe('KY');
    }, 10000);
  });

  describe('getCandidateFinancials with real API', () => {
    it('should fetch financials for Bernie Sanders', async () => {
      // First find the candidate
      const candidate = await searchCandidateByName('Bernard', 'Sanders', 'S');
      expect(candidate).toBeDefined();
      
      // Then get financials
      const financials = await getCandidateFinancials(candidate!.candidate_id, 2024);
      
      expect(financials).toBeDefined();
      expect(financials?.cycle).toBe(2024);
      expect(financials?.total_receipts).toBeGreaterThan(0);
      expect(financials?.individual_contributions).toBeGreaterThan(0);
      
      // Bernie should have low PAC contributions
      if (financials?.total_receipts && financials?.pac_contributions) {
        const pacPct = (financials.pac_contributions / financials.total_receipts) * 100;
        expect(pacPct).toBeLessThan(5); // Bernie typically has <5% from PACs
      }
    }, 15000);

    it('should fetch financials for a House member', async () => {
      const candidate = await searchCandidateByName('Alexandria', 'Ocasio-Cortez', 'H');
      expect(candidate).toBeDefined();
      
      const financials = await getCandidateFinancials(candidate!.candidate_id, 2024);
      
      expect(financials).toBeDefined();
      expect(financials?.total_receipts).toBeGreaterThan(0);
      expect(financials?.total_disbursements).toBeGreaterThanOrEqual(0);
      expect(financials?.cash_on_hand).toBeGreaterThanOrEqual(0);
    }, 15000);
  });

  describe('getTopContributors with real API', () => {
    it('should fetch top contributors', async () => {
      const candidate = await searchCandidateByName('Bernard', 'Sanders', 'S');
      expect(candidate).toBeDefined();
      
      const contributors = await getTopContributors(candidate!.candidate_id, 2024, 5);
      
      expect(Array.isArray(contributors)).toBe(true);
      // Note: Some candidates may have 0 contributors if data isn't itemized
      if (contributors.length > 0) {
        expect(contributors[0]).toHaveProperty('name');
        expect(contributors[0]).toHaveProperty('total');
        expect(contributors[0]).toHaveProperty('type');
        expect(contributors[0].total).toBeGreaterThan(0);
      }
    }, 15000);
  });

  describe('getDonorBreakdown with real API', () => {
    it('should calculate comprehensive donor breakdown', async () => {
      const candidate = await searchCandidateByName('Bernard', 'Sanders', 'S');
      expect(candidate).toBeDefined();
      
      const breakdown = await getDonorBreakdown(candidate!.candidate_id, 2024);
      
      expect(breakdown).toBeDefined();
      expect(breakdown?.total_raised).toBeGreaterThan(0);
      expect(breakdown?.pac_percentage).toBeGreaterThanOrEqual(0);
      expect(breakdown?.individual_percentage).toBeGreaterThanOrEqual(0);
      expect(breakdown?.small_donor_percentage).toBeGreaterThanOrEqual(0);
      
      // Percentages should add up to ~100% (allowing for rounding and other sources)
      const totalPct = breakdown!.pac_percentage + breakdown!.individual_percentage;
      expect(totalPct).toBeLessThanOrEqual(110); // Allow some wiggle room
      
      // Bernie should have high small donor percentage
      expect(breakdown!.small_donor_percentage).toBeGreaterThan(20);
    }, 15000);
  });

  describe('getMemberFECData convenience function', () => {
    it('should fetch both candidate and financials in one call', async () => {
      const result = await getMemberFECData('Bernard', 'Sanders', 'senate');
      
      expect(result.candidate).toBeDefined();
      expect(result.financials).toBeDefined();
      
      expect(result.candidate?.name).toContain('SANDERS');
      expect(result.financials?.total_receipts).toBeGreaterThan(0);
    }, 15000);

    it('should handle house members', async () => {
      const result = await getMemberFECData('Alexandria', 'Ocasio-Cortez', 'house');
      
      expect(result.candidate).toBeDefined();
      expect(result.financials).toBeDefined();
      
      expect(result.candidate?.office).toBe('H');
      expect(result.financials?.total_receipts).toBeGreaterThan(0);
    }, 15000);

    it('should handle non-existent candidates gracefully', async () => {
      const result = await getMemberFECData('NonExistent', 'FakeCandidate', 'house');
      
      expect(result.candidate).toBeNull();
      expect(result.financials).toBeNull();
    }, 15000);
  });

  describe('Data quality checks', () => {
    it('should have consistent data types', async () => {
      const candidate = await searchCandidateByName('Mitch', 'McConnell', 'S');
      expect(candidate).toBeDefined();
      
      const financials = await getCandidateFinancials(candidate!.candidate_id, 2024);
      expect(financials).toBeDefined();
      
      // All money fields should be numbers
      expect(typeof financials!.total_receipts).toBe('number');
      expect(typeof financials!.total_disbursements).toBe('number');
      expect(typeof financials!.cash_on_hand).toBe('number');
      expect(typeof financials!.individual_contributions).toBe('number');
      expect(typeof financials!.pac_contributions).toBe('number');
      
      // All should be non-negative
      expect(financials!.total_receipts).toBeGreaterThanOrEqual(0);
      expect(financials!.total_disbursements).toBeGreaterThanOrEqual(0);
      expect(financials!.cash_on_hand).toBeGreaterThanOrEqual(0);
    }, 15000);

    it('should have logical relationships between fields', async () => {
      const candidate = await searchCandidateByName('Bernard', 'Sanders', 'S');
      const breakdown = await getDonorBreakdown(candidate!.candidate_id, 2024);
      
      expect(breakdown).toBeDefined();
      
      // Individual total should equal small + large donors
      const calculatedIndividual = breakdown!.small_donor_total + breakdown!.large_donor_total;
      expect(Math.abs(calculatedIndividual - breakdown!.individual_total)).toBeLessThan(100); // Allow small rounding differences
      
      // PAC + Individual should be close to total (allowing for other sources)
      const accounted = breakdown!.pac_total + breakdown!.individual_total;
      expect(accounted).toBeLessThanOrEqual(breakdown!.total_raised * 1.1);
    }, 15000);
  });
});
