import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TopCapturedPanel from "./TopCapturedPanel";

// Mock fetch for IP geolocation
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ region: "Georgia" }),
  }));
});

describe("TopCapturedPanel", () => {
  it("renders the header", () => {
    render(<TopCapturedPanel />);
    expect(screen.getByText(/Top 10 · Most PAC-Captured/i)).toBeTruthy();
  });

  it("renders at least 5 representative entries", () => {
    render(<TopCapturedPanel />);
    // Each entry has a PAC percentage badge
    const badges = screen.getAllByText(/PAC/);
    expect(badges.length).toBeGreaterThanOrEqual(5);
  });

  it("renders rep names as links to /rep/ pages", () => {
    render(<TopCapturedPanel />);
    const links = screen.getAllByRole("link");
    const repLinks = links.filter((l) =>
      (l as HTMLAnchorElement).href?.includes("/rep/")
    );
    expect(repLinks.length).toBeGreaterThanOrEqual(5);
  });

  it("shows user state callout after geolocation", async () => {
    render(<TopCapturedPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Most captured in Georgia/i)).toBeTruthy();
    });
  });

  it("shows source attribution in footer", () => {
    render(<TopCapturedPanel />);
    expect(screen.getByText(/Source: FEC.*Leadership excluded/i)).toBeTruthy();
  });

  it("handles geolocation failure gracefully", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network")));
    render(<TopCapturedPanel />);
    // Should still render entries without crashing
    await waitFor(() => {
      const badges = screen.getAllByText(/PAC/);
      expect(badges.length).toBeGreaterThanOrEqual(5);
    });
  });
});
