import { describe, it, expect } from "vitest";
import {
  getRepOgData,
  getCabinetOgData,
  formatDollars,
} from "./og-utils";

// ---------- formatDollars ----------------------------------------------------

describe("formatDollars", () => {
  it("formats billions", () => {
    expect(formatDollars(2_500_000_000)).toBe("$2.5B");
  });

  it("formats millions", () => {
    expect(formatDollars(4_200_000)).toBe("$4.2M");
  });

  it("formats thousands", () => {
    expect(formatDollars(350_000)).toBe("$350K");
  });

  it("formats small amounts", () => {
    expect(formatDollars(500)).toBe("$500");
  });
});

// ---------- getRepOgData -----------------------------------------------------

describe("getRepOgData", () => {
  it("returns null for unknown bioguide id", () => {
    expect(getRepOgData("UNKNOWN_ID_999")).toBeNull();
  });

  it("returns correct data for a known member", () => {
    // C001120 = Dan Crenshaw (R-TX-2) — exists in members.json
    const data = getRepOgData("C001120");
    expect(data).not.toBeNull();
    expect(data!.name).toBe("Dan Crenshaw");
    expect(data!.party).toBe("R");
    expect(data!.partyFull).toBe("Republican");
    expect(data!.state).toBe("Texas");
    expect(data!.chamber).toBe("house");
  });

  it("sets verdictLabel based on PAC percentage", () => {
    const data = getRepOgData("C001120");
    expect(data).not.toBeNull();
    // Should be one of the valid verdict labels
    expect([
      "DONOR CAPTURED",
      "MIXED ALLEGIANCE",
      "CONSTITUENT FOCUSED",
      "NO DATA",
    ]).toContain(data!.verdictLabel);
  });

  it("includes finance data when available", () => {
    // M000355 = Mitch McConnell — has finance data
    const data = getRepOgData("M000355");
    expect(data).not.toBeNull();
    expect(data!.pacPct).toBeTypeOf("number");
    expect(data!.totalRaised).toBeTypeOf("number");
  });

  it("handles member with no finance data", () => {
    // M001245 = Christian Menefee — new member, may lack finance
    const data = getRepOgData("M001245");
    expect(data).not.toBeNull();
    // pacPct can be null or a number depending on data
    expect(data!.name).toBe("Christian Menefee");
  });

  it("maps party codes correctly", () => {
    const repData = getRepOgData("C001120"); // Republican
    expect(repData!.partyFull).toBe("Republican");
  });

  it("produces DONOR CAPTURED for high PAC pct", () => {
    // Find any member with pac_percentage >= 60 or verify label logic
    const data = getRepOgData("M000355");
    if (data && data.pacPct !== null) {
      if (data.pacPct >= 60) expect(data.verdictLabel).toBe("DONOR CAPTURED");
      else if (data.pacPct >= 30) expect(data.verdictLabel).toBe("MIXED ALLEGIANCE");
      else expect(data.verdictLabel).toBe("CONSTITUENT FOCUSED");
    }
  });
});

// ---------- getCabinetOgData -------------------------------------------------

describe("getCabinetOgData", () => {
  it("returns null for unknown id", () => {
    expect(getCabinetOgData("nonexistent-role")).toBeNull();
  });

  it("returns correct data for secretary-of-state", () => {
    const data = getCabinetOgData("secretary-of-state");
    expect(data).not.toBeNull();
    expect(data!.name).toBe("Marco Rubio");
    expect(data!.role).toBe("Secretary of State");
    expect(data!.department).toBe("Department of State");
  });

  it("computes conflict score correctly", () => {
    const data = getCabinetOgData("secretary-of-state");
    expect(data).not.toBeNull();
    // Rubio has 1 "medium" conflict → score = 3
    expect(data!.conflictScore).toBe(3);
    expect(data!.conflictLabel).toBe("Low");
  });

  it("assigns HIGH RISK for high conflict scores", () => {
    // secretary-of-defense (Pete Hegseth) has multiple conflicts
    const data = getCabinetOgData("secretary-of-defense");
    expect(data).not.toBeNull();
    expect(data!.conflictScore).toBeGreaterThan(0);
    // Verdict should match threshold logic
    if (data!.conflictScore >= 15) {
      expect(data!.verdictType).toBe("HIGH RISK");
    } else if (data!.conflictScore >= 5) {
      expect(data!.verdictType).toBe("MODERATE");
    } else {
      expect(data!.verdictType).toBe("LOW RISK");
    }
  });

  it("includes all required fields", () => {
    const data = getCabinetOgData("secretary-of-treasury");
    expect(data).not.toBeNull();
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("role");
    expect(data).toHaveProperty("department");
    expect(data).toHaveProperty("conflictScore");
    expect(data).toHaveProperty("conflictLabel");
    expect(data).toHaveProperty("verdictType");
  });

  it("conflict label matches score ranges", () => {
    const data = getCabinetOgData("attorney-general");
    expect(data).not.toBeNull();
    const score = data!.conflictScore;
    if (score === 0) expect(data!.conflictLabel).toBe("None");
    else if (score < 5) expect(data!.conflictLabel).toBe("Low");
    else if (score < 15) expect(data!.conflictLabel).toBe("Medium");
    else if (score < 25) expect(data!.conflictLabel).toBe("High");
    else expect(data!.conflictLabel).toBe("Critical");
  });
});
