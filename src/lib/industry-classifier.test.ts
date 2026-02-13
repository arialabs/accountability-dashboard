import { describe, it, expect } from "vitest";
import { 
  classifyEmployer, 
  getIndustryName, 
  getIndustryIcon,
  aggregateByIndustry,
  INDUSTRIES 
} from "./industry-classifier";

describe("Industry Classifier", () => {
  describe("classifyEmployer", () => {
    it("should classify tech companies correctly", () => {
      expect(classifyEmployer("Google")).toBe("tech");
      expect(classifyEmployer("ALPHABET INC")).toBe("tech");
      expect(classifyEmployer("Microsoft Corporation")).toBe("tech");
      expect(classifyEmployer("Apple Inc.")).toBe("tech");
    });

    it("should classify pharma companies correctly", () => {
      expect(classifyEmployer("Pfizer")).toBe("pharma");
      expect(classifyEmployer("Moderna")).toBe("pharma");
      expect(classifyEmployer("Johnson & Johnson")).toBe("pharma");
    });

    it("should classify finance companies correctly", () => {
      expect(classifyEmployer("Goldman Sachs")).toBe("finance");
      expect(classifyEmployer("JPMorgan Chase")).toBe("finance");
      expect(classifyEmployer("Bank of America")).toBe("finance");
    });

    it("should classify energy companies correctly", () => {
      expect(classifyEmployer("ExxonMobil")).toBe("energy");
      expect(classifyEmployer("Chevron")).toBe("energy");
      expect(classifyEmployer("Shell Oil")).toBe("energy");
    });

    it("should classify defense contractors correctly", () => {
      expect(classifyEmployer("Lockheed Martin")).toBe("defense");
      expect(classifyEmployer("Boeing")).toBe("defense");
      expect(classifyEmployer("Raytheon")).toBe("defense");
    });

    it("should return 'other' for unknown employers", () => {
      expect(classifyEmployer("Random Small Business")).toBe("other");
      expect(classifyEmployer("Self-Employed")).toBe("other");
    });

    it("should handle null and undefined employers", () => {
      expect(classifyEmployer(null)).toBe("other");
      expect(classifyEmployer(undefined)).toBe("other");
      expect(classifyEmployer("")).toBe("other");
    });

    it("should be case-insensitive", () => {
      expect(classifyEmployer("GOOGLE")).toBe("tech");
      expect(classifyEmployer("google")).toBe("tech");
      expect(classifyEmployer("GoOgLe")).toBe("tech");
    });
  });

  describe("getIndustryName", () => {
    it("should return correct display names", () => {
      expect(getIndustryName("tech")).toBe("Tech & Internet");
      expect(getIndustryName("pharma")).toBe("Pharmaceuticals & Health");
      expect(getIndustryName("finance")).toBe("Finance & Banking");
    });

    it("should return 'Other' for unknown industries", () => {
      expect(getIndustryName("unknown")).toBe("Other");
    });
  });

  describe("getIndustryIcon", () => {
    it("should return correct icons", () => {
      expect(getIndustryIcon("tech")).toBe("💻");
      expect(getIndustryIcon("pharma")).toBe("💊");
      expect(getIndustryIcon("finance")).toBe("💰");
    });

    it("should return default icon for unknown industries", () => {
      expect(getIndustryIcon("unknown")).toBe("📊");
    });
  });

  describe("aggregateByIndustry", () => {
    it("should aggregate contributions by industry", () => {
      const contributions = [
        {
          contributor_name: "John Doe",
          contributor_employer: "Google",
          contribution_receipt_amount: 2000,
        },
        {
          contributor_name: "Jane Smith",
          contributor_employer: "Microsoft",
          contribution_receipt_amount: 1500,
        },
        {
          contributor_name: "Bob Johnson",
          contributor_employer: "Pfizer",
          contribution_receipt_amount: 3000,
        },
      ];

      const result = aggregateByIndustry(contributions);

      expect(result.length).toBeGreaterThan(0);
      
      const techIndustry = result.find(r => r.industry === "tech");
      expect(techIndustry).toBeDefined();
      expect(techIndustry?.total).toBe(3500);
      expect(techIndustry?.count).toBe(2);

      const pharmaIndustry = result.find(r => r.industry === "pharma");
      expect(pharmaIndustry).toBeDefined();
      expect(pharmaIndustry?.total).toBe(3000);
      expect(pharmaIndustry?.count).toBe(1);
    });

    it("should sort industries by total amount descending", () => {
      const contributions = [
        {
          contributor_name: "Person 1",
          contributor_employer: "Google",
          contribution_receipt_amount: 1000,
        },
        {
          contributor_name: "Person 2",
          contributor_employer: "Pfizer",
          contribution_receipt_amount: 5000,
        },
        {
          contributor_name: "Person 3",
          contributor_employer: "Microsoft",
          contribution_receipt_amount: 500,
        },
      ];

      const result = aggregateByIndustry(contributions);

      // Pharma should be first (5000), then Tech (1500)
      expect(result[0].industry).toBe("pharma");
      expect(result[0].total).toBe(5000);
      expect(result[1].industry).toBe("tech");
      expect(result[1].total).toBe(1500);
    });

    it("should include top contributors for each industry", () => {
      const contributions = [
        {
          contributor_name: "Big Donor",
          contributor_employer: "Google",
          contribution_receipt_amount: 5000,
        },
        {
          contributor_name: "Small Donor",
          contributor_employer: "Google",
          contribution_receipt_amount: 100,
        },
      ];

      const result = aggregateByIndustry(contributions);
      const techIndustry = result.find(r => r.industry === "tech");

      expect(techIndustry?.topContributors.length).toBeGreaterThan(0);
      expect(techIndustry?.topContributors[0].name).toBe("Big Donor");
      expect(techIndustry?.topContributors[0].amount).toBe(5000);
    });

    it("should handle empty contributions array", () => {
      const result = aggregateByIndustry([]);
      expect(result).toEqual([]);
    });
  });

  describe("INDUSTRIES configuration", () => {
    it("should have all required fields", () => {
      for (const [key, industry] of Object.entries(INDUSTRIES)) {
        expect(industry.name).toBeDefined();
        expect(typeof industry.name).toBe("string");
        expect(industry.keywords).toBeDefined();
        expect(Array.isArray(industry.keywords)).toBe(true);
        expect(industry.keywords.length).toBeGreaterThan(0);
        expect(industry.icon).toBeDefined();
        expect(typeof industry.icon).toBe("string");
      }
    });

    it("should have unique industry keys", () => {
      const keys = Object.keys(INDUSTRIES);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    });
  });
});
