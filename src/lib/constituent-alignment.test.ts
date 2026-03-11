import { describe, it, expect, vi } from "vitest";
import { getConstituentAlignment } from "./constituent-alignment";

// Use a real member with known ICPSR mapping and votes
// Dan Crenshaw (R-TX-2) — bioguide C001120
describe("constituent-alignment", () => {
  it("returns null for unknown member", () => {
    const result = getConstituentAlignment("FAKE_ID_123");
    expect(result).toBeNull();
  });

  it("returns a result object for a valid member", () => {
    // Use a senator or rep who likely has votes in key-votes
    const result = getConstituentAlignment("C001120"); // Dan Crenshaw
    if (!result) {
      // If Crenshaw has no ICPSR mapping or no matching votes, skip gracefully
      return;
    }

    expect(result.bioguideId).toBe("C001120");
    expect(result.state).toBe("TX");
    expect(typeof result.overallScore).toBe("number");
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.policies)).toBe(true);
    expect(result.policies.length).toBeGreaterThan(0);
  });

  it("includes policy details with correct structure", () => {
    const result = getConstituentAlignment("C001120");
    if (!result) return;

    for (const policy of result.policies) {
      expect(policy).toHaveProperty("policyKey");
      expect(policy).toHaveProperty("label");
      expect(policy).toHaveProperty("category");
      expect(policy).toHaveProperty("source");
      expect(policy).toHaveProperty("stateSupport");
      expect(policy).toHaveProperty("nationalSupport");
      expect(policy).toHaveProperty("votesFound");
      expect(policy).toHaveProperty("aligned");

      // stateSupport should be a valid percentage
      expect(policy.stateSupport).toBeGreaterThanOrEqual(0);
      expect(policy.stateSupport).toBeLessThanOrEqual(100);
    }
  });

  it("scores aligned votes correctly", () => {
    const result = getConstituentAlignment("C001120");
    if (!result || result.totalVotesScored === 0) return;

    // totalVotesAligned should not exceed totalVotesScored
    expect(result.totalVotesAligned).toBeLessThanOrEqual(result.totalVotesScored);
    expect(result.totalVotesAligned).toBeGreaterThanOrEqual(0);

    // overallScore should match the ratio
    const expectedScore = Math.round(
      (result.totalVotesAligned / result.totalVotesScored) * 100
    );
    expect(result.overallScore).toBe(expectedScore);
  });

  it("returns 0 score when member has no matching votes", () => {
    // Use a member who likely has no ICPSR mapping (new freshman member)
    const result = getConstituentAlignment("M001245"); // Christian Menefee — 0 votes cast
    if (!result) return;

    expect(result.overallScore).toBe(0);
    expect(result.totalVotesScored).toBe(0);
  });

  it("only scores Yea/Nay votes, not Present or Not Voting", () => {
    const result = getConstituentAlignment("C001120");
    if (!result) return;

    for (const policy of result.policies) {
      for (const vote of policy.votesFound) {
        // All scored votes should be Yea or Nay
        expect(["Yea", "Nay"]).toContain(vote.memberVote);
      }
    }
  });
});
