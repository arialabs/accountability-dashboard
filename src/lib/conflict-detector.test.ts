import { describe, it, expect } from "vitest";
import { detectConflicts, INDUSTRY_VOTE_MAPPING } from "./conflict-detector";
import type { IndustryTotal } from "./industry-classifier";

describe("Conflict Detector", () => {
  // Industry keys must match finance.json values (not INDUSTRIES classifier keys)
  const sampleIndustries: IndustryTotal[] = [
    {
      industry: "Health",
      displayName: "Pharmaceuticals & Health",
      icon: "💊",
      total: 150000,
      count: 10,
      topContributors: [],
    },
    {
      industry: "Finance/Securities",
      displayName: "Finance & Banking",
      icon: "💰",
      total: 80000,
      count: 15,
      topContributors: [],
    },
    {
      industry: "Defense",
      displayName: "Defense & Aerospace",
      icon: "🛡️",
      total: 120000,
      count: 8,
      topContributors: [],
    },
  ];

  describe("detectConflicts", () => {
    it("should detect conflicts when voting with donor industry interests", () => {
      const votes = [
        {
          bill: "H.R. 123",
          title: "Drug Price Regulation Act",
          category: "Healthcare",
          date: "2024-01-15",
          vote: "Nay" as const,
          description: "Regulation of pharmaceutical prices",
        },
      ];

      const conflicts = detectConflicts(sampleIndustries, votes);

      expect(conflicts.length).toBeGreaterThan(0);
      const healthConflict = conflicts.find(c => c.industry === "Health");
      expect(healthConflict).toBeDefined();
      expect(healthConflict?.votePosition).toBe("Nay");
      expect(healthConflict?.benefitsIndustry).toBe(true);
    });

    it("should detect defense industry conflicts on defense spending", () => {
      const votes = [
        {
          bill: "H.R. 456",
          title: "Defense Authorization Act",
          category: "National Security",
          date: "2024-02-10",
          vote: "Yea" as const,
          description: "Funding for military programs",
        },
      ];

      const conflicts = detectConflicts(sampleIndustries, votes);

      const defenseConflict = conflicts.find(c => c.industry === "Defense");
      expect(defenseConflict).toBeDefined();
      expect(defenseConflict?.votePosition).toBe("Yea");
      expect(defenseConflict?.benefitsIndustry).toBe(true);
    });

    it("should not flag conflicts when voting against donor interests", () => {
      const votes = [
        {
          bill: "H.R. 789",
          title: "Drug Price Reform Act",
          category: "Healthcare",
          date: "2024-03-05",
          vote: "Yea" as const, // Voting FOR regulations (against pharma interests)
          description: "Regulation to lower drug prices",
        },
      ];

      const conflicts = detectConflicts(sampleIndustries, votes);

      const healthConflict = conflicts.find(c => c.industry === "Health");
      expect(healthConflict).toBeUndefined(); // Should not flag this as a conflict
    });

    it("should ignore Present and Not Voting votes", () => {
      const votes = [
        {
          bill: "H.R. 100",
          title: "Some Bill",
          category: "Healthcare",
          date: "2024-01-01",
          vote: "Present" as const,
          description: "Test bill",
        },
        {
          bill: "H.R. 101",
          title: "Another Bill",
          category: "Healthcare",
          date: "2024-01-02",
          vote: "Not Voting" as const,
          description: "Test bill",
        },
      ];

      const conflicts = detectConflicts(sampleIndustries, votes);

      expect(conflicts.length).toBe(0);
    });

    it("should skip votes with no industry mapping", () => {
      const votes = [
        {
          bill: "H.R. 999",
          title: "Random Bill",
          category: "UnmappedCategory",
          date: "2024-01-01",
          vote: "Yea" as const,
          description: "Test",
        },
      ];

      const conflicts = detectConflicts(sampleIndustries, votes);

      expect(conflicts.length).toBe(0);
    });

    it("should only check top 5 donor industries", () => {
      const manyIndustries: IndustryTotal[] = [
        ...sampleIndustries,
        {
          industry: "Real Estate",
          displayName: "Real Estate",
          icon: "🏗️",
          total: 10000,
          count: 5,
          topContributors: [],
        },
        {
          industry: "Agriculture",
          displayName: "Agriculture",
          icon: "🌾",
          total: 8000,
          count: 3,
          topContributors: [],
        },
        {
          industry: "Labor/Unions",
          displayName: "Labor Unions",
          icon: "👷",
          total: 5000,
          count: 2,
          topContributors: [],
        },
      ];

      const votes = [
        {
          bill: "H.R. 200",
          title: "Ethics Reform Act",
          category: "Government Ethics",
          date: "2024-01-01",
          vote: "Nay" as const,
          description: "Ethics oversight",
        },
      ];

      const conflicts = detectConflicts(manyIndustries, votes);

      // Government Ethics maps to Lawyers/Law Firms, which is not in the top 5
      expect(conflicts.length).toBe(0);
    });

    it("should assign severity based on donation amount", () => {
      const highDonorIndustries: IndustryTotal[] = [
        {
          industry: "Health",
          displayName: "Health",
          icon: "💊",
          total: 150000, // High: >100k
          count: 10,
          topContributors: [],
        },
        {
          industry: "Finance/Securities",
          displayName: "Finance",
          icon: "💰",
          total: 75000, // Medium: 50k-100k
          count: 10,
          topContributors: [],
        },
      ];

      const votes = [
        {
          bill: "H.R. 1",
          title: "Healthcare Reform",
          category: "Healthcare",
          date: "2024-01-01",
          vote: "Nay" as const,
        },
        {
          bill: "H.R. 2",
          title: "Tax Reform",
          category: "Economy & Taxes",
          date: "2024-01-01",
          vote: "Nay" as const,
        },
      ];

      const conflicts = detectConflicts(highDonorIndustries, votes);

      const healthConflict = conflicts.find(c => c.industry === "Health");
      expect(healthConflict?.conflictSeverity).toBe("high");

      const financeConflict = conflicts.find(c => c.industry === "Finance/Securities");
      expect(financeConflict?.conflictSeverity).toBe("medium");
    });

    it("should sort conflicts by severity then donation amount", () => {
      const industries: IndustryTotal[] = [
        {
          industry: "Health",
          displayName: "Health",
          icon: "💊",
          total: 90000, // Medium severity
          count: 10,
          topContributors: [],
        },
        {
          industry: "Finance/Securities",
          displayName: "Finance",
          icon: "💰",
          total: 150000, // High severity
          count: 10,
          topContributors: [],
        },
      ];

      const votes = [
        {
          bill: "H.R. 1",
          title: "Healthcare Regulation",
          category: "Healthcare",
          date: "2024-01-01",
          vote: "Nay" as const,
        },
        {
          bill: "H.R. 2",
          title: "Tax Regulation",
          category: "Economy & Taxes",
          date: "2024-01-01",
          vote: "Nay" as const,
        },
      ];

      const conflicts = detectConflicts(industries, votes);

      // Finance should be first (high severity, $150k)
      expect(conflicts[0].industry).toBe("Finance/Securities");
      expect(conflicts[0].conflictSeverity).toBe("high");

      // Health should be second (medium severity)
      expect(conflicts[1].industry).toBe("Health");
      expect(conflicts[1].conflictSeverity).toBe("medium");
    });

    it("should generate appropriate explanations", () => {
      const votes = [
        {
          bill: "H.R. 500",
          title: "Pharmaceutical Oversight Act",
          category: "Healthcare",
          date: "2024-01-01",
          vote: "Nay" as const,
          description: "Regulation of drug companies",
        },
      ];

      const conflicts = detectConflicts(sampleIndustries, votes);

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].explanation).toContain("$150,000");
      expect(conflicts[0].explanation).toContain("Pharmaceuticals");
      expect(conflicts[0].explanation).toContain("Nay");
    });
  });

  describe("INDUSTRY_VOTE_MAPPING configuration", () => {
    it("should have valid mappings", () => {
      for (const [category, mapping] of Object.entries(INDUSTRY_VOTE_MAPPING)) {
        expect(mapping.industries).toBeDefined();
        expect(Array.isArray(mapping.industries)).toBe(true);
        expect(mapping.industries.length).toBeGreaterThan(0);
        expect(mapping.proIndustryVote).toMatch(/^(Yea|Nay)$/);
      }
    });

    it("should map actual key-votes.json categories", () => {
      expect(INDUSTRY_VOTE_MAPPING["Healthcare"]).toBeDefined();
      expect(INDUSTRY_VOTE_MAPPING["Economy & Taxes"]).toBeDefined();
      expect(INDUSTRY_VOTE_MAPPING["Climate & Environment"]).toBeDefined();
      expect(INDUSTRY_VOTE_MAPPING["National Security"]).toBeDefined();
    });
  });
});
