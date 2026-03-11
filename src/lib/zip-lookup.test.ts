import { describe, it, expect, vi, beforeEach } from "vitest";
import { isZipCode, mapApiResultToReps, fetchRepsByZip, type ZipRepResult } from "./zip-lookup";

/* ── isZipCode ── */
describe("isZipCode", () => {
  it("accepts valid 5-digit ZIP codes", () => {
    expect(isZipCode("90210")).toBe(true);
    expect(isZipCode("00501")).toBe(true);
    expect(isZipCode("99999")).toBe(true);
  });

  it("rejects non-ZIP inputs", () => {
    expect(isZipCode("9021")).toBe(false);      // too short
    expect(isZipCode("902101")).toBe(false);     // too long
    expect(isZipCode("abcde")).toBe(false);      // letters
    expect(isZipCode("")).toBe(false);           // empty
    expect(isZipCode("CA-12")).toBe(false);      // district
    expect(isZipCode("Pelosi")).toBe(false);     // name
  });

  it("trims whitespace before checking", () => {
    expect(isZipCode("  90210  ")).toBe(true);
  });
});

/* ── mapApiResultToReps ── */
describe("mapApiResultToReps", () => {
  const validRep: ZipRepResult = {
    id: "P000197",
    name: "Nancy Pelosi",
    state: "CA",
    party: "D",
    chamber: "house",
    district: 11,
    photo_url: "/photos/P000197.jpg",
    verdictScore: "captured",
    verdictLabel: "Donor Captured",
  };

  it("passes through valid results", () => {
    const result = mapApiResultToReps([validRep]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("P000197");
  });

  it("filters out null / incomplete entries", () => {
    const result = mapApiResultToReps([
      validRep,
      null as unknown as ZipRepResult,
      { id: "", name: "", state: "CA", party: "D", chamber: "house", district: null, photo_url: null, verdictScore: null, verdictLabel: null },
    ]);
    expect(result).toHaveLength(1);
  });

  it("returns empty array for empty input", () => {
    expect(mapApiResultToReps([])).toEqual([]);
  });
});

/* ── fetchRepsByZip ── */
describe("fetchRepsByZip", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns reps on successful API call", async () => {
    const mockReps: ZipRepResult[] = [
      {
        id: "S000148",
        name: "Chuck Schumer",
        state: "NY",
        party: "D",
        chamber: "senate",
        district: null,
        photo_url: null,
        verdictScore: "mixed",
        verdictLabel: "Mixed Allegiance",
      },
    ];

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockReps),
    }));

    const result = await fetchRepsByZip("10001");
    expect(result.fallback).toBe(false);
    expect(result.reps).toHaveLength(1);
    expect(result.reps[0].name).toBe("Chuck Schumer");
  });

  it("returns fallback when API indicates fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ fallback: true, message: "API key missing" }),
    }));

    const result = await fetchRepsByZip("10001");
    expect(result.fallback).toBe(true);
    expect(result.message).toContain("API key");
  });

  it("returns fallback on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network failure")));

    const result = await fetchRepsByZip("10001");
    expect(result.fallback).toBe(true);
    expect(result.message).toContain("Network error");
  });

  it("returns fallback when API returns error field", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ error: "Invalid ZIP" }),
    }));

    const result = await fetchRepsByZip("00000");
    expect(result.fallback).toBe(true);
    expect(result.message).toContain("Invalid ZIP");
  });
});
