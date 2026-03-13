import { describe, it, expect } from "vitest";
import { billToCongressGovUrl, rollCallUrl } from "./bill-urls";

describe("billToCongressGovUrl", () => {
  it("converts HR bills", () => {
    expect(billToCongressGovUrl("HR6703", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/house-bill/6703"
    );
  });
  it("converts S bills", () => {
    expect(billToCongressGovUrl("S1234", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/senate-bill/1234"
    );
  });
  it("converts HJRES bills", () => {
    expect(billToCongressGovUrl("HJRES100", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/house-joint-resolution/100"
    );
  });
  it("converts SJRES bills", () => {
    expect(billToCongressGovUrl("SJRES50", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/senate-joint-resolution/50"
    );
  });
  it("converts HCONRES bills", () => {
    expect(billToCongressGovUrl("HCONRES10", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/house-concurrent-resolution/10"
    );
  });
  it("converts SCONRES bills", () => {
    expect(billToCongressGovUrl("SCONRES5", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/senate-concurrent-resolution/5"
    );
  });
  it("converts HRES bills", () => {
    expect(billToCongressGovUrl("HRES1014", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/house-resolution/1014"
    );
  });
  it("converts SRES bills", () => {
    expect(billToCongressGovUrl("SRES42", 119)).toBe(
      "https://www.congress.gov/bill/119th-congress/senate-resolution/42"
    );
  });
  it("returns null for PN (nominations)", () => {
    expect(billToCongressGovUrl("PN121", 119)).toBeNull();
  });
  it("returns null for unrecognized prefixes", () => {
    expect(billToCongressGovUrl("UNKNOWN99", 119)).toBeNull();
  });
});

describe("rollCallUrl", () => {
  it("generates House roll call URL", () => {
    expect(rollCallUrl("House", 399, "2025-03-15", 119)).toBe(
      "https://clerk.house.gov/Votes/2025399"
    );
  });
  it("does not zero-pad House roll call numbers", () => {
    expect(rollCallUrl("House", 5, "2025-01-10", 119)).toBe(
      "https://clerk.house.gov/Votes/20255"
    );
  });
  it("generates Senate roll call URL (session 1 — congress start year)", () => {
    expect(rollCallUrl("Senate", 100, "2025-06-15", 119)).toBe(
      "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00100.htm"
    );
  });
  it("generates Senate roll call URL (session 2 — second year)", () => {
    expect(rollCallUrl("Senate", 677, "2026-01-30", 119)).toBe(
      "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1192/vote_119_2_00677.htm"
    );
  });
});
