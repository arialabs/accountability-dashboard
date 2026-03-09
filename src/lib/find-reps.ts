/**
 * find-reps.ts — ZIP code → congressional representatives lookup
 * Issue #128
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawRep {
  bioguide_id: string;
  name: string;
  party: string;
  state: string;
  chamber: 'house' | 'senate';
  district: string | null;
  photo_url: string | null;
}

export interface EnrichedRep extends RawRep {
  pac_pct: number | null;
  display_name: string;  // "Last, First" → "First Last"
  profile_url: string;
}

export interface FindRepsResult {
  fallback: boolean;
  reps: EnrichedRep[];
  state?: string;
  district?: string;
}

// ─── ZIP detection ────────────────────────────────────────────────────────────

/** Matches exactly 5 consecutive digits — full string */
export const ZIP_REGEX = /^\d{5}$/;

export function isZipCode(query: string): boolean {
  return ZIP_REGEX.test(query.trim());
}

// ─── Party mapping ────────────────────────────────────────────────────────────

export function mapPartyCode(partyName: string | undefined): 'D' | 'R' | 'I' {
  if (!partyName) return 'I';
  const p = partyName.toLowerCase();
  if (p.includes('democrat')) return 'D';
  if (p.includes('republican')) return 'R';
  return 'I';
}

// ─── Name formatting ──────────────────────────────────────────────────────────

/** Convert "Last, First M." → "First Last" for display */
export function formatRepName(apiName: string): string {
  if (!apiName) return apiName;
  const commaIdx = apiName.indexOf(',');
  if (commaIdx === -1) return apiName;
  const last = apiName.slice(0, commaIdx).trim();
  const rest = apiName.slice(commaIdx + 1).trim();
  // Take first token of rest (first name), skip suffixes
  const first = rest.split(/\s+/)[0] ?? '';
  return first ? `${first} ${last}` : last;
}

// ─── Enrichment ───────────────────────────────────────────────────────────────

/**
 * Match raw reps from the API against local finance data to produce verdict-ready results.
 * @param reps Raw rep array from /api/find-reps
 * @param financeData keyed by bioguide_id: { pac_percentage }
 */
export function enrichRepsWithVerdicts(
  reps: RawRep[],
  financeData: Record<string, { pac_percentage: number }>
): EnrichedRep[] {
  return reps.map((rep) => {
    const finance = financeData[rep.bioguide_id];
    return {
      ...rep,
      pac_pct: finance?.pac_percentage ?? null,
      display_name: formatRepName(rep.name),
      profile_url: `/rep/${rep.bioguide_id}`,
    };
  });
}

// ─── API fetch ────────────────────────────────────────────────────────────────

/**
 * Fetch representatives for a given ZIP code from the CF Pages Function.
 * Always resolves — returns { fallback: true } on any error.
 */
export async function fetchRepsByZip(zip: string): Promise<FindRepsResult> {
  try {
    const res = await fetch(`/api/find-reps?zip=${encodeURIComponent(zip)}`);
    if (!res.ok) {
      return { fallback: true, reps: [] };
    }
    const data = await res.json();
    if (data.fallback) {
      return { fallback: true, reps: [] };
    }
    return {
      fallback: false,
      reps: data.reps ?? [],
      state: data.state,
      district: data.district,
    };
  } catch {
    return { fallback: true, reps: [] };
  }
}
