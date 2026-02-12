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
    expect(screen.getByText("Legislative")).toBeDefined();
    expect(screen.getByText("Executive")).toBeDefined();
    expect(screen.getByText("Judicial")).toBeDefined();
  });

  it("does not show 'Coming Soon' for any branch", () => {
    render(<Home />);
    
    // Query for "Coming Soon" text - should not exist
    const comingSoonElements = screen.queryAllByText("Coming Soon");
    expect(comingSoonElements.length).toBe(0);
  });

  it("has working links to all branches", () => {
    render(<Home />);
    
    // Check for links
    const legislativeLink = screen.getByRole("link", { name: /Legislative/i });
    const executiveLink = screen.getByRole("link", { name: /Executive/i });
    const judicialLink = screen.getByRole("link", { name: /Judicial/i });
    
    expect(legislativeLink).toBeDefined();
    expect(executiveLink).toBeDefined();
    expect(judicialLink).toBeDefined();
    
    // Verify href attributes
    expect(legislativeLink.getAttribute("href")).toBe("/congress");
    expect(executiveLink.getAttribute("href")).toBe("/executive");
    expect(judicialLink.getAttribute("href")).toBe("/judicial");
  });

  it("displays member count for Legislative branch", () => {
    render(<Home />);
    expect(screen.getByText("535")).toBeDefined();
    expect(screen.getByText("Members")).toBeDefined();
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
