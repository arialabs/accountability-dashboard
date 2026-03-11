import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RepPage from "./page";
import { getMemberDisclosures } from "@/lib/data";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("Not found");
  }),
}));

// Mock chart components that use canvas
vi.mock("@/components/VotingCharts", () => ({
  default: () => <div>VotingCharts Mock</div>,
}));

vi.mock("@/components/DonorAnalysisSection", () => ({
  default: () => <div>DonorAnalysisSection Mock</div>,
}));

// Extended timeout — rep page is heavier with BudgetImpactCard + AffectedProgramsList
describe("Rep Page - Financial Disclosures", () => {
  it("displays Financial Disclosures section when data exists", { timeout: 20000 }, async () => {
    // Use Robert Garcia who we know has disclosures
    const params = Promise.resolve({ id: "G000585" });
    
    const page = await RepPage({ params });
    render(page);
    
    // Check for Financial Disclosures heading (may appear multiple times in page)
    const headings = screen.getAllByText(/Financial Disclosures/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("shows filing type and date for each disclosure", { timeout: 20000 }, async () => {
    const params = Promise.resolve({ id: "G000585" });
    const disclosures = getMemberDisclosures("G000585");
    
    // Verify we have test data
    expect(disclosures.length).toBeGreaterThan(0);
    
    const page = await RepPage({ params });
    render(page);
    
    // Should show the filing type (Annual or Amendment)
    const annualText = screen.queryAllByText(/Annual/i);
    const amendmentText = screen.queryAllByText(/Amendment/i);
    
    // At least one should exist
    expect(annualText.length + amendmentText.length).toBeGreaterThan(0);
  });

  it("includes PDF links for each filing", { timeout: 20000 }, async () => {
    const params = Promise.resolve({ id: "G000585" });
    
    const page = await RepPage({ params });
    render(page);
    
    // Look for PDF link text
    const pdfLinks = screen.getAllByText(/View PDF/i);
    expect(pdfLinks.length).toBeGreaterThan(0);
  });

  it("does not show 'Coming Soon' for Financial Disclosures", { timeout: 20000 }, async () => {
    const params = Promise.resolve({ id: "G000585" });
    
    const page = await RepPage({ params });
    render(page);
    
    // Check that Financial Disclosures heading exists (may be multiple matches)
    const financialDisclosuresHeadings = screen.queryAllByText(/Financial Disclosures/i);
    expect(financialDisclosuresHeadings.length).toBeGreaterThan(0);
    
    // Should not have "Coming Soon" text anywhere near Financial Disclosures
    const comingSoonElements = screen.queryAllByText(/Coming Soon/i);
    
    // If there are any "Coming Soon" elements, they shouldn't be in any Financial Disclosures section
    if (financialDisclosuresHeadings.length > 0 && comingSoonElements.length > 0) {
      financialDisclosuresHeadings.forEach(heading => {
        const section = heading.parentElement;
        comingSoonElements.forEach(element => {
          expect(section?.contains(element)).toBe(false);
        });
      });
    }
  });

  it("handles members with no disclosures gracefully", { timeout: 20000 }, async () => {
    // Use a real member ID that exists
    const params = Promise.resolve({ id: "A000370" }); // Alma Adams - should exist
    
    const page = await RepPage({ params });
    render(page);
    
    // Should show Financial Disclosures section (may be multiple matches)
    const headings = screen.queryAllByText(/Financial Disclosures/i);
    expect(headings.length).toBeGreaterThan(0);
  });
});
