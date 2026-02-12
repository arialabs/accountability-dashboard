import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock the data module
vi.mock("@/lib/data", () => ({
  getAllScandals: vi.fn(() => []),
  getMember: vi.fn(() => null),
}));

// Mock the components
vi.mock("@/components/ScandalCard", () => ({
  default: () => <div>ScandalCard Mock</div>,
}));

vi.mock("@/components/ScandalFilters", () => ({
  default: () => <div>ScandalFilters Mock</div>,
}));

vi.mock("@/components/EpsteinFilesCard", () => ({
  default: ({ variant }: { variant?: string }) => (
    <div data-testid="epstein-card" data-variant={variant}>
      Epstein Files Explorer
    </div>
  ),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

// Import after mocks
import ScandalsPage from "./page";

describe("ScandalsPage", () => {
  it("renders the page heading", () => {
    render(<ScandalsPage />);
    expect(screen.getByText("Scandals & Controversies")).toBeDefined();
  });

  it("renders the back to Congress link", () => {
    render(<ScandalsPage />);
    const backLink = screen.getByText("← Back to Congress");
    expect(backLink).toBeDefined();
  });

  it("renders the Featured Deep Dive section", () => {
    render(<ScandalsPage />);
    expect(screen.getByText("Featured Deep Dive")).toBeDefined();
    expect(screen.getByText(/Comprehensive investigations into major cases/)).toBeDefined();
  });

  it("renders the Epstein Files card in compact variant", () => {
    render(<ScandalsPage />);
    const epsteinCard = screen.getByTestId("epstein-card");
    expect(epsteinCard).toBeDefined();
    expect(epsteinCard.getAttribute("data-variant")).toBe("compact");
  });

  it("displays the page description", () => {
    render(<ScandalsPage />);
    expect(
      screen.getByText(/Verified incidents with sources/)
    ).toBeDefined();
  });
});
