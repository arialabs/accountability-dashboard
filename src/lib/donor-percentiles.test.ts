import { describe, it, expect } from "vitest";
import { getMemberIndustryContext } from "./donor-percentiles";
import type { DonorPercentilesData } from "./donor-percentiles";

const mockData: DonorPercentilesData = {
  generated_at: "2026-01-01T00:00:00.000Z",
  members: {
    A000001: {
      "Finance/Securities": {
        chamber_percentile: 82,
        chamber_label: "More than 82% of senators",
        state_rank: 1,
        state_member_count: 2,
        is_state_leader: true,
      },
    },
  },
};

describe("getMemberIndustryContext", () => {
  it("returns the context for a known member + industry", () => {
    const ctx = getMemberIndustryContext(mockData, "A000001", "Finance/Securities");
    expect(ctx).not.toBeNull();
    expect(ctx?.chamber_percentile).toBe(82);
    expect(ctx?.is_state_leader).toBe(true);
  });

  it("returns null for an unknown member", () => {
    const ctx = getMemberIndustryContext(mockData, "UNKNOWN", "Finance/Securities");
    expect(ctx).toBeNull();
  });

  it("returns null for an unknown industry", () => {
    const ctx = getMemberIndustryContext(mockData, "A000001", "Oil & Gas");
    expect(ctx).toBeNull();
  });

  it("returns null when data is null", () => {
    const ctx = getMemberIndustryContext(null, "A000001", "Finance/Securities");
    expect(ctx).toBeNull();
  });
});
