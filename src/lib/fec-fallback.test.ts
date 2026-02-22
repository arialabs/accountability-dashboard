import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getCandidateFinancials, clearFECCache } from './fec';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FEC Fallback Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearFECCache();
    // Default mock implementation to return empty
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [], pagination: { count: 0 } }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fallback to 2024 cycle when current cycle returns no data', async () => {
    const candidateId = 'S2KY00012'; // McConnell
    const currentYear = new Date().getFullYear();
    const currentCycle = currentYear % 2 === 0 ? currentYear : currentYear + 1;
    const fallbackCycle = 2024;

    // First call (current cycle) returns empty results
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [],
        pagination: { count: 0, page: 1, pages: 0, per_page: 20 },
      }),
    });

    // Second call (fallback cycle) returns valid data
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            cycle: fallbackCycle,
            receipts: 100000,
            disbursements: 50000,
            cash_on_hand_end_period: 25000,
          },
        ],
        pagination: { count: 1, page: 1, pages: 1, per_page: 20 },
      }),
    });

    const result = await getCandidateFinancials(candidateId);

    // Should have called fetch twice
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Verify first call used current cycle
    const firstCallUrl = mockFetch.mock.calls[0][0].toString();
    expect(firstCallUrl).toContain(`cycle=${currentCycle}`);

    // Verify second call used fallback cycle
    const secondCallUrl = mockFetch.mock.calls[1][0].toString();
    expect(secondCallUrl).toContain(`cycle=${fallbackCycle}`);

    // Verify result comes from fallback data
    expect(result).toBeDefined();
    expect(result?.cycle).toBe(fallbackCycle);
    expect(result?.total_receipts).toBe(100000);
  });

  it('should return null if both current and fallback cycles return no data', async () => {
    const candidateId = 'INVALID';

    // First call (current cycle) returns empty
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    // Second call (fallback cycle) returns empty
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    const result = await getCandidateFinancials(candidateId);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toBeNull();
  });

  it('should use provided cycle if specified and not fallback (unless recursive)', async () => {
    const candidateId = 'S2KY00012';
    const specificCycle = 2020;

    // Mock return specific data
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ cycle: specificCycle, receipts: 500 }],
      }),
    });

    const result = await getCandidateFinancials(candidateId, specificCycle);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain(`cycle=${specificCycle}`);
    expect(result?.cycle).toBe(specificCycle);
  });
});
