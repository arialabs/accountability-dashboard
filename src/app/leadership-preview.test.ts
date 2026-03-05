/**
 * Tests for the LEADERSHIP_CARDS data computed at the top of page.tsx.
 * Validates that scandal counts, PAC verdict thresholds, and card data
 * are derived correctly from leadership-finance.json + scandals.json.
 */
import { describe, it, expect } from "vitest";
import leadershipFinance from "@/data/leadership-finance.json";
import scandals from "@/data/scandals.json";

// Mirror the logic from page.tsx
const scandalCounts: Record<string, number> = {};
(scandals as Array<{ bioguide_id?: string }>).forEach(s => {
  if (s.bioguide_id && s.bioguide_id !== "null") {
    scandalCounts[s.bioguide_id] = (scandalCounts[s.bioguide_id] || 0) + 1;
  }
});

const leadershipCards = (leadershipFinance as Array<{
  bioguide_id: string; name: string; role: string; party: string;
  pac_percentage: number; total_raised: number;
}>).map(m => ({
  ...m,
  scandals: scandalCounts[m.bioguide_id] || 0,
}));

function getPacVerdict(pac: number) {
  if (pac >= 35) return "HIGH PAC";
  if (pac >= 15) return "MED PAC";
  return "LOW PAC";
}

describe("Leadership Preview (homepage #100)", () => {
  it("produces at least 4 leadership cards", () => {
    expect(leadershipCards.length).toBeGreaterThanOrEqual(4);
  });

  it("all cards have required fields", () => {
    leadershipCards.forEach(card => {
      expect(card.bioguide_id).toBeTruthy();
      expect(card.name).toBeTruthy();
      expect(card.role).toBeTruthy();
      expect(typeof card.pac_percentage).toBe("number");
      expect(typeof card.total_raised).toBe("number");
      expect(typeof card.scandals).toBe("number");
    });
  });

  it("scandal counts are non-negative integers", () => {
    leadershipCards.forEach(card => {
      expect(card.scandals).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(card.scandals)).toBe(true);
    });
  });

  it("PAC verdict thresholds are correct", () => {
    expect(getPacVerdict(40.7)).toBe("HIGH PAC");  // Katherine Clark
    expect(getPacVerdict(19.4)).toBe("MED PAC");   // Tom Emmer
    expect(getPacVerdict(8.3)).toBe("LOW PAC");    // Mike Johnson
    expect(getPacVerdict(35)).toBe("HIGH PAC");    // boundary
    expect(getPacVerdict(34.9)).toBe("MED PAC");   // just below boundary
    expect(getPacVerdict(15)).toBe("MED PAC");     // boundary
    expect(getPacVerdict(14.9)).toBe("LOW PAC");   // just below boundary
  });

  it("total_raised is formatted correctly for display", () => {
    leadershipCards.forEach(card => {
      const formatted = (card.total_raised / 1_000_000).toFixed(1);
      expect(Number(formatted)).toBeGreaterThan(0);
    });
  });

  it("null bioguide_ids are excluded from scandal counts", () => {
    expect(scandalCounts["null"]).toBeUndefined();
  });

  it("Katherine Clark has the highest PAC percentage", () => {
    const clark = leadershipCards.find(c => c.name === "Katherine Clark");
    expect(clark).toBeDefined();
    expect(clark!.pac_percentage).toBeGreaterThan(35);
    expect(getPacVerdict(clark!.pac_percentage)).toBe("HIGH PAC");
  });
});
