import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FinancialDisclosuresSection, { FinancialDisclosure } from "./FinancialDisclosuresSection";

const mockDisclosures: FinancialDisclosure[] = [
  {
    last: "Smith",
    first: "John",
    prefix: "Hon.",
    suffix: "",
    filingType: "O",
    stateDst: "CA12",
    year: 2024,
    filingDate: "5/15/2025",
    docId: "10066123",
    pdfUrl: "https://disclosures-clerk.house.gov/public_disc/financial-pdfs/2024/10066123.pdf",
  },
  {
    last: "Smith",
    first: "John",
    prefix: "Hon.",
    suffix: "",
    filingType: "A",
    stateDst: "CA12",
    year: 2023,
    filingDate: "5/12/2024",
    docId: "10059456",
    pdfUrl: "https://disclosures-clerk.house.gov/public_disc/financial-pdfs/2023/10059456.pdf",
  },
];

describe("FinancialDisclosuresSection", () => {
  it("renders section heading", () => {
    render(<FinancialDisclosuresSection disclosures={mockDisclosures} memberName="John Smith" />);
    const headings = screen.getAllByText(/Financial Disclosures/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("displays count of filings", () => {
    render(<FinancialDisclosuresSection disclosures={mockDisclosures} memberName="John Smith" />);
    expect(screen.getByText("2 filings")).toBeDefined();
  });

  it("shows summary with filing count", () => {
    render(<FinancialDisclosuresSection disclosures={mockDisclosures} memberName="John Smith" />);
    expect(screen.getByText(/2 financial disclosure filings? on record/)).toBeDefined();
  });

  it("renders all disclosure filings after expanding", () => {
    render(<FinancialDisclosuresSection disclosures={mockDisclosures} memberName="John Smith" />);

    fireEvent.click(screen.getByText("Show all filings"));

    expect(screen.getByText("2024 Annual Financial Disclosure")).toBeDefined();
    expect(screen.getByText("2023 Annual Financial Disclosure")).toBeDefined();
  });

  it("displays filing types correctly after expanding", () => {
    render(<FinancialDisclosuresSection disclosures={mockDisclosures} memberName="John Smith" />);

    fireEvent.click(screen.getByText("Show all filings"));

    expect(screen.getByText("Original")).toBeDefined();
    expect(screen.getByText("Amendment")).toBeDefined();
  });

  it("displays document IDs after expanding", () => {
    render(<FinancialDisclosuresSection disclosures={mockDisclosures} memberName="John Smith" />);

    fireEvent.click(screen.getByText("Show all filings"));

    expect(screen.getByText(/10066123/)).toBeDefined();
    expect(screen.getByText(/10059456/)).toBeDefined();
  });

  it("renders PDF links after expanding", () => {
    render(<FinancialDisclosuresSection disclosures={mockDisclosures} memberName="John Smith" />);

    fireEvent.click(screen.getByText("Show all filings"));

    const links = screen.getAllByText("View PDF");
    expect(links.length).toBe(2);

    const firstLink = links[0].closest("a");
    expect(firstLink?.getAttribute("href")).toContain("10066123.pdf");
    expect(firstLink?.getAttribute("target")).toBe("_blank");
  });

  it("shows empty state when no disclosures", () => {
    render(<FinancialDisclosuresSection disclosures={[]} memberName="John Smith" />);

    // Component shows a "Being Compiled" message when no disclosures are available
    expect(screen.getByText(/Financial Disclosures Being Compiled/)).toBeDefined();
    expect(screen.getByText(/John Smith/)).toBeDefined();
  });

  it("displays data source attribution after expanding", () => {
    render(<FinancialDisclosuresSection disclosures={mockDisclosures} memberName="John Smith" />);

    fireEvent.click(screen.getByText("Show all filings"));

    expect(screen.getByText(/House Clerk Financial Disclosures/)).toBeDefined();

    const sourceLink = screen.getByText("Official Source");
    expect(sourceLink.getAttribute("href")).toBe("https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure");
  });
});
