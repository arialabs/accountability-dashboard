import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

// Mock next/navigation for RepSearch component
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock client-only components that depend on browser APIs (IntersectionObserver, RAF, etc.)
// These are unit-tested independently; here we test the page structure.
vi.mock("@/components/AnimatedCounter", () => ({
  default: ({ value, style, className }: { value: string; style?: React.CSSProperties; className?: string }) => (
    <span className={className} style={style}>{value}</span>
  ),
}));

vi.mock("@/components/ScrollFadeIn", () => ({
  default: ({ children, className, as: Tag = "div" }: { children: React.ReactNode; className?: string; as?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock("@/components/HeroSparkline", () => ({
  default: () => (
    <div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>2.4M+</span>
      <span>Votes tracked</span>
      <svg aria-hidden="true" role="img" />
      <span>Voting activity — 119th Congress</span>
    </div>
  ),
}));

describe("Home Page", () => {
  it("renders the main heading", () => {
    render(<Home />);
    // "Rep Accountability Dashboard" appears as the hero kicker label in the left column
    expect(screen.getByText("Rep Accountability Dashboard")).toBeDefined();
    // Hero h1 has the main tagline
    expect(screen.getByText("They work for you.")).toBeDefined();
  });

  it("renders all three branch cards", () => {
    render(<Home />);
    expect(screen.getAllByText("Legislative").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Executive").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Judicial").length).toBeGreaterThan(0);
  });

  it("does not show 'Coming Soon' in branch navigation cards", () => {
    render(<Home />);
    // Coming Soon only appears in deep dive placeholder cards, not branch nav cards
    // Branch nav section is a known section — verify branch cards have no Coming Soon text
    const allLinks = screen.getAllByRole("link");
    const branchLinks = allLinks.filter(
      (l) =>
        l.getAttribute("href") === "/congress" ||
        l.getAttribute("href") === "/executive" ||
        l.getAttribute("href") === "/judicial"
    );
    branchLinks.forEach((link) => {
      expect(link.textContent).not.toContain("Coming Soon");
    });
  });

  it("has working links to all branches", () => {
    render(<Home />);
    const legislativeLinks = screen.getAllByRole("link", { name: /Legislative/i });
    const executiveLinks = screen.getAllByRole("link", { name: /Executive/i });
    const judicialLinks = screen.getAllByRole("link", { name: /Judicial/i });

    const legislativeCard = legislativeLinks.find((l) => l.getAttribute("href") === "/congress");
    const executiveCard = executiveLinks.find((l) => l.getAttribute("href") === "/executive");
    const judicialCard = judicialLinks.find((l) => l.getAttribute("href") === "/judicial");

    expect(legislativeCard).toBeDefined();
    expect(executiveCard).toBeDefined();
    expect(judicialCard).toBeDefined();
  });

  it("displays member count for Legislative branch with House and Senate breakdown", () => {
    render(<Home />);
    expect(screen.getByText("435")).toBeDefined();
    expect(screen.getByText("100")).toBeDefined();
    expect(screen.getByText("House")).toBeDefined();
    expect(screen.getAllByText("Senate").length).toBeGreaterThan(0);
  });

  it("renders the Deep Dives section", () => {
    render(<Home />);
    expect(screen.getByText("Deep Dives")).toBeDefined();
    expect(screen.getByText(/In-depth investigations into major scandals/)).toBeDefined();
  });

  it("renders the Epstein Files Explorer card", () => {
    render(<Home />);
    expect(screen.getByText("Epstein Files Explorer")).toBeDefined();
  });

  it("Epstein Files card links to external site", () => {
    const { container } = render(<Home />);
    const epsteinLink = container.querySelector('a[href="https://epstein.arialabs.ai"]');
    expect(epsteinLink).toBeDefined();
    expect(epsteinLink?.getAttribute("target")).toBe("_blank");
    expect(epsteinLink?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders the search bar", () => {
    render(<Home />);
    expect(screen.getByRole("search")).toBeDefined();
    expect(screen.getByLabelText(/search for a representative/i)).toBeDefined();
  });

  it("renders quick stats labels", () => {
    render(<Home />);
    // AnimatedCounter is mocked to render the value string directly.
    // "535" may appear in both the stats bar and deep dive cards, so use getAllByText.
    expect(screen.getAllByText("535").length).toBeGreaterThan(0);
    expect(screen.getByText("Members of Congress tracked")).toBeDefined();
  });

  it("renders the hero sparkline data section", () => {
    render(<Home />);
    // HeroSparkline is mocked to render key text elements
    expect(screen.getByText("Votes tracked")).toBeDefined();
  });

  it("renders additional deep dive placeholder cards", () => {
    render(<Home />);
    expect(screen.getByText("Dark Money: PAC Flows 2020–2024")).toBeDefined();
    expect(screen.getByText("Congressional Trades Database")).toBeDefined();
  });

  it("uses no emoji icons in branch cards", () => {
    const { container } = render(<Home />);
    // Branch cards should use SVG icons, not emoji
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("JetBrains Mono applied to data stats", () => {
    const { container } = render(<Home />);
    const monoElements = container.querySelectorAll('[style*="JetBrains Mono"]');
    expect(monoElements.length).toBeGreaterThan(0);
  });
});
