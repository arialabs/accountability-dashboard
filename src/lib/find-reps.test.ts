/**
 * Tests for ZIP → Find Your Reps feature (issue #128)
 * Tests run BEFORE implementation (TDD).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ZIP_REGEX,
  isZipCode,
  mapPartyCode,
  enrichRepsWithVerdicts,
  fetchRepsByZip,
  type FindRepsResult,
  type RawRep,
} from './find-reps';

// ─── ZIP Detection ───────────────────────────────────────────────────────────

describe('ZIP_REGEX', () => {
  it('matches a standard 5-digit ZIP', () => {
    expect(ZIP_REGEX.test('10001')).toBe(true);
    expect(ZIP_REGEX.test('90210')).toBe(true);
    expect(ZIP_REGEX.test('00501')).toBe(true);
  });

  it('does not match partial ZIPs or non-numeric strings', () => {
    expect(ZIP_REGEX.test('1234')).toBe(false);   // too short
    expect(ZIP_REGEX.test('123456')).toBe(false);  // too long
    expect(ZIP_REGEX.test('abcde')).toBe(false);   // letters
    expect(ZIP_REGEX.test('1000a')).toBe(false);   // mixed
    expect(ZIP_REGEX.test('')).toBe(false);        // empty
    expect(ZIP_REGEX.test('10001-1234')).toBe(false); // ZIP+4 not supported
  });
});

describe('isZipCode', () => {
  it('returns true for valid 5-digit ZIPs', () => {
    expect(isZipCode('10001')).toBe(true);
    expect(isZipCode('90210')).toBe(true);
  });

  it('returns false for non-ZIP strings', () => {
    expect(isZipCode('nancy pelosi')).toBe(false);
    expect(isZipCode('CA')).toBe(false);
    expect(isZipCode('')).toBe(false);
  });
});

// ─── Party mapping ───────────────────────────────────────────────────────────

describe('mapPartyCode', () => {
  it('maps Democratic to D', () => {
    expect(mapPartyCode('Democratic')).toBe('D');
    expect(mapPartyCode('democrat')).toBe('D');
  });

  it('maps Republican to R', () => {
    expect(mapPartyCode('Republican')).toBe('R');
    expect(mapPartyCode('REPUBLICAN')).toBe('R');
  });

  it('maps unknown parties to I', () => {
    expect(mapPartyCode('Independent')).toBe('I');
    expect(mapPartyCode('Green')).toBe('I');
    expect(mapPartyCode('')).toBe('I');
    expect(mapPartyCode(undefined)).toBe('I');
  });
});

// ─── Result mapping / enrichment ─────────────────────────────────────────────

describe('enrichRepsWithVerdicts', () => {
  const mockFinance: Record<string, { pac_percentage: number }> = {
    S000148: { pac_percentage: 15 },   // constituent
    C001098: { pac_percentage: 65 },   // captured
    O000172: { pac_percentage: 40 },   // mixed
  };

  const reps: RawRep[] = [
    { bioguide_id: 'S000148', name: 'Schumer, Charles E.', party: 'D', state: 'NY', chamber: 'senate', district: null, photo_url: null },
    { bioguide_id: 'C001098', name: 'Cruz, Ted', party: 'R', state: 'TX', chamber: 'senate', district: null, photo_url: null },
    { bioguide_id: 'O000172', name: 'Ocasio-Cortez, Alexandria', party: 'D', state: 'NY', chamber: 'house', district: '14', photo_url: null },
    { bioguide_id: 'UNKNOWN', name: 'Ghost, Joe', party: 'I', state: 'XX', chamber: 'house', district: '1', photo_url: null },
  ];

  it('attaches pac_percentage from finance data by bioguide_id', () => {
    const enriched = enrichRepsWithVerdicts(reps, mockFinance);
    expect(enriched[0].pac_pct).toBe(15);
    expect(enriched[1].pac_pct).toBe(65);
    expect(enriched[2].pac_pct).toBe(40);
  });

  it('returns null pac_pct when bioguide_id not in finance data', () => {
    const enriched = enrichRepsWithVerdicts(reps, mockFinance);
    expect(enriched[3].pac_pct).toBeNull();
  });

  it('returns same number of reps as input', () => {
    const enriched = enrichRepsWithVerdicts(reps, mockFinance);
    expect(enriched).toHaveLength(4);
  });

  it('preserves all original rep fields', () => {
    const enriched = enrichRepsWithVerdicts(reps, mockFinance);
    expect(enriched[0].bioguide_id).toBe('S000148');
    expect(enriched[0].chamber).toBe('senate');
    expect(enriched[0].state).toBe('NY');
  });
});

// ─── API fetch / fallback ─────────────────────────────────────────────────────

describe('fetchRepsByZip', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls /api/find-reps with the provided ZIP', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reps: [
          { bioguide_id: 'S000148', name: 'Schumer, Charles E.', party: 'D', state: 'NY', chamber: 'senate', district: null, photo_url: null },
        ],
        state: 'NY',
        district: '12',
      }),
    } as Response);

    const result = await fetchRepsByZip('10001');

    expect(mockFetch).toHaveBeenCalledWith('/api/find-reps?zip=10001');
    expect(result.fallback).toBe(false);
    expect(result.reps).toHaveLength(1);
    expect(result.reps[0].bioguide_id).toBe('S000148');
  });

  it('returns fallback=true when API returns { fallback: true }', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ fallback: true }),
    } as Response);

    const result = await fetchRepsByZip('99999');
    expect(result.fallback).toBe(true);
    expect(result.reps).toHaveLength(0);
  });

  it('returns fallback=true when fetch throws (network error)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchRepsByZip('10001');
    expect(result.fallback).toBe(true);
    expect(result.reps).toHaveLength(0);
  });

  it('returns fallback=true when HTTP response is not ok', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    } as Response);

    const result = await fetchRepsByZip('10001');
    expect(result.fallback).toBe(true);
    expect(result.reps).toHaveLength(0);
  });
});
