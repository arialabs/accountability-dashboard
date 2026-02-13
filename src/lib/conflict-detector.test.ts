import { describe, it, expect } from "vitest";
import { detectConflicts, INDUSTRY_VOTE_MAPPING } from "./conflict-detector";
import type { IndustryTotal } from "./industry-classifier";

describe("Conflict Detector", () => {
  const sampleIndustries: IndustryTotal[] = [
    {
      industry: "pharma",
      displayName: "Pharmaceuticals & Health",
      icon: "💊",
      total: 150000,
      count: 10,
      topContributors: [],
    },
    {
      industry: "tech",
      displayName: "Tech & Internet",
      icon: "💻",
      total: 80000,
      count: 15,
      topContributors: [],
    },
    {
      industry: "defense",
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
      const pharmaConflict = conflicts.find(c => c.industry === "pharma");
      expect(pharmaConflict).toBeDefined();
      expect(pharmaConflict?.votePosition).toBe("Nay");
      expect(pharmaConflict?.benefitsIndustry).toBe(true);
    });

    it("should detect defense industry conflicts on defense spending", () => {
      const votes = [
        {
          bill: "H.R. 456",
          title: "Defense Authorization Act",
          category: "Defense",
          date: "2024-02-10",
          vote: "Yea" as const,
          description: "Funding for military programs",
        },
      ];

      const conflicts = detectConflicts(sampleIndustries, votes);

      const defenseConflict = conflicts.find(c => c.industry === "defense");
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

      const pharmaConflict = conflicts.find(c => c.industry === "pharma");
      expect(pharmaConflict).toBeUndefined(); // Should not flag this as a conflict
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
          industry: "retail",
          displayName: "Retail",
          icon: "🛒",
          total: 10000,
          count: 5,
          topContributors: [],
        },
        {
          industry: "agriculture",
          displayName: "Agriculture",
          icon: "🌾",
          total: 8000,
          count: 3,
          topContributors: [],
        },
        {
          industry: "labor",
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
          title: "Labor Protection Act",
          category: "Labor",
          date: "2024-01-01",
          vote: "Yea" as const,
          description: "Protects workers",
        },
      ];

      const conflicts = detectConflicts(manyIndustries, votes);

      // Labor is 6th by donation amount, so should not be checked
      expect(conflicts.length).toBe(0);
    });

    it("should assign severity based on donation amount", () => {
      const highDonorIndustries: IndustryTotal[] = [
        {
          industry: "pharma",
          displayName: "Pharmaceuticals",
          icon: "💊",
          total: 150000, // High: >100k
          count: 10,
          topContributors: [],
        },
        {
          industry: "tech",
          displayName: "Tech",
          icon: "💻",
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
          title: "Tech Regulation",
          category: "Technology",
          date: "2024-01-01",
          vote: "Nay" as const,
        },
      ];

      const conflicts = detectConflicts(highDonorIndustries, votes);

      const pharmaConflict = conflicts.find(c => c.industry === "pharma");
      expect(pharmaConflict?.conflictSeverity).toBe("high");

      const techConflict = conflicts.find(c => c.industry === "tech");
      expect(techConflict?.conflictSeverity).toBe("medium");
    });

    it("should sort conflicts by severity then donation amount", () => {
      const industries: IndustryTotal[] = [
        {
          industry: "pharma",
          displayName: "Pharma",
          icon: "💊",
          total: 90000, // Medium severity
          count: 10,
          topContributors: [],
        },
        {
          industry: "tech",
          displayName: "Tech",
          icon: "💻",
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
          title: "Tech Regulation",
          category: "Technology",
          date: "2024-01-01",
          vote: "Nay" as const,
        },
      ];

      const conflicts = detectConflicts(industries, votes);

      // Tech should be first (high severity, $150k)
      expect(conflicts[0].industry).toBe("tech");
      expect(conflicts[0].conflictSeverity).toBe("high");
      
      // Pharma should be second (medium severity)
      expect(conflicts[1].industry).toBe("pharma");
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

    it("should map relevant categories", () => {
      expect(INDUSTRY_VOTE_MAPPING["Healthcare"]).toBeDefined();
      expect(INDUSTRY_VOTE_MAPPING["Technology"]).toBeDefined();
      expect(INDUSTRY_VOTE_MAPPING["Defense"]).toBeDefined();
      expect(INDUSTRY_VOTE_MAPPING["Finance"]).toBeDefined();
    });
  });
});
