import { describe, it, expect } from "vitest";
import { computeVerdict } from "./RepVerdictBadge";

describe("computeVerdict", () => {
  it("returns null when no data available", () => {
    expect(computeVerdict(null, 0, 0)).toBe(null);
  });

  it("returns 'captured' when PAC pct >= 60", () => {
    expect(computeVerdict(60, 0, 0)).toBe("captured");
    expect(computeVerdict(80, 0, 0)).toBe("captured");
    expect(computeVerdict(100, 0, 0)).toBe("captured");
  });

  it("returns 'captured' when 2+ high-severity conflicts", () => {
    expect(computeVerdict(0, 2, 2)).toBe("captured");
    expect(computeVerdict(null, 3, 3)).toBe("captured");
  });

  it("returns 'mixed' when PAC pct >= 30 but < 60", () => {
    expect(computeVerdict(30, 0, 0)).toBe("mixed");
    expect(computeVerdict(45, 0, 0)).toBe("mixed");
    expect(computeVerdict(59, 0, 0)).toBe("mixed");
  });

  it("returns 'mixed' when 1 high-severity conflict", () => {
    expect(computeVerdict(10, 1, 1)).toBe("mixed");
  });

  it("returns 'mixed' when 2+ total conflicts (even low severity)", () => {
    expect(computeVerdict(10, 0, 2)).toBe("mixed");
    expect(computeVerdict(0, 0, 3)).toBe("mixed");
  });

  it("returns 'constituent' when low PAC and no conflicts", () => {
    expect(computeVerdict(10, 0, 0)).toBe("constituent");
    expect(computeVerdict(29, 0, 0)).toBe("constituent");
    expect(computeVerdict(0, 0, 0)).toBe("constituent");
  });

  it("returns 'captured' when high conflicts override low PAC", () => {
    expect(computeVerdict(5, 2, 2)).toBe("captured");
  });
});
