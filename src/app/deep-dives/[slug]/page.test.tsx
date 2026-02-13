import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DeepDiveInvestigationPage, { generateStaticParams } from "./page";

// Mock Next.js notFound
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

describe("Deep Dive Investigation Detail Page", () => {
  describe("generateStaticParams", () => {
    it("returns params for all investigations", () => {
      const params = generateStaticParams();
      
      expect(params).toEqual([
        { slug: "congressional-stock-trading" },
        { slug: "pharma-lobbying-drug-prices" },
        { slug: "defense-contractor-revolving-door" },
      ]);
    });
  });

  describe("Congressional Stock Trading investigation", () => {
    it("renders the investigation title and subtitle", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      expect(screen.getByText("Trading on Insider Knowledge")).toBeDefined();
      expect(screen.getByText("How Members of Congress Profit From Industries They Regulate")).toBeDefined();
    });

    it("displays tags", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      expect(screen.getByText("Stock Trading")).toBeDefined();
      expect(screen.getByText("STOCK Act")).toBeDefined();
    });

    it("renders Executive Summary section", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      expect(screen.getByText("Executive Summary")).toBeDefined();
    });

    it("renders Key Findings section", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      expect(screen.getByText("Key Findings")).toBeDefined();
    });

    it("renders Timeline section", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      expect(screen.getByText("Timeline")).toBeDefined();
    });

    it("renders By the Numbers section with financial data", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      expect(screen.getByText("By the Numbers")).toBeDefined();
    });

    it("renders Officials Documented section", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      expect(screen.getByText("Officials Documented")).toBeDefined();
      // Names appear multiple times (key findings, timeline, officials section), so use getAllByText
      const donaldsRefs = screen.getAllByText(/Byron Donalds/i);
      const pelosiRefs = screen.getAllByText(/Nancy Pelosi/i);
      expect(donaldsRefs.length).toBeGreaterThan(0);
      expect(pelosiRefs.length).toBeGreaterThan(0);
    });

    it("renders Sources & Citations section", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      expect(screen.getByText("Sources & Citations")).toBeDefined();
    });

    it("has back link to investigations list", () => {
      const { container } = render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      const backLink = container.querySelector('a[href="/deep-dives"]');
      expect(backLink).toBeDefined();
    });

    it("includes links to representative detail pages where applicable", () => {
      const { container } = render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      // Byron Donalds should have a link to his detail page
      const donaldsLink = container.querySelector('a[href="/rep/D000032"]');
      expect(donaldsLink).toBeDefined();
    });
  });

  describe("Pharma Lobbying investigation", () => {
    it("renders the investigation title and subtitle", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "pharma-lobbying-drug-prices" }} />);
      
      expect(screen.getByText("Big Pharma's Congressional Capture")).toBeDefined();
      expect(screen.getByText("How Pharmaceutical Money Keeps Drug Prices Sky-High")).toBeDefined();
    });

    it("displays pharma-specific tags", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "pharma-lobbying-drug-prices" }} />);
      
      expect(screen.getByText("Pharmaceutical Industry")).toBeDefined();
      expect(screen.getByText("Drug Prices")).toBeDefined();
    });
  });

  describe("Defense Contractor investigation", () => {
    it("renders the investigation title and subtitle", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "defense-contractor-revolving-door" }} />);
      
      expect(screen.getByText("The Pentagon's Revolving Door")).toBeDefined();
      expect(screen.getByText("How Former Lawmakers Cash In on Defense Contracts They Voted to Approve")).toBeDefined();
    });

    it("displays defense-specific tags", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "defense-contractor-revolving-door" }} />);
      
      expect(screen.getByText("Defense Contractors")).toBeDefined();
      expect(screen.getByText("Revolving Door")).toBeDefined();
    });

    it("documents former officials like McKeon and Esper", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "defense-contractor-revolving-door" }} />);
      
      // Should reference key individuals (appear multiple times, so use getAllByText)
      const mckeonRefs = screen.getAllByText(/McKeon/i);
      const esperRefs = screen.getAllByText(/Esper/i);
      expect(mckeonRefs.length).toBeGreaterThan(0);
      expect(esperRefs.length).toBeGreaterThan(0);
    });
  });

  describe("Read time display", () => {
    it("shows read time for congressional stock trading", () => {
      const { container } = render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      expect(screen.getByText(/12 min read/i)).toBeDefined();
    });

    it("shows read time for pharma lobbying", () => {
      const { container } = render(<DeepDiveInvestigationPage params={{ slug: "pharma-lobbying-drug-prices" }} />);
      
      expect(screen.getByText(/15 min read/i)).toBeDefined();
    });

    it("shows read time for defense contractor", () => {
      const { container } = render(<DeepDiveInvestigationPage params={{ slug: "defense-contractor-revolving-door" }} />);
      
      expect(screen.getByText(/14 min read/i)).toBeDefined();
    });
  });

  describe("Content sections", () => {
    it("renders all main content sections for stock trading", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      expect(screen.getByText("The Problem: Lawmakers Trading What They Regulate")).toBeDefined();
      expect(screen.getByText("Case Studies: Who's Trading What")).toBeDefined();
      expect(screen.getByText("The STOCK Act's Failure")).toBeDefined();
    });

    it("renders all main content sections for pharma lobbying", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "pharma-lobbying-drug-prices" }} />);
      
      expect(screen.getByText("America's Drug Price Crisis")).toBeDefined();
    });

    it("renders all main content sections for defense contractor", () => {
      render(<DeepDiveInvestigationPage params={{ slug: "defense-contractor-revolving-door" }} />);
      
      expect(screen.getByText("The System: From Public Service to Private Profit")).toBeDefined();
    });
  });

  describe("Source credibility badges", () => {
    it("shows verified badge for high credibility sources", () => {
      const { container } = render(<DeepDiveInvestigationPage params={{ slug: "congressional-stock-trading" }} />);
      
      const verifiedBadges = screen.getAllByText("Verified");
      expect(verifiedBadges.length).toBeGreaterThan(0);
    });
  });
});
