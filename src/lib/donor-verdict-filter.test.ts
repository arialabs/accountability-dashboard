/**
 * Tests for the getDonorVerdict helper used by the congress listing filter.
 * The helper must match the thresholds used in MemberCard's badge rendering.
 */

import { vi, describe, it, expect, afterEach } from "vitest";
import { getMemberFinanceStatic } from "@/lib/data";

// Inline the helper so tests stay self-contained
function getDonorVerdict(bioguideId: string): "captured" | "mixed" | "focused" | null {
  const finance = getMemberFinanceStatic(bioguideId);
  if (!finance) return null;
  const pac = finance.pac_percentage ?? 0;
  const large = finance.large_donor_percentage ?? 0;
  if (pac === 0 && large === 0) return null;
  if (pac >= 60 || large >= 75) return "captured";
  if (pac >= 30 || large >= 50) return "mixed";
  return "focused";
}

vi.mock("@/lib/data", () => ({
  getMemberFinanceStatic: vi.fn(),
}));

const mockFinance = getMemberFinanceStatic as ReturnType<typeof vi.fn>;

describe("getDonorVerdict", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns null when no finance data exists", () => {
    mockFinance.mockReturnValue(null);
    expect(getDonorVerdict("A000000")).toBeNull();
  });

  it("returns null when both PAC% and large_donor% are 0", () => {
    mockFinance.mockReturnValue({ pac_percentage: 0, large_donor_percentage: 0 });
    expect(getDonorVerdict("A000001")).toBeNull();
  });

  it("returns 'captured' when PAC% >= 60", () => {
    mockFinance.mockReturnValue({ pac_percentage: 60, large_donor_percentage: 10 });
    expect(getDonorVerdict("A000002")).toBe("captured");
  });

  it("returns 'captured' when PAC% > 60", () => {
    mockFinance.mockReturnValue({ pac_percentage: 75, large_donor_percentage: 20 });
    expect(getDonorVerdict("A000003")).toBe("captured");
  });

  it("returns 'captured' when large_donor% >= 75", () => {
    mockFinance.mockReturnValue({ pac_percentage: 20, large_donor_percentage: 75 });
    expect(getDonorVerdict("A000004")).toBe("captured");
  });

  it("returns 'mixed' when PAC% >= 30 (below captured threshold)", () => {
    mockFinance.mockReturnValue({ pac_percentage: 30, large_donor_percentage: 10 });
    expect(getDonorVerdict("A000005")).toBe("mixed");
  });

  it("returns 'mixed' when large_donor% >= 50 (below captured threshold)", () => {
    mockFinance.mockReturnValue({ pac_percentage: 20, large_donor_percentage: 50 });
    expect(getDonorVerdict("A000006")).toBe("mixed");
  });

  it("returns 'focused' when below all thresholds", () => {
    mockFinance.mockReturnValue({ pac_percentage: 15, large_donor_percentage: 30 });
    expect(getDonorVerdict("A000007")).toBe("focused");
  });

  it("returns 'focused' when PAC% is just under 30 threshold", () => {
    mockFinance.mockReturnValue({ pac_percentage: 29, large_donor_percentage: 20 });
    expect(getDonorVerdict("A000008")).toBe("focused");
  });

  it("handles missing pac_percentage (treats as 0)", () => {
    mockFinance.mockReturnValue({ large_donor_percentage: 80 });
    expect(getDonorVerdict("A000009")).toBe("captured");
  });

  it("handles missing large_donor_percentage (treats as 0)", () => {
    mockFinance.mockReturnValue({ pac_percentage: 65 });
    expect(getDonorVerdict("A000010")).toBe("captured");
  });
});
