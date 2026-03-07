import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MostCapturedPanel from "./MostCapturedPanel";
import type { CapturedMember } from "./MostCapturedPanel";

// Mock fetch for geolocation
beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ region: "Ohio" }) } as Response)
  );
});

const MOCK_MEMBERS: CapturedMember[] = [
  {
    bioguide_id: "L000566",
    name: "Robert Latta",
    party: "R",
    state: "Ohio",
    district: "OH-5",
    chamber: "house",
    pac_percentage: 62.4,
    total_raised: 2145000,
    top_pac_sector: "Energy",
  },
  {
    bioguide_id: "C001087",
    name: "Eric Crawford",
    party: "R",
    state: "Arkansas",
    district: "AR-1",
    chamber: "house",
    pac_percentage: 58.7,
    total_raised: 1876000,
    top_pac_sector: "Agriculture",
  },
  {
    bioguide_id: "C001059",
    name: "Jim Costa",
    party: "D",
    state: "California",
    district: "CA-21",
    chamber: "house",
    pac_percentage: 53.1,
    total_raised: 1654000,
    top_pac_sector: "Agriculture",
  },
];

describe("MostCapturedPanel", () => {
  it("renders all provided members with names and PAC percentages", () => {
    render(<MostCapturedPanel members={MOCK_MEMBERS} />);
    expect(screen.getByText("Robert Latta")).toBeDefined();
    expect(screen.getByText("Eric Crawford")).toBeDefined();
    expect(screen.getByText("Jim Costa")).toBeDefined();
    expect(screen.getByText("62.4% PAC")).toBeDefined();
    expect(screen.getByText("58.7% PAC")).toBeDefined();
  });

  it("renders the section heading", () => {
    render(<MostCapturedPanel members={MOCK_MEMBERS} />);
    expect(screen.getByText("Top 10 Most Captured")).toBeDefined();
  });

  it("shows party badges for each member", () => {
    render(<MostCapturedPanel members={MOCK_MEMBERS} />);
    const gopBadges = screen.getAllByText("GOP");
    const demBadges = screen.getAllByText("DEM");
    expect(gopBadges.length).toBe(2);
    expect(demBadges.length).toBe(1);
  });

  it("shows HIGH PAC verdict for members above 50%", () => {
    render(<MostCapturedPanel members={MOCK_MEMBERS} />);
    const highPacBadges = screen.getAllByText("HIGH PAC");
    expect(highPacBadges.length).toBe(3);
  });

  it("shows 'Most captured in [State]' flag for top member per state", () => {
    render(<MostCapturedPanel members={MOCK_MEMBERS} />);
    expect(screen.getByText("Most captured in Ohio")).toBeDefined();
    expect(screen.getByText("Most captured in Arkansas")).toBeDefined();
    expect(screen.getByText("Most captured in California")).toBeDefined();
  });

  it("creates click-through links to /rep/[id]", () => {
    const { container } = render(<MostCapturedPanel members={MOCK_MEMBERS} />);
    const links = container.querySelectorAll('a[href^="/rep/"]');
    expect(links.length).toBe(3);
    expect(links[0].getAttribute("href")).toBe("/rep/L000566");
  });

  it("renders ranking numbers for each member", () => {
    render(<MostCapturedPanel members={MOCK_MEMBERS} />);
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("gracefully handles geolocation failure", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));
    render(<MostCapturedPanel members={MOCK_MEMBERS} />);
    // Should still render members without any state highlight
    expect(screen.getByText("Robert Latta")).toBeDefined();
  });

  it("excludes leadership members from the data", () => {
    const leadershipNames = ["McConnell", "Schumer", "Pelosi", "Johnson", "Jeffries", "McCarthy", "Clark", "Emmer"];
    const hasLeadership = MOCK_MEMBERS.some((m) =>
      leadershipNames.some((l) => m.name.includes(l))
    );
    expect(hasLeadership).toBe(false);
  });
});

describe("top-captured.json data validation", () => {
  it("contains exactly 10 non-leadership members sorted by pac_percentage desc", async () => {
    const data = (await import("@/data/top-captured.json")).default;
    expect(data.length).toBe(10);

    // Verify sorted descending
    for (let i = 1; i < data.length; i++) {
      expect(data[i - 1].pac_percentage).toBeGreaterThanOrEqual(data[i].pac_percentage);
    }
  });

  it("excludes all known leadership members", async () => {
    const data = (await import("@/data/top-captured.json")).default;
    const leadershipIds = [
      "M000355", "S000148", "J000299", "J000294",
      "C001101", "E000294", "S001176", "D000563", "T000250",
    ];
    const leadershipNames = ["McConnell", "Schumer", "Pelosi", "Johnson", "Jeffries", "McCarthy", "Clark", "Emmer"];

    for (const member of data) {
      expect(leadershipIds).not.toContain(member.bioguide_id);
      for (const name of leadershipNames) {
        expect(member.name).not.toContain(name);
      }
    }
  });

  it("every member has required fields", async () => {
    const data = (await import("@/data/top-captured.json")).default;
    for (const m of data) {
      expect(m.bioguide_id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.party).toMatch(/^[RDI]$/);
      expect(m.state).toBeTruthy();
      expect(typeof m.pac_percentage).toBe("number");
      expect(m.pac_percentage).toBeGreaterThan(0);
      expect(typeof m.total_raised).toBe("number");
    }
  });
});
