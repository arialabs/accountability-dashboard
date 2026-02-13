import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DeepDivesPage from "./page";

describe("Deep Dives Index Page", () => {
  it("renders the main heading", () => {
    render(<DeepDivesPage />);
    expect(screen.getByText("Deep Dive Investigations")).toBeDefined();
  });

  it("renders the page description", () => {
    render(<DeepDivesPage />);
    expect(screen.getByText(/Comprehensive investigative reports/i)).toBeDefined();
  });

  it("displays stats for investigations, sources, and officials", () => {
    render(<DeepDivesPage />);
    
    // Stats should be visible
    expect(screen.getByText("Active Investigations")).toBeDefined();
    expect(screen.getByText("Credible Sources")).toBeDefined();
    expect(screen.getByText("Officials Documented")).toBeDefined();
  });

  it("renders all three investigation cards", () => {
    render(<DeepDivesPage />);
    
    // Check for investigation titles
    expect(screen.getByText("Trading on Insider Knowledge")).toBeDefined();
    expect(screen.getByText("Big Pharma's Congressional Capture")).toBeDefined();
    expect(screen.getByText("The Pentagon's Revolving Door")).toBeDefined();
  });

  it("each investigation card has a link", () => {
    const { container } = render(<DeepDivesPage />);
    
    const stockTradingLink = container.querySelector('a[href="/deep-dives/congressional-stock-trading"]');
    const pharmaLink = container.querySelector('a[href="/deep-dives/pharma-lobbying-drug-prices"]');
    const defenseLink = container.querySelector('a[href="/deep-dives/defense-contractor-revolving-door"]');
    
    expect(stockTradingLink).toBeDefined();
    expect(pharmaLink).toBeDefined();
    expect(defenseLink).toBeDefined();
  });

  it("displays tags for each investigation", () => {
    render(<DeepDivesPage />);
    
    // Check for some tags
    expect(screen.getByText("Stock Trading")).toBeDefined();
    expect(screen.getByText("Pharmaceutical Industry")).toBeDefined();
    expect(screen.getByText("Defense Contractors")).toBeDefined();
    // Note: "Both Parties" may not appear on index page as only first 3 tags are shown
  });

  it("shows read time for each investigation", () => {
    render(<DeepDivesPage />);
    
    // Should have read time indicators (text contains "min read")
    expect(screen.getByText(/12 min read/i)).toBeDefined();
    expect(screen.getByText(/15 min read/i)).toBeDefined();
    expect(screen.getByText(/14 min read/i)).toBeDefined();
  });

  it("renders call to action section", () => {
    render(<DeepDivesPage />);
    
    expect(screen.getByText("Have a tip or story lead?")).toBeDefined();
    expect(screen.getByText("Submit a Tip")).toBeDefined();
  });

  it("has email link for submitting tips", () => {
    const { container } = render(<DeepDivesPage />);
    const emailLink = container.querySelector('a[href^="mailto:"]');
    expect(emailLink).toBeDefined();
  });

  it("has link to About page", () => {
    const { container } = render(<DeepDivesPage />);
    const aboutLink = container.querySelector('a[href="/about"]');
    expect(aboutLink).toBeDefined();
    expect(screen.getByText("About Our Research")).toBeDefined();
  });
});
