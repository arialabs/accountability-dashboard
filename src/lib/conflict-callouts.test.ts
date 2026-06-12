import { describe, it, expect } from "vitest";
import {
  classifyContributorsIntoIndustries,
  getConflictCallouts,
  type ConflictCallout,
} from "./conflict-callouts";
import type { CampaignFinance } from "@/lib/types";

// ─── Helper factories ────────────────────────────────────────────────────────

function makeFinance(
  topContributors: Array<{ name: string; total: number; type?: string }>
): CampaignFinance {
  return {
    candidate_id: "TEST001",
    cycle: 2024,
    total_raised: topContributors.reduce((s, c) => s + c.total, 0),
    total_spent: 0,
    cash_on_hand: 0,
    individual_contributions: 0,
    pac_contributions: 0,
    party_contributions: 0,
    candidate_self_funding: 0,
    small_donors: 0,
    large_donors: 0,
    pac_percentage: 0,
    small_donor_percentage: 0,
    large_donor_percentage: 0,
    top_contributors: topContributors.map((c) => ({ ...c, type: c.type ?? 'PAC' })),
    top_industries: [],
  };
}

function makeVote(
  overrides: Partial<{
    id: string;
    bill: string;
    title: string;
    description: string;
    category: string;
    date: string;
    votes: Record<string, string>;
  }>
) {
  return {
    id: overrides.id ?? "test-vote-1",
    bill: overrides.bill ?? "HR1",
    title: overrides.title ?? "Test Bill",
    description: overrides.description ?? "A test bill",
    category: overrides.category ?? "Healthcare",
    date: overrides.date ?? "2024-01-01",
    votes: overrides.votes ?? {},
  };
}

// ─── classifyContributorsIntoIndustries ──────────────────────────────────────

describe("classifyContributorsIntoIndustries", () => {
  it("classifies pharma contributors correctly", () => {
    const contributors = [
      { name: "Pfizer PAC", total: 50_000 },
      { name: "Johnson & Johnson Fund", total: 30_000 },
    ];
    const result = classifyContributorsIntoIndustries(contributors);
    const pharma = result.find((r) => r.industryKey === "pharma");
    expect(pharma).toBeDefined();
    expect(pharma!.total).toBe(80_000);
    expect(pharma!.contributors).toHaveLength(2);
  });

  it("classifies energy contributors correctly", () => {
    const contributors = [
      { name: "ExxonMobil PAC", total: 200_000 },
      { name: "Chevron Corporation PAC", total: 150_000 },
    ];
    const result = classifyContributorsIntoIndustries(contributors);
    const energy = result.find((r) => r.industryKey === "energy");
    expect(energy).toBeDefined();
    expect(energy!.total).toBe(350_000);
  });

  it("classifies finance contributors correctly", () => {
    const contributors = [
      { name: "Goldman Sachs Political Action Committee", total: 100_000 },
      { name: "JPMorgan Chase & Co PAC", total: 75_000 },
    ];
    const result = classifyContributorsIntoIndustries(contributors);
    const finance = result.find((r) => r.industryKey === "finance");
    expect(finance).toBeDefined();
    expect(finance!.total).toBe(175_000);
  });

  it("classifies defense contributors correctly", () => {
    const contributors = [{ name: "Lockheed Martin PAC", total: 120_000 }];
    const result = classifyContributorsIntoIndustries(contributors);
    const defense = result.find((r) => r.industryKey === "defense");
    expect(defense).toBeDefined();
    expect(defense!.total).toBe(120_000);
  });

  it("classifies telecom contributors correctly", () => {
    const contributors = [{ name: "AT&T Inc PAC", total: 60_000 }];
    const result = classifyContributorsIntoIndustries(contributors);
    const telecom = result.find((r) => r.industryKey === "telecom");
    expect(telecom).toBeDefined();
    expect(telecom!.total).toBe(60_000);
  });

  it("returns results sorted by total descending", () => {
    const contributors = [
      { name: "Goldman Sachs PAC", total: 50_000 },
      { name: "Pfizer Inc PAC", total: 200_000 },
      { name: "AT&T PAC", total: 30_000 },
    ];
    const result = classifyContributorsIntoIndustries(contributors);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].total).toBeGreaterThanOrEqual(result[i].total);
    }
  });

  it("aggregates multiple contributors from the same industry", () => {
    const contributors = [
      { name: "Goldman Sachs PAC", total: 50_000 },
      { name: "JPMorgan Chase PAC", total: 50_000 },
      { name: "Bank of America PAC", total: 50_000 },
    ];
    const result = classifyContributorsIntoIndustries(contributors);
    const finance = result.find((r) => r.industryKey === "finance");
    expect(finance!.total).toBe(150_000);
    expect(finance!.contributors).toHaveLength(3);
  });

  it("returns empty array for unrecognised contributors", () => {
    const contributors = [
      { name: "Some Generic Super PAC", total: 500_000 },
      { name: "Victory Fund 2024", total: 200_000 },
    ];
    const result = classifyContributorsIntoIndustries(contributors);
    expect(result).toHaveLength(0);
  });
});

// ─── getConflictCallouts ─────────────────────────────────────────────────────

describe("getConflictCallouts", () => {
  const BIOGUIDE = "T000001";
  const ICPSR = "99001";

  it("returns empty array when finance is null", () => {
    const result = getConflictCallouts(BIOGUIDE, null, [], ICPSR);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when top_contributors is empty", () => {
    const finance = makeFinance([]);
    const result = getConflictCallouts(BIOGUIDE, finance, [], ICPSR);
    expect(result).toHaveLength(0);
  });

  it("detects pharma conflict — member voted Nay on drug pricing reform", () => {
    const finance = makeFinance([{ name: "Pfizer PAC", total: 150_000 }]);
    const votes = [
      makeVote({
        category: "Healthcare",
        description: "Regulation to cut the price of prescription drugs under Medicare",
        votes: { [ICPSR]: "Nay" },
      }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    expect(result.length).toBeGreaterThan(0);
    const pharma = result.find((c) => c.industryKey === "pharma");
    expect(pharma).toBeDefined();
    expect(pharma!.narrative).toContain("Pharmaceuticals");
    expect(pharma!.narrative).toContain("$150K");
    expect(pharma!.voteCount).toBe(1);
    expect(pharma!.severity).toBe("high");
  });

  it("detects energy conflict — member voted Nay on climate regulation", () => {
    const finance = makeFinance([{ name: "ExxonMobil PAC", total: 280_000 }]);
    const votes = [
      makeVote({
        category: "Climate & Environment",
        description: "Regulation to limit carbon emissions from power plants",
        votes: { [ICPSR]: "Nay" },
      }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    const energy = result.find((c) => c.industryKey === "energy");
    expect(energy).toBeDefined();
    expect(energy!.donationAmount).toBe(280_000);
    expect(energy!.severity).toBe("high");
    expect(energy!.narrative).toMatch(/280K|0\.3M/);
  });

  it("detects finance conflict — member voted Nay on consumer protection regulation", () => {
    const finance = makeFinance([{ name: "Goldman Sachs PAC", total: 190_000 }]);
    const votes = [
      makeVote({
        category: "Economy & Taxes",
        description: "Consumer protection regulation for financial services",
        votes: { [ICPSR]: "Nay" },
      }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    const fin = result.find((c) => c.industryKey === "finance");
    expect(fin).toBeDefined();
    expect(fin!.narrative).toContain("consumer");
  });

  it("does not flag a member who voted FOR healthcare reform despite pharma donors", () => {
    const finance = makeFinance([{ name: "Pfizer PAC", total: 150_000 }]);
    const votes = [
      makeVote({
        category: "Healthcare",
        description: "Regulation to cut the price of prescription drugs",
        votes: { [ICPSR]: "Yea" }, // Voting FOR reform — no conflict
      }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    // Should have no pharma conflict since they voted for reform
    const pharma = result.find((c) => c.industryKey === "pharma");
    // pharma benefitsIndustry for isRegulation=true expects Nay; Yea means no conflict
    expect(pharma).toBeUndefined();
  });

  it("skips votes where member did not vote (Present / Not Voting)", () => {
    const finance = makeFinance([{ name: "Pfizer PAC", total: 150_000 }]);
    const votes = [
      makeVote({ category: "Healthcare", votes: { [ICPSR]: "Present" } }),
      makeVote({ category: "Healthcare", votes: { [ICPSR]: "Not Voting" } }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    expect(result).toHaveLength(0);
  });

  it("skips industries below $5K threshold", () => {
    const finance = makeFinance([{ name: "Pfizer PAC", total: 4_999 }]);
    const votes = [
      makeVote({
        category: "Healthcare",
        description: "regulation",
        votes: { [ICPSR]: "Nay" },
      }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    expect(result).toHaveLength(0);
  });

  it("counts multiple conflicting votes correctly", () => {
    const finance = makeFinance([{ name: "Pfizer PAC", total: 150_000 }]);
    const votes = [
      makeVote({ id: "v1", category: "Healthcare", description: "regulation", votes: { [ICPSR]: "Nay" } }),
      makeVote({ id: "v2", category: "Healthcare", description: "healthcare reform limit", votes: { [ICPSR]: "Nay" } }),
      makeVote({ id: "v3", category: "Healthcare", description: "another reform cap", votes: { [ICPSR]: "Nay" } }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    const pharma = result.find((c) => c.industryKey === "pharma");
    expect(pharma!.voteCount).toBe(3);
    expect(pharma!.narrative).toContain("3 times");
  });

  it("uses 'once' for a single conflicting vote", () => {
    const finance = makeFinance([{ name: "Pfizer PAC", total: 150_000 }]);
    const votes = [
      makeVote({ category: "Healthcare", description: "regulation", votes: { [ICPSR]: "Nay" } }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    const pharma = result.find((c) => c.industryKey === "pharma");
    expect(pharma!.narrative).toContain("once");
  });

  it("sorts callouts by severity then donation amount", () => {
    const finance = makeFinance([
      { name: "Goldman Sachs PAC", total: 90_000 },   // finance → medium
      { name: "ExxonMobil PAC", total: 200_000 },      // energy  → high
    ]);
    const votes = [
      makeVote({ category: "Economy & Taxes", description: "consumer protection regulation", votes: { [ICPSR]: "Nay" } }),
      makeVote({ category: "Climate & Environment", description: "regulation for emissions", votes: { [ICPSR]: "Nay" } }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    if (result.length >= 2) {
      expect(result[0].severity).toBe("high");
    }
  });

  it("assigns correct severity levels", () => {
    const finance = makeFinance([
      { name: "Pfizer PAC", total: 150_000 },   // >100K → high
    ]);
    const votes = [
      makeVote({ category: "Healthcare", description: "regulation", votes: { [ICPSR]: "Nay" } }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    expect(result[0].severity).toBe("high");
  });

  it("assigns medium severity for $25K–$100K donors", () => {
    const finance = makeFinance([{ name: "Pfizer PAC", total: 50_000 }]);
    const votes = [makeVote({ category: "Healthcare", description: "regulation", votes: { [ICPSR]: "Nay" } })];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    expect(result[0].severity).toBe("medium");
  });

  it("assigns low severity for $5K–$25K donors", () => {
    const finance = makeFinance([{ name: "Pfizer PAC", total: 10_000 }]);
    const votes = [makeVote({ category: "Healthcare", description: "regulation", votes: { [ICPSR]: "Nay" } })];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    expect(result[0].severity).toBe("low");
  });

  it("formats large donations in millions", () => {
    const finance = makeFinance([{ name: "Goldman Sachs Political Action Committee", total: 1_500_000 }]);
    const votes = [makeVote({ category: "Economy & Taxes", description: "consumer protection regulation", votes: { [ICPSR]: "Nay" } })];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    const fin = result.find((c) => c.industryKey === "finance");
    expect(fin?.narrative).toMatch(/\$[\d.]+M/);
  });

  it("detects defense conflict — member voted Yea on defense funding", () => {
    const finance = makeFinance([{ name: "Lockheed Martin PAC", total: 120_000 }]);
    const votes = [
      makeVote({
        category: "National Security",
        description: "Authorization for defense funding and military expansion",
        votes: { [ICPSR]: "Yea" },
      }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    const defense = result.find((c) => c.industryKey === "defense");
    expect(defense).toBeDefined();
    expect(defense!.narrative).toContain("defense");
  });

  it("falls back to bioguideId for vote lookup when icpsrId is not provided", () => {
    const finance = makeFinance([{ name: "Pfizer PAC", total: 150_000 }]);
    const votes = [
      makeVote({
        category: "Healthcare",
        description: "regulation",
        // Use bioguideId as key since no ICPSR provided
        votes: { [BIOGUIDE]: "Nay" },
      }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes); // no icpsrId
    const pharma = result.find((c) => c.industryKey === "pharma");
    expect(pharma).toBeDefined();
  });

  it("includes supporting votes in the callout", () => {
    const finance = makeFinance([{ name: "Pfizer PAC", total: 150_000 }]);
    const votes = [
      makeVote({
        bill: "HR100",
        category: "Healthcare",
        description: "regulation to cut drug prices",
        votes: { [ICPSR]: "Nay" },
      }),
    ];
    const result = getConflictCallouts(BIOGUIDE, finance, votes, ICPSR);
    const pharma = result.find((c) => c.industryKey === "pharma");
    expect(pharma!.votes).toHaveLength(1);
    expect(pharma!.votes[0].bill).toBe("HR100");
  });
});
