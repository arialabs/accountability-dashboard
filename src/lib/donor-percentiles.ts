/**
 * donor-percentiles.ts
 *
 * Types and loader for the pre-computed donor percentile data.
 * The JSON is generated at build time by scripts/compute-donor-percentiles.ts
 */

/** Percentile context for a single member+industry pair */
export interface IndustryPercentileContext {
  /** What percentile this member is in within their chamber (0–100) */
  chamber_percentile: number;
  /** Human-readable label, e.g. "More than 89% of senators" */
  chamber_label: string;
  /** Rank within member's state for this industry (1 = highest) */
  state_rank: number | null;
  /** Total members in this state with data for this industry */
  state_member_count: number | null;
  /** True if this member has the highest amount in their state (among those with data) */
  is_state_leader: boolean;
}

/** Shape of src/data/donor-percentiles.json */
export interface DonorPercentilesData {
  generated_at: string;
  /** bioguide_id → industry name → percentile context */
  members: Record<string, Record<string, IndustryPercentileContext>>;
}

/**
 * Load the pre-computed donor percentiles.
 * Safe to call from server components — returns null if data is unavailable.
 */
export function loadDonorPercentiles(): DonorPercentilesData | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const data = require("@/data/donor-percentiles.json") as DonorPercentilesData;
    return data;
  } catch {
    return null;
  }
}

/**
 * Get the percentile context for a specific member and industry.
 */
export function getMemberIndustryContext(
  data: DonorPercentilesData | null,
  bioguideId: string,
  industry: string
): IndustryPercentileContext | null {
  if (!data) return null;
  return data.members[bioguideId]?.[industry] ?? null;
}
