import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home Page", () => {
  it("renders the main heading", () => {
    render(<Home />);
    expect(screen.getByText("Accountability")).toBeDefined();
    expect(screen.getByText("Dashboard")).toBeDefined();
  });

  it("renders all three branch cards", () => {
    render(<Home />);
    // Use getAllByText since nav also has these labels
    expect(screen.getAllByText("Legislative").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Executive").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Judicial").length).toBeGreaterThan(0);
  });

  it("does not show 'Coming Soon' for any branch", () => {
    render(<Home />);
    
    // Navigation dropdowns are closed by default, so "Coming Soon" badge is not rendered
    const comingSoonElements = screen.queryAllByText("Coming Soon");
    expect(comingSoonElements.length).toBe(0);
  });

  it("has working links to all branches", () => {
    render(<Home />);
    
    // Use getAllByRole since nav also has branch links - find the main card links
    const legislativeLinks = screen.getAllByRole("link", { name: /Legislative/i });
    const executiveLinks = screen.getAllByRole("link", { name: /Executive/i });
    const judicialLinks = screen.getAllByRole("link", { name: /Judicial/i });
    
    // Find the card link (should link to /congress, /executive, /judicial)
    const legislativeCard = legislativeLinks.find(l => l.getAttribute("href") === "/congress");
    const executiveCard = executiveLinks.find(l => l.getAttribute("href") === "/executive");
    const judicialCard = judicialLinks.find(l => l.getAttribute("href") === "/judicial");
    
    expect(legislativeCard).toBeDefined();
    expect(executiveCard).toBeDefined();
    expect(judicialCard).toBeDefined();
  });

  it("displays member count for Legislative branch with House and Senate breakdown", () => {
    render(<Home />);
    expect(screen.getByText("435")).toBeDefined();
    expect(screen.getByText("100")).toBeDefined();
    expect(screen.getByText("House")).toBeDefined();
    expect(screen.getByText("Senate")).toBeDefined();
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
    expect(epsteinLink?.getAttribute('target')).toBe('_blank');
    expect(epsteinLink?.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
